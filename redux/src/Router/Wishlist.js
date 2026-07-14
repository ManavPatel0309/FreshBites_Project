import React from "react";

const Wishlist = () => {
  const wishlist =
    JSON.parse(localStorage.getItem("wishlist")) || [];

  return (
    <div className="profile-page">
      <div className="profile-card">
        <h2>❤️ Wishlist</h2>

        {wishlist.length === 0 ? (
          <p>No Wishlist Items</p>
        ) : (
          wishlist.map((item, index) => (
            <div key={index}>
              <h4>{item.name}</h4>
              <p>₹{item.price}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Wishlist;