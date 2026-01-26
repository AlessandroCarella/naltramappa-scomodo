// Apply constants to CSS variables
function applyConstants() {
    const root = document.documentElement;
    root.style.setProperty("--title-box-color", TITLE_BOX_COLOR);
    root.style.setProperty("--title-text-color", TITLE_TEXT_COLOR);
    root.style.setProperty("--pin-color-green", PIN_COLOR_GREEN);
    root.style.setProperty("--pin-color-purple", PIN_COLOR_PURPLE);
    root.style.setProperty("--pin-width", PIN_WIDTH + "px");
    root.style.setProperty("--pin-height", PIN_HEIGHT + "px");
    root.style.setProperty("--pin-border-width", PIN_BORDER_WIDTH + "px");
    root.style.setProperty("--pin-border-color", PIN_BORDER_COLOR);
    root.style.setProperty("--tooltip-background", TOOLTIP_BACKGROUND);
    root.style.setProperty("--tooltip-text-color", TOOLTIP_TEXT_COLOR);
    root.style.setProperty(
        "--tooltip-title-color-green",
        TOOLTIP_TITLE_COLOR_GREEN,
    );
    root.style.setProperty(
        "--tooltip-title-color-purple",
        TOOLTIP_TITLE_COLOR_PURPLE,
    );

    // Set the title text
    document.getElementById("map-title").textContent = TITLE_TEXT;
}

// Global variables for auto-update functionality
let currentMarkers = [];
let previousPinsData = null;
let previousPins = [];
let updateInterval = null;

// Add hover functionality to title overlay
function setupTitleHover() {
    const titleOverlay = document.getElementById("title-overlay");
    const mapTitle = document.getElementById("map-title");

    titleOverlay.addEventListener("mouseenter", function () {
        mapTitle.textContent = TITLE_TEXT_HOVER;
    });

    titleOverlay.addEventListener("mouseleave", function () {
        mapTitle.textContent = TITLE_TEXT;
    });
}

// Initialize the map centered on Bari, Italy
const map = L.map("map", {
    center: [MAP_CENTER_LAT, MAP_CENTER_LNG],
    zoom: MAP_INITIAL_ZOOM,
    zoomControl: true,
    scrollWheelZoom: true,
    dragging: true,
    doubleClickZoom: true,
    touchZoom: true,
    zoomSnap: MAP_ZOOM_SNAP, // Allows zoom to snap at 0.1 increments
    zoomDelta: MAP_ZOOM_DELTA, // Zoom in/out by 0.5 per action (keyboard and scroll wheel)
    wheelPxPerZoomLevel: 60 * MAP_ZOOM_DELTA, // Pixels per zoom increment (30px for 0.5 zoom)
    wheelDebounceTime: 40, // Debounce time for scroll wheel in milliseconds
});

// Add CartoDB Voyager tile layer (no labels)
L.tileLayer(
    "https://{s}.basemaps.cartocdn.com/rastertiles/voyager_nolabels/{z}/{x}/{y}.png",
    {
        attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        maxZoom: MAP_MAX_ZOOM,
        minZoom: MAP_MIN_ZOOM,
    },
).addTo(map);

// Custom icon creator function
function createCustomIcon(color) {
    return L.divIcon({
        className: "custom-div-icon",
        html: `<div class="custom-marker marker-${color}"></div>`,
        iconSize: [PIN_WIDTH, PIN_HEIGHT],
        iconAnchor: [PIN_WIDTH / 2, PIN_HEIGHT],
        popupAnchor: [0, -PIN_HEIGHT],
    });
}

// Function to clear all current markers from the map
function clearMarkers() {
    currentMarkers.forEach((marker) => {
        map.removeLayer(marker);
    });
    currentMarkers = [];
}

// Function to show update indicator
function showUpdateIndicator(message = "● Auto-update active") {
    const indicator = document.getElementById("update-indicator");
    if (indicator) {
        indicator.textContent = message;
        indicator.classList.add("active");
        setTimeout(() => {
            indicator.classList.remove("active");
        }, 2000);
    }
}

