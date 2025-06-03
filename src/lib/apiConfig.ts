// Attempt to access VITE_API_URL, providing a fallback for non-Vite environments
const VITE_API_URL = typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env.VITE_API_URL : undefined;

const API_CONFIG = {
  baseUrls: VITE_API_URL
    ? [VITE_API_URL.replace(/\/$/, '')] // Use environment variable if available, remove trailing slash
    : [
        "http://15.206.169.202:5011",
        "http://aptino-dev.zentere.com:5011",
        // "http://localhost:5011", // Optional: for local development
      ],
  endpoints: {
    forecast: "forecast",
    analyze_forecasts: "analyze_forecasts",
  },
  healthcheck: "healthcheck",
};

export default API_CONFIG;
