import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import './AdminUserManagement.css';
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
const AdminUserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterVerification, setFilterVerification] = useState('all');
  const { token } = useContext(AuthContext);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch('${API_URL}/admin/users', {
          headers: { 'x-auth-token': token }
        });
        if (response.ok) {
          const data = await response.json();
          setUsers(data);
        }
      } catch (error) {
        console.error('Failed to fetch users:', error);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchUsers();
    }
  }, [token]);

  // Approve manufacturer function
  const approveManufacturer = async (userId) => {
    try {
      const response = await fetch(`${API_URL}/admin/users/${userId}/verify`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token
        },
        body: JSON.stringify({ verificationStatus: 'approved' })
      });

      if (response.ok) {
        const result = await response.json();
        // Update user in state
        setUsers(users.map(user => 
          user._id === userId ? { ...user, verificationStatus: 'approved', isSeller: true } : user
        ));
        alert(result.msg || 'Manufacturer approved successfully');
      } else {
        const errorData = await response.json();
        alert(`Failed to approve: ${errorData.msg}`);
      }
    } catch (error) {
      console.error('Approval error:', error);
      alert('Failed to approve manufacturer');
    }
  };

  // Reject manufacturer function
  const rejectManufacturer = async (userId) => {
    if (!window.confirm('Are you sure you want to reject this manufacturer application?')) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/admin/users/${userId}/verify`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token
        },
        body: JSON.stringify({ verificationStatus: 'rejected' })
      });

      if (response.ok) {
        const result = await response.json();
        // Update user in state
        setUsers(users.map(user => 
          user._id === userId ? { ...user, verificationStatus: 'rejected', isSeller: false } : user
        ));
        alert(result.msg || 'Manufacturer rejected successfully');
      } else {
        const errorData = await response.json();
        alert(`Failed to reject: ${errorData.msg}`);
      }
    } catch (error) {
      console.error('Rejection error:', error);
      alert('Failed to reject manufacturer');
    }
  };


  const handleRoleChange = async (userId, newRole) => {
    try {
      const response = await fetch(`${API_URL}/admin/users/${userId}/role`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token
        },
        body: JSON.stringify({ role: newRole })
      });

      if (response.ok) {
        setUsers(users.map(user => 
          user._id === userId ? { ...user, role: newRole } : user
        ));
        alert('User role updated successfully');
      }
    } catch (error) {
      alert('Failed to update user role');
    }
  };
  

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    const matchesVerification = filterVerification === 'all' || user.verificationStatus === filterVerification;
    return matchesSearch && matchesRole && matchesVerification;
  });

  const pendingManufacturers = users.filter(user => user.role === 'manufacturer' && user.verificationStatus === 'pending');

  if (loading) return <div className="container"><p>Loading users...</p></div>;

  return (
    <div className="admin-user-management container">
      <div className="page-header">
        <h1>User Management</h1>
        <p>Manage all users on your platform</p>
      </div>

      
      {/* Pending Manufacturers Section */}
      {pendingManufacturers.length > 0 && (
        <div className="pending-manufacturers">
          <h2>Pending Manufacturer Approvals ({pendingManufacturers.length})</h2>
          <div className="pending-cards">
            {pendingManufacturers.map(user => (
              <div key={user._id} className="pending-card">
                <div className="pending-card-header">
                  <h3>{user.name}</h3>
                  <span className="pending-badge">Pending</span>
                </div>
                <div className="pending-card-body">
                  <p><strong>Email:</strong> {user.email}</p>
                  <p><strong>Company:</strong> {user.companyName}</p>
                  <p><strong>Applied:</strong> {new Date(user.createdAt).toLocaleDateString()}</p>
                  <p><strong>Description:</strong> {user.companyDescription}</p>
                </div>
                <div className="pending-card-actions">
                  <button 
                    onClick={() => approveManufacturer(user._id)}
                    className="approve-btn"
                  >
                    Approve
                  </button>
                  <button 
                    onClick={() => rejectManufacturer(user._id)}
                    className="reject-btn"
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="filters">
        <input
          type="text"
          placeholder="Search users..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
        <select
          value={filterRole}
          onChange={(e) => setFilterRole(e.target.value)}
          className="role-filter"
        >
          <option value="all">All Roles</option>
          <option value="customer">Customers</option>
          <option value="seller">Sellers</option>
          <option value="manufacturer">Manufacturers</option>
          <option value="admin">Admins</option>
        </select>
        <select
          value={filterVerification}
          onChange={(e) => setFilterVerification(e.target.value)}
          className="verification-filter"
        >
          <option value="all">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      <div className="users-table-container">
        <table className="users-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Joined</th>
              <th>VerificationStatus</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map(user => (
              <tr key={user._id}>
                <td>
                  <div className="user-info">
                    <strong>{user.name}</strong>
                    {user.companyName && <span>{user.companyName}</span>}
                  </div>
                </td>
                <td>{user.email}</td>
                <td>
                  <select
                    value={user.role}
                    onChange={(e) => handleRoleChange(user._id, e.target.value)}
                    className="role-select"
                  >
                    <option value="customer">Customer</option>
                    <option value="seller">Seller</option>
                    <option value="manufacturer">Manufacturer</option>
                    <option value="admin">Admin</option>
                  </select>
                </td>
                <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                <td>
                  <span className={`status-badge ${user.verificationStatus || 'approved'}`}>
                    {user.verificationStatus || 'Approved'}
                  </span>
                  {user.role === 'manufacturer' && user.verificationStatus === 'pending' && (
                    <div className="inline-actions">
                      <button 
                        onClick={() => approveManufacturer(user._id)}
                        className="mini-approve-btn"
                      >
                        ✓
                      </button>
                      <button 
                        onClick={() => rejectManufacturer(user._id)}
                        className="mini-reject-btn"
                      >
                        ✗
                      </button>
                    </div>
                  )}
                </td>
                <td>
                  <button className="action-btn-small">View</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminUserManagement;
