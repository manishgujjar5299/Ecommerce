import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate, useLocation} from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import './MyProductsPage.css';

const MyProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { token, currentUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const isAdminPage = location.pathname.startsWith('/admin');

  useEffect(() => {
    const fetchMyProducts = async () => {
      try {
        const endpoint = isAdminPage ? 'http://localhost:5000/api/admin/products' : 'http://localhost:5000/api/products/my-products';
        const response = await fetch(endpoint, {
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
  }, [token, isAdminPage]);

  const handleEdit = (productId) => {
    // Future mein EditProductPage banayenge
    navigate(`/dashboard/edit-product/${productId}`);
  };

  const handleDelete = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        const response = await fetch(`http://localhost:5000/api/products/${productId}`, {
          method: 'DELETE',
          headers: { 
            'x-auth-token': token 
          },
        });
         if (response.ok) {
          // State se product remove kar do
          setProducts(products.filter(p => p._id !== productId));
          alert('Product deleted successfully!');
        } else {
          const errorData = await response.json();
          alert(`Failed to delete: ${errorData.msg || 'Please try again'}`);
        }
      } catch (error) {
        console.error('Delete error:', error);
        alert('Error deleting product');
      }
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading your products..."/>;
  }

  return (
    <div className="my-products-page container">
      <div className="dashboard-header">
        <h1>{isAdminPage ? 'All Products (Admin View)' : 'My Products'}</h1>
        {currentUser && !isAdminPage && (
          <p>Welcome, {currentUser.name}</p> // यहाँ currentUser का उपयोग किया
        )}
        {!isAdminPage && (
          <Link to="/manufacturer/add-product">
            <button className="add-product-btn">+ Add New Product</button>
          </Link>
        )}
      </div>

      {products.length > 0 ? (
        <table className="products-table">
          <thead>
            <tr>
              <th>Image</th>
              <th>Name</th>
              <th>Price</th>
              <th>Category</th>
              <th>Status</th>
              {isAdminPage && <th>Seller</th>}
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
                <td><span className={`status ${product.status}`}>{product.status}</span></td>
                {isAdminPage && <td>{product.seller ? product.seller.companyName || product.seller.name : 'N/A'}</td>}
                <td>
                  <button className="action-btn-edit" onClick={() => handleEdit(product._id)}>Edit</button>
                  <button className="action-btn-delete" onClick={() => handleDelete(product._id)}>Delete</button>
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