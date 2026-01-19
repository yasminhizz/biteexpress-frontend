/** distanceUtils.js */
export function calculateDistance(lat1, lon1, lat2, lon2) {
  const aLat1 = Number(lat1);
  const aLon1 = Number(lon1);
  const aLat2 = Number(lat2);
  const aLon2 = Number(lon2);

  if (!isFinite(aLat1) || !isFinite(aLon1) || !isFinite(aLat2) || !isFinite(aLon2)) {
    return Infinity;
  }

  const R = 6371;
  const dLat = (aLat2 - aLat1) * (Math.PI / 180);
  const dLon = (aLon2 - aLon1) * (Math.PI / 180);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(aLat1 * (Math.PI / 180)) *
      Math.cos(aLat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function getKNearestVendors(userLat, userLon, vendors, k) {
  return vendors
    .map((v) => ({
      ...v,
      distance: calculateDistance(userLat, userLon, v.latitude, v.longitude),
    }))
    .sort((a, b) => a.distance - b.distance)
    .slice(0, k);
}

export function filterVendorsByDistance(vendors, maxDistance) {
  return vendors.filter((v) => v.distance <= maxDistance);
}
