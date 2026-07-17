import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const AdminWallet = () => {
  const navigate = useNavigate();

  const API_BASE = `${process.env.REACT_APP_API || "http://localhost:5000"}/api/admin`;

  const [users, setUsers] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);

  const getAdminToken = () => {
    return localStorage.getItem("adminToken");
  };

  useEffect(() => {
    const adminToken = getAdminToken();

    if (!adminToken) {
      navigate("/admin-login");
      return;
    }

    loadWalletData();
  }, [navigate]);

  const logoutAdmin = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("admin");
    navigate("/admin-login");
  };

  const handleApiAuthError = (message) => {
    if (
      message === "Invalid or expired admin token" ||
      message === "Admin token missing" ||
      message === "Admin access denied"
    ) {
      logoutAdmin();
    }
  };

  const normalizeWalletUser = (user) => {
    return {
      ...user,
      id: user.id,
      name: user.name || "Unknown User",
      email: user.email || "N/A",
      phone: user.phone || "N/A",
      walletBalance: Number(user.wallet_balance || user.walletBalance || 0),
      createdAt: user.created_at || user.createdAt || "",
    };
  };

  const normalizeTransaction = (item) => {
    return {
      ...item,
      id: item.id,
      userName: item.user_name || item.userName || "Unknown User",
      userEmail: item.user_email || item.userEmail || "N/A",
      type: item.type || "",
      amount: Number(item.amount || 0),
      oldBalance: Number(item.old_balance || item.oldBalance || 0),
      newBalance: Number(item.new_balance || item.newBalance || 0),
      paymentMethod: item.payment_method || item.paymentMethod || "",
      note: item.note || "",
      date: item.created_at || item.date || "",
    };
  };

  const loadWalletData = async () => {
    try {
      const adminToken = getAdminToken();

      if (!adminToken) {
        logoutAdmin();
        return;
      }

      setLoading(true);

      const [walletResponse, transactionResponse] = await Promise.all([
        fetch(`${API_BASE}/wallets`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${adminToken}`,
          },
        }),

        fetch(`${API_BASE}/wallet-transactions`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${adminToken}`,
          },
        }),
      ]);

      const walletData = await walletResponse.json();
      const transactionData = await transactionResponse.json();

      if (walletData.success) {
        setUsers((walletData.wallets || []).map(normalizeWalletUser));
      } else {
        alert(walletData.message || "Wallet users fetch failed");
        handleApiAuthError(walletData.message);
      }

      if (transactionData.success) {
        setTransactions(
          (transactionData.transactions || []).map(normalizeTransaction)
        );
      } else {
        alert(transactionData.message || "Wallet transactions fetch failed");
        handleApiAuthError(transactionData.message);
      }
    } catch (error) {
      console.log("Load Wallet Error:", error);
      alert("Server Error while loading wallet data");
    } finally {
      setLoading(false);
    }
  };

  const handleWalletUpdate = async (type) => {
    try {
      if (!selectedUser) {
        alert("Please select a user first");
        return;
      }

      const walletAmount = Number(amount);

      if (!walletAmount || walletAmount <= 0) {
        alert("Please enter valid amount");
        return;
      }

      if (
        type === "deduct" &&
        walletAmount > Number(selectedUser.walletBalance || 0)
      ) {
        alert("Wallet balance cannot be negative");
        return;
      }

      const adminToken = getAdminToken();

      if (!adminToken) {
        logoutAdmin();
        return;
      }

      setLoading(true);

      const response = await fetch(`${API_BASE}/wallet/${selectedUser.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          type,
          amount: walletAmount,
          note:
            note ||
            (type === "add"
              ? "Admin added wallet money"
              : "Admin deducted wallet money"),
        }),
      });

      const data = await response.json();

      if (data.success) {
        alert(
          type === "add"
            ? "Wallet money added in MySQL ✅"
            : "Wallet money deducted in MySQL ✅"
        );

        setAmount("");
        setNote("");
        setSelectedUser(null);
        await loadWalletData();
      } else {
        alert(data.message || "Wallet update failed");
        handleApiAuthError(data.message);
      }
    } catch (error) {
      console.log("Wallet Update Error:", error);
      alert("Server Error while updating wallet");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logoutAdmin();
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
            <h1>💰 Wallet Management</h1>
            <p>Add or deduct permanent MySQL customer wallet money</p>
          </div>

          <button type="button" onClick={loadWalletData} disabled={loading}>
            {loading ? "Loading..." : "🔄 Refresh"}
          </button>
        </div>

        <div className="admin-section">
          <div className="admin-topbar">
            <h2>Customer Wallets</h2>

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
                  <th>User ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Wallet Balance</th>
                  <th>Joined</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id}>
                    <td>#{user.id}</td>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td>{user.phone}</td>

                    <td>
                      <strong>
                        ₹{Number(user.walletBalance || 0).toFixed(2)}
                      </strong>
                    </td>

                    <td>
                      {user.createdAt
                        ? new Date(user.createdAt).toLocaleDateString()
                        : "N/A"}
                    </td>

                    <td>
                      <button
                        type="button"
                        className="admin-view-btn"
                        onClick={() => {
                          setSelectedUser(user);
                          setAmount("");
                          setNote("");
                        }}
                      >
                        Manage Wallet
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="admin-section">
          <h2>Wallet Transactions</h2>

          {transactions.length === 0 ? (
            <p>No wallet transactions found.</p>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>User</th>
                  <th>Email</th>
                  <th>Type</th>
                  <th>Amount</th>
                  <th>Old Balance</th>
                  <th>New Balance</th>
                  <th>Payment</th>
                  <th>Note</th>
                </tr>
              </thead>

              <tbody>
                {transactions.map((item) => (
                  <tr key={item.id}>
                    <td>
                      {item.date
                        ? new Date(item.date).toLocaleString()
                        : "N/A"}
                    </td>

                    <td>{item.userName}</td>
                    <td>{item.userEmail}</td>

                    <td>
                      <span
                        className={
                          item.type === "add"
                            ? "admin-status delivered"
                            : "admin-status cancelled"
                        }
                      >
                        {item.type === "add"
                          ? "Added"
                          : item.type === "deduct"
                          ? "Deducted"
                          : item.type}
                      </span>
                    </td>

                    <td>₹{Number(item.amount || 0).toFixed(2)}</td>
                    <td>₹{Number(item.oldBalance || 0).toFixed(2)}</td>
                    <td>₹{Number(item.newBalance || 0).toFixed(2)}</td>
                    <td>{item.paymentMethod || "N/A"}</td>
                    <td>{item.note || "N/A"}</td>
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

              <h2>💰 Manage Wallet</h2>

              <p>
                <strong>User ID:</strong> #{selectedUser.id}
              </p>

              <p>
                <strong>Name:</strong> {selectedUser.name}
              </p>

              <p>
                <strong>Email:</strong> {selectedUser.email}
              </p>

              <p>
                <strong>Phone:</strong> {selectedUser.phone}
              </p>

              <p>
                <strong>Current Balance:</strong> ₹
                {Number(selectedUser.walletBalance || 0).toFixed(2)}
              </p>

              <input
                type="number"
                min="1"
                placeholder="Enter amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="admin-wallet-input"
              />

              <textarea
                placeholder="Note optional"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="admin-wallet-note"
              />

              <div className="admin-wallet-buttons">
                <button
                  type="button"
                  onClick={() => handleWalletUpdate("add")}
                  disabled={loading}
                >
                  ➕ Add Money
                </button>

                <button
                  type="button"
                  onClick={() => handleWalletUpdate("deduct")}
                  disabled={loading}
                >
                  ➖ Deduct Money
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminWallet;