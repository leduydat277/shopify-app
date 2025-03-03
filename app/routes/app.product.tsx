import { json, LoaderFunctionArgs } from "@remix-run/node";
import { useState } from "react";
import {
  Page,
  ResourceList,
  Text,
  Link as PolarisLink,
  Button,
  Modal,
} from "@shopify/polaris";
import { authenticate } from "../shopify.server";
import { useLoaderData } from "@remix-run/react";
import { EditProduct } from "app/component/EditProduct";
import { Product } from "app/stores";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { admin } = await authenticate.admin(request);

  const GET_PRODUCTS_QUERY = `
    query getProducts($first: Int!) {
      products(first: $first) {
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
      }
    }
  `;

  const response = await admin.graphql(GET_PRODUCTS_QUERY, { variables: { first: 10 } });
  const responseJson = await response.json();

  const products: Product[] = responseJson.data.products.edges.map((edge: any) => edge.node);

  return json({ products });
};

export default function ProductListPage() {
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const { products } = useLoaderData<typeof loader>();
  console.log('products', products);


  const handleDeleteProduct = async (productId: string) => {
    const confirmed = window.confirm("XOÁ SẢN PHẨM?");
    if (!confirmed) return;
  
    try {
      const response = await fetch("/app/api/delete-product", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: productId }),
      });
      const result = await response.json();
      console.log("Product deleted:", result);
      
      window.location.reload();
    } catch (error) {
      console.error("Error deleting product:", error);
    }
  };

  return (
    <Page title="Danh sách sản phẩm">
      <PolarisLink url="/app/create-product">THÊM SẢN PHẨM</PolarisLink>
      <ResourceList
        resourceName={{ singular: 'product', plural: 'products' }}
        items={products}
        renderItem={(item: Product) => {
          const price =
            item.variants && item.variants.edges.length > 0
              ? item.variants.edges[0].node.price
              : "N/A";
          return (
            <ResourceList.Item id={item.id}>
              <h3>
                <Text variation="strong">{item.title}</Text>
              </h3>
              <div>Giá: {price}</div>
              <div>Trạng thái: {item.status}</div>
              <Button onClick={() => setEditingProduct(item)}>Sửa</Button>
              <Button destructive onClick={() => handleDeleteProduct(item.id)}>
                Xoá
              </Button>
            </ResourceList.Item>
          );
        }}
      />

      {editingProduct && (
        <Modal
          open={true}
          onClose={() => setEditingProduct(null)}
          title="Chỉnh sửa sản phẩm"
        >
          <Modal.Section>
            <EditProduct
              product={editingProduct}
              onClose={() => setEditingProduct(null)}
            />
          </Modal.Section>
        </Modal>
      )}
    </Page>
  );
}
