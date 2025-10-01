import React, { useState, useEffect, useContext } from 'react';
import {Link, useParams, useNavigate } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';
import './ProductDetailPage.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // State for the review form
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');

  const { addToCart } = useContext(CartContext);
  const { currentUser, token } = useContext(AuthContext);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_URL}/products/${id}`);
        if (!response.ok) {
          throw new Error('Product not found');
        }
        const data = await response.json();
        setProduct(data);
      } catch (error) {
        console.error("Failed to fetch product:", error);
        navigate('/shop'); // Redirect if product not found
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id, navigate]);

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!token) {
      alert('Please login to submit a review.');
      return;
    }
    try {
      const response = await fetch(`${API_URL}/products/${id}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token,
        },
        body: JSON.stringify({ rating, comment }),
      });

      if (response.ok) {
        alert('Review submitted successfully!');
        setRating(0);
        setComment('');
        // Refetch product to show the new review
        const updatedResponse = await fetch(`${API_URL}/products/${id}`);
        const updatedData = await updatedResponse.json();
        setProduct(updatedData);
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.msg || 'Failed to submit review.'}`);
      }
    } catch (error) {
      alert('An error occurred while submitting your review.');
    }
  };


  if (loading) {
    return <div className="container"><p>Loading product...</p></div>;
  }

  if (!product) {
    return <div className="container"><p>Product not found.</p></div>;
  }

  return (
    <div className="product-detail-page container">
      <div className="product-detail-main">
        <div className="product-detail-image">
          <img src={product.image} alt={product.name} />
        </div>
        <div className="product-detail-info">
          <h1>{product.name}</h1>
          <div className="product-rating">
            {'⭐'.repeat(Math.round(product.rating))} 
            <span> ({product.numReviews} reviews)</span>
          </div>
          <p className="product-price">${product.price.toFixed(2)}</p>
          <p className="product-description-short">{product.description}</p>
          <button onClick={() => addToCart(product)} className="add-to-cart-btn-detail">
            Add to Cart
          </button>
        </div>
      </div>

      <div className="product-reviews-section">
        <h2>Customer Reviews</h2>
        {product.reviews.length === 0 && <p>No reviews yet.</p>}
        <div className="reviews-list">
          {product.reviews.map((review) => (
            <div key={review._id} className="review-item">
              <strong>{review.name}</strong>
              <div className="review-rating">{'⭐'.repeat(review.rating)}</div>
              <p className="review-date">{new Date(review.createdAt).toLocaleDateString()}</p>
              <p className="review-comment">{review.comment}</p>
            </div>
          ))}
        </div>

        <div className="review-form-container">
          {currentUser ? (
            <form onSubmit={handleReviewSubmit}>
              <h3>Write a Customer Review</h3>
              <div className="form-group">
                <label>Rating</label>
                <select value={rating} onChange={(e) => setRating(e.target.value)} required>
                  <option value="">Select...</option>
                  <option value="1">1 - Poor</option>
                  <option value="2">2 - Fair</option>
                  <option value="3">3 - Good</option>
                  <option value="4">4 - Very Good</option>
                  <option value="5">5 - Excellent</option>
                </select>
              </div>
              <div className="form-group">
                <label>Comment</label>
                <textarea value={comment} onChange={(e) => setComment(e.target.value)} required></textarea>
              </div>
              <button type="submit">Submit Review</button>
            </form>
          ) : (
            <p>Please <Link to="/login">log in</Link> to write a review.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;