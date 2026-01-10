require("dotenv").config();
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();

/* =====================
   Middleware
===================== */
app.use(cors());
app.use(express.json());
app.use(express.static("frontend"));

/* =====================
   Routes
===================== */
app.use("/api/auth", require("./routes/auth"));
app.use("/api/manager", require("./routes/manager"));
app.use("/api/warehouses", require("./routes/warehouses"));
app.use("/api/ports", require("./routes/ports"));
app.use("/orders", require("./routes/orders"));
app.use("/vehicles", require("./routes/vehicles"));

/* =====================
   MongoDB
===================== */
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.error("❌ MongoDB Error:", err.message));

/* =====================
   HTTP + Socket.IO
===================== */
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

/* =====================
   OSRM Helper
===================== */
async function getOSRMRoute(start, end) {
  const url = `https://router.project-osrm.org/route/v1/driving/${start.lng},${start.lat};${end.lng},${end.lat}?overview=full&geometries=geojson`;
  const res = await fetch(url);
  const data = await res.json();
  if (!data.routes?.length) return null;
  return {
    distance: data.routes[0].distance,
    duration: data.routes[0].duration,
    geometry: data.routes[0].geometry.coordinates,
  };
}

/* =====================
   Live Driver Store
===================== */
const liveDrivers = {};

/* =====================
   Health Check
===================== */
app.get("/", (_, res) => res.send("🚀 LogiSync Backend Running"));

/* =====================
   SOCKET.IO
===================== */
io.on("connection", socket => {
  console.log("🟢 Client connected:", socket.id);

  /* ---------- DRIVER ONLINE ---------- */
  socket.on("driver:online", ({ driverId, vehicleType }) => {
    liveDrivers[driverId] = {
      driverId,
      vehicleType,
      socketId: socket.id,
      status: "online",
      updatedAt: Date.now()
    };

    io.emit("driver:status:update", {
      driverId,
      status: "online",
      vehicleType
    });
  });

  /* ---------- DRIVER LOCATION ---------- */
  socket.on("driver:location", async data => {
    const prev = liveDrivers[data.driverId];
    let speed = data.speed || 0;

    // fallback speed calculation
    if (!speed && prev?.lat) {
      const dist = Math.hypot(data.lat - prev.lat, data.lng - prev.lng);
      speed = Math.round(dist * 111000 * 3.6);
    }

    let route = null;
    if (data.destination) {
      route = await getOSRMRoute(
        { lat: data.lat, lng: data.lng },
        data.destination
      );
    }

    liveDrivers[data.driverId] = {
      ...liveDrivers[data.driverId],
      lat: data.lat,
      lng: data.lng,
      speed,
      heading: data.heading || 0,
      status: speed < 2 ? "idle" : "active",
      route,
      updatedAt: Date.now(),
    };

    io.emit("fleet:update", liveDrivers[data.driverId]);
  });

  /* ---------- DRIVER SOS ---------- */
  socket.on("driver:sos", data => {
    console.log("🚨 SOS:", data.driverId);
    io.emit("driver:sos", {
      driverId: data.driverId,
      lat: data.lat,
      lng: data.lng,
      vehicleType: data.vehicleType,
      timestamp: Date.now()
    });
  });

  /* ---------- DRIVER OFFLINE ---------- */
  socket.on("driver:offline", ({ driverId }) => {
    delete liveDrivers[driverId];
    io.emit("driver:status:update", {
      driverId,
      status: "offline"
    });
  });

  /* ---------- SOCKET DISCONNECT ---------- */
  socket.on("disconnect", () => {
    for (const id in liveDrivers) {
      if (liveDrivers[id].socketId === socket.id) {
        delete liveDrivers[id];
        io.emit("driver:status:update", {
          driverId: id,
          status: "offline"
        });
        break;
      }
    }
    console.log("🔴 Client disconnected:", socket.id);
  });
});

/* =====================
   START SERVER
===================== */
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🔥 Server running on http://localhost:${PORT}`);
});