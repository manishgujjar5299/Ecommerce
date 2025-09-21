import React from 'react';
import './StaticPage.css'; // Use the shared CSS file

const ReturnsPage = () => {
  return (
    <div className="static-page container">
      <h1>30 Days Return Policy</h1>
      <p>We want you to be completely satisfied with your purchase. If you are not, we offer a 30-day return policy from the date of delivery.</p>
      
      <h2>Conditions for Return</h2>
      <ul>
        <li>The product must be unused and in its original condition.</li>
        <li>Original packaging and all tags must be intact.</li>
        <li>The return must be initiated within 30 days of receiving the item.</li>
      </ul>

      <h2>Refund Process</h2>
      <p>Once we receive and inspect the returned item, we will process your refund. The amount will be credited to your original payment method within 5-7 business days.</p>
    </div>
  );
};

export default ReturnsPage;