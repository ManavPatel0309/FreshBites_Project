import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const EditProfile = () => {
  const navigate = useNavigate();

  const formatDateForInput = (dateValue) => {
    if (!dateValue) return "";

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) return "";

    return date.toISOString().split("T")[0];
  };

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    dob: "",
    altPhone: "",
    address: "",
    profilePhoto: "",
  });

  useEffect(() => {
    const savedUser = JSON.parse(localStorage.getItem("user")) || {};

    setFormData({
      name: savedUser.name || "",
      email: savedUser.email || "",
      phone: savedUser.phone || "",
      dob: formatDateForInput(savedUser.dob),
      altPhone: savedUser.altPhone || "",
      address: savedUser.address || "",
      profilePhoto: savedUser.profilePhoto || "",
    });
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login");
        return;
      }

      const response = await fetch(
        `${process.env.REACT_APP_API || "http://localhost:5000"}/api/auth/profile`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: formData.name,
            phone: formData.phone,
            dob: formData.dob,
            altPhone: formData.altPhone,
            address: formData.address,
            profilePhoto: formData.profilePhoto || "",
          }),
        }
      );
      const data = await response.json();

      if (data.success) {
        localStorage.setItem("user", JSON.stringify(data.user));
        localStorage.setItem("profileImage", data.user.profilePhoto || "");

        window.dispatchEvent(new Event("profileUpdated"));

        alert("✅ Profile Updated Successfully");
        navigate("/profile");
      } else {
        alert(data.message || "Update Failed");
      }
    } catch (error) {
      console.log(error);
      alert("Server Error");
    }
  };

  return (
    <div className="profile-page">
      <div className="profile-card">
        <h2>✏️ Edit Profile</h2>

        <input
          type="text"
          name="name"
          value={formData.name}
          placeholder="Full Name"
          onChange={handleChange}
        />

        <input
          type="email"
          name="email"
          value={formData.email}
          disabled
          placeholder="Email"
        />

        <input
          type="text"
          name="phone"
          value={formData.phone}
          placeholder="Phone Number"
          onChange={handleChange}
        />

        <input
          type="date"
          name="dob"
          value={formData.dob}
          onChange={handleChange}
        />

        <input
          type="text"
          name="altPhone"
          value={formData.altPhone}
          placeholder="Alternative Number"
          onChange={handleChange}
        />

        <textarea
          name="address"
          value={formData.address}
          placeholder="Address"
          onChange={handleChange}
        />

        <button type="button" onClick={handleSave}>
          💾 Save Changes
        </button>
      </div>
    </div>
  );
};

export default EditProfile;