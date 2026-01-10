const vehiclesService = require("./vehicles");
const { findBestVehicle, insertOrder } = require("../utils/optimizer");

function optimizeOrder(order) {
  const vehicles = vehiclesService.getActiveVehicles();
  const vehicle = findBestVehicle(order, vehicles);

  vehicle.currentRoute = insertOrder(
    vehicle.currentRoute,
    order
  );

  vehiclesService.updateRoute(vehicle);

  return vehicle;
}

module.exports = {
  optimizeOrder
};