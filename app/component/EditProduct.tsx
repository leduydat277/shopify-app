
import { FormProduct } from "./FormProduct";
import { Product } from "app/stores"; 

interface ProductEditProps {
  product: Product;
  onClose: () => void;
}

export const EditProduct = ({ product, onClose }: ProductEditProps) => {
  
  const handleSubmit = async (updatedProduct: Product) => {
    console.log("Updated product:", updatedProduct);
    try {
      const response = await fetch("/app/api/update-product", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ product: updatedProduct }),
      });
      const result = await response.json();
      console.log("Product updated:", result);
     
      onClose();
    } catch (error) {
      console.error("Error updating product:", error);
    }
  };

  const handleClose = () => {
    console.log("Form closed");
    onClose();
  };

  return (
    <FormProduct
      initialProduct={product}
      onSubmit={handleSubmit}
      onClose={handleClose}
    />
  );
};
