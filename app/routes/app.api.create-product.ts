import { json, ActionFunctionArgs } from "@remix-run/node";
import { authenticate } from "../shopify.server";

export const action = async ({ request }: ActionFunctionArgs) => {
  const { admin } = await authenticate.admin(request);
  const { product } = await request.json();

 
  const { id, ...productInput } = product;

  const CREATE_PRODUCT_MUTATION = `
    mutation createProduct($input: ProductInput!) {
      productCreate(input: $input) {
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

  const response = await admin.graphql(CREATE_PRODUCT_MUTATION, {
    variables: { input: productInput },
  });
  const result = await response.json();

  return json(result);
};
