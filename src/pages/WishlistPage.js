import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { WishlistContext } from '../context/WishlistContext';
import ProductCard from '../components/ProductCard';
import './WishlistPage.css';

const WishlistPage = () => {
  const { wishlistItems } = useContext(WishlistContext);

  return (
    <div className="wishlist-page container">
      <h1>My Wishlist</h1>
      {wishlistItems.length > 0 ? (
        <div className="product-grid">
          {wishlistItems.map((product) => (
            <ProductCard key={product._id} product={product} onQuickViewClick={() => {}} />
          ))}
        </div>
      ) : (
        <div className="empty-wishlist">
          <p>Your wishlist is empty.</p>
          <Link to="/shop">
            <button>Discover Products</button>
          </Link>
        </div>
      )}
    </div>
  );
};

export default WishlistPage;