import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import CartSlider from "./CartSlider";

const Navbar = () => {
  const cartItems = useSelector((state) => state.cart.items || []);

  const totalQuantity = cartItems.reduce(
    (sum, item) => sum + Number(item.quantity || item.qty || 0),
    0
  );

  const [showCart, setShowCart] = useState(false);
  const [user, setUser] = useState(null);
  const [profileImage, setProfileImage] = useState("");

  useEffect(() => {
    const loadUserData = () => {
      const savedUser = JSON.parse(localStorage.getItem("user"));
      const savedImage =
        savedUser?.profilePhoto ||
        localStorage.getItem("profileImage") ||
        "";

      setUser(savedUser);
      setProfileImage(savedImage);
    };

    loadUserData();

    window.addEventListener("storage", loadUserData);
    window.addEventListener("profileUpdated", loadUserData);

    return () => {
      window.removeEventListener("storage", loadUserData);
      window.removeEventListener("profileUpdated", loadUserData);
    };
  }, []);

  return (
    <nav className="navbar">
      <div className="navbar-logo">
        <img
          src="https://react-food-project-five.vercel.app/static/media/res-logo.150c9007ec5a83adf3c4.png"
          alt="Fresh Bites Logo"
        />
        <span>Fresh Bites</span>
      </div>

      <div className="nav-link">
        <Link to="/">Home</Link>
        <Link to="/foods">Foods</Link>
        <Link to="/cart">Cart</Link>
        <Link to="/contact">Contact</Link>
      </div>

      <div className="nav-icons">
        <div className="cart-icon-container">
          <Link
            to="#"
            onClick={(e) => {
              e.preventDefault();
              setShowCart(true);
            }}
          >
            {totalQuantity > 0 && (
              <span className="cart-badge">{totalQuantity}</span>
            )}
            🛒
          </Link>
        </div>

        {showCart && <CartSlider onClose={() => setShowCart(false)} />}

        <Link to={user ? "/profile" : "/login"}>
          <img
            src={
              profileImage ||
              "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
            }
            alt="Profile"
            className="profile-nav-img"
          />
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;