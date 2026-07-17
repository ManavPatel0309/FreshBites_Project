import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

const defaultIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

L.Marker.prototype.options.icon = defaultIcon;

const bikeIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/2972/2972185.png",
  iconSize: [45, 45],
  iconAnchor: [22, 45],
  popupAnchor: [0, -40],
});

const restaurantLocation = {
  lat: 23.03,
  lng: 72.56,
};

const customerLocation = {
  lat: 23.0225,
  lng: 72.5714,
};

const RecenterMap = ({ riderPosition }) => {
  const map = useMap();

  useEffect(() => {
    if (riderPosition?.lat && riderPosition?.lng) {
      map.setView([riderPosition.lat, riderPosition.lng], 15, {
        animate: true,
      });
    }
  }, [riderPosition, map]);

  return null;
};

const Tracking = () => {
  const navigate = useNavigate();

  const intervalRef = useRef(null);
  const timerRef = useRef(null);

  const [activeOrder, setActiveOrder] = useState(null);
  const [riderPosition, setRiderPosition] = useState(restaurantLocation);
  const [eta, setEta] = useState(10);
  const [status, setStatus] = useState("Preparing 🍳");
  const [showOrderInfo, setShowOrderInfo] = useState(false);

  const getUserKeys = useCallback(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    const userId = user?.id || user?.email || "guest";

    return {
      orderKey: `orders_${userId}`,
      currentOrderKey: `currentOrder_${userId}`,
    };
  }, []);

  const isOrderActive = (order) => {
    if (!order) return false;

    const activeValue =
      order.isActive === true ||
      order.is_active === true ||
      order.is_active === 1 ||
      order.is_active === "1";

    return (
      activeValue &&
      order.status !== "Cancelled ❌" &&
      order.status !== "Delivered ✅"
    );
  };

  const getRiderName = (order) => {
    return (
      order?.rider_name ||
      order?.riderName ||
      order?.rider?.name ||
      "Rider Not Assigned"
    );
  };

  const getRiderPhone = (order) => {
    return (
      order?.rider_phone ||
      order?.riderPhone ||
      order?.rider?.phone ||
      ""
    );
  };

  const getRiderVehicle = (order) => {
    return (
      order?.rider_vehicle ||
      order?.riderVehicle ||
      order?.rider?.vehicle ||
      "Delivery Partner"
    );
  };

  const normalizeOrder = (order) => {
    if (!order) return null;

    return {
      ...order,
      orderId: order.orderId || order.id,
      isActive:
        order.isActive === true ||
        order.is_active === true ||
        order.is_active === 1 ||
        order.is_active === "1",
      riderName: getRiderName(order),
      riderPhone: getRiderPhone(order),
      riderVehicle: getRiderVehicle(order),
    };
  };

  const getCurrentOrder = useCallback(() => {
    const { currentOrderKey } = getUserKeys();

    const order =
      JSON.parse(localStorage.getItem(currentOrderKey)) ||
      JSON.parse(localStorage.getItem("currentOrder"));

    return normalizeOrder(order);
  }, [getUserKeys]);

  const fetchLatestActiveOrder = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) return null;

      const response = await fetch(
        `${process.env.REACT_APP_API || "http://localhost:5000"}/api/orders/my-orders`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await response.json();

      if (!data.success) return null;

      const latestActiveOrder = (data.orders || []).find((order) =>
        isOrderActive(order)
      );

      if (!latestActiveOrder) return null;

      const normalized = normalizeOrder(latestActiveOrder);

      const { orderKey, currentOrderKey } = getUserKeys();

      localStorage.setItem(currentOrderKey, JSON.stringify(normalized));
      localStorage.setItem("currentOrder", JSON.stringify(normalized));

      const oldOrders = JSON.parse(localStorage.getItem(orderKey)) || [];
      const exists = oldOrders.some(
        (order) => Number(order.orderId) === Number(normalized.orderId)
      );

      const updatedOrders = exists
        ? oldOrders.map((order) =>
          Number(order.orderId) === Number(normalized.orderId)
            ? normalized
            : order
        )
        : [...oldOrders, normalized];

      localStorage.setItem(orderKey, JSON.stringify(updatedOrders));

      return normalized;
    } catch (error) {
      console.log("Fetch Active Order Error:", error);
      return null;
    }
  }, [getUserKeys]);

  const updateOrderStatusLocal = useCallback(
    (updatedOrder) => {
      const { orderKey, currentOrderKey } = getUserKeys();

      localStorage.setItem(currentOrderKey, JSON.stringify(updatedOrder));
      localStorage.setItem("currentOrder", JSON.stringify(updatedOrder));

      const userOrders = JSON.parse(localStorage.getItem(orderKey)) || [];

      const exists = userOrders.some(
        (order) => Number(order.orderId) === Number(updatedOrder.orderId)
      );

      const updatedUserOrders = exists
        ? userOrders.map((order) =>
          Number(order.orderId) === Number(updatedOrder.orderId)
            ? updatedOrder
            : order
        )
        : [...userOrders, updatedOrder];

      localStorage.setItem(orderKey, JSON.stringify(updatedUserOrders));

      window.dispatchEvent(new Event("orderUpdated"));
    },
    [getUserKeys]
  );

  const updateOrderStatusBackend = async (orderId, newStatus) => {
    try {
      const token = localStorage.getItem("token");

      if (!token || !orderId) return;

      await fetch(
        `${process.env.REACT_APP_API || "http://localhost:5000"}/api/orders/${orderId}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            status: newStatus,
          }),
        }
      );
    } catch (error) {
      console.log("Backend Status Update Error:", error);
    }
  };

  useEffect(() => {
    const loadOrder = async () => {
      const backendOrder = await fetchLatestActiveOrder();
      const currentOrder = backendOrder || getCurrentOrder();

      if (!isOrderActive(currentOrder)) {
        setActiveOrder(null);
        return;
      }

      setActiveOrder(currentOrder);
      setStatus(currentOrder.status || "Preparing 🍳");
    };

    loadOrder();
  }, [fetchLatestActiveOrder, getCurrentOrder]);

  const cancelOrder = async () => {
    const currentOrder = getCurrentOrder();

    if (!currentOrder) {
      alert("No active order found");
      navigate("/orders");
      return;
    }

    const cancelledOrder = {
      ...currentOrder,
      status: "Cancelled ❌",
      isActive: false,
      is_active: 0,
      cancelledAt: new Date().toISOString(),
      cancelled_at: new Date().toISOString(),
    };

    updateOrderStatusLocal(cancelledOrder);
    await updateOrderStatusBackend(cancelledOrder.orderId, "Cancelled ❌");

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    setStatus("Cancelled ❌");
    setActiveOrder(null);

    alert("Order Cancelled Successfully ❌");
    navigate("/orders");
  };

  useEffect(() => {
    if (!activeOrder) return;

    let step = 0;

    intervalRef.current = setInterval(async () => {
      const latestOrder = getCurrentOrder();

      if (!isOrderActive(latestOrder)) {
        clearInterval(intervalRef.current);
        setActiveOrder(null);
        return;
      }

      step += 1;

      const progress = Math.min(step / 20, 1);

      const lat =
        restaurantLocation.lat +
        (customerLocation.lat - restaurantLocation.lat) * progress;

      const lng =
        restaurantLocation.lng +
        (customerLocation.lng - restaurantLocation.lng) * progress;

      setRiderPosition({ lat, lng });

      let newStatus = "Preparing 🍳";

      if (step >= 5) newStatus = "Picked Up 📦";
      if (step >= 10) newStatus = "On The Way 🚴";
      if (step >= 20) newStatus = "Delivered ✅";

      setStatus(newStatus);

      const updatedOrder = {
        ...latestOrder,
        status: newStatus,
        isActive: newStatus !== "Delivered ✅",
        is_active: newStatus !== "Delivered ✅" ? 1 : 0,
        deliveredAt:
          newStatus === "Delivered ✅"
            ? new Date().toISOString()
            : latestOrder.deliveredAt || "",
        delivered_at:
          newStatus === "Delivered ✅"
            ? new Date().toISOString()
            : latestOrder.delivered_at || "",
      };

      updateOrderStatusLocal(updatedOrder);

      if (
        newStatus === "Picked Up 📦" ||
        newStatus === "On The Way 🚴" ||
        newStatus === "Delivered ✅"
      ) {
        await updateOrderStatusBackend(updatedOrder.orderId, newStatus);
      }

      if (step >= 20) {
        setEta(0);
        setActiveOrder(null);
        clearInterval(intervalRef.current);
      }
    }, 3000);

    return () => clearInterval(intervalRef.current);
  }, [activeOrder, getCurrentOrder, updateOrderStatusLocal]);

  useEffect(() => {
    if (!activeOrder) return;

    timerRef.current = setInterval(() => {
      setEta((prev) => (prev > 0 ? prev - 1 : 0));
    }, 6000);

    return () => clearInterval(timerRef.current);
  }, [activeOrder]);

  if (!activeOrder) {
    return (
      <div className="profile-page">
        <div className="profile-card">
          <h2>🚫 No Active Order</h2>
          <p>You have no food order currently being delivered.</p>

          <button type="button" onClick={() => navigate("/foods")}>
            Order Food
          </button>
        </div>
      </div>
    );
  }

  const riderName = getRiderName(activeOrder);
  const riderPhone = getRiderPhone(activeOrder);
  const riderVehicle = getRiderVehicle(activeOrder);

  return (
    <div className="tracking-container">
      <div className="tracking-map-area">
        <MapContainer
          center={[restaurantLocation.lat, restaurantLocation.lng]}
          zoom={15}
          zoomControl={false}
          className="tracking-map"
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

          <RecenterMap riderPosition={riderPosition} />

          <Polyline
            positions={[
              [restaurantLocation.lat, restaurantLocation.lng],
              [customerLocation.lat, customerLocation.lng],
            ]}
            pathOptions={{
              color: "blue",
              weight: 6,
            }}
          />

          <Marker position={[restaurantLocation.lat, restaurantLocation.lng]}>
            <Popup>🏪 Restaurant</Popup>
          </Marker>

          <Marker position={[customerLocation.lat, customerLocation.lng]}>
            <Popup>🏠 Delivery Address</Popup>
          </Marker>

          <Marker
            position={[riderPosition.lat, riderPosition.lng]}
            icon={bikeIcon}
          >
            <Popup>
              🚴 {riderName} {riderPhone ? `(${riderPhone})` : ""} is on the way
            </Popup>
          </Marker>
        </MapContainer>
      </div>

      <div className="tracking-card">
        <h2>{status}</h2>
        <p>Your Fresh Bites order is on the way.</p>

        <div className="eta-box">
          <h1>{eta}</h1>
          <span>mins</span>
        </div>

        {showOrderInfo && (
          <div className="tracking-order-box">
            <h3>🧾 Order Info</h3>

            <p>
              <strong>Order ID:</strong> #{activeOrder.orderId || activeOrder.id}
            </p>

            <p>
              <strong>Name:</strong>{" "}
              {activeOrder.name || activeOrder.customer_name || "N/A"}
            </p>

            <p>
              <strong>Phone:</strong> {activeOrder.phone || "N/A"}
            </p>

            <p>
              <strong>Address:</strong>{" "}
              {activeOrder.address || "N/A"}, {activeOrder.city || ""},{" "}
              {activeOrder.state || ""} -{" "}
              {activeOrder.pinCode || activeOrder.pin_code || ""}
            </p>

            <p>
              <strong>Payment:</strong>{" "}
              {activeOrder.paymentMethod?.toUpperCase() ||
                activeOrder.payment_method?.toUpperCase() ||
                "N/A"}
            </p>

            <p>
              <strong>Total:</strong> ₹
              {Number(activeOrder.total || 0).toFixed(2)}
            </p>

            <p>
              <strong>Rider:</strong> {riderName}
            </p>

            <p>
              <strong>Rider Phone:</strong> {riderPhone || "N/A"}
            </p>

            <p>
              <strong>Vehicle:</strong> {riderVehicle}
            </p>
          </div>
        )}

        <div className="rider-info">
          <img
            src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
            alt="Rider"
          />

          <div>
            <h3>{riderName}</h3>
            <p>{riderVehicle}</p>
            {riderPhone && <p>📞 {riderPhone}</p>}
          </div>
        </div>

        <div className="tracking-buttons">
          <button
            type="button"
            onClick={() => setShowOrderInfo(!showOrderInfo)}
          >
            🧾 Order Info
          </button>

          <a href={riderPhone ? `tel:${riderPhone}` : "#"}>📞 Call Rider</a>

          <button
            type="button"
            onClick={() => alert("Message feature coming soon")}
          >
            💬 Message Rider
          </button>

          <button
            type="button"
            className="cancel-order-btn"
            onClick={cancelOrder}
          >
            ❌ Cancel Order
          </button>
        </div>
      </div>
    </div>
  );
};

export default Tracking;