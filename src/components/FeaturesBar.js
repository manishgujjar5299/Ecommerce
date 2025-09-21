import React from 'react';
import { Link } from 'react-router-dom';
import './FeaturesBar.css';

const FeaturesBar = () => {
  return (
    <section className="features-bar">
      <div className="container">
        <div className="features-grid">
          <Link to="/shipping-policy" className="feature-item-link">
            <div className="feature-item">
              <div className="feature-icon">🚚</div>
              <div className="feature-text">
                <h4>Free Shipping</h4>
                <p>On All Orders Over $99</p>
              </div>
            </div>
          </Link>
          <div className="feature-item">
            <div className="feature-icon">🔒</div>
            <div className="feature-text">
              <h4>Secure Payment</h4>
              <p>We ensure secure payment</p>
            </div>
          </div>
          <Link to="/returns" className="feature-item-link">
            <div className="feature-item">
              <div className="feature-icon">💰</div>
              <div className="feature-text">
                <h4>30 Days Return</h4>
                <p>100% Money Back Guarantee</p>
              </div>
            </div>
          </Link>
          <Link to="/contact" className="feature-item-link">
            <div className="feature-item">
              <div className="feature-icon">💬</div>
              <div className="feature-text">
                <h4>Online Support</h4>
                <p>24/7 Online Support</p>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturesBar;