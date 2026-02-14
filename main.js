let map = L.map("map").setView([-1.286389, 36.817223], 6);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "&copy; OpenStreetMap contributors",
}).addTo(map);

// Test ONE file at a time
const url = "data/points.geojson"; // change later if needed

fetch(url)
  .then((r) => r.text())
  .then((txt) => {
    console.log("RAW TEXT (first 200 chars):", txt.slice(0, 200));

    let data = JSON.parse(txt);
    console.log("PARSED OK. type =", data.type);
    console.log("features count =", data.features?.length);

    const layer = L.geoJSON(data).addTo(map);

    console.log("Layer added. bounds valid?", layer.getBounds().isValid());
    if (layer.getBounds().isValid()) {
      map.fitBounds(layer.getBounds());
    } else {
      console.log("Bounds invalid → geometry/coordinates likely wrong.");
    }
  })
  .catch((err) => console.error("FETCH/PARSE ERROR:", err));
