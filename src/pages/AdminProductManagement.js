import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
// import './AdminProductManagement.css';
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
const AdminProductManagement = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const { token } = useContext(AuthContext);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('${API_URL}/admin/products', {
          headers: { 'x-auth-token': token }
        });
        if (response.ok) {
          const data = await response.json();
          setProducts(data);
        }
      } catch (error) {
        console.error('Failed to fetch products:', error);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchProducts();
    }
  }, [token]);

  const handleStatusChange = async (productId, newStatus) => {
    try {
      const response = await fetch(`${API_URL}/admin/products/${productId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        setProducts(products.map(product => 
          product._id === productId ? { ...product, status: newStatus } : product
        ));
        alert(`Product ${newStatus} successfully!`);
      }
    } catch (error) {
      alert('Failed to update product status');
    }
  };

  const filteredProducts = products.filter(product => {
    if (filterStatus === 'all') return true;
    return product.status === filterStatus;
  });

  if (loading) return <div className="container"><p>Loading products...</p></div>;

  return (
    <div className="admin-product-management container">
      <div className="page-header">
        <h1>Product Management</h1>
        <p>Approve or reject manufacturer products</p>
      </div>

      <div className="filters">
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="status-filter"
        >
          <option value="all">All Products</option>
          <option value="pending">Pending Approval</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      <div className="products-table-container">
        <table className="products-table">
          <thead>
            <tr>
              <th>Image</th>
              <th>Name</th>
              <th>Price</th>
              <th>Category</th>
              <th>Status</th>
              <th>Seller</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.map(product => (
              <tr key={product._id}>
                <td>
                  <img src={product.image} alt={product.name} className="product-table-img" />
                </td>
                <td>{product.name}</td>
                <td>${product.price?.toFixed(2)}</td>
                <td>{product.category}</td>
                <td>
                  <span className={`status-badge ${product.status || 'approved'}`}>
                    {product.status || 'approved'}
                  </span>
                </td>
                <td>{product.seller?.name}</td>
                <td>
                  <div className="action-buttons">
                    <button 
                      onClick={() => handleStatusChange(product._id, 'approved')}
                      className="approve-btn"
                      disabled={product.status === 'approved'}
                    >
                      Approve
                    </button>
                    <button 
                      onClick={() => handleStatusChange(product._id, 'rejected')}
                      className="reject-btn"
                      disabled={product.status === 'rejected'}
                    >
                      Reject
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminProductManagement;