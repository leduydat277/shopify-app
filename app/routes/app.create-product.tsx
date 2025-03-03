
import { Page } from "@shopify/polaris";
import { FormProduct } from "app/component/FormProduct";
import { Product } from "app/stores";

export default function CreateProductPage() {
  
  const initialProduct: Product = {
    id: "",       
    title: "",
    status: "",
  };

 
   const handleSubmit = async (newProduct: Product) => {
      console.log("Updated product:", newProduct);
      try {
        const response = await fetch("/app/api/create-product", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ product: newProduct }),
        });
        const result = await response.json();
        console.log("Product updated:", result);
       
        
      } catch (error) {
        console.error("Error updating product:", error);
      }
    };
  
    
  

  
  const handleClose = () => {
    console.log("Form closed");
   
  };

  return (
    <Page title="Thêm mới sản phẩm">
      <FormProduct
        initialProduct={initialProduct}
        onSubmit={handleSubmit}
        onClose={handleClose}
      />
    </Page>
  );
}
