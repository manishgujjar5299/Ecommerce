import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import './CartPage.css';

const CartPage = () => {
  const { cartItems, removeFromCart, updateQuantity } = useContext(CartContext);

  const total = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

  if (cartItems.length === 0) {
    return (
      <div className="cart-page container">
        <h1>Your Cart</h1>
        <p>Your cart is empty.</p>
        <Link to="/shop"><button>Continue Shopping</button></Link>
      </div>
    );
  }

  return (
    <div className="cart-page container">
      <h1>Your Cart</h1>
      <div className="cart-items">
        {cartItems.map((item) => (
          <div key={item._id} className="cart-item">
            <img src={item.image} alt={item.name} />
            <div className="item-details">
              <h3>{item.name}</h3>
              <p>${item.price.toFixed(2)}</p>
            </div>
            <div className="item-quantity">
              <button onClick={() => updateQuantity(item._id, item.quantity - 1)}>-</button>
              <span>{item.quantity}</span>
              <button onClick={() => updateQuantity(item._id, item.quantity + 1)}>+</button>
            </div>
            <div className="item-total">
              ${(item.price * item.quantity).toFixed(2)}
            </div>
            <button onClick={() => removeFromCart(item._id)} className="remove-btn">
              &times;
            </button>
          </div>
        ))}
      </div>
      <div className="cart-summary">
        <h2>Total: ${total.toFixed(2)}</h2>
        <Link to="/checkout">
          <button className="checkout-btn">Proceed to Checkout</button>
        </Link>
      </div>
    </div>
  );
};

export default CartPage;