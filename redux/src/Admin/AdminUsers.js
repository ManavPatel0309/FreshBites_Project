import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const AdminUsers = () => {
  const navigate = useNavigate();

  const API_URL = "http://localhost:5000/api/admin/users";

  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);

  const getAdminToken = () => {
    return localStorage.getItem("adminToken");
  };

  useEffect(() => {
    const adminToken = getAdminToken();

    if (!adminToken) {
      navigate("/admin-login");
      return;
    }

    loadUsers();
  }, [navigate]);

  const loadUsers = async () => {
    try {
      const adminToken = getAdminToken();

      if (!adminToken) {
        navigate("/admin-login");
        return;
      }

      const response = await fetch(API_URL, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        setUsers(data.users || []);
      } else {
        alert(data.message || "Users fetch failed");

        if (
          data.message === "Invalid or expired admin token" ||
          data.message === "Admin token missing"
        ) {
          localStorage.removeItem("adminToken");
          localStorage.removeItem("admin");
          navigate("/admin-login");
        }
      }
    } catch (error) {
      console.log("Load Users Error:", error);
      alert("Server Error while loading users");
    }
  };

  const handleDeleteUser = async (user) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete ${user.name || "this user"} from MySQL?`
    );

    if (!confirmDelete) return;

    try {
      const adminToken = getAdminToken();

      const response = await fetch(`${API_URL}/${user.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        alert("User deleted from MySQL database ✅");
        loadUsers();
      } else {
        alert(data.message || "User delete failed");
      }
    } catch (error) {
      console.log("Delete User Error:", error);
      alert("Server Error while deleting user");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("admin");
    navigate("/admin-login");
  };

  const filteredUsers = users.filter((user) => {
    const value = `${user.name || ""} ${user.email || ""} ${
      user.phone || ""
    }`.toLowerCase();

    return value.includes(search.toLowerCase());
  });

  return (
    <div className="admin-page">
      <aside className="admin-sidebar">
        <h2>Fresh Bites</h2>
        <p>Admin Panel</p>

        <nav>
          <Link to="/admin/dashboard">📊 Dashboard</Link>
          <Link to="/admin/users">👤 Users</Link>
          <Link to="/admin/orders">📦 Orders</Link>
          <Link to="/admin/foods">🍔 Foods</Link>
          <Link to="/admin/wallet">💰 Wallet</Link>
          <Link to="/admin/riders">🚴 Riders</Link>
          <Link to="/admin/analytics">📈 Analytics</Link>
        </nav>

        <button className="admin-logout-btn" onClick={handleLogout}>
          🚪 Logout
        </button>
      </aside>

      <main className="admin-main">
        <div className="admin-header">
          <div>
            <h1>👤 Users</h1>
            <p>All registered Fresh Bites customers from MySQL</p>
          </div>

          <button type="button" onClick={loadUsers}>
            🔄 Refresh
          </button>
        </div>

        <div className="admin-section">
          <div className="admin-topbar">
            <h2>All Users</h2>

            <input
              type="text"
              placeholder="Search user by name, email, phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {filteredUsers.length === 0 ? (
            <p>No users found.</p>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Photo</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>DOB</th>
                  <th>Wallet</th>
                  <th>Orders</th>
                  <th>Total Spent</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id}>
                    <td>
                      {user.profile_photo ? (
                        <img
                          src={user.profile_photo}
                          alt={user.name}
                          className="admin-user-img"
                        />
                      ) : (
                        <div className="admin-user-placeholder">
                          {user.name?.charAt(0)?.toUpperCase() || "U"}
                        </div>
                      )}
                    </td>

                    <td>{user.name || "N/A"}</td>
                    <td>{user.email || "N/A"}</td>
                    <td>{user.phone || "N/A"}</td>

                    <td>
                      {user.dob
                        ? new Date(user.dob).toLocaleDateString()
                        : "N/A"}
                    </td>

                    <td>₹{Number(user.wallet_balance || 0).toFixed(2)}</td>
                    <td>{user.totalOrders || 0}</td>
                    <td>₹{Number(user.totalSpent || 0).toFixed(2)}</td>

                    <td>
                      <div className="admin-action-buttons">
                        <button
                          type="button"
                          className="admin-view-btn"
                          onClick={() => setSelectedUser(user)}
                        >
                          View
                        </button>

                        <button
                          type="button"
                          className="admin-delete-btn"
                          onClick={() => handleDeleteUser(user)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {selectedUser && (
          <div className="admin-modal-overlay">
            <div className="admin-modal">
              <button
                type="button"
                className="admin-modal-close"
                onClick={() => setSelectedUser(null)}
              >
                ✖
              </button>

              <h2>👤 User Details</h2>

              {selectedUser.profile_photo && (
                <img
                  src={selectedUser.profile_photo}
                  alt={selectedUser.name}
                  className="admin-modal-img"
                />
              )}

              <p>
                <strong>ID:</strong> #{selectedUser.id}
              </p>

              <p>
                <strong>Name:</strong> {selectedUser.name || "N/A"}
              </p>

              <p>
                <strong>Email:</strong> {selectedUser.email || "N/A"}
              </p>

              <p>
                <strong>Phone:</strong> {selectedUser.phone || "N/A"}
              </p>

              <p>
                <strong>DOB:</strong>{" "}
                {selectedUser.dob
                  ? new Date(selectedUser.dob).toLocaleDateString()
                  : "N/A"}
              </p>

              <p>
                <strong>Alt Phone:</strong> {selectedUser.alt_phone || "N/A"}
              </p>

              <p>
                <strong>Address:</strong> {selectedUser.address || "N/A"}
              </p>

              <p>
                <strong>Age:</strong> {selectedUser.age || "N/A"}
              </p>

              <p>
                <strong>Wallet:</strong> ₹
                {Number(selectedUser.wallet_balance || 0).toFixed(2)}
              </p>

              <p>
                <strong>Total Orders:</strong> {selectedUser.totalOrders || 0}
              </p>

              <p>
                <strong>Total Spent:</strong> ₹
                {Number(selectedUser.totalSpent || 0).toFixed(2)}
              </p>

              <p>
                <strong>Joined:</strong>{" "}
                {selectedUser.created_at
                  ? new Date(selectedUser.created_at).toLocaleString()
                  : "N/A"}
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminUsers;