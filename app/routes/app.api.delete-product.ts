import { json, ActionFunctionArgs } from "@remix-run/node";
import { authenticate } from "../shopify.server";

export const action = async ({ request }: ActionFunctionArgs) => {

    const { admin } = await authenticate.admin(request);
    const { id } = await request.json();

    if (!id) {
        return json({ error: "Product id is required" }, { status: 400 });
    }

    const DELETE_PRODUCT_MUTATION = `
    mutation deleteProduct($id: ID!) {
      productDelete(input: { id: $id }) {
        deletedProductId
        userErrors {
          field
          message
        }
      }
    }
  `;


    const response = await admin.graphql(DELETE_PRODUCT_MUTATION, { variables: { id } });
    const result = await response.json();


    if (result.data?.productDelete?.userErrors?.length) {
        return json({ errors: result.data.productDelete.userErrors }, { status: 400 });
    }

    return json({ success: true, deletedProductId: result.data.productDelete.deletedProductId });
};
