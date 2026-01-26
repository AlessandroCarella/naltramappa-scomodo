// Map Configuration Constants

// Title Configuration
const TITLE_TEXT = "Bari Metropolitan Area - Interactive Map";
const TITLE_TEXT_HOVER = "Explore the City of Bari"; // Alternative text on hover
const TITLE_BOX_COLOR = "#dc2626"; // Red color for the title box
const TITLE_TEXT_COLOR = "#ffffff"; // White text

// Pin Colors
const PIN_COLOR_GREEN = "#10b981";
const PIN_COLOR_PURPLE = "#8b5cf6";

// Pin Sizes
const PIN_WIDTH = 30;
const PIN_HEIGHT = 30;
const PIN_BORDER_WIDTH = 3;
const PIN_BORDER_COLOR = "#ffffff";

// Tooltip Colors
const TOOLTIP_BACKGROUND = "rgba(0, 0, 0, 0.9)";
const TOOLTIP_TEXT_COLOR = "#e5e7eb";
const TOOLTIP_TITLE_COLOR_GREEN = "#10b981";
const TOOLTIP_TITLE_COLOR_PURPLE = "#8b5cf6";

// Map Initial Settings
const MAP_CENTER_LAT = 41.1171;
const MAP_CENTER_LNG = 16.8719;
const MAP_INITIAL_ZOOM = 13;
const MAP_MIN_ZOOM = 10;
const MAP_MAX_ZOOM = 19;
const MAP_ZOOM_SNAP = 0.1; // Allows zoom levels at 0.1 increments (e.g., 13.1, 13.2)
const MAP_ZOOM_DELTA = 0.5; // Zoom in/out by 0.5 per scroll/click

// Polygon Outline Settings
const POLYGON_COLOR = "#000000"; // Black
const POLYGON_WEIGHT = 3;
const POLYGON_OPACITY = 1;
const POLYGON_FILL = false;
const POLYGON_FILL_COLOR = "#000000";
const POLYGON_FILL_OPACITY = 0.1;
const POLYGON_BOUNDS_PADDING = [50, 50]; // Padding in pixels [vertical, horizontal]

// Auto-update Settings
const AUTO_UPDATE_ENABLED = true; // Enable/disable auto-update
const AUTO_UPDATE_INTERVAL = 3000; // Check for updates every 3 seconds (3000ms)

// Export constants (for module usage if needed)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        TITLE_TEXT,
        TITLE_TEXT_HOVER,
        TITLE_BOX_COLOR,
        TITLE_TEXT_COLOR,
        PIN_COLOR_GREEN,
        PIN_COLOR_PURPLE,
        PIN_WIDTH,
        PIN_HEIGHT,
        PIN_BORDER_WIDTH,
        PIN_BORDER_COLOR,
        TOOLTIP_BACKGROUND,
        TOOLTIP_TEXT_COLOR,
        TOOLTIP_TITLE_COLOR_GREEN,
        TOOLTIP_TITLE_COLOR_PURPLE,
        MAP_CENTER_LAT,
        MAP_CENTER_LNG,
        MAP_INITIAL_ZOOM,
        MAP_MIN_ZOOM,
        MAP_MAX_ZOOM,
        MAP_ZOOM_SNAP,
        MAP_ZOOM_DELTA,
        POLYGON_COLOR,
        POLYGON_WEIGHT,
        POLYGON_OPACITY,
        POLYGON_FILL,
        POLYGON_FILL_COLOR,
        POLYGON_FILL_OPACITY,
        POLYGON_BOUNDS_PADDING,
        AUTO_UPDATE_ENABLED,
        AUTO_UPDATE_INTERVAL
    };
}