import React, { createContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const navigate = useNavigate();

  useEffect(() => {
    if (token) {
      const user = JSON.parse(localStorage.getItem('user'));
      if (user) {
        setCurrentUser(user);
      }
    }
  }, [token]);

  const register = async (name, email, password) => {
    try {
      await fetch('http://localhost:5000/api/users/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });
      alert('Registration successful! Please login.');
      navigate('/login');
    } catch (err) {
      alert('Registration failed. Please try again.');
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
      if (data.token) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        setToken(data.token);
        setCurrentUser(data.user);
        navigate('/');
      } else {
        alert(data.msg || 'Login failed');
      }
    } catch (err) {
      alert('Login failed. Please try again.');
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setCurrentUser(null);
    navigate('/login');
  };
   const becomeSeller = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/users/become-seller', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token, // Send the auth token
        },
      });
      
      const data = await response.json();
      if (response.ok) {
        // const updatedUser = { ...currentUser, isSeller: true };
        setCurrentUser(data.User);
        localStorage.setItem('user', JSON.stringify(data.User));
        return true;
      } else {
        console.error(data.msg);
        return false;
      }
    } catch (err) {
      console.error(err);
      return false;
    }
  };

  return (
    <AuthContext.Provider value={{ currentUser, token, register, login, logout, becomeSeller }}>
      {children}
    </AuthContext.Provider>
  );
};