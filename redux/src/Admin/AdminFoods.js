import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const API_URL = `${process.env.REACT_APP_API || "http://localhost:5000"}/api/foods`;

const AdminFoods = () => {
  const navigate = useNavigate();

  const [foods, setFoods] = useState([]);
  const [search, setSearch] = useState("");
  const [editFoodId, setEditFoodId] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    price: "",
    category: "",
    image: "",
    description: "",
  });

  useEffect(() => {
    const adminToken = localStorage.getItem("adminToken");

    if (!adminToken) {
      navigate("/admin-login");
      return;
    }

    loadFoods();
  }, [navigate]);

  const loadFoods = async () => {
    try {
      const response = await fetch(API_URL);
      const data = await response.json();

      if (data.success) {
        setFoods(data.foods || []);
      } else {
        alert(data.message || "Failed to load foods");
      }
    } catch (error) {
      console.log("Load Foods Error:", error);
      alert("Server Error while loading foods");
    }
  };

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
      price: "",
      category: "",
      image: "",
      description: "",
    });

    setEditFoodId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.name.trim() ||
      !formData.price ||
      !formData.category.trim() ||
      !formData.image.trim()
    ) {
      alert("Please fill all required fields");
      return;
    }

    try {
      const method = editFoodId ? "PUT" : "POST";
      const url = editFoodId ? `${API_URL}/${editFoodId}` : API_URL;

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          price: Number(formData.price),
          category: formData.category,
          image: formData.image,
          description: formData.description,
        }),
      });

      const data = await response.json();

      if (data.success) {
        alert(
          editFoodId
            ? "Food updated successfully ✅"
            : "Food added successfully ✅"
        );

        resetForm();
        loadFoods();
      } else {
        alert(data.message || "Food save failed");
      }
    } catch (error) {
      console.log("Save Food Error:", error);
      alert("Server Error while saving food");
    }
  };

  const handleEdit = (food) => {
    setEditFoodId(food.id);

    setFormData({
      name: food.name || "",
      price: food.price || "",
      category: food.category || "",
      image: food.image || "",
      description: food.description || "",
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleDelete = async (foodId) => {
    const confirmDelete = window.confirm("Delete this food item?");

    if (!confirmDelete) return;

    try {
      const response = await fetch(`${API_URL}/${foodId}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (data.success) {
        alert("Food deleted successfully ✅");
        loadFoods();
      } else {
        alert(data.message || "Delete failed");
      }
    } catch (error) {
      console.log("Delete Food Error:", error);
      alert("Server Error while deleting food");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    navigate("/admin-login");
  };

  const filteredFoods = foods.filter((food) => {
    const value = `${food.name} ${food.category} ${food.price}`.toLowerCase();
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
            <h1>🍔 Food Management</h1>
            <p>Add, edit and delete food items</p>
          </div>

          <button type="button" onClick={loadFoods}>
            🔄 Refresh
          </button>
        </div>

        <div className="admin-section">
          <h2>{editFoodId ? "Edit Food" : "Add New Food"}</h2>

          <form className="admin-food-form" onSubmit={handleSubmit}>
            <input
              type="text"
              name="name"
              placeholder="Food Name"
              value={formData.name}
              onChange={handleChange}
              required
            />

            <input
              type="number"
              name="price"
              placeholder="Price"
              value={formData.price}
              onChange={handleChange}
              required
            />

            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
            >
              <option value="">Select Category</option>
              <option value="Pizza">Pizza</option>
              <option value="Burger">Burger</option>
              <option value="Pasta">Pasta</option>
              <option value="Rice">Rice</option>
              <option value="Drink">Drink</option>
              <option value="Dessert">Dessert</option>
              <option value="Gujarati">Gujarati</option>
              <option value="Punjabi">Punjabi</option>
              <option value="South Indian">South Indian</option>
              <option value="Chinese">Chinese</option>
            </select>

            <input
              type="text"
              name="image"
              placeholder="Food Image URL"
              value={formData.image}
              onChange={handleChange}
              required
            />

            <textarea
              name="description"
              placeholder="Food Description"
              value={formData.description}
              onChange={handleChange}
            />

            <div className="admin-form-buttons">
              <button type="submit">
                {editFoodId ? "Update Food" : "Add Food"}
              </button>

              {editFoodId && (
                <button type="button" onClick={resetForm}>
                  Cancel Edit
                </button>
              )}
            </div>
          </form>
        </div>

        <div className="admin-section">
          <div className="admin-topbar">
            <h2>All Foods</h2>

            <input
              type="text"
              placeholder="Search food..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {filteredFoods.length === 0 ? (
            <p>No food items found.</p>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Image</th>
                  <th>Name</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Description</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {filteredFoods.map((food) => (
                  <tr key={food.id}>
                    <td>
                      <img
                        src={
                          food.image ||
                          "https://cdn-icons-png.flaticon.com/512/1046/1046784.png"
                        }
                        alt={food.name}
                        className="admin-food-img"
                      />
                    </td>

                    <td>{food.name}</td>
                    <td>{food.category || "N/A"}</td>
                    <td>₹{Number(food.price || 0).toFixed(2)}</td>
                    <td>{food.description || "N/A"}</td>

                    <td>
                      <div className="admin-action-buttons">
                        <button
                          type="button"
                          className="admin-view-btn"
                          onClick={() => handleEdit(food)}
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          className="admin-delete-btn"
                          onClick={() => handleDelete(food.id)}
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

export default AdminFoods;