import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { remove, increment, decrement } from '../Store/cartSlice';

const CartSlider = ({ onClose }) => {
  const cartItems = useSelector((state) => state.cart.items); // ✅ Corrected selector
  const dispatch = useDispatch();

  const totalAmount = cartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  return (
    <div className="cart-slider">
      <button className="close-btn" onClick={onClose}>×</button>

      <div className="cart-slider-content">
        {cartItems.length === 0 ? (
          <p className="empty-cart">No item added to the cart</p>
        ) : (
          cartItems.map((item, index) => (
            <div key={index} className="cart-slider-item">
              <img src={item.image} alt={item.title} className="cart-item-img" />

              <div className="cart-item-info">
                <p className="item-title">{item.title}</p>
                <p className="item-price">₹{item.price}</p>
                <div className="item-qty">
                  <button onClick={() => dispatch(decrement(item.id))}>−</button>
                  <span>{item.quantity}</span>
                  <button onClick={() => dispatch(increment(item.id))}>+</button>
                </div>
              </div>

              <button className="remove-btn" onClick={() => dispatch(remove(item.id))}>×</button>
            </div>
          ))
        )}
      </div>

      <div className="cart-slider-footer">
        <span>Subtotal: ₹{totalAmount.toFixed(2)}</span>
        <Link to="/checkout">
          <button className="checkout">Checkout</button>
        </Link>
      </div>
    </div>
  );
};

export default CartSlider;
