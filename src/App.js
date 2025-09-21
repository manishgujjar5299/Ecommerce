import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import ShopPage from './pages/ShopPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import ConfirmationPage from './pages/ConfirmationPage';
import LoginPage from './pages/LoginPage'; 
import RegisterPage from './pages/RegisterPage';
import WishlistPage from './pages/WishlistPage';
import ShippingPolicyPage from './pages/ShippingPolicyPage';
import ReturnsPage from './pages/ReturnsPage';
import ContactPage from './pages/ContactPage';
import "slick-carousel/slick/slick.css"; 
import "slick-carousel/slick/slick-theme.css";
import PrivateRoute from './components/PrivateRoute';
import ProfilePage from './pages/ProfilePage';
import SellerRoute from './components/SellerRoute';
import AddProductPage from './pages/AddProductPage';
import MyProductsPage from './pages/MyProductsPage';
import './App.css';

function App() {
  return (
    <div className="App">
      <Navbar />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/shop" element={<ShopPage />} />
          <Route path="/product/:id" element={<ProductDetailPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/confirmation" element={<ConfirmationPage />} />
          <Route path="/login" element={<LoginPage />} /> 
          <Route path="/register" element={<RegisterPage />} /> 
          <Route path="/wishlist" element={<WishlistPage />} />
          <Route path="/shipping-policy" element={<ShippingPolicyPage />} />
          <Route path="/returns" element={<ReturnsPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/profile" element={
            <PrivateRoute>
              <ProfilePage />
            </PrivateRoute>
          } />
          <Route path="/dashboard/add-product" element={
            <SellerRoute>
              <AddProductPage />
            </SellerRoute>
          } />
          <Route path="/dashboard/my-products" element={
            <SellerRoute><MyProductsPage /></SellerRoute>
          } />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;