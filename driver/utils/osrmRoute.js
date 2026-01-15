// utils/osrmRoute.js

export async function getRouteGeoJSON(pickup, drop) {
  if (!pickup || !drop) return null;

  const url =
    `https://router.project-osrm.org/route/v1/driving/` +
    `${pickup.lon},${pickup.lat};${drop.lon},${drop.lat}` +
    `?overview=full&geometries=geojson`;

  const res = await fetch(url);
  const data = await res.json();

  if (!data.routes || !data.routes.length) return null;

  return data.routes[0].geometry; // GeoJSON LineString
}
