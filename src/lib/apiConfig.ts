// Access VITE_API_URL from process.env
const VITE_API_URL = "http://aptino-dev2.zentere.com:5011";

if (!VITE_API_URL) {
  throw new Error('VITE_API_URL environment variable is not defined');
}

const API_CONFIG = {
  baseUrls: [VITE_API_URL.replace(/\/$/, '')], // Use environment variable and remove trailing slash
  endpoints: {
    forecast: "forecast",
    analyze_forecasts: "analyze_forecasts",
  },
  healthcheck: "healthcheck",
};

export default API_CONFIG;
