import { GoogleGenerativeAI } from '@google/generative-ai';
import { SYSTEM_PROMPT } from './prompts';
import { WorkoutSession } from './types';
import dotenv from 'dotenv';

dotenv.config();

export const getRecommendation = async (history: WorkoutSession[], focus?: string): Promise<any> => {
  if (!process.env.GOOGLE_API_KEY) {
    throw new Error("Missing GOOGLE_API_KEY in .env");
  }

  const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  // Optimize context: last 5 sessions
  const recentHistory = history.slice(-5);

  const prompt = `
  ${SYSTEM_PROMPT}
  
  CURRENT HISTORY:
  ${JSON.stringify(recentHistory, null, 2)}
  
  TODAY'S FOCUS: ${focus || "General"}
  
  Make your recommendation in JSON format.
  `;

  const result = await model.generateContent(prompt);
  const response = result.response;
  let text = response.text();

  // Clean up markdown code blocks if present (common with Gemini)
  text = text.replace(/```json/g, '').replace(/```/g, '').trim();

  try {
    return JSON.parse(text);
  } catch (e) {
    console.error("Failed to parse AI response:", text);
    throw new Error("AI returned invalid JSON");
  }
};
