// URL for the earthquake JSON data
var earthquakeURL = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

// Create a map and set its initial view
var myMap = L.map('map').setView([0, 0], 2);

// Define base layers
var streetMap = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors',
    maxZoom: 18,
});

var satelliteMap = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
    attribution: 'Map data &copy; <a href="https://opentopomap.org/">OpenTopoMap</a> contributors',
    maxZoom: 18,
});

var greyscaleMap = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    maxZoom: 18,
});

// Add the default base layer to the map
streetMap.addTo(myMap);

// Function to set the marker size based on the earthquake magnitude
function getRadius(magnitude) {
    return magnitude * 5;
}

// Function to set the marker color based on the earthquake depth
function getColor(depth) {
    if (depth > 90) {
        return "#FF0000"; // Red
    } else if (depth > 70) {
        return "#FFA500"; // Orange
    } else if (depth > 50) {
        return "#FFFF00"; // Yellow
    } else if (depth > 30) {
        return "#008000"; // Green
    } else if (depth > 10) {
        return "#0000FF"; // Blue
    } else {
        return "#800080"; // Purple
    }
}

// Fetch the earthquake data and add markers to the map
var earthquakes = new L.LayerGroup(); // Create a new layer group for the earthquakes
d3.json(earthquakeURL).then(function(data) {
    console.log("Earthquake data:", data); // Log the earthquake data to the console

    L.geoJSON(data, {
        pointToLayer: function(feature, latlng) {
            return L.circleMarker(latlng, {
                radius: getRadius(feature.properties.mag),
                fillColor: getColor(feature.geometry.coordinates[2]),
                color: "#000",
                weight: 1,
                opacity: 1,
                fillOpacity: 0.8
            }).bindPopup("<h3>Magnitude: " + feature.properties.mag +
                        "</h3><h3>Location: " + feature.properties.place +
                        "</h3><h3>Depth: " + feature.geometry.coordinates[2] + "</h3>");
        }
    }).addTo(earthquakes); // Add the earthquake layer to the map
    earthquakes.addTo(myMap); // Add the layer group to the map
}).catch(function(error) {
    console.log("Error fetching earthquake data:", error);
});

// Create a legend
var legend = L.control({position: 'bottomright'});

legend.onAdd = function (myMap) {
    var div = L.DomUtil.create('div', 'info legend'),
        depthLevels = [-10, 10, 30, 50, 70, 90],
        labels = [];

    // Loop through depth intervals and generate a label with a colored square for each interval
    for (var i = 0; i < depthLevels.length; i++) {
        div.innerHTML +=
            '<i style="background:' + getColor(depthLevels[i] + 1) + '"></i> ' +
            depthLevels[i] + (depthLevels[i + 1] ? '&ndash;' + depthLevels[i + 1] + '<br>' : '+');
    }

    return div;
};

legend.addTo(myMap);

// Create an object to hold the base layers
var baseLayers = {
    "Street Map": streetMap,
    "Satellite Map": satelliteMap,
    "Greyscale Map": greyscaleMap
};

// Create an object to hold the overlay layers
var overlayLayers = {
    "Earthquakes": earthquakes
};

// Add control for the base layers and overlay layers
L.control.layers(baseLayers, overlayLayers).addTo(myMap);
