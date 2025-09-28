// Complete EditProductPage.js - Full Implementation
import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import './AddProductPage.css'; // Reuse same styling

const EditProductPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token, currentUser } = useContext(AuthContext);
  
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    description: '',
    image: '',
    category: '',
    brand: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [originalProduct, setOriginalProduct] = useState(null);

  // Validation rules
//   const validationRules = {
//     name: { required: true, minLength: 2, maxLength: 100, label: 'Product name' },
//     price: { required: true, min: 0.01, max: 999999, label: 'Price' },
//     description: { required: true, minLength: 10, maxLength: 1000, label: 'Description' },
//     image: { 
//       required: true, 
//       pattern: /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)(\?.*)?$/i, 
//       patternMessage: 'Please enter a valid image URL',
//       label: 'Image URL' 
//     },
//     category: { required: true, label: 'Category' },
//     brand: { required: true, minLength: 2, maxLength: 50, label: 'Brand' }
//   };

  // Fetch product data on component mount
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const response = await fetch(`http://localhost:5000/api/products/${id}`, {
          headers: { 'x-auth-token': token }
        });

        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Product not found');
          }
          throw new Error('Failed to fetch product data');
        }

        const product = await response.json();
        
        // Check if user owns this product (unless admin)
        if (currentUser?.role !== 'admin' && product.seller._id !== currentUser?.id) {
          throw new Error('You can only edit your own products');
        }

        setOriginalProduct(product);
        setFormData({
          name: product.name || '',
          price: product.price?.toString() || '',
          description: product.description || '',
          image: product.image || '',
          category: product.category || '',
          brand: product.brand || ''
        });
      } catch (error) {
        // Simple error handling without ErrorHandler dependency
        alert(error.message || 'Failed to load product data');
        navigate(-1); // Go back
      } finally {
        setLoading(false);
      }
    };

    if (id && token) {
      fetchProduct();
    }
  }, [id, token, currentUser, navigate]);

  // Simple validation function (since ErrorHandler might not exist)
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) newErrors.name = 'Product name is required';
    else if (formData.name.length < 2) newErrors.name = 'Product name must be at least 2 characters';
    else if (formData.name.length > 100) newErrors.name = 'Product name cannot exceed 100 characters';
    
    if (!formData.price || formData.price <= 0) newErrors.price = 'Price must be greater than 0';
    else if (formData.price > 999999) newErrors.price = 'Price cannot exceed 999,999';
    
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    else if (formData.description.length < 10) newErrors.description = 'Description must be at least 10 characters';
    else if (formData.description.length > 1000) newErrors.description = 'Description cannot exceed 1000 characters';
    
    if (!formData.image.trim()) newErrors.image = 'Image URL is required';
    else if (!/^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)(\?.*)?$/i.test(formData.image)) {
      newErrors.image = 'Please enter a valid image URL';
    }
    
    if (!formData.category) newErrors.category = 'Category is required';
    
    if (!formData.brand.trim()) newErrors.brand = 'Brand is required';
    else if (formData.brand.length < 2) newErrors.brand = 'Brand must be at least 2 characters';
    else if (formData.brand.length > 50) newErrors.brand = 'Brand cannot exceed 50 characters';
    
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
    
    // Validate form
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    // Check if anything actually changed
    const hasChanges = Object.keys(formData).some(key => {
      if (key === 'price') {
        return Number(formData[key]) !== Number(originalProduct[key]);
      }
      return formData[key] !== originalProduct[key];
    });

    if (!hasChanges) {
      alert('No changes detected');
      return;
    }

    setSubmitting(true);
    
    try {
      const updateData = {
        ...formData,
        price: Number(formData.price)
      };

      const response = await fetch(`http://localhost:5000/api/products/update/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token,
        },
        body: JSON.stringify(updateData),
      });

      if (response.ok) {
        const result = await response.json();
        alert(result.msg || 'Product updated successfully!');
        
        // Navigate based on user role
        if (currentUser?.role === 'admin') {
          navigate('/admin/products');
        } else {
          navigate('/manufacturer/my-products');
        }
      } else {
        const errorData = await response.json();
        throw new Error(errorData.msg || 'Failed to update product');
      }
    } catch (error) {
      alert(error.message || 'Failed to update product. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (window.confirm('Are you sure you want to cancel? Any unsaved changes will be lost.')) {
      navigate(-1);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading product data..." />;
  }

  return (
    <div className="add-product-page container">
      <div className="page-header">
        <h1>Edit Product</h1>
        <p>Update your product information</p>
      </div>

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
            placeholder="Enter product name"
          />
          {errors.name && <span className="error-text">{errors.name}</span>}
        </div>
        
        <div className="form-group">
          <label htmlFor="price">Price ($) *</label>
          <input 
            type="number" 
            id="price" 
            name="price"
            value={formData.price} 
            onChange={handleChange}
            className={errors.price ? 'error' : ''}
            step="0.01"
            min="0"
            placeholder="0.00"
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
            rows="4"
            placeholder="Describe your product..."
          />
          {errors.description && <span className="error-text">{errors.description}</span>}
          <small className="char-count">{formData.description.length}/1000 characters</small>
        </div>
        
        <div className="form-group">
          <label htmlFor="image">Image URL *</label>
          <input 
            type="url" 
            id="image" 
            name="image"
            value={formData.image} 
            onChange={handleChange}
            className={errors.image ? 'error' : ''}
            placeholder="https://example.com/image.jpg"
          />
          {errors.image && <span className="error-text">{errors.image}</span>}
          {formData.image && (
            <div className="image-preview">
              <img 
                src={formData.image} 
                alt="Preview" 
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'block';
                }}
              />
              <div className="image-error" style={{ display: 'none' }}>
                Image preview not available
              </div>
            </div>
          )}
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
            placeholder="Enter brand name"
          />
          {errors.brand && <span className="error-text">{errors.brand}</span>}
        </div>

        {/* Show current status for non-admin users */}
        {originalProduct && currentUser?.role !== 'admin' && (
          <div className="form-group">
            <label>Current Status</label>
            <div className={`status-display ${originalProduct.status}`}>
              <span className={`status-badge ${originalProduct.status}`}>
                {originalProduct.status?.charAt(0).toUpperCase() + originalProduct.status?.slice(1)}
              </span>
              {originalProduct.status === 'pending' && (
                <small>Your product is awaiting admin approval</small>
              )}
              {originalProduct.status === 'rejected' && (
                <small>Your product was rejected. Update it to resubmit for approval.</small>
              )}
              {originalProduct.status === 'approved' && (
                <small>Note: Changes will require re-approval</small>
              )}
            </div>
          </div>
        )}
        
        <div className="form-actions">
          <button 
            type="button" 
            onClick={handleCancel}
            className="cancel-btn"
            disabled={submitting}
          >
            Cancel
          </button>
          <button 
            type="submit" 
            className="submit-btn" 
            disabled={submitting}
          >
            {submitting ? 'Updating...' : 'Update Product'}
          </button>
        </div>
      </form>
      
      {/* Changes summary */}
      {originalProduct && (
        <div className="changes-summary">
          <h3>Changes Preview</h3>
          <div className="changes-list">
            {Object.keys(formData).map(key => {
              const original = key === 'price' ? originalProduct[key]?.toString() : originalProduct[key];
              const current = formData[key];
              const hasChanged = original !== current;
              
              return hasChanged ? (
                <div key={key} className="change-item">
                  <strong>{key.charAt(0).toUpperCase() + key.slice(1)}:</strong>
                  <div className="change-values">
                    <span className="old-value">"{original}" →</span>
                    <span className="new-value">"{current}"</span>
                  </div>
                </div>
              ) : null;
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default EditProductPage;