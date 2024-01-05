import React from 'react';
import { formatCurrencyString } from 'use-shopping-cart';
import { type Product as DataProduct } from '../data/product';

interface ProductProps {
  product: DataProduct;
  addProduct?: (item: DataProduct) => void;
  removeProduct?: (id: string) => void;
}

const Product: React.FC<ProductProps> = ({
  product,
  addProduct = () => {},
  removeProduct = () => {},
}) => {
  return (
    <div
      key={product.id}
      className='product'
    >
      <div className='product-image-container'>
        <img
          src={
            product.image ?? 'https://actogmbh.com/files/no-product-image.png'
          }
          alt={product.name}
        />
      </div>
      <h2>{product.name}</h2>
      <p className='price'>
        {formatCurrencyString({
          value: product.price,
          currency: product.currency,
        })}
      </p>
      <button
        className='cart-style-background'
        onClick={() => {
          addProduct(product);
        }}
      >
        Add to cart
      </button>
      <button
        className='cart-style-background'
        onClick={() => {
          removeProduct(product.id);
        }}
      >
        Remove
      </button>
    </div>
  );
};

export default Product;
