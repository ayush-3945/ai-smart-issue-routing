require('dotenv').config();
const { analyzeComplaint } = require('./services/aiService');

const test = async () => {
  console.log('Testing Gemini AI...');
  const result = await analyzeComplaint(
    'Laptop not working',
    'My office laptop stopped working since morning. Cannot access any files and deadlines are approaching.'
  );
  console.log('AI Response:', JSON.stringify(result, null, 2));
};

test();