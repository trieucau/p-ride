// utils/osrmDistance.js

export async function getDistanceAndDuration(pickup, drop) {
  if (!pickup || !drop) return null;

  const url =
    `https://router.project-osrm.org/route/v1/driving/` +
    `${pickup.lon},${pickup.lat};${drop.lon},${drop.lat}?overview=false`;

  const res = await fetch(url);
  const data = await res.json();

  if (!data.routes || !data.routes.length) return null;

  const route = data.routes[0];

  return {
    distanceKm: route.distance / 1000, // meters → km
    durationMin: route.duration / 60, // seconds → minutes
  };
}
