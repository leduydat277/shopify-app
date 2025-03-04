import { json, LoaderFunctionArgs } from "@remix-run/node";
import { useState, useEffect } from "react";
import { useFetcher, useLoaderData } from "@remix-run/react";
import {
  Page,
  ResourceList,
  TextField,
  Select,
  Button,
  Card,
} from "@shopify/polaris";
import { authenticate } from "../shopify.server";

import { Product } from "app/stores";
import { FiltersWithAResourceList } from "app/component/Filters";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);
  const cursor = url.searchParams.get("cursor");
  const search = url.searchParams.get("search") || "";
  const status = url.searchParams.get("status");
  const minPrice = url.searchParams.get("minPrice");
  const maxPrice = url.searchParams.get("maxPrice");

  const { admin } = await authenticate.admin(request);

  const GET_PRODUCTS_QUERY = `
    query getProducts($first: Int!, $cursor: String, $query: String) {
      products(first: $first, after: $cursor, query: $query) {
        edges {
          node {
            id
            title
            status
            variants(first: 1) {
              edges {
                node {
                  price
                }
              }
            }
          }
        }
        pageInfo {
          hasNextPage
          endCursor
        }
      }
    }
  `;

  let queryParts = [];
  if (search) queryParts.push(`title:*${search}*`);
  if (status) queryParts.push(`status:${status}`);
  if (minPrice) queryParts.push(`variants.price:>=${minPrice}`);
  if (maxPrice) queryParts.push(`variants.price:<=${maxPrice}`);

  const query = queryParts.length ? queryParts.join(" AND ") : null;

  const response = await admin.graphql(GET_PRODUCTS_QUERY, {
    variables: { first: 10, cursor, query },
  });

  const responseJson = await response.json();
  const products = responseJson.data.products.edges.map((edge: any) => edge.node);
  const hasNextPage = responseJson.data.products.pageInfo.hasNextPage;
  const nextCursor = responseJson.data.products.pageInfo.endCursor;

  return json({ products, hasNextPage, nextCursor });
};

export default function ProductListPage() {
  const fetcher = useFetcher();
  const [products, setProducts] = useState<Product[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [search, setSearch] = useState<string>("");
  const [status, setStatus] = useState<string>("");
  const [minPrice, setMinPrice] = useState<string>("");
  const [maxPrice, setMaxPrice] = useState<string>("");

  const { products: initialProducts, hasNextPage, nextCursor: initialCursor } =
    useLoaderData<typeof loader>();

  useEffect(() => {
    setProducts(initialProducts);
    setNextCursor(initialCursor);
  }, [initialProducts, initialCursor]);

  const loadMoreProducts = () => {
    if (!nextCursor) return;
    fetcher.load(
      window.location.pathname + `?cursor=${nextCursor}&search=${search}&status=${status}&minPrice=${minPrice}&maxPrice=${maxPrice}`
    );
  };

  const handleSearch = () => {
    const queryParams = new URLSearchParams();
    if (search) queryParams.set("search", search);
    if (status) queryParams.set("status", status);
    if (minPrice) queryParams.set("minPrice", minPrice);
    if (maxPrice) queryParams.set("maxPrice", maxPrice);

    fetcher.load(window.location.pathname + `?${queryParams.toString()}`);
  };

  useEffect(() => {
    if (fetcher.data?.products) {
      setProducts(fetcher.data.products);
      setNextCursor(fetcher.data.hasNextPage ? fetcher.data.nextCursor : null);
    }
  }, [fetcher.data]);

  return (
    <Page title="Danh sách sản phẩm">
      {/* <FiltersWithAResourceList /> */}
      <Card sectioned>
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <TextField
            label="Tìm kiếm sản phẩm"
            value={search}
            onChange={(value) => setSearch(value)}
            onEnterPressed={handleSearch}
          />
          <Select
            label="Trạng thái"
            options={[
              { label: "Tất cả", value: "" },
              { label: "ACTIVE", value: "ACTIVE" },
              { label: "DRAFT", value: "DRAFT" },
            ]}
            value={status}
            onChange={(value) => setStatus(value)}
          />
          <TextField
            label="Giá tối thiểu"
            value={minPrice}
            onChange={(value) => setMinPrice(value)}
            type="number"
          />
          <TextField
            label="Giá tối đa"
            value={maxPrice}
            onChange={(value) => setMaxPrice(value)}
            type="number"
          />
          <Button onClick={handleSearch} primary>
            Tìm kiếm
          </Button>
        </div>
      </Card>

      <ResourceList
        resourceName={{ singular: "product", plural: "products" }}
        items={products}
        renderItem={(item: Product) => (
          <ResourceList.Item id={item.id}>
            <h3>
              <strong>{item.title}</strong>
            </h3>
            <div>Giá: {item.variants?.edges?.[0]?.node.price || "N/A"}</div>
            <div>Trạng thái: {item.status}</div>
            <Button>Edit</Button>
            <Button destructive>Xoá</Button>
          </ResourceList.Item>
        )}
      />

      {nextCursor && (
        <Button onClick={loadMoreProducts} loading={fetcher.state === "loading"}>
          Tải thêm
        </Button>
      )}
    </Page>
  );
}
