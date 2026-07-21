// // /utils/coords.js - النسخة النهائية المصححة
// export function extractLatLngsFromPolygon(polygon) {
//   if (!polygon || !polygon.coordinates) {
//     console.warn("Polygon object or coordinates array is missing.");
//     return [];
//   }

//   let coords = polygon.coordinates;

//   // التسطيح المتكرر: استمر بالتسطيح طالما أن العنصر الحالي هو مصفوفة،
//   // وعنصرها الأول مصفوفة أيضاً.
//   // نتوقف عندما يكون العنصر الأول زوجًا من الأرقام [number, number].
//   while (
//     Array.isArray(coords) &&
//     coords.length > 0 &&
//     Array.isArray(coords[0]) &&
//     // الشرط الحاسم: إذا كان العنصر الأول من المصفوفة ليس زوج إحداثيات (أي ليس [number, number])، نستمر في التسطيح.
//     (coords[0].length !== 2 || typeof coords[0][0] !== 'number')
//   ) {
//     coords = coords[0];
//   }

//   // الآن، يجب أن تكون 'coords' هي مصفوفة من أزواج الإحداثيات: [[lng, lat], [lng, lat], ...]

//   if (!Array.isArray(coords) || coords.length === 0 || coords[0].length !== 2) {
//       // إذا فشل الاستخراج، نرجع مصفوفة فارغة
//       console.error("Failed to extract coordinate pairs after flattening.", coords);
//       return [];
//   }

//   // 1. استخدام 'coords' كمصفوفة أزواج
//   const pairs = coords;

//   // 2. العكس (Reversing) من [Long, Lat] إلى [Lat, Long]
//   return pairs.map(p => {
//     const [lng, lat] = p; // GeoJSON is Longitude, Latitude
//     if (typeof lng === 'number' && typeof lat === 'number') {
//       return [lat, lng]; // Leaflet requires Latitude, Longitude
//     }
//     return null;
//   }).filter(Boolean);
// }

// export function extractLatLngsFromPolygon(polygon) {
//   if (!polygon || !polygon.coordinates) return [];

//   // السيرفر بيرجع الشكل: coordinates[0][0][0] = Array of pairs
//   const raw = polygon.coordinates?.[0]?.[0]?.[0];
//   if (!Array.isArray(raw)) return [];

//   // raw = [[lng,lat], [lng,lat], ...]
//   return raw.map(([lng, lat]) => [lat, lng]); // Leaflet format
// }

// utils/coords.js
export function extractLatLngsFromPolygon(polygon) {
  if (!polygon || !polygon.coordinates) {
    console.warn("Polygon object or coordinates array is missing.");
    return [];
  }

  let coords = polygon.coordinates;

  // flatten until we reach coordinate pairs
  while (
    Array.isArray(coords) &&
    Array.isArray(coords[0]) &&
    (coords[0].length !== 2 || typeof coords[0][0] !== "number")
  ) {
    coords = coords[0];
  }

  if (!Array.isArray(coords) || coords.length === 0) {
    console.error("Failed to extract coordinate pairs.", coords);
    return [];
  }

  return coords.map((p) => {
    const [lng, lat] = p;
    return [lat, lng]; // Leaflet => [lat, lng]
  });
}
