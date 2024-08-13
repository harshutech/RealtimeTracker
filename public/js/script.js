const socket = io();

// Watch for changes in the user's location
if (navigator.geolocation) {
    navigator.geolocation.watchPosition(
        (position) => {
            const { latitude, longitude } = position.coords;
            socket.emit("send-location", { latitude, longitude });
        },
        (error) => {
            console.log("Geolocation error", error);
        },
        {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0
        }
    );
}

// Initialize the map
const map = L.map("map").setView([0, 0], 2);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    // attribution: 'medicaps college'
}).addTo(map);

// Initialize the marker cluster group
const markersGroup = L.markerClusterGroup();
map.addLayer(markersGroup);

const markers = {};

socket.on("receive-location", (data) => {
    const { id, latitude, longitude } = data;

    // Check if the marker already exists and update its position
    if (markers[id]) {
        markers[id].setLatLng([latitude, longitude]);
    } else {
        // Create a new marker and add it to the cluster group
        const marker = L.marker([latitude, longitude]);
        markersGroup.addLayer(marker);
        markers[id] = marker;
    }

    // Optionally, adjust the view to fit all markers
    const allMarkers = Object.values(markers);
    if (allMarkers.length > 0) {
        const bounds = L.latLngBounds(allMarkers.map(m => m.getLatLng()));
        map.fitBounds(bounds);
    }
});

socket.on("user-disconnected", (id) => {
    if (markers[id]) {
        markersGroup.removeLayer(markers[id]);
        delete markers[id];
    }
});
