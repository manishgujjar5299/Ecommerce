// Create new file: utils/errorHandler.js
// Centralized error handling with specific messages

class ErrorHandler {
  static getErrorMessage(error, context = 'general') {
    // Handle different types of errors
    if (error.response) {
      // HTTP response errors
      const status = error.response.status;
      const message = error.response.data?.msg || error.response.data?.message;
      
      switch (status) {
        case 400:
          return message || 'Invalid request. Please check your input.';
        case 401:
          return 'You need to log in to perform this action.';
        case 403:
          return 'You don\'t have permission to perform this action.';
        case 404:
          return context === 'product' 
            ? 'Product not found. It may have been removed.' 
            : 'The requested resource was not found.';
        case 409:
          return 'This item already exists. Please try a different name.';
        case 422:
          return message || 'Please check your input and try again.';
        case 500:
          return 'Server error. Please try again later.';
        default:
          return message || 'An unexpected error occurred.';
      }
    }
    
    // Network errors
    if (error.code === 'NETWORK_ERROR' || error.message.includes('fetch')) {
      return 'Network error. Please check your internet connection.';
    }
    
    // Validation errors
    if (error.name === 'ValidationError') {
      const validationMessages = Object.values(error.errors).map(err => err.message);
      return validationMessages.join(', ');
    }
    
    // Context-specific error messages
    switch (context) {
      case 'login':
        return error.message.includes('credentials') 
          ? 'Invalid email or password. Please try again.'
          : 'Login failed. Please check your credentials.';
      case 'register':
        return error.message.includes('exists') 
          ? 'An account with this email already exists.'
          : 'Registration failed. Please check your information.';
      case 'product':
        return error.message.includes('required') 
          ? 'Please fill in all required fields.'
          : 'Failed to save product. Please try again.';
      case 'upload':
        return 'File upload failed. Please check file size and format.';
      case 'cart':
        return 'Unable to update cart. Please refresh and try again.';
      default:
        return error.message || 'An unexpected error occurred.';
    }
  }

  static handleApiError(error, context, showAlert = true) {
    const message = this.getErrorMessage(error, context);
    
    if (showAlert) {
      alert(message);
    }
    
    // Log detailed error for debugging
    console.error(`${context} error:`, error);
    
    return message;
  }

  static validateForm(formData, validationRules) {
    const errors = {};
    
    Object.entries(validationRules).forEach(([field, rules]) => {
      const value = formData[field];
      
      if (rules.required && (!value || value.toString().trim() === '')) {
        errors[field] = `${rules.label || field} is required`;
      } else if (value) {
        if (rules.minLength && value.length < rules.minLength) {
          errors[field] = `${rules.label || field} must be at least ${rules.minLength} characters`;
        }
        if (rules.maxLength && value.length > rules.maxLength) {
          errors[field] = `${rules.label || field} must not exceed ${rules.maxLength} characters`;
        }
        if (rules.pattern && !rules.pattern.test(value)) {
          errors[field] = rules.patternMessage || `${rules.label || field} format is invalid`;
        }
        if (rules.min && Number(value) < rules.min) {
          errors[field] = `${rules.label || field} must be at least ${rules.min}`;
        }
        if (rules.max && Number(value) > rules.max) {
          errors[field] = `${rules.label || field} must not exceed ${rules.max}`;
        }
      }
    });
    
    return errors;
  }
}

export default ErrorHandler;