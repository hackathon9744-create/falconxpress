const { Server } = require("socket.io");
const redis = require("./redis/redisClient");
module.exports = function (server) {
const io = new Server(server, {
cors: { origin: "*" }

});
io.on("connection", socket => {
console.log("🟢 Client connected");



// Driver sends GPS

socket.on("location:update", async data => {

  await redis.set(

    `vehicle:${data.id}`,

    JSON.stringify(data)

  );



  socket.broadcast.emit("vehicle:moved", data);

});



socket.on("disconnect", () => {

  console.log("🔴 Client disconnected");

});

});
global.io = io;
};