// Function to add markers from JSON data
async function loadMarkers() {
    try {
        const response = await fetch(
            "data/pins.json?t=" + new Date().getTime(),
        ); // Add timestamp to avoid caching
        const pins = await response.json();

        // Check if data has changed
        const pinsString = JSON.stringify(pins);
        if (pinsString === previousPinsData) {
            return; // No changes, skip update
        }

        // Detect new pins by comparing with previous pins
        let newPins = [];
        if (previousPins.length > 0) {
            newPins = pins.filter((pin) => {
                return !previousPins.some(
                    (prevPin) =>
                        prevPin.latitude === pin.latitude &&
                        prevPin.longitude === pin.longitude &&
                        prevPin.name === pin.name,
                );
            });
        }

        // Show update indicator if this is not the first load
        if (previousPinsData !== null) {
            let message = "● Markers updated";
            if (newPins.length > 0) {
                message = `● New pin: ${newPins[0].name}`;
            }
            showUpdateIndicator(message);
            console.log("Pins data updated - refreshing markers");
            if (newPins.length > 0) {
                console.log(
                    `${newPins.length} new pin(s) detected:`,
                    newPins.map((p) => p.name),
                );
            }
        }

        // Clear existing markers
        clearMarkers();

        // Add new markers
        pins.forEach((pin) => {
            // Create custom icon based on type
            const icon = createCustomIcon(pin.type);

            // Create marker
            const marker = L.marker([pin.latitude, pin.longitude], {
                icon: icon,
                title: pin.name,
            }).addTo(map);

            // Create tooltip content
            const tooltipContent = `
                <div class="tooltip-title ${pin.type}">${pin.name}</div>
                <div class="tooltip-description">${pin.description}</div>
            `;

            // Bind tooltip that shows on hover
            marker.bindTooltip(tooltipContent, {
                className: "custom-tooltip",
                permanent: false,
                direction: "top",
                offset: [0, -20],
                opacity: 1,
            });

            // Add hover effects
            marker.on("mouseover", function () {
                this.openTooltip();
            });

            marker.on("mouseout", function () {
                this.closeTooltip();
            });

            // Add double-click to focus on pin
            marker.on("dblclick", function () {
                map.setView([pin.latitude, pin.longitude], MAP_PIN_FOCUS_ZOOM, {
                    animate: true,
                    duration: 0.5,
                });
            });

            // Store marker reference
            currentMarkers.push(marker);
        });

        // Update previous data
        previousPinsData = pinsString;
        previousPins = JSON.parse(JSON.stringify(pins)); // Deep copy

        console.log(`Successfully loaded ${pins.length} pins to the map`);
    } catch (error) {
        console.error("Error loading pins:", error);
        if (!previousPinsData) {
            alert(
                "Error loading map pins. Please ensure data/pins.json exists.",
            );
        }
    }
}

// Function to load and draw Bari outline polygon
async function loadBariOutline() {
    try {
        const response = await fetch("data/baricoordinates.json");
        const coordinates = await response.json();

        // Create polygon with the coordinates
        const polygon = L.polygon(coordinates, {
            color: POLYGON_COLOR,
            weight: POLYGON_WEIGHT,
            opacity: POLYGON_OPACITY,
            fill: POLYGON_FILL,
            fillColor: POLYGON_FILL_COLOR,
            fillOpacity: POLYGON_FILL_OPACITY,
        }).addTo(map);

        // Fit the map bounds to the polygon with padding
        map.fitBounds(polygon.getBounds(), {
            padding: POLYGON_BOUNDS_PADDING,
        });

        console.log(
            `Successfully loaded Bari outline with ${coordinates.length} coordinates`,
        );
    } catch (error) {
        console.error("Error loading Bari outline:", error);
        console.log(
            "Bari outline will not be displayed. Please ensure data/baricoordinates.json exists.",
        );
    }
}

// Function to start auto-update polling
function startAutoUpdate() {
    if (!AUTO_UPDATE_ENABLED) {
        console.log("Auto-update is disabled");
        return;
    }

    console.log(
        `Auto-update enabled: checking for changes every ${AUTO_UPDATE_INTERVAL}ms`,
    );

    // Set up interval to check for updates
    updateInterval = setInterval(async () => {
        await loadMarkers();
    }, AUTO_UPDATE_INTERVAL);
}

// Function to stop auto-update polling
function stopAutoUpdate() {
    if (updateInterval) {
        clearInterval(updateInterval);
        updateInterval = null;
        console.log("Auto-update stopped");
    }
}

// Load markers when page is ready
document.addEventListener("DOMContentLoaded", function () {
    applyConstants();
    setupTitleHover();
    loadBariOutline();
    loadMarkers();
    startAutoUpdate();
});

// Add keyboard controls for accessibility
document.addEventListener("keydown", function (e) {
    const panAmount = 50;
    const center = map.getCenter();

    switch (e.key) {
        case "ArrowUp":
            map.panTo([center.lat + 0.01, center.lng]);
            break;
        case "ArrowDown":
            map.panTo([center.lat - 0.01, center.lng]);
            break;
        case "ArrowLeft":
            map.panTo([center.lat, center.lng - 0.01]);
            break;
        case "ArrowRight":
            map.panTo([center.lat, center.lng + 0.01]);
            break;
        case "+":
        case "=":
            map.setZoom(map.getZoom() + MAP_ZOOM_DELTA);
            break;
        case "-":
        case "_":
            map.setZoom(map.getZoom() - MAP_ZOOM_DELTA);
            break;
    }
});
