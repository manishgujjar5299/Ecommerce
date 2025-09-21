import React from 'react';
import { Link } from 'react-router-dom';
import './ConfirmationPage.css';

const ConfirmationPage = () => {
  return (
    <div className="confirmation-page container">
      <div className="confirmation-content">
        <h2>✅</h2>
        <h1>Thank You for Your Order!</h1>
        <p>Your order has been placed successfully.</p>
        <p>We've sent a confirmation email to you with the order details.</p>
        <Link to="/shop">
          <button>Continue Shopping</button>
        </Link>
      </div>
    </div>
  );
};

export default ConfirmationPage;