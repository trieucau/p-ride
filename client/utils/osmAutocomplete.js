// utils/osmAutocomplete.js

export async function searchOSM(query) {
  if (!query) return [];

  const url =
    `https://nominatim.openstreetmap.org/search` +
    `?format=json&q=${encodeURIComponent(query)}&addressdetails=1&limit=5`;

  const res = await fetch(url, {
    headers: {
      Accept: "application/json",
    },
  });

  return await res.json();
}
