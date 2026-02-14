// ---------------------------
// 1) Initialize the map
// ---------------------------
let map = L.map("map", {
  center: [-1.286389, 36.817223], // Nairobi (just an initial view)
  zoom: 6,
});

// ---------------------------
// 2) Base maps (tile layers)
// ---------------------------
let osm = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "&copy; OpenStreetMap contributors",
}).addTo(map);

let cartoLight = L.tileLayer(
  "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
  { attribution: "&copy; OpenStreetMap &copy; Carto" }
);

let esriImagery = L.tileLayer(
  "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
  { attribution: "Tiles &copy; Esri" }
);

let baseMaps = {
  "OpenStreetMap": osm,
  "Carto Light": cartoLight,
  "ESRI Imagery": esriImagery,
};

// ---------------------------
// 3) Vector layer placeholders
// ---------------------------
let pointsLayer = L.layerGroup();
let linesLayer = L.layerGroup();
let polygonsLayer = L.layerGroup();

// For zooming to everything together
let allBounds;

// Helper: update combined bounds safely
function extendBounds(layer) {
  const b = layer.getBounds();
  if (!b.isValid()) return;

  if (!allBounds) allBounds = b;
  else allBounds.extend(b);
}

// ---------------------------
// 4) Load POINTS (your confirmed path)
// ---------------------------
fetch("data/points.geojson")
  .then((r) => r.json())
  .then((data) => {
    let lyr = L.geoJSON(data, {
      pointToLayer: (feature, latlng) => {
        return L.circleMarker(latlng, {
          radius: 7,
          fillColor: "#22C55E",
          fillOpacity: 0.9,
          color: "#14532D",
          weight: 2,
        });
      },
      onEachFeature: (feature, layer) => {
        const name = feature.properties?.name || "Point feature";
        layer.bindPopup(`<b>${name}</b>`);
      },
    }).addTo(pointsLayer);

    pointsLayer.addTo(map);
    extendBounds(lyr);

    // Zoom once we have something
    if (allBounds) map.fitBounds(allBounds, { padding: [25, 25] });

    console.log("✅ Points loaded");
  })
  .catch((err) => console.error("❌ Points error:", err));

// ---------------------------
// 5) Load LINES (your confirmed path)
// ---------------------------
fetch("data/data/lines.geojson")
  .then((r) => r.json())
  .then((data) => {
    let lyr = L.geoJSON(data, {
      style: {
        color: "#2563EB",
        weight: 4,
        opacity: 0.9,
      },
      onEachFeature: (feature, layer) => {
        const name = feature.properties?.name || "Line feature";
        layer.bindPopup(`<b>${name}</b>`);
      },
    }).addTo(linesLayer);

    linesLayer.addTo(map);
    extendBounds(lyr);

    if (allBounds) map.fitBounds(allBounds, { padding: [25, 25] });

    console.log("✅ Lines loaded");
  })
  .catch((err) => console.error("❌ Lines error:", err));

// ---------------------------
// 6) Load POLYGONS (your confirmed path)
// ---------------------------
fetch("data/data/data/polygons.geojson")
  .then((r) => r.json())
  .then((data) => {
    let lyr = L.geoJSON(data, {
      style: {
        color: "#7C3AED",
        weight: 2,
        opacity: 1,
        fillColor: "#A78BFA",
        fillOpacity: 0.45,
      },
      onEachFeature: (feature, layer) => {
        const name = feature.properties?.name || "Polygon feature";
        layer.bindPopup(`<b>${name}</b>`);
      },
    }).addTo(polygonsLayer);

    polygonsLayer.addTo(map);
    extendBounds(lyr);

    if (allBounds) map.fitBounds(allBounds, { padding: [25, 25] });

    console.log("✅ Polygons loaded");
  })
  .catch((err) => console.error("❌ Polygons error:", err));

// ---------------------------
// 7) Layer control
// ---------------------------
let overlays = {
  "Points": pointsLayer,
  "Lines": linesLayer,
  "Polygons": polygonsLayer,
};

L.control.layers(baseMaps, overlays).addTo(map);

// ---------------------------
// 8) Legend (matches the styling)
// ---------------------------
let legend = L.control({ position: "bottomright" });

legend.onAdd = function () {
  let div = L.DomUtil.create("div", "legend");
  div.innerHTML = `
    <b>Legend</b><br><br>
    <span style="display:inline-block;width:12px;height:12px;border-radius:50%;
      background:#22C55E;border:2px solid #14532D;margin-right:8px;"></span>
    Points<br>
    <span style="display:inline-block;width:18px;height:4px;background:#2563EB;
      margin-right:8px;vertical-align:middle;"></span>
    Lines<br>
    <span style="display:inline-block;width:14px;height:14px;background:#A78BFA;
      border:2px solid #7C3AED;margin-right:8px;vertical-align:middle;"></span>
    Polygons
  `;
  return div;
};

legend.addTo(map);
