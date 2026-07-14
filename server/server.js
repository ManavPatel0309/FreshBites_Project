const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const http = require("http");
const { Server } = require("socket.io");

dotenv.config();

const app = express();
const server = http.createServer(app);

/* =========================
   ALLOWED FRONTEND URLS
========================= */
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:3001",
  "http://127.0.0.1:3000",
  "http://127.0.0.1:3001",
];

/* =========================
   SOCKET.IO SETUP
========================= */
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  },
});

/* =========================
   CORS MIDDLEWARE
========================= */
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

/* =========================
   RAZORPAY WEBHOOK ROUTE
   IMPORTANT:
   This must be BEFORE express.json()
========================= */
app.post(
  "/api/payment/webhook",
  express.raw({ type: "application/json" }),
  require("./controllers/paymentController").razorpayWebhook
);

/* =========================
   BODY MIDDLEWARE
========================= */
app.use(express.json({ limit: "50mb" }));

app.use(
  express.urlencoded({
    extended: true,
    limit: "50mb",
  })
);

/* =========================
   ROUTES
========================= */
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/payment", require("./routes/paymentRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));
app.use("/api/foods", require("./routes/foodRoutes"));
app.use("/api/orders", require("./routes/orderRoutes"));

/* =========================
   RIDER LIVE LOCATION STORE
========================= */
let riderLocation = {
  lat: 23.0225,
  lng: 72.5714,
};

/* =========================
   SOCKET EVENTS
========================= */
io.on("connection", (socket) => {
  console.log("🟢 User connected:", socket.id);

  socket.emit("rider-location", riderLocation);

  socket.on("rider-location", (data) => {
    if (!data || !data.lat || !data.lng) return;

    riderLocation = {
      lat: Number(data.lat),
      lng: Number(data.lng),
    };

    io.emit("rider-location", riderLocation);
  });

  socket.on("disconnect", () => {
    console.log("🔴 User disconnected:", socket.id);
  });
});

/* =========================
   HOME ROUTE
========================= */
app.get("/", (req, res) => {
  res.send("🚀 API Running...");
});

/* =========================
   404 HANDLER
========================= */
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

/* =========================
   ERROR HANDLER
========================= */
app.use((err, req, res, next) => {
  console.error("❌ Server Error:", err.message);

  if (err.type === "entity.too.large") {
    return res.status(413).json({
      success: false,
      message: "Uploaded file is too large",
    });
  }

  res.status(500).json({
    success: false,
    message: "Internal Server Error",
  });
});

/* =========================
   START SERVER
========================= */
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 Server Running On Port ${PORT}`);
});