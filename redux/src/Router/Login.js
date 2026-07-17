import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaFacebookF,
  FaInstagram,
  FaYoutube,
  FaLinkedin,
  FaPaperPlane,
} from "react-icons/fa";

const Login = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const clearOldCustomerData = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("profileImage");
    localStorage.removeItem("walletBalance");

    localStorage.removeItem("currentOrder");
    localStorage.removeItem("pendingOrder");
    localStorage.removeItem("savedAddress");
    localStorage.removeItem("cartItems");
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      clearOldCustomerData();

      const response = await fetch(
        `${process.env.REACT_APP_API || "http://localhost:5000"}/api/auth/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: formData.email,
            password: formData.password,
          }),
        }
      );

      const data = await response.json();

      if (response.ok && data.success) {
        localStorage.setItem("token", data.token);

        if (data.user) {
          localStorage.setItem("user", JSON.stringify(data.user));
          localStorage.setItem("profileImage", data.user.profilePhoto || "");
          localStorage.setItem(
            "walletBalance",
            String(data.user.walletBalance || 0)
          );
        }

        window.dispatchEvent(new Event("profileUpdated"));

        alert("Login Successful ✅");
        navigate("/profile");
      } else {
        alert(data.message || "Invalid Email or Password");
      }
    } catch (error) {
      console.error("Login Error:", error);
      alert("Server Error");
    }
  };

  return (
    <>
      <div className="foods-container">
        <div className="foods-header">Login</div>

        <div className="login-container">
          <div className="login-box">
            <form onSubmit={handleLogin}>
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
                required
              />

              <input
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                required
              />

              <button type="submit" className="login-btn">
                Login
              </button>
            </form>
          </div>

          <p className="signup-link">
            Don't have an account? <Link to="/register">Create an account</Link>
          </p>
        </div>
      </div>

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
              Welcome to Fresh Bites, your ultimate destination for delicious
              and fresh online food ordering!
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

              <button type="button" className="send-btn">
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

export default Login;