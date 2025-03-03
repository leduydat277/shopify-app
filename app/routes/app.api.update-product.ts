import { json, ActionFunctionArgs } from "@remix-run/node";
import { authenticate } from "../shopify.server";

export const action = async ({ request }: ActionFunctionArgs) => {
  const { admin } = await authenticate.admin(request);
  const { product } = await request.json();

  const UPDATE_PRODUCT_MUTATION = `
    mutation updateProduct($input: ProductInput!) {
      productUpdate(input: $input) {
        product {
          id
          title
          status
        }
        userErrors {
          field
          message
        }
      }
    }
  `;

  const response = await admin.graphql(UPDATE_PRODUCT_MUTATION, {
    variables: { input: product },
  });
  const result = await response.json();

  return json(result);
};
