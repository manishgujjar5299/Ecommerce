import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const PrivateRoute = ({ children }) => {
  const { currentUser } = useContext(AuthContext);

  // If there is no logged-in user, redirect to the login page
  return currentUser ? children : <Navigate to="/login" />;
};

export default PrivateRoute;