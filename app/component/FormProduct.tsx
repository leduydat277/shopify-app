import { Form, FormLayout, TextField, Button } from '@shopify/polaris';
import { Product, useProductStore } from 'app/stores';
import { useCallback, useEffect, useRef } from 'react';

interface Props {
  initialProduct: Product;
  onSubmit: (product: Product) => void;
  onClose: () => void;
}

export const FormProduct = ({ initialProduct, onSubmit, onClose }: Props) => {
    
    const product = useProductStore((state) => state.product);
    const setId = useProductStore((state) => state.setId);
   const setTitle = useProductStore((state) => state.setTitle);
   const setStatus = useProductStore((state) => state.setStatus);
   useEffect(() => {
    setId(initialProduct.id);
    setTitle(initialProduct.title);
    setStatus(initialProduct.status);
  }, [initialProduct]);

  const handleSubmit = useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      onSubmit(product);
    },
    [onSubmit, product]
  );
  
console.log('product_id', initialProduct.id);

 

  return (
    <Form onSubmit={handleSubmit}>
      <FormLayout>

        <TextField
          label="ID"
          value={ product.id || ""}
          onChange={setId}
        />
        <TextField
          label="Tiêu đề"
          value={product.title || ""}
          onChange={setTitle}
        />
         <TextField
          label="Tiêu đề"
          value={product.status || ""}
          onChange={setStatus}
        />
       
        <Button submit primary>
          Lưu thay đổi
        </Button>
      </FormLayout>
    </Form>
  );
};
