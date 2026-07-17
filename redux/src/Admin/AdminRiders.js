import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const AdminRiders = () => {
  const navigate = useNavigate();

  const API_URL = `${process.env.REACT_APP_API || "http://localhost:5000"}/api/admin`;

  const [riders, setRiders] = useState([]);
  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState("");
  const [editRiderId, setEditRiderId] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    vehicle: "",
    status: "Available",
    location: "",
  });

  const getAdminToken = () => {
    return localStorage.getItem("adminToken");
  };

  const loadRiders = async () => {
    try {
      const adminToken = getAdminToken();

      const response = await fetch(`${API_URL}/riders`, {
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        setRiders(data.riders || []);
      } else {
        alert(data.message || "Riders fetch failed");
      }
    } catch (error) {
      console.log("Load Riders Error:", error);
      alert("Server Error while loading riders");
    }
  };

  const loadOrders = async () => {
    try {
      const adminToken = getAdminToken();

      const response = await fetch(`${API_URL}/orders`, {
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        setOrders(data.orders || []);
      }
    } catch (error) {
      console.log("Load Orders Error:", error);
    }
  };

  useEffect(() => {
    const adminToken = getAdminToken();

    if (!adminToken) {
      navigate("/admin-login");
      return;
    }

    loadRiders();
    loadOrders();
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const resetForm = () => {
    setFormData({
      name: "",
      phone: "",
      vehicle: "",
      status: "Available",
      location: "",
    });

    setEditRiderId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.name.trim() ||
      !formData.phone.trim() ||
      !formData.vehicle.trim()
    ) {
      alert("Please fill rider name, phone and vehicle");
      return;
    }

    try {
      const adminToken = getAdminToken();

      const method = editRiderId ? "PUT" : "POST";
      const url = editRiderId
        ? `${API_URL}/riders/${editRiderId}`
        : `${API_URL}/riders`;

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        alert(
          editRiderId
            ? "Rider updated successfully ✅"
            : "Rider added successfully ✅"
        );

        resetForm();
        loadRiders();
      } else {
        alert(data.message || "Rider save failed");
      }
    } catch (error) {
      console.log("Save Rider Error:", error);
      alert("Server Error while saving rider");
    }
  };

  const handleEdit = (rider) => {
    setEditRiderId(rider.id);

    setFormData({
      name: rider.name || "",
      phone: rider.phone || "",
      vehicle: rider.vehicle || "",
      status: rider.status || "Available",
      location: rider.location || "",
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleDelete = async (riderId) => {
    const confirmDelete = window.confirm("Delete this rider from database?");

    if (!confirmDelete) return;

    try {
      const adminToken = getAdminToken();

      const response = await fetch(`${API_URL}/riders/${riderId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        alert("Rider deleted successfully ✅");
        loadRiders();
      } else {
        alert(data.message || "Rider delete failed");
      }
    } catch (error) {
      console.log("Delete Rider Error:", error);
      alert("Server Error while deleting rider");
    }
  };

  const handleStatusChange = async (rider, status) => {
    try {
      const adminToken = getAdminToken();

      const response = await fetch(`${API_URL}/riders/${rider.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          name: rider.name || "",
          phone: rider.phone || "",
          vehicle: rider.vehicle || "",
          status,
          location: rider.location || "",
        }),
      });

      const data = await response.json();

      if (data.success) {
        loadRiders();
      } else {
        alert(data.message || "Status update failed");
      }
    } catch (error) {
      console.log("Status Change Error:", error);
      alert("Server Error while updating status");
    }
  };

  const assignRiderToActiveOrder = async (rider) => {
    try {
      if (rider.status !== "Available") {
        alert("Only available rider can be assigned");
        return;
      }

      await loadOrders();

      const activeOrder = orders.find(
        (order) =>
          order.is_active !== 0 &&
          order.status !== "Delivered ✅" &&
          order.status !== "Cancelled ❌" &&
          !order.rider_id
      );

      if (!activeOrder) {
        alert("No active unassigned order found");
        return;
      }

      const adminToken = getAdminToken();

      const response = await fetch(`${API_URL}/riders/assign`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          orderId: activeOrder.id || activeOrder.orderId,
          riderId: rider.id,
        }),
      });

      const data = await response.json();

      if (data.success) {
        alert(`${rider.name} assigned to Order #${activeOrder.id || activeOrder.orderId} ✅`);
        loadRiders();
        loadOrders();
        window.dispatchEvent(new Event("orderUpdated"));
      } else {
        alert(data.message || "Rider assign failed");
      }
    } catch (error) {
      console.log("Assign Rider Error:", error);
      alert("Server Error while assigning rider");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    navigate("/admin-login");
  };

  const filteredRiders = riders.filter((rider) => {
    const value = `${rider.name || ""} ${rider.phone || ""} ${
      rider.vehicle || ""
    } ${rider.status || ""} ${rider.location || ""}`.toLowerCase();

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
            <h1>🚴 Rider Management</h1>
            <p>Add, edit, delete and assign delivery riders</p>
          </div>

          <button
            type="button"
            onClick={() => {
              loadRiders();
              loadOrders();
            }}
          >
            🔄 Refresh
          </button>
        </div>

        <div className="admin-section">
          <h2>{editRiderId ? "Edit Rider" : "Add New Rider"}</h2>

          <form className="admin-rider-form" onSubmit={handleSubmit}>
            <input
              type="text"
              name="name"
              placeholder="Rider Name"
              value={formData.name}
              onChange={handleChange}
              required
            />

            <input
              type="tel"
              name="phone"
              placeholder="Phone Number"
              value={formData.phone}
              onChange={handleChange}
              required
            />

            <input
              type="text"
              name="vehicle"
              placeholder="Vehicle Number / Bike"
              value={formData.vehicle}
              onChange={handleChange}
              required
            />

            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
            >
              <option value="Available">Available</option>
              <option value="Busy">Busy</option>
              <option value="Offline">Offline</option>
            </select>

            <input
              type="text"
              name="location"
              placeholder="Current Location"
              value={formData.location}
              onChange={handleChange}
            />

            <div className="admin-form-buttons">
              <button type="submit">
                {editRiderId ? "Update Rider" : "Add Rider"}
              </button>

              {editRiderId && (
                <button type="button" onClick={resetForm}>
                  Cancel Edit
                </button>
              )}
            </div>
          </form>
        </div>

        <div className="admin-section">
          <div className="admin-topbar">
            <h2>All Riders</h2>

            <input
              type="text"
              placeholder="Search rider..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {filteredRiders.length === 0 ? (
            <p>No riders found.</p>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Phone</th>
                  <th>Vehicle</th>
                  <th>Location</th>
                  <th>Status</th>
                  <th>Assigned Order</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {filteredRiders.map((rider) => (
                  <tr key={rider.id}>
                    <td>#{rider.id}</td>
                    <td>{rider.name || "N/A"}</td>
                    <td>{rider.phone || "N/A"}</td>
                    <td>{rider.vehicle || "N/A"}</td>
                    <td>{rider.location || "N/A"}</td>

                    <td>
                      <select
                        value={rider.status || "Available"}
                        onChange={(e) =>
                          handleStatusChange(rider, e.target.value)
                        }
                      >
                        <option value="Available">Available</option>
                        <option value="Busy">Busy</option>
                        <option value="Offline">Offline</option>
                      </select>
                    </td>

                    <td>
                      {rider.assigned_order_id
                        ? `Order #${rider.assigned_order_id}`
                        : "Not Assigned"}
                    </td>

                    <td>
                      <div className="admin-action-buttons">
                        <button
                          type="button"
                          className="admin-view-btn"
                          onClick={() => assignRiderToActiveOrder(rider)}
                        >
                          Assign
                        </button>

                        <button
                          type="button"
                          className="admin-edit-btn"
                          onClick={() => handleEdit(rider)}
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          className="admin-delete-btn"
                          onClick={() => handleDelete(rider.id)}
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
      </main>
    </div>
  );
};

export default AdminRiders;