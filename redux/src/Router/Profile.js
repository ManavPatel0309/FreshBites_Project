import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const Profile = () => {
  const navigate = useNavigate();

  const [user, setUser] = useState({});
  const [profileImage, setProfileImage] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login");
        return;
      }

      try {
        const res = await fetch("http://localhost:5000/api/auth/profile", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();

        if (data.success) {
          setUser(data.user);
          setProfileImage(data.user.profilePhoto || "");

          localStorage.setItem("user", JSON.stringify(data.user));
          localStorage.setItem("profileImage", data.user.profilePhoto || "");
          localStorage.setItem(
            "walletBalance",
            String(data.user.walletBalance || 0)
          );

          window.dispatchEvent(new Event("profileUpdated"));
        } else {
          navigate("/login");
        }
      } catch (error) {
        console.log(error);
        alert("Server Error");
      }
    };

    fetchProfile();
  }, [navigate]);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];

    if (!file) return;

    const reader = new FileReader();

    reader.onloadend = async () => {
      const imageBase64 = reader.result;
      const token = localStorage.getItem("token");

      try {
        const res = await fetch("http://localhost:5000/api/auth/profile", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: user.name || "",
            phone: user.phone || "",
            dob: user.dob || "",
            altPhone: user.altPhone || "",
            age: user.age || "",
            address: user.address || "",
            profilePhoto: imageBase64,
          }),
        });

        const data = await res.json();

        if (data.success) {
          setUser(data.user);
          setProfileImage(data.user.profilePhoto || imageBase64);

          localStorage.setItem("user", JSON.stringify(data.user));
          localStorage.setItem(
            "profileImage",
            data.user.profilePhoto || imageBase64
          );

          window.dispatchEvent(new Event("profileUpdated"));
          alert("Profile Photo Saved Permanently ✅");
        } else {
          alert(data.message || "Photo update failed");
        }
      } catch (error) {
        console.log(error);
        alert("Server Error");
      }
    };

    reader.readAsDataURL(file);
  };

  const addWalletMoney = () => {
    navigate("/add-wallet");
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("profileImage");
    localStorage.removeItem("walletBalance");

    navigate("/login");
  };

  return (
    <div className="profile-page">
      <div className="profile-card">
        <div className="profile-image-box">
          <img
            src={
              profileImage ||
              "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
            }
            alt="Profile"
            className="profile-image"
          />

          <label htmlFor="profileUpload" className="upload-btn">
            📷
          </label>

          <input
            id="profileUpload"
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            style={{ display: "none" }}
          />
        </div>

        <h2>{user.name || "Customer"}</h2>

        <p> {user.email || "Email Not Added"}</p>

        <p> {user.phone || "Phone Not Added"}</p>

        <p>{user.altPhone || "Alternative Number Not Added"}</p>

        <p>
          {" "}
          {user.dob
            ? new Date(user.dob).toLocaleDateString()
            : "DOB Not Added"}
        </p>

        <p>📍 {user.address || "Address Not Added"}</p>

        <div className="wallet-box">
          <h3>💰 Wallet Balance</h3>
          <h2>₹{Number(user.walletBalance || 0).toFixed(2)}</h2>

          <button onClick={addWalletMoney}>
            Add Money
          </button>
        </div>

        <div className="profile-buttons">
          <button onClick={() => navigate("/tracking")}>
            🚚 Track Orders
          </button>

          <button onClick={() => navigate("/cart")}>
            🛒 My Cart
          </button>

          <button onClick={() => navigate("/orders")}>
            📦 Order History
          </button>

          <button onClick={() => navigate("/settings")}>
            ⚙️ Settings
          </button>

          <button onClick={() => navigate("/support")}>
            📞 Customer Service
          </button>

          <button onClick={() => navigate("/wishlist")}>
            ❤️ Wishlist
          </button>

          <button onClick={() => navigate("/edit-profile")}>
            ✏️ Edit Profile
          </button>

          <button className="logout-btn" onClick={handleLogout}>
            🚪 Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;