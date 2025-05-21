const apiBaseUrls = [
  // 'http://localhost:5011',
  'http://15.206.169.202:5011',
  'http://aptino-dev.zentere.com:5011'
];

const getApiBaseUrl = async () => {
  for (const url of apiBaseUrls) {
    try {
      const response = await fetch(`${url}/healthcheck`);
      if (response.ok) {
        return url;
      }
    } catch (error) {
      console.error(`Error checking ${url}:`, error);
    }
  }
  return null;
};

export default getApiBaseUrl;
