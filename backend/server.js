require("dotenv").config();
const express = require("express");
const http = require("http");
const mongoose = require("mongoose");
const cors = require("cors");
const { Server } = require("socket.io");

/* =====================
   FIX: fetch for Node
===================== */
const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

const app = express();

/* =====================
   Middleware
===================== */




app.use(cors({
  origin: [
    "http://localhost:5500",
    "http://127.0.0.1:5500",
    "https://hackathon9744-create.github.io"
  ],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}));


app.use(express.json());

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

const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:5500",
      "https://hackathon9744-create.github.io"
    ],
    methods: ["GET", "POST"],
    credentials: true
  }
});
/* =====================
   OSRM Helper
===================== */
async function getOSRMRoute(start, end) {
  const url = `https://router.project-osrm.org/route/v1/driving/${start.lng},${start.lat};${end.lng},${end.lat}?overview=full&geometries=geojson`;
  const res = await fetch(url);
  const data = await res.json();

  if (!data.routes || !data.routes.length) return null;

  return {
    distance: data.routes[0].distance,
    duration: data.routes[0].duration,
    geometry: data.routes[0].geometry.coordinates
  };
}

/* =====================
   Live Driver Store
===================== */
const liveDrivers = {};

/* =====================
   Health Check
===================== */
app.get("/", (_, res) => {
  res.send("🚀 LogiSync Backend Running on Render");
});

/* =====================
   SOCKET.IO
===================== */
io.on("connection", socket => {
  console.log("🟢 Client connected:", socket.id);

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

  socket.on("driver:location", async data => {
    const prev = liveDrivers[data.driverId];
    let speed = data.speed || 0;

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
      updatedAt: Date.now()
    };

    io.emit("fleet:update", liveDrivers[data.driverId]);
  });

  socket.on("driver:sos", data => {
    io.emit("driver:sos", {
      driverId: data.driverId,
      lat: data.lat,
      lng: data.lng,
      vehicleType: data.vehicleType,
      timestamp: Date.now()
    });
  });

  socket.on("driver:offline", ({ driverId }) => {
    delete liveDrivers[driverId];
    io.emit("driver:status:update", {
      driverId,
      status: "offline"
    });
  });

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
  console.log(`🔥 Server running on port ${PORT}`);
});


