require('dotenv').config();
const { GoogleGenAI } = require('@google/genai');

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const listModels = async () => {
  const models = await ai.models.list();
  for await (const model of models) {
    console.log(JSON.stringify(model, null, 2));
    break; // sirf pehla model dikhao structure ke liye
  }
};

listModels().catch(console.error);