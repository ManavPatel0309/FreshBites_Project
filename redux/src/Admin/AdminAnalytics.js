import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const AdminAnalytics = () => {
  const navigate = useNavigate();

  const API_BASE = "http://localhost:5000/api/admin";

  const [dashboardStats, setDashboardStats] = useState({
    totalOrders: 0,
    totalUsers: 0,
    totalFoods: 0,
    totalRiders: 0,
    totalRevenue: 0,
    activeOrders: 0,
    deliveredOrders: 0,
    cancelledOrders: 0,
  });

  const [revenueLast7Days, setRevenueLast7Days] = useState([]);
  const [statusCounts, setStatusCounts] = useState([]);
  const [paymentCounts, setPaymentCounts] = useState([]);
  const [topFoods, setTopFoods] = useState([]);
  const [topCustomers, setTopCustomers] = useState([]);
  const [walletTransactions, setWalletTransactions] = useState([]);
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

    loadAnalyticsData();
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

  const formatDateLabel = (dateValue) => {
    if (!dateValue) return "N/A";

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
      return String(dateValue);
    }

    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
    });
  };

  const normalizeRevenue = (rows = []) => {
    return rows.map((item) => ({
      label: formatDateLabel(item.date),
      revenue: Number(item.revenue || 0),
    }));
  };

  const normalizeStatus = (rows = []) => {
    const statusMap = {
      "Preparing 🍳": 0,
      "Picked Up 📦": 0,
      "On The Way 🚴": 0,
      "Delivered ✅": 0,
      "Cancelled ❌": 0,
    };

    rows.forEach((item) => {
      statusMap[item.status] = Number(item.count || 0);
    });

    return [
      {
        label: "Preparing",
        status: "Preparing 🍳",
        count: statusMap["Preparing 🍳"] || 0,
      },
      {
        label: "Picked Up",
        status: "Picked Up 📦",
        count: statusMap["Picked Up 📦"] || 0,
      },
      {
        label: "On Way",
        status: "On The Way 🚴",
        count: statusMap["On The Way 🚴"] || 0,
      },
      {
        label: "Delivered",
        status: "Delivered ✅",
        count: statusMap["Delivered ✅"] || 0,
      },
      {
        label: "Cancelled",
        status: "Cancelled ❌",
        count: statusMap["Cancelled ❌"] || 0,
      },
    ];
  };

  const normalizePayments = (rows = []) => {
    const paymentMap = {
      cod: 0,
      upi: 0,
      card: 0,
      wallet: 0,
    };

    rows.forEach((item) => {
      const method = String(item.payment_method || "cod").toLowerCase();
      paymentMap[method] = Number(item.count || 0);
    });

    return [
      { label: "COD", count: paymentMap.cod || 0 },
      { label: "UPI", count: paymentMap.upi || 0 },
      { label: "Card", count: paymentMap.card || 0 },
      { label: "Wallet", count: paymentMap.wallet || 0 },
    ];
  };

  const loadAnalyticsData = async () => {
    try {
      const adminToken = getAdminToken();

      if (!adminToken) {
        logoutAdmin();
        return;
      }

      setLoading(true);

      const [analyticsResponse, dashboardResponse, walletResponse] =
        await Promise.all([
          fetch(`${API_BASE}/analytics`, {
            method: "GET",
            headers: {
              Authorization: `Bearer ${adminToken}`,
            },
          }),

          fetch(`${API_BASE}/dashboard`, {
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

      const analyticsData = await analyticsResponse.json();
      const dashboardData = await dashboardResponse.json();
      const walletData = await walletResponse.json();

      if (analyticsData.success) {
        setRevenueLast7Days(
          normalizeRevenue(analyticsData.revenueLast7Days || [])
        );
        setStatusCounts(normalizeStatus(analyticsData.statusCounts || []));
        setPaymentCounts(normalizePayments(analyticsData.paymentCounts || []));
        setTopFoods(analyticsData.topFoods || []);
        setTopCustomers(analyticsData.topCustomers || []);
      } else {
        alert(analyticsData.message || "Analytics fetch failed");
        handleApiAuthError(analyticsData.message);
      }

      if (dashboardData.success) {
        setDashboardStats({
          totalOrders: Number(dashboardData.stats?.totalOrders || 0),
          totalUsers: Number(dashboardData.stats?.totalUsers || 0),
          totalFoods: Number(dashboardData.stats?.totalFoods || 0),
          totalRiders: Number(dashboardData.stats?.totalRiders || 0),
          totalRevenue: Number(dashboardData.stats?.totalRevenue || 0),
          activeOrders: Number(dashboardData.stats?.activeOrders || 0),
          deliveredOrders: Number(dashboardData.stats?.deliveredOrders || 0),
          cancelledOrders: Number(dashboardData.stats?.cancelledOrders || 0),
        });
      } else {
        alert(dashboardData.message || "Dashboard stats fetch failed");
        handleApiAuthError(dashboardData.message);
      }

      if (walletData.success) {
        setWalletTransactions(walletData.transactions || []);
      } else {
        alert(walletData.message || "Wallet transactions fetch failed");
        handleApiAuthError(walletData.message);
      }
    } catch (error) {
      console.log("Analytics Load Error:", error);
      alert("Server Error while loading analytics");
    } finally {
      setLoading(false);
    }
  };

  const walletSummary = useMemo(() => {
    const walletAdded = walletTransactions
      .filter((item) => item.type === "add")
      .reduce((sum, item) => sum + Number(item.amount || 0), 0);

    const walletDeducted = walletTransactions
      .filter((item) => item.type === "deduct")
      .reduce((sum, item) => sum + Number(item.amount || 0), 0);

    return {
      walletAdded,
      walletDeducted,
      totalTransactions: walletTransactions.length,
    };
  }, [walletTransactions]);

  const avgOrderValue = useMemo(() => {
    const validOrders =
      Number(dashboardStats.totalOrders || 0) -
      Number(dashboardStats.cancelledOrders || 0);

    if (validOrders <= 0) return 0;

    return Number(dashboardStats.totalRevenue || 0) / validOrders;
  }, [dashboardStats]);

  const maxRevenue = Math.max(
    ...revenueLast7Days.map((item) => Number(item.revenue || 0)),
    1
  );

  const maxStatus = Math.max(
    ...statusCounts.map((item) => Number(item.count || 0)),
    1
  );

  const maxPayment = Math.max(
    ...paymentCounts.map((item) => Number(item.count || 0)),
    1
  );

  const maxFoodQty = Math.max(
    ...topFoods.map((item) => Number(item.quantity || 0)),
    1
  );

  const maxCustomerSpent = Math.max(
    ...topCustomers.map((item) => Number(item.totalSpent || 0)),
    1
  );

  const handleLogout = () => {
    logoutAdmin();
  };

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
            <h1>📈 Charts & Analytics</h1>
            <p>Permanent MySQL revenue, orders, payments and top foods</p>
          </div>

          <button type="button" onClick={loadAnalyticsData} disabled={loading}>
            {loading ? "Loading..." : "🔄 Refresh"}
          </button>
        </div>

        <div className="admin-cards">
          <div className="admin-card">
            <h3>💰 Total Revenue</h3>
            <h2>₹{Number(dashboardStats.totalRevenue || 0).toFixed(2)}</h2>
          </div>

          <div className="admin-card">
            <h3>📦 Total Orders</h3>
            <h2>{dashboardStats.totalOrders}</h2>
          </div>

          <div className="admin-card">
            <h3>✅ Delivered</h3>
            <h2>{dashboardStats.deliveredOrders}</h2>
          </div>

          <div className="admin-card">
            <h3>❌ Cancelled</h3>
            <h2>{dashboardStats.cancelledOrders}</h2>
          </div>

          <div className="admin-card">
            <h3>🧾 Avg Order Value</h3>
            <h2>₹{Number(avgOrderValue || 0).toFixed(2)}</h2>
          </div>

          <div className="admin-card">
            <h3>🚚 Active Orders</h3>
            <h2>{dashboardStats.activeOrders}</h2>
          </div>

          <div className="admin-card">
            <h3>👤 Total Users</h3>
            <h2>{dashboardStats.totalUsers}</h2>
          </div>

          <div className="admin-card">
            <h3>🍔 Total Foods</h3>
            <h2>{dashboardStats.totalFoods}</h2>
          </div>
        </div>

        <div className="analytics-grid">
          <div className="admin-section">
            <h2>Revenue Last 7 Days</h2>

            {revenueLast7Days.length === 0 ? (
              <p>No revenue data found.</p>
            ) : (
              <div className="analytics-bar-chart">
                {revenueLast7Days.map((item) => (
                  <div className="analytics-bar-item" key={item.label}>
                    <div className="analytics-bar-value">
                      ₹{Number(item.revenue || 0).toFixed(0)}
                    </div>

                    <div
                      className="analytics-bar revenue"
                      style={{
                        height: `${
                          (Number(item.revenue || 0) / maxRevenue) * 180
                        }px`,
                      }}
                    />

                    <span>{item.label}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="admin-section">
            <h2>Order Status</h2>

            <div className="analytics-horizontal-chart">
              {statusCounts.map((item) => (
                <div className="analytics-row" key={item.label}>
                  <span>{item.label}</span>

                  <div className="analytics-row-track">
                    <div
                      className="analytics-row-fill status"
                      style={{
                        width: `${
                          (Number(item.count || 0) / maxStatus) * 100
                        }%`,
                      }}
                    />
                  </div>

                  <strong>{item.count}</strong>
                </div>
              ))}
            </div>
          </div>

          <div className="admin-section">
            <h2>Payment Methods</h2>

            <div className="analytics-horizontal-chart">
              {paymentCounts.map((item) => (
                <div className="analytics-row" key={item.label}>
                  <span>{item.label}</span>

                  <div className="analytics-row-track">
                    <div
                      className="analytics-row-fill payment"
                      style={{
                        width: `${
                          (Number(item.count || 0) / maxPayment) * 100
                        }%`,
                      }}
                    />
                  </div>

                  <strong>{item.count}</strong>
                </div>
              ))}
            </div>
          </div>

          <div className="admin-section">
            <h2>Top Selling Foods</h2>

            {topFoods.length === 0 ? (
              <p>No food sales found.</p>
            ) : (
              <div className="analytics-horizontal-chart">
                {topFoods.map((food) => (
                  <div
                    className="analytics-row"
                    key={food.food_name || food.title}
                  >
                    <span>{food.food_name || food.title || "Food"}</span>

                    <div className="analytics-row-track">
                      <div
                        className="analytics-row-fill food"
                        style={{
                          width: `${
                            (Number(food.quantity || 0) / maxFoodQty) * 100
                          }%`,
                        }}
                      />
                    </div>

                    <strong>{Number(food.quantity || 0)}</strong>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="admin-section">
          <h2>Top Customers</h2>

          {topCustomers.length === 0 ? (
            <p>No customer data found.</p>
          ) : (
            <div className="analytics-horizontal-chart">
              {topCustomers.map((customer) => (
                <div className="analytics-row" key={customer.id}>
                  <span>
                    {customer.name || "Customer"} ({customer.email || "N/A"})
                  </span>

                  <div className="analytics-row-track">
                    <div
                      className="analytics-row-fill food"
                      style={{
                        width: `${
                          (Number(customer.totalSpent || 0) /
                            maxCustomerSpent) *
                          100
                        }%`,
                      }}
                    />
                  </div>

                  <strong>
                    ₹{Number(customer.totalSpent || 0).toFixed(0)}
                  </strong>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="admin-section">
          <h2>Wallet Summary</h2>

          <table className="admin-table">
            <thead>
              <tr>
                <th>Total Added</th>
                <th>Total Deducted</th>
                <th>Total Transactions</th>
              </tr>
            </thead>

            <tbody>
              <tr>
                <td>₹{Number(walletSummary.walletAdded || 0).toFixed(2)}</td>
                <td>₹{Number(walletSummary.walletDeducted || 0).toFixed(2)}</td>
                <td>{walletSummary.totalTransactions}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
};

export default AdminAnalytics;