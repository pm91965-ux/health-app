
import { GoogleGenerativeAI } from '@google/generative-ai';
import { SYSTEM_PROMPT } from './prompts'; // Assuming prompts.ts exists in backend
import { WorkoutSession, UserProfile, DayNutrition, LabResult } from './types'; // Assuming types.ts exists in backend

const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;

if (!GOOGLE_API_KEY) {
  console.warn("GOOGLE_API_KEY is not set in backend environment variables. AI features may not work.");
}

const genAI = GOOGLE_API_KEY ? new GoogleGenerativeAI(GOOGLE_API_KEY) : null;
const model = genAI ? genAI.getGenerativeModel({ model: "gemini-2.0-flash" }) : null;

const parseAIResponse = (text: string) => {
  text = text.replace(/```json/g, '').replace(/```/g, '').trim();
  try {
    return JSON.parse(text);
  } catch (e) {
    console.error("Failed to parse AI response:", text);
    throw new Error("AI returned invalid JSON");
  }
};

export const getRecommendation = async (history: WorkoutSession[], profile: UserProfile, nutrition: DayNutrition, labs: LabResult[], focus?: string): Promise<any> => {
  if (!model) {
    return { reasoning: "AI is offline (missing API key).", plan: [] };
  }

  const recentHistory = history.slice(-5);
  const recentLabs = labs.slice(-5);

  const prompt = `
  ${SYSTEM_PROMPT}

  USER PROFILE (The "Truth"):
  ${JSON.stringify(profile, null, 2)}
  
  TODAY'S NUTRITION (Fuel Status):
  Totals: ${JSON.stringify(nutrition.total)}
  
  INTERNAL BIOMARKERS (Labs):
  ${JSON.stringify(recentLabs, null, 2)}
  
  CURRENT HISTORY:
  ${JSON.stringify(recentHistory, null, 2)}
  
  TODAY'S FOCUS/CONTEXT: ${focus || "General"}
  
  INSTRUCTIONS:
  1. Respect User Profile.
  2. CONSIDER EVERYTHING (Bio-Digital Twin):
     - Nutrition: Low fuel -> Lower volume.
     - Labs: If markers are off (e.g. Low Iron, Low T, High Inflammation), suggest lighter load or recovery focus. Mention this in reasoning.
  3. Use takeaways to inform next step.
  
  Make your recommendation in JSON format.
  `;

  const result = await model.generateContent(prompt);
  const response = result.response;
  const text = response.text();
  return parseAIResponse(text);
};

export const analyzeSession = async (session: WorkoutSession, history: WorkoutSession[], profile: UserProfile): Promise<{ new_takeaways: string[], updated_context: string[], feedback: string }> => {
  if (!model) {
    return { new_takeaways: [], updated_context: [], feedback: "AI Offline (missing API key)" };
  }

  const prompt = `
  You are an expert coach analyzing a completed workout session.
  
  USER PROFILE:
  ${JSON.stringify(profile, null, 2)}
  
  RECENT HISTORY (Last 3):
  ${JSON.stringify(history.slice(-3), null, 2)}
  
  COMPLETED SESSION (Just now):
  ${JSON.stringify(session, null, 2)}
  
  TASK:
  1. Analyze performance vs goals.
  2. Did we learn anything new? (PRs, pain, technique).
  3. Write a short, encouraging, but technical "Coach's Feedback" paragraph to the user.
  
  OUTPUT JSON ONLY:
  {
    "new_takeaways": ["List of NEW concise lessons/facts"],
    "updated_context": ["List of physical context updates if changed"],
    "feedback": "Direct message to user. E.g. 'Great work on the 100kg! RPE 9 was spot on...'"
  }
  `;

  const result = await model.generateContent(prompt);
  const text = result.response.text();
  return parseAIResponse(text);
};
