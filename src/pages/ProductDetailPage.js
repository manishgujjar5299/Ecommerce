import React, { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
// import { products } from '../data/products'; // ❌ REMOVE THIS
import { CartContext } from '../context/CartContext';
import './ProductDetailPage.css';

const ProductDetailPage = () => {
  const { id } = useParams();
  const { addToCart } = useContext(CartContext);
  const [product, setProduct] = useState(null); // State for the single product

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/products/${id}`);
        const data = await response.json();
        setProduct(data);
      } catch (error) {
        console.error("Failed to fetch product:", error);
      }
    };
    fetchProduct();
  }, [id]); // Re-run this effect if the ID in the URL changes

  if (!product) {
    return <div className="container"><h2>Loading...</h2></div>;
  }

  return (
    <div className="product-detail-page container">
      <div className="product-detail-layout">
        <div className="product-detail-image">
          <img src={product.image} alt={product.name} />
        </div>
        <div className="product-detail-info">
          <h1>{product.name}</h1>
          <div className="product-rating">{'⭐'.repeat(Math.round(product.rating))} ({product.rating})</div>
          <p className="product-price">${product.price.toFixed(2)}</p>
          <p className="product-description">{product.description}</p>
          <button onClick={() => addToCart(product)} className="add-to-cart-btn">
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;