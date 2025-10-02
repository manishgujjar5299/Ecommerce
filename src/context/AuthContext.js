import React, { createContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export const AuthContext = createContext();

// FIXED: Define the base API URL using an environment variable
const API_URL = process.env.REACT_APP_API_URL ; 

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [refreshToken, setRefreshToken] = useState(localStorage.getItem('refreshToken')); 
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const initializeAuth = () => {
      const storedToken = localStorage.getItem('token');
      const storedRefreshToken = localStorage.getItem('refreshToken'); 
      const storedUser = localStorage.getItem('user');
      
      if (storedToken && storedUser) {
        try {
          const user = JSON.parse(storedUser);
          setCurrentUser(user);
          setToken(storedToken);
          setRefreshToken(storedRefreshToken); 
        } catch (error) {
          console.error('Error parsing stored user data or tokens:', error);
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken'); 
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
      // FIXED: Use the dynamic API_URL
      const response = await fetch(`${API_URL}/users/register`, {
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

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken'); 
    localStorage.removeItem('user');
    setToken(null);
    setRefreshToken(null); 
    setCurrentUser(null);
    navigate('/login');
  };

  const login = async (email, password) => {
    try {
      // FIXED: Use the dynamic API_URL
      const response = await fetch(`${API_URL}/users/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      
      const data = await response.json();
      
      if (response.ok && data.token && data.refreshToken) { 
        localStorage.setItem('token', data.token);
        localStorage.setItem('refreshToken', data.refreshToken);
        localStorage.setItem('user', JSON.stringify(data.user));
        setToken(data.token);
        setRefreshToken(data.refreshToken); 
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

  const refreshAccessToken = async () => {
    const currentRefreshToken = localStorage.getItem('refreshToken');
    
    if (!currentRefreshToken) {
      console.warn("No refresh token available, forcing logout.");
      logout();
      return null;
    }
    
    try {
      // FIXED: Use the dynamic API_URL
      const response = await fetch(`${API_URL}/users/token/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: currentRefreshToken }),
      });
      
      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('token', data.token);
        localStorage.setItem('refreshToken', data.refreshToken); 
        setToken(data.token);
        setRefreshToken(data.refreshToken);
        return data.token; 
      } else {
        logout();
        throw new Error('Session expired, please log in again.');
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
      logout();
      return null;
    }
  };
  
  const becomeManufacturer = async (companyName, companyDescription) => {
    try {
      // FIXED: Use the dynamic API_URL
      const response = await fetch(`${API_URL}/users/become-manufacturer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token,
        },
        body: JSON.stringify({ companyName, companyDescription }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
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

  const becomeSeller = async () => {
    try {
      // FIXED: Use the dynamic API_URL
      const response = await fetch(`${API_URL}/users/become-seller`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token,
        },
      });
      
      const data = await response.json();
      
      if (response.ok) {
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

  const refreshUserData = async () => {
    if (!token) return;
    
    try {
      // FIXED: Use the dynamic API_URL
      const response = await fetch(`${API_URL}/users/profile`, {
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
    refreshUserData,
    refreshToken, 
    refreshAccessToken 
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};