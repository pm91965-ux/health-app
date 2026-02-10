import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
dotenv.config();

async function main() {
  if (!process.env.GOOGLE_API_KEY) {
    console.log("No API Key found");
    return;
  }
  const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    // simple test
    const result = await model.generateContent("Hello");
    console.log("Success with gemini-1.5-flash:", result.response.text());
  } catch (e: any) {
    console.error("Flash failed:", e.message);
    try {
        const model2 = genAI.getGenerativeModel({ model: "gemini-pro" });
        const result2 = await model2.generateContent("Hello");
        console.log("Success with gemini-pro:", result2.response.text());
    } catch (e2: any) {
        console.error("Pro failed:", e2.message);
    }
  }
}
main();
