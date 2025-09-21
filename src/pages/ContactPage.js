import React from 'react';
import './StaticPage.css'; // Use the shared CSS file

const ContactPage = () => {
  return (
    <div className="static-page container">
      <h1>Contact Us</h1>
      <p>We're here to help! If you have any questions or need support, feel free to reach out to us.</p>
      
      <h2>Online Support</h2>
      <p>Our support team is available 24/7. You can contact us via:</p>
      <ul>
        <li><strong>Email:</strong> support@pressmart.com</li>
        <li><strong>Phone:</strong> (123) 4567 890</li>
        <li><strong>Address:</strong> 123 E-commerce St, New Delhi, India</li>
      </ul>
    </div>
  );
};

export default ContactPage;