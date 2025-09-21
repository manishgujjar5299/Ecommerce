import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import { WishlistContext } from '../context/WishlistContext';
import './ProductCard.css';

const ProductCard = ({ product }) => {
  const { addToCart } = useContext(CartContext);
  const { addToWishlist, removeFromWishlist, isInWishlist } = useContext(WishlistContext);

  const isProductInWishlist = isInWishlist(product._id);

  const handleWishlistToggle = () => {
    if (isProductInWishlist) {
      removeFromWishlist(product._id);
    } else {
      addToWishlist(product);
    }
  };

  const discountPercentage = product.salePrice 
    ? Math.round(((product.price - product.salePrice) / product.price) * 100)
    : 0;

  return (
    <div className="product-card-pressmart">
      <div className="product-image-container">
        <Link to={`/product/${product._id}`}>
          <img src={product.image} alt={product.name} className="product-image" />
        </Link>
        {discountPercentage > 0 && (
          <div className="sale-badge">-{discountPercentage}% OFF</div>
        )}
        <div className="product-actions-overlay">
          <button onClick={handleWishlistToggle} className={`action-btn ${isProductInWishlist ? 'active' : ''}`}>❤️</button>
          <button onClick={() => addToCart(product)} className="action-btn">🛒</button>
          {/* We can add the Quick View feature back later if needed */}
          {/* <button className="action-btn">🔍</button> */}
        </div>
      </div>
      <div className="product-info">
        <span className="product-category-text">{product.category}</span>
        <h3 className="product-name-text">
          <Link to={`/product/${product._id}`}>{product.name}</Link>
        </h3>
        <div className="product-rating-stars">
          {'⭐'.repeat(Math.round(product.rating))}
          <span className="rating-count">({Math.round(product.rating)})</span>
        </div>
        <div className="product-price-container">
          {product.salePrice ? (
            <>
              <span className="sale-price">${product.salePrice.toFixed(2)}</span>
              <span className="original-price">${product.price.toFixed(2)}</span>
            </>
          ) : (
            <span className="regular-price">${product.price.toFixed(2)}</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;