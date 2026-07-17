import { io } from "socket.io-client";

const socket = io(process.env.REACT_APP_API || "http://localhost:5000");

// fake movement
let lat = 23.0225;
let lng = 72.5714;

setInterval(() => {
  lat += 0.0005;
  lng += 0.0005;

  socket.emit("rider-location", { lat, lng });

  console.log("Rider moved:", lat, lng);
}, 3000);