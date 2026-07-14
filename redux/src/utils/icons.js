import L from "leaflet";
import bikeImg from "../assets/bike.png";

// 🚴 Rider (Bike) Icon
export const bikeIcon = L.icon({
  iconUrl: bikeImg,
  iconSize: [45, 45],
  iconAnchor: [22, 45],
  popupAnchor: [0, -40],
});