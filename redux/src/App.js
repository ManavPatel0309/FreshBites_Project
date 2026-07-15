import React from "react";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import { Analytics } from "@vercel/analytics/react";

import Navbar from "./Router/Navbar";
import Home from "./Router/Home";
import Foods from "./Router/Foods";
import Cart from "./Router/Cart";
import Contact from "./Router/Contact";
import Checkout from "./Router/Checkout";
import Login from "./Router/Login";
import Register from "./Router/Register";
import Tracking from "./Router/Tracking";
import Profile from "./Router/Profile";
import EditProfile from "./Router/EditProfile";
import OrderHistory from "./Router/OrderHistory";
import Settings from "./Router/Settings";
import Support from "./Router/Support";
import Wishlist from "./Router/Wishlist";
import Payment from "./Router/Payment";
import AddWallet from "./Router/AddWallet";

import AdminLogin from "./Admin/AdminLogin";
import AdminDashboard from "./Admin/AdminDashboard";
import AdminUsers from "./Admin/AdminUsers";
import AdminOrders from "./Admin/AdminOrders";
import AdminFoods from "./Admin/AdminFoods";
import AdminWallet from "./Admin/AdminWallet";
import AdminRiders from "./Admin/AdminRiders";
import AdminAnalytics from "./Admin/AdminAnalytics";
import AdminLayout from "./Admin/AdminLayout";

import { Provider } from "react-redux";
import Store from "./Store/Store";

const AppContent = () => {
  const location = useLocation();

  const isAdminPage = location.pathname.startsWith("/admin");

  return (
    <>
      {!isAdminPage && <Navbar />}

      <Routes>
        {/* User Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/foods" element={<Foods />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/add-wallet" element={<AddWallet />} />
        <Route path="/payment" element={<Payment />} />
        <Route path="/tracking" element={<Tracking />} />

        <Route path="/profile" element={<Profile />} />
        <Route path="/orders" element={<OrderHistory />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/support" element={<Support />} />
        <Route path="/edit-profile" element={<EditProfile />} />
        <Route path="/wishlist" element={<Wishlist />} />

        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Admin Routes */}
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/users" element={<AdminUsers />} />
        <Route path="/admin/orders" element={<AdminOrders />} />
        <Route path="/admin/foods" element={<AdminFoods />} />
        <Route path="/admin/wallet" element={<AdminWallet />} />
        <Route path="/admin/riders" element={<AdminRiders />} />
        <Route path="/admin/analytics" element={<AdminAnalytics />} />
        <Route path="/admin" element={<AdminLayout />}></Route>
      </Routes>
    </>
  );
};

const App = () => {
  return (
    <Provider store={Store}>
      <BrowserRouter>
        <AppContent />
        <Analytics />
      </BrowserRouter>
    </Provider>
  );
};

export default App;