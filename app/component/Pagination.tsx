import {Pagination} from '@shopify/polaris';
import React from 'react';

export const  PaginationExample = ({onPrevious, onNext}) =>{
  return (
    <Pagination
      hasPrevious
      onPrevious={onPrevious}
      hasNext
      onNext={onNext}
    />
  );
}