import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import './AdminDashboard.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProducts: 0,
    totalManufacturers: 0,
    pendingApprovals: 0
  });
  const [loading, setLoading] = useState(true);
  const [recentActivity, setRecentActivity] = useState([]);
  const { token } = useContext(AuthContext);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [statsRes, activityRes] = await Promise.all([
          fetch('${API_URL}/admin/stats', {
            headers: { 'x-auth-token': token }
          }),
          fetch('${API_URL}/admin/recent-activity', {
            headers: { 'x-auth-token': token }
          })
        ]);

        if (statsRes.ok) {
          const statsData = await statsRes.json();
          setStats(statsData);
        }

        if (activityRes.ok) {
          const activityData = await activityRes.json();
          setRecentActivity(activityData);
        }
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchDashboardData();
    }
  }, [token]);

  if (loading) return <div className="container"><p>Loading admin dashboard...</p></div>;

  return (
    <div className="admin-dashboard container">
      <div className="dashboard-header">
        <h1>Admin Dashboard</h1>
        <p>Manage your e-commerce platform</p>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <h3>{stats.totalUsers}</h3>
          <p>Total Users</p>
          <Link to="/admin/users">View All</Link>
        </div>
        <div className="stat-card">
          <h3>{stats.totalProducts}</h3>
          <p>Total Products</p>
          <Link to="/admin/products">Manage</Link>
        </div>
        <div className="stat-card">
          <h3>{stats.totalManufacturers}</h3>
          <p>Manufacturers</p>
          <Link to="/admin/manufacturers">View All</Link>
        </div>
        <div className="stat-card urgent">
          <h3>{stats.pendingApprovals}</h3>
          <p>Pending Approvals</p>
          <Link to="/admin/approvals">Review</Link>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <h2>Quick Actions</h2>
        <div className="action-buttons">
          <Link to="/admin/users" className="action-btn">
            <span>👥</span>
            Manage Users
          </Link>
          <Link to="/admin/products" className="action-btn">
            <span>📦</span>
            Manage Products
          </Link>
          <Link to="/admin/manufacturers" className="action-btn">
            <span>🏭</span>
            Manufacturers
          </Link>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="recent-activity">
        <h2>Recent Activity</h2>
        <div className="activity-list">
          {recentActivity.length > 0 ? (
            recentActivity.map((activity, index) => (
              <div key={index} className="activity-item">
                <span className="activity-icon">{activity.icon}</span>
                <div className="activity-content">
                  <p>{activity.message}</p>
                  <span className="activity-time">{activity.time}</span>
                </div>
              </div>
            ))
          ) : (
            <p>No recent activity</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;