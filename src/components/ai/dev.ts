
// Import dotenv only in development environments
try {
  const dotenv = require('dotenv');
  dotenv.config();
} catch (error) {
  console.log('Dotenv not available, skipping config');
}

import '@/ai/flows/suggest-lob-groupings.ts';
import './genkit';
