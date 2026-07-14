const { io } = require("socket.io-client");

// connect to backend server
const socket = io("http://localhost:5000");

let lat = 23.0225;   // starting point (Ahmedabad)
let lng = 72.5714;

// simulate movement every 2 seconds
setInterval(() => {
  lat += 0.0005;
  lng += 0.0005;

  const location = { lat, lng };

  console.log("🚴 Rider moving:", location);

  socket.emit("rider-location", location);
}, 2000);
