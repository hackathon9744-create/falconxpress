// utils/optimizer.js

function distance(a, b) {
  return Math.sqrt(
    Math.pow(a.lat - b.lat, 2) +
    Math.pow(a.lng - b.lng, 2)
  );
}

function findBestVehicle(order, vehicles) {
  let best = null;
  let minDist = Infinity;

  vehicles.forEach(vehicle => {
    const d = distance(order, vehicle);
    if (d < minDist) {
      minDist = d;
      best = vehicle;
    }
  });

  return best;
}

function routeCost(route) {
  let cost = 0;
  for (let i = 0; i < route.length - 1; i++) {
    cost += distance(route[i], route[i + 1]);
  }
  return cost;
}

function insertOrder(route, order) {
  if (!route) route = [];

  let bestIndex = 0;
  let minCost = Infinity;

  for (let i = 0; i <= route.length; i++) {
    const temp = [...route];
    temp.splice(i, 0, order);

    const cost = routeCost(temp);
    if (cost < minCost) {
      minCost = cost;
      bestIndex = i;
    }
  }

  route.splice(bestIndex, 0, order);
  return route;
}

module.exports = {
  findBestVehicle,
  insertOrder
};