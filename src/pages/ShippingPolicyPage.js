import React from 'react';
import './StaticPage.css'; // Use the shared CSS file

const ShippingPolicyPage = () => {
  return (
    <div className="static-page container">
      <h1>Shipping Policy</h1>
      <p>We are committed to delivering your order accurately, in good condition, and always on time.</p>
      
      <h2>Shipping Coverage</h2>
      <p>We ship to all major cities across India. We partner with reputable courier services to ensure your products reach you safely.</p>

      <h2>Shipping Charges</h2>
      <p>We offer **Free Shipping** on all orders over $99. For orders below $99, a flat shipping fee of $10 will be applied.</p>
      
      <h2>Delivery Time</h2>
      <p>Your order will be delivered within 5-7 working days from the date of dispatch. You will receive a tracking link via email once your order has been shipped.</p>
    </div>
  );
};

export default ShippingPolicyPage;