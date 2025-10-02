import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-column">
            <h4 className="footer-heading">ReactShop</h4>
            <p>Your one-stop shop for everything you need. High-quality products at the best prices.</p>
          </div>
          <div className="footer-column">
            <h4 className="footer-heading">Quick Links</h4>
            <ul className="footer-links">
              <li><Link to="/">Home</Link></li>
              <li><Link to="/shop">Shop</Link></li>
              <li><Link to="/about">About Us</Link></li>
              <li><Link to="/contact">Contact</Link></li>
            </ul>
          </div>
          <div className="footer-column">
            <h4 className="footer-heading">Help</h4>
            <ul className="footer-links">
               <li><Link to="/faq">FAQ</Link></li>
              <li><Link to="/shipping-policy">Shipping</Link></li>
              <li><Link to="/returns">Returns</Link></li>
              <li><Link to="/privacy-policy">Privacy Policy</Link></li>
            </ul>
          </div>
          <div className="footer-column">
            <h4 className="footer-heading">Follow Us</h4>
            <div className="social-links">
              {/* <a href="#">FB</a> */}
              <a href="https://instagram.com/pressmart" target="_blank" rel="noopener noreferrer">IG</a>
              <a href="https://twiter.com/pressmart"target="_blank" rel="noopener noreferrer">TW</a>
            </div>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <p>&copy; 2025 PressMart. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;