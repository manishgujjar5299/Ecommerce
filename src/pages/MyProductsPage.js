import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import './MyProductsPage.css';

const MyProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { token } = useContext(AuthContext);

  useEffect(() => {
    const fetchMyProducts = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/products/my-products', {
          headers: {
            'x-auth-token': token,
          },
        });
        const data = await response.json();
        setProducts(data);
      } catch (error) {
        console.error("Failed to fetch products:", error);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchMyProducts();
    }
  }, [token]);

  if (loading) {
    return <div className="container"><p>Loading your products...</p></div>;
  }

  return (
    <div className="my-products-page container">
      <div className="dashboard-header">
        <h1>My Products</h1>
        <Link to="/dashboard/add-product">
          <button className="add-product-btn">+ Add New Product</button>
        </Link>
      </div>

      {products.length > 0 ? (
        <table className="products-table">
          <thead>
            <tr>
              <th>Image</th>
              <th>Name</th>
              <th>Price</th>
              <th>Category</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map(product => (
              <tr key={product._id}>
                <td><img src={product.image} alt={product.name} className="product-table-img" /></td>
                <td>{product.name}</td>
                <td>${product.price.toFixed(2)}</td>
                <td>{product.category}</td>
                <td>
                  <button className="action-btn-edit">Edit</button>
                  <button className="action-btn-delete">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>You haven't added any products yet.</p>
      )}
    </div>
  );
};

export default MyProductsPage;