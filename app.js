const map = L.map("map").setView([19.076, 72.8777], 12);
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png")
.addTo(map);
const socket = io("http://localhost:3000");
const vehicles = {};
let routeLine = null;
// Live vehicle movement
socket.on("vehicle:moved", data => {
if (!vehicles[data.id]) {
vehicles[data.id] = L.marker([data.lat, data.lng]).addTo(map);

}
vehicles[data.id].setLatLng([data.lat, data.lng]);
});
// Updated route
socket.on("route:reoptimized", vehicle => {
if (routeLine) map.removeLayer(routeLine);
const coords = vehicle.currentRoute.map(p => [p.lat, p.lng]);
routeLine = L.polyline(coords, { weight: 5 }).addTo(map);
});
