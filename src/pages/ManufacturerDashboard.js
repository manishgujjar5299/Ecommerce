import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import './ManufacturerDashboard.css';

const ManufacturerDashboard = () => {
  const [manufacturerStats, setManufacturerStats] = useState({
    totalProducts: 0,
    approvedProducts: 0,
    pendingProducts: 0,
    totalViews: 0
  });
  const [loading, setLoading] = useState(true);
  const [recentProducts, setRecentProducts] = useState([]);
  const { currentUser, token } = useContext(AuthContext);

  useEffect(() => {
    const fetchManufacturerData = async () => {
      try {
        const [statsRes, productsRes] = await Promise.all([
          fetch('http://localhost:5000/api/manufacturer/stats', {
            headers: { 'x-auth-token': token }
          }),
          fetch('http://localhost:5000/api/manufacturer/recent-products', {
            headers: { 'x-auth-token': token }
          })
        ]);

        if (statsRes.ok) {
          const statsData = await statsRes.json();
          setManufacturerStats(statsData);
        }

        if (productsRes.ok) {
          const productsData = await productsRes.json();
          setRecentProducts(productsData);
        }
      } catch (error) {
        console.error('Failed to fetch manufacturer data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchManufacturerData();
    }
  }, [token]);

  if (loading) return <div className="container"><p>Loading manufacturer dashboard...</p></div>;

  return (
    <div className="manufacturer-dashboard container">
      <div className="dashboard-header">
        <h1>Manufacturer Dashboard</h1>
        <p>Welcome back, {currentUser?.companyName || currentUser?.name}</p>
        {currentUser?.verificationStatus === 'pending' && (
          <div className="verification-notice">
            <span>⏳</span>
            Your manufacturer account is pending approval
          </div>
        )}
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <h3>{manufacturerStats.totalProducts}</h3>
          <p>Total Products</p>
        </div>
        <div className="stat-card success">
          <h3>{manufacturerStats.approvedProducts}</h3>
          <p>Approved Products</p>
        </div>
        <div className="stat-card warning">
          <h3>{manufacturerStats.pendingProducts}</h3>
          <p>Pending Approval</p>
        </div>
        <div className="stat-card">
          <h3>{manufacturerStats.totalViews}</h3>
          <p>Total Views</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <h2>Quick Actions</h2>
        <div className="action-buttons">
          <Link to="/manufacturer/add-product" className="action-btn primary">
            <span>➕</span>
            Add New Product
          </Link>
          <Link to="/manufacturer/my-products" className="action-btn">
            <span>📦</span>
            My Products
          </Link>
          <Link to="/manufacturer/analytics" className="action-btn">
            <span>📊</span>
            Analytics
          </Link>
        </div>
      </div>

      {/* Recent Products */}
      <div className="recent-products">
        <div className="section-header">
          <h2>Recent Products</h2>
          <Link to="/manufacturer/my-products">View All</Link>
        </div>
        <div className="products-grid">
          {recentProducts.length > 0 ? (
            recentProducts.map(product => (
              <div key={product._id} className="product-card-mini">
                <img src={product.image} alt={product.name} />
                <div className="product-info">
                  <h4>{product.name}</h4>
                  <p>${product.price}</p>
                  <span className={`status ${product.status || 'approved'}`}>
                    {product.status || 'approved'}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <p>No products added yet. <Link to="/manufacturer/add-product">Add your first product</Link></p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManufacturerDashboard;
