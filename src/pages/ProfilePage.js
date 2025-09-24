import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import './ProfilePage.css';

const ProfilePage = () => {
  const { currentUser, becomeSeller } = useContext(AuthContext);

  const handleBecomeSeller = async () => {
    const success = await becomeSeller();
    if (success) {
      alert('Congratulations! You are now a seller.');
    } else {
      alert('Something went wrong. Please try again.');
    }
  };
  
  // This check is important for when the page first loads
  if (!currentUser) {
    return <p>Loading...</p>;
  }

  return (
    <div className="profile-page container">
      <h1>My Profile</h1>
      <div className="profile-details">
        <p><strong>Name:</strong> {currentUser.name}</p>
      </div>

      <div className="seller-section">
        <h2>Seller Status</h2>
        {currentUser.isSeller ? (
          <div>
            <p>You are a registered seller.</p>
            <Link to="/dashboard/my-products">
              <button className="dashboard-btn">Go to Seller Dashboard</button>
            </Link>
          </div>
        ) : (
          <div>
            <p>Want to sell your own products on PressMart?</p>
            <button onClick={handleBecomeSeller} className="become-seller-btn">
              Become a Seller
            </button>
          </div>
        )}
      </div>
      <div className="manufacturer-section">
        <h2>Manufacturer Status</h2>
        {currentUser?.role === 'manufacturer' ? (
          <div>
            <p>✅ You are a registered manufacturer.</p>
            <Link to="/manufacturer">
             <button className="dashboard-btn">Go to Manufacturer Dashboard</button>
            </Link>
          </div>
        ) : currentUser?.role === 'admin' ? (
          <div>
            <p>👑 You are an administrator.</p>
            <Link to="/admin">
              <button className="dashboard-btn">Go to Admin Dashboard</button>
            </Link>
          </div>
        ) : (
          <div>
            <p>Want to become a manufacturer and sell your products?</p>
            <Link to="/become-manufacturer">
              <button className="become-seller-btn">Become a Manufacturer</button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;