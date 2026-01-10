let vehicles = [
  {
    id: "VEH_1",
    lat: 19.076,
    lng: 72.8777,
    currentRoute: []
  },
  {
    id: "VEH_2",
    lat: 19.10,
    lng: 72.85,
    currentRoute: []
  }
];

function getActiveVehicles() {
  return vehicles;
}

function updateRoute(updatedVehicle) {
  vehicles = vehicles.map(v =>
    v.id === updatedVehicle.id ? updatedVehicle : v
  );
}

module.exports = {
  getActiveVehicles,
  updateRoute
};