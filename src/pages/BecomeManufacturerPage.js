import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import './BecomeManufacturerPage.css';

const BecomeManufacturerPage = () => {
  const [formData, setFormData] = useState({
    companyName: '',
    companyDescription: '',
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();

  const validateForm = () => {
    const newErrors = {};
    if (!formData.companyName.trim()) newErrors.companyName = 'Company name is required';
    if (!formData.companyDescription.trim()) newErrors.companyDescription = 'Company description is required';
    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
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
    try {
      const response = await fetch('http://localhost:5000/api/users/become-manufacturer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token,
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const data = await response.json();
        alert(data.msg);
        // Update user context with new role
        localStorage.setItem('user', JSON.stringify(data.user));
        window.location.reload(); // Force refresh to update context
        navigate('/manufacturer');
      } else {
        const errorData = await response.json();
        alert(`Application failed: ${errorData.msg || 'Please try again.'}`);
      }
    } catch (err) {
      alert('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="container"><p>Submitting application...</p></div>;
  }

  return (
    <div className="become-manufacturer-page container">
      <div className="page-header">
        <h1>Become a Manufacturer</h1>
        <p>Join our platform and start selling your products to thousands of customers</p>
      </div>

      <form onSubmit={handleSubmit} className="manufacturer-form">
        <h2>Application Form</h2>
        
        <div className="form-group">
          <label htmlFor="companyName">Company Name *</label>
          <input
            type="text"
            id="companyName"
            name="companyName"
            value={formData.companyName}
            onChange={handleChange}
            className={errors.companyName ? 'error' : ''}
            placeholder="Enter your company name"
          />
          {errors.companyName && <span className="error-text">{errors.companyName}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="companyDescription">Company Description *</label>
          <textarea
            id="companyDescription"
            name="companyDescription"
            value={formData.companyDescription}
            onChange={handleChange}
            className={errors.companyDescription ? 'error' : ''}
            placeholder="Describe your company, products, and manufacturing capabilities"
            rows="5"
          />
          {errors.companyDescription && <span className="error-text">{errors.companyDescription}</span>}
        </div>

        <button type="submit" className="submit-btn" disabled={loading}>
          Submit Application
        </button>
      </form>
    </div>
  );
};

export default BecomeManufacturerPage;