// Fixed ProductCard.js - Added proper validations to prevent crashes
import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import { WishlistContext } from '../context/WishlistContext';
import './ProductCard.css';

const ProductCard = ({ product, onQuickViewClick }) => {
  const { addToCart } = useContext(CartContext);
  const { addToWishlist, removeFromWishlist, isInWishlist } = useContext(WishlistContext);

  // Validation: Check if product exists and has required fields
  if (!product) {
    console.warn('ProductCard: No product data provided');
    return (
      <div className="product-card-pressmart">
        <div className="product-error">
          <p>Product data unavailable</p>
        </div>
      </div>
    );
  }

  // Validation: Check for required fields
  if (!product._id || !product.name || !product.image) {
    console.warn('ProductCard: Missing required product fields', product);
    return (
      <div className="product-card-pressmart">
        <div className="product-error">
          <p>Product information incomplete</p>
        </div>
      </div>
    );
  }

  // Safe defaults for optional fields
  const safeProduct = {
    _id: product._id,
    name: product.name || 'Unnamed Product',
    price: typeof product.price === 'number' ? product.price : 0,
    salePrice: typeof product.salePrice === 'number' ? product.salePrice : null,
    image: product.image || '/placeholder-image.jpg',
    category: product.category || 'Uncategorized',
    rating: typeof product.rating === 'number' ? product.rating : 0,
    description: product.description || 'No description available'
  };

  // Safe wishlist check
  const isProductInWishlist = safeProduct._id ? isInWishlist(safeProduct._id) : false;

  const handleWishlistToggle = () => {
    if (!safeProduct._id) {
      console.error('Cannot toggle wishlist: Product ID missing');
      return;
    }

    try {
      if (isProductInWishlist) {
        removeFromWishlist(safeProduct._id);
      } else {
        addToWishlist(safeProduct);
      }
    } catch (error) {
      console.error('Error toggling wishlist:', error);
    }
  };

  const handleAddToCart = () => {
    if (!safeProduct._id) {
      console.error('Cannot add to cart: Product ID missing');
      return;
    }

    try {
      addToCart(safeProduct);
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  };

  const handleQuickView = () => {
    if (onQuickViewClick && typeof onQuickViewClick === 'function') {
      try {
        onQuickViewClick(safeProduct);
      } catch (error) {
        console.error('Error in quick view:', error);
      }
    }
  };

  // Calculate discount percentage safely
  const discountPercentage = safeProduct.salePrice && safeProduct.price > safeProduct.salePrice
    ? Math.round(((safeProduct.price - safeProduct.salePrice) / safeProduct.price) * 100)
    : 0;

  // Safe rating display
  const displayRating = Math.max(0, Math.min(5, Math.round(safeProduct.rating)));
  const ratingStars = '★'.repeat(displayRating) + '☆'.repeat(5 - displayRating);

  return (
    <div className="product-card-pressmart">
      <div className="product-image-container">
        <Link to={`/product/${safeProduct._id}`}>
          <img 
            src={safeProduct.image} 
            alt={safeProduct.name} 
            className="product-image"
            onError={(e) => {
              e.target.src = '/placeholder-image.jpg'; // Fallback image
              console.warn('Image failed to load:', safeProduct.image);
            }}
          />
        </Link>
        {discountPercentage > 0 && (
          <div className="sale-badge">-{discountPercentage}% OFF</div>
        )}
        <div className="product-actions-overlay">
          <button 
            onClick={handleWishlistToggle} 
            className={`action-btn ${isProductInWishlist ? 'active' : ''}`}
            title={isProductInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            {isProductInWishlist ? '❤️' : '🤍'}
          </button>
          <button 
            onClick={handleAddToCart} 
            className="action-btn"
            title="Add to cart"
          >
            🛒
          </button>
          {onQuickViewClick && (
            <button 
              onClick={handleQuickView} 
              className="action-btn"
              title="Quick view"
            >
              👁️
            </button>
          )}
        </div>
      </div>
      <div className="product-info">
        <span className="product-category-text">{safeProduct.category}</span>
        <h3 className="product-name-text">
          <Link to={`/product/${safeProduct._id}`} title={safeProduct.name}>
            {safeProduct.name}
          </Link>
        </h3>
        <div className="product-rating-stars">
          <span className="stars">{ratingStars}</span>
          <span className="rating-count">({safeProduct.rating.toFixed(1)})</span>
        </div>
        <div className="product-price-container">
          {safeProduct.salePrice ? (
            <>
              <span className="sale-price">${safeProduct.salePrice.toFixed(2)}</span>
              <span className="original-price">${safeProduct.price.toFixed(2)}</span>
            </>
          ) : (
            <span className="regular-price">${safeProduct.price.toFixed(2)}</span>
          )}
        </div>
      </div>
    </div>
  );
};

// Add PropTypes for better development experience (optional)
ProductCard.defaultProps = {
  product: null,
  onQuickViewClick: null
};

export default ProductCard;