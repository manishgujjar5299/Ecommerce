import React, { createContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const initializeAuth = () => {
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');
      
      if (storedToken && storedUser) {
        try {
          const user = JSON.parse(storedUser);
          setCurrentUser(user);
          setToken(storedToken);
        } catch (error) {
          console.error('Error parsing stored user data:', error);
          // Clear corrupted data
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const updateUserData = (newUserData) => {
    setCurrentUser(newUserData);
    localStorage.setItem('user', JSON.stringify(newUserData));
  };

  const register = async (name, email, password) => {
    try {
      const response = await fetch('http://localhost:5000/api/users/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();
      
      if (response.ok) {
        alert('Registration successful! Please login.');
        navigate('/login');
      } else {
        throw new Error(data.msg || 'Registration failed');
      }
    } catch (err) {
      alert(`Registration failed: ${err.message}`);
      throw err;
    }
  };

  const login = async (email, password) => {
    try {
      const response = await fetch('http://localhost:5000/api/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      
      const data = await response.json();
      
      if (response.ok && data.token) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        setToken(data.token);
        setCurrentUser(data.user);
        navigate('/');
      } else {
        throw new Error(data.msg || 'Login failed');
      }
    } catch (err) {
      alert(`Login failed: ${err.message}`);
      throw err;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setCurrentUser(null);
    navigate('/login');
  };

  // Fixed: Proper manufacturer application without page reload
  const becomeManufacturer = async (companyName, companyDescription) => {
    try {
      const response = await fetch('http://localhost:5000/api/users/become-manufacturer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token,
        },
        body: JSON.stringify({ companyName, companyDescription }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        // Update user state without page reload
        updateUserData(data.user);
        return { success: true, message: data.msg, user: data.user };
      } else {
        return { success: false, message: data.msg || 'Application failed' };
      }
    } catch (err) {
      console.error('Manufacturer application error:', err);
      return { success: false, message: 'Network error. Please try again.' };
    }
  };

  // Fixed: Legacy becomeSeller method - now properly updates state
  const becomeSeller = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/users/become-seller', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token,
        },
      });
      
      const data = await response.json();
      
      if (response.ok) {
        // Update user state without page reload
        updateUserData(data.user);
        return true;
      } else {
        console.error('Become seller error:', data.msg);
        return false;
      }
    } catch (err) {
      console.error('Become seller error:', err);
      return false;
    }
  };

  // Method to refresh user data from server
  const refreshUserData = async () => {
    if (!token) return;
    
    try {
      const response = await fetch('http://localhost:5000/api/users/profile', {
        headers: { 'x-auth-token': token }
      });
      
      if (response.ok) {
        const userData = await response.json();
        updateUserData(userData);
      }
    } catch (error) {
      console.error('Error refreshing user data:', error);
    }
  };

  const contextValue = {
    currentUser,
    token,
    loading,
    register,
    login,
    logout,
    becomeSeller,
    becomeManufacturer,
    updateUserData,
    refreshUserData
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};