import React, { useContext } from 'react'; 
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const SellerRoute = ({ children }) => {
  const { currentUser } = useContext(AuthContext);

  // Redirect to homepage if user is not logged in or is not a seller
  if (!currentUser || !currentUser.isSeller) {
    return <Navigate to="/" />;
  }

  return children;
};

export default SellerRoute;