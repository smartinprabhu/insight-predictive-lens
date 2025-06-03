const API_CONFIG = {
  baseUrls: [
    "http://15.206.169.202:5011",
    "http://aptino-dev.zentere.com:5011",
    // "http://localhost:5011", // Optional: for local development
  ],
  endpoints: {
    forecast: "forecast",
    analyze_forecasts: "analyze_forecasts",
  },
  healthcheck: "healthcheck", // Added healthcheck endpoint
};

export default API_CONFIG;
