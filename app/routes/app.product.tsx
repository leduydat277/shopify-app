import { json, LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, useSearchParams } from "@remix-run/react";
import { Page } from "@shopify/polaris";
import { authenticate } from "../shopify.server";
import { IndexFiltersDefaultExample } from "app/component/IndexFilters";
import { PaginationExample } from "app/component/Pagination";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);
  const cursor = url.searchParams.get("cursor");
  const direction = url.searchParams.get("direction") || "next";
  const search = url.searchParams.get("title") || "";
  const status = url.searchParams.get("status");
  const price = url.searchParams.get("price");
  const sort = url.searchParams.get("sort") || "title asc";
  const [sortKey, sortOrder] = sort.split(" ");
  const { admin } = await authenticate.admin(request);

  const GET_PRODUCTS_QUERY = `
    query getProducts($first: Int, $last: Int, $after: String, $before: String, $query: String, $sortKey: ProductSortKeys, $reverse: Boolean) {
      products(first: $first, last: $last, after: $after, before: $before, query: $query, sortKey: $sortKey, reverse: $reverse) {
        edges {
          cursor
          node {
            id
            title
            status
            description
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
          hasPreviousPage
          startCursor
          endCursor
        }
      }
    }
  `;

  let queryParts = [];
  if (search) queryParts.push(`title:*${search}*`);
  if (price) queryParts.push(`variants.price:${price}`);
  if (status) queryParts.push(`status:${status}`);

  const query = queryParts.length ? queryParts.join(" AND ") : null;

  const variables = {
    first: direction === "next" ? 2 : null,
    last: direction === "previous" ? 2 : null,
    after: direction === "next" ? cursor : null,
    before: direction === "previous" ? cursor : null,
    query,
    sortKey: sortKey.toUpperCase(),
    reverse: sortOrder === "desc",
  };
  console.log('variables', direction);

  const response = await admin.graphql(GET_PRODUCTS_QUERY, { variables });
  const responseJson = await response.json();

  if (responseJson.errors) {
    console.error("GraphQL errors:", responseJson.errors);
    throw new Error("Failed to fetch products");
  }

  const products = responseJson.data.products.edges.map((edge: any) => ({
    ...edge.node,
    cursor: edge.cursor,
  }));
  const pageInfo = responseJson.data.products.pageInfo;

  return json({ products, pageInfo });
};

export default function ProductListPage() {
  const { products, pageInfo } = useLoaderData<typeof loader>();
  const [searchParams, setSearchParams] = useSearchParams();

  const updateCursor = (cursor: string, direction: "next" | "previous") => {
    const params = new URLSearchParams(searchParams);
    params.set("cursor", cursor);
    params.set("direction", direction);
    setSearchParams(params);
  };

  const onPrevious = () => {
    if (!pageInfo.hasPreviousPage || !pageInfo.startCursor) return;
    updateCursor(pageInfo.startCursor, "previous");
  };

  const onNext = () => {
    if (!pageInfo.hasNextPage || !pageInfo.endCursor) return;
    updateCursor(pageInfo.endCursor, "next");
  };

  console.log("startCursor:", pageInfo.startCursor);
  console.log("endCursor:", pageInfo.endCursor);
  console.log("hasNextPage:", pageInfo.hasNextPage);
  console.log("hasPreviousPage:", pageInfo.hasPreviousPage);

  return (
    <Page primaryAction={{ content: "Save", disabled: true }} title="Danh sách sản phẩm">
      <IndexFiltersDefaultExample products={products} />
      <PaginationExample onPrevious={onPrevious} onNext={onNext} />
    </Page>
  );
}
