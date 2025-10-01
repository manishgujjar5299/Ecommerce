import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import './AddProductPage.css';
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
const AddProductPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    description: '',
    image: '',
    category: '',
    brand: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) newErrors.name = 'Product name is required';
    if (!formData.price || formData.price <= 0) newErrors.price = 'Price must be greater than 0';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.image.trim()) newErrors.image = 'Image URL is required';
    else if (!formData.image.includes('http')) newErrors.image = 'Valid image URL required';
    if (!formData.category.trim()) newErrors.category = 'Category is required';
    if (!formData.brand.trim()) newErrors.brand = 'Brand is required';
    
    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    const newProduct = { 
      ...formData, 
      price: Number(formData.price) 
    };

    try {
      const response = await fetch('${API_URL}/products/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token,
        },
        body: JSON.stringify(newProduct),
      });

      if (response.ok) {
        alert('Product added successfully!');
        navigate('/dashboard/my-products');
      } else {
        const errorData = await response.json();
        alert(`Failed to add product: ${errorData.msg || 'Please try again.'}`);
      }
    } catch (err) {
      alert('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Adding product..." />;
  }

  return (
    <div className="add-product-page container">
      <h1>Add New Product</h1>
      <form onSubmit={handleSubmit} className="add-product-form">
        <div className="form-group">
          <label htmlFor="name">Product Name *</label>
          <input 
            type="text" 
            id="name" 
            name="name"
            value={formData.name} 
            onChange={handleChange}
            className={errors.name ? 'error' : ''}
          />
          {errors.name && <span className="error-text">{errors.name}</span>}
        </div>
        
        <div className="form-group">
          <label htmlFor="price">Price *</label>
          <input 
            type="number" 
            id="price" 
            name="price"
            value={formData.price} 
            onChange={handleChange}
            className={errors.price ? 'error' : ''}
          />
          {errors.price && <span className="error-text">{errors.price}</span>}
        </div>
        
        <div className="form-group">
          <label htmlFor="description">Description *</label>
          <textarea 
            id="description" 
            name="description"
            value={formData.description} 
            onChange={handleChange}
            className={errors.description ? 'error' : ''}
          />
          {errors.description && <span className="error-text">{errors.description}</span>}
        </div>
        
        <div className="form-group">
          <label htmlFor="image">Image URL *</label>
          <input 
            type="text" 
            id="image" 
            name="image"
            value={formData.image} 
            onChange={handleChange}
            className={errors.image ? 'error' : ''}
          />
          {errors.image && <span className="error-text">{errors.image}</span>}
        </div>
        
        <div className="form-group">
          <label htmlFor="category">Category *</label>
          <select 
            id="category" 
            name="category"
            value={formData.category} 
            onChange={handleChange}
            className={errors.category ? 'error' : ''}
          >
            <option value="">Select Category</option>
            <option value="Electronics">Electronics</option>
            <option value="Apparel">Apparel</option>
            <option value="Shoes">Shoes</option>
            <option value="Watch">Watch</option>
            <option value="Bags">Bags</option>
            <option value="Accessories">Accessories</option>
            <option value="Home Goods">Home Goods</option>
            <option value="Groceries">Groceries</option>
          </select>
          {errors.category && <span className="error-text">{errors.category}</span>}
        </div>
        
        <div className="form-group">
          <label htmlFor="brand">Brand *</label>
          <input 
            type="text" 
            id="brand" 
            name="brand"
            value={formData.brand} 
            onChange={handleChange}
            className={errors.brand ? 'error' : ''}
          />
          {errors.brand && <span className="error-text">{errors.brand}</span>}
        </div>
        
        <button type="submit" className="submit-btn" disabled={loading}>
          {loading ? 'Adding...' : 'Add Product'}
        </button>
      </form>
    </div>
  );
};

export default AddProductPage;
