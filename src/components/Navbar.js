import React, { useState, useContext, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';
import './Navbar.css';

// Note: We are simplifying the profile dropdown for now.
// You can re-add the AuthContext logic later if needed.

const Navbar = () => {
  const { cartItems } = useContext(CartContext);
  const { currentUser, logout } = useContext(AuthContext);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate()

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const cartCount = cartItems.reduce((count, item) => count + item.quantity, 0);

  // This is the function that runs when you submit the search form
  const handleSearch = (e) => {
    e.preventDefault(); // Prevents the page from reloading
    if (searchTerm.trim()) {
      // Navigates to the shop page with the search query
      navigate(`/shop?search=${searchTerm.trim()}`);
      setSearchTerm(''); // Clears the search bar after searching
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);


  return (
    <header className="header">
      {/* --- TOP BAR --- */}
      <div className="header-top">
        <div className="container">
          <div className="header-top-content">
            <div className="contact-info">
              <span>support@pressmart.com</span> | <span>(123) 4567 890</span>
            </div>
            <div className="user-links">
              <span>Welcome to Our Store</span>
            </div>
          </div>
        </div>
      </div>

      {/* --- MAIN HEADER --- */}
      <div className="header-main">
        <div className="container">
          <div className="header-main-content">
            <Link to="/" className="navbar-logo">
              PressMart
            </Link>
            <nav className="navbar-nav">
              <Link to="/">Home</Link>
              <Link to="/shop">Shop</Link>
              <Link to="#">Pages</Link>
              <Link to="#">Blog</Link>
            </nav>

             <form onSubmit={handleSearch} className="navbar-search">
              <input
                type="text"
                placeholder="Search for products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button type="submit">🔍</button>
            </form>

            <div className="navbar-icons">
              <div className="nav-icon profile-menu-container" ref={dropdownRef}>
                <button onClick={() => setIsDropdownOpen(!isDropdownOpen)} className="icon-btn">
                  👤
                </button>
                {isDropdownOpen && (
                  <div className="profile-dropdown">
                    {currentUser ? (
                      <>
                        <div className="dropdown-header">Hello, {currentUser.name}</div>
                        <Link to="/profile" className="dropdown-item" onClick={() => setIsDropdownOpen(false)}>My Profile</Link>
                        <button onClick={() => { logout(); setIsDropdownOpen(false); }} className="dropdown-item dropdown-button">Logout</button>
                      </>
                    ) : (
                      <>
                        <div className="dropdown-header">Welcome</div>
                        <Link to="/login" className="dropdown-item" onClick={() => setIsDropdownOpen(false)}>
                          <button className="dropdown-login-btn">Login / Sign Up</button>
                        </Link>
                      </>
                    )}
                  </div>
                )}
              </div>
              <Link to="/cart" className="icon-btn cart-icon">
                🛒
                {cartCount > 0 && <span className="cart-count">{cartCount}</span>}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;