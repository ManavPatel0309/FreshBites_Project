import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import {
  remove,
  increment,
  decrement,
} from '../Store/cartSlice';

import {
  FaPaperPlane,
  FaFacebookF,
  FaInstagram,
  FaYoutube,
  FaLinkedin,
} from 'react-icons/fa';

const Cart = () => {
  const dispatch = useDispatch();

  const cartItems = useSelector((state) => state.cart.items || []);
  const totalAmount = useSelector((state) => state.cart.totalAmount || 0);

  const handleRemove = (id) => {
    dispatch(remove(id));
  };

  return (
    <>
      <div className="foods-container">
        <div className="foods-header">Cart</div>
      </div>

      <div className="cart-container">

        {cartItems.length === 0 ? (
          <p className="empty-cart">Your cart is empty</p>
        ) : (
          <table className="cart-table">
            <thead>
              <tr>
                <th>Image</th>
                <th>Product Title</th>
                <th>Price</th>
                <th>Quantity</th>
                <th>Delete</th>
              </tr>
            </thead>

            <tbody>
              {cartItems.map((item) => (
                <tr key={item.id}>
                  <td>
                    <img
                      src={item.image}
                      alt={item.title}
                      style={{ width: '50px', height: '50px' }}
                    />
                  </td>

                  <td>{item.title}</td>

                  <td>₹{item.price}</td>

                  <td>
                    <button onClick={() => dispatch(decrement(item.id))}>
                      -
                    </button>

                    <span style={{ margin: '0 8px' }}>
                      {item.quantity}
                    </span>

                    <button onClick={() => dispatch(increment(item.id))}>
                      +
                    </button>
                  </td>

                  <td>
                    <button onClick={() => handleRemove(item.id)}>
                      🗑️
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <div className="cart123">
          <div className="cart-summary123">
            <p>Subtotal: ₹{totalAmount}</p>
            <small>
              Taxes and shipping will calculate at checkout
            </small>

            <div className="cart-buttons123">
              <Link to="/foods">
                <button className="continue-btn123">
                  Continue Shopping
                </button>
              </Link>

              <Link to="/checkout">
                <button className="checkout-btn123">
                  Proceed to checkout
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <footer className="footer">
        <div className="footer-grid">

          <div className="footer-section">
            <img
              src="https://react-food-project-five.vercel.app/static/media/res-logo.150c9007ec5a83adf3c4.png"
              alt="Fresh Bites"
              className="footer-logo"
            />
            <h3>Fresh Bites</h3>
            <p>
              Welcome to Fresh Bites, your ultimate destination for
              delicious and fresh online food ordering!
            </p>
          </div>

          <div className="footer-section">
            <h4>Delivery Time</h4>
            <p>
              <strong>Monday – Friday</strong>
              <br />
              10:00am – 11:00pm
            </p>
            <p>
              <strong>Saturday – Sunday</strong>
              <br />
              Full Day
            </p>
          </div>

          <div className="footer-section">
            <h4>Contact</h4>
            <p>Location: Sola, Ahmedabad</p>
            <p>Phone: 8511755852</p>
            <p>Email: divy2332gj2@gmail.com</p>
          </div>

          <div className="footer-section">
            <h4>Newsletter</h4>
            <p>Subscribe our newsletter</p>

            <div className="newsletter">
              <input type="email" placeholder="Enter your email" />
              <button className="send-btn">
                <FaPaperPlane />
              </button>
            </div>

            <div className="social-icons">
              <FaFacebookF />
              <FaInstagram />
              <FaYoutube />
              <FaLinkedin />
            </div>
          </div>
        </div>

        <p className="footer-bottom">
          Copyright © 2024, website made by Divy Doshi. All Rights Reserved.
        </p>
      </footer>
    </>
  );
};

export default Cart;