import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaFacebookF,
  FaInstagram,
  FaYoutube,
  FaLinkedin,
  FaPaperPlane,
} from "react-icons/fa";

const Register = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    dob: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    try {
      const response = await fetch(
        `${process.env.REACT_APP_API || "http://localhost:5000"}/api/auth/register`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            dob: formData.dob,
            password: formData.password,
          }),
        }
      );

      const data = await response.json();

      if (data.success) {
        alert("Registration Successful ✅");
        navigate("/login");
      } else {
        alert(data.message || "Registration failed");
      }
    } catch (error) {
      console.error("Register error:", error);
      alert("Server Error");
    }
  };

  return (
    <>
      <div className="foods-container">
        <div className="foods-header">Register</div>

        <div className="login-container">
          <div className="login-box">
            <form onSubmit={handleSubmit}>
              <input
                type="text"
                name="name"
                placeholder="Enter your name"
                value={formData.name}
                onChange={handleChange}
                required
              />

              <input
                type="email"
                name="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                required
              />

              <input
                type="tel"
                name="phone"
                placeholder="Phone number"
                value={formData.phone}
                onChange={handleChange}
                required
              />

              <input
                type="date"
                name="dob"
                value={formData.dob}
                onChange={handleChange}
                required
              />

              <input
                type="password"
                name="password"
                placeholder="Create Password"
                value={formData.password}
                onChange={handleChange}
                required
              />

              <input
                type="password"
                name="confirmPassword"
                placeholder="Confirm Password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />

              <button type="submit" className="login-btn">
                Register
              </button>
            </form>
          </div>

          <p className="signup-link">
            Already have an account? <Link to="/login">Login</Link>
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

export default Register;