import React, { useEffect } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";

const AdminLayout = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const adminToken = localStorage.getItem("adminToken");

    if (!adminToken) {
      navigate("/admin-login");
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    navigate("/admin-login");
  };

  return (
    <div className="admin-page">
      <aside className="admin-sidebar">
        <h2>Fresh Bites</h2>
        <p>Admin Panel</p>

        <nav>
          <NavLink to="/admin/dashboard">📊 Dashboard</NavLink>
          <NavLink to="/admin/users">👤 Users</NavLink>
          <NavLink to="/admin/orders">📦 Orders</NavLink>
          <NavLink to="/admin/foods">🍔 Foods</NavLink>
          <NavLink to="/admin/wallet">💰 Wallet</NavLink>
          <NavLink to="/admin/riders">🚴 Riders</NavLink>
          <NavLink to="/admin/analytics">📈 Analytics</NavLink>
        </nav>

        <button className="admin-logout-btn" onClick={handleLogout}>
          🚪 Logout
        </button>
      </aside>

      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;