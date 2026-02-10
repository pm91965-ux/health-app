import { GoogleGenerativeAI } from '@google/generative-ai';
import { Meal } from './nutrition_types';

export const analyzeFood = async (description: string, rules: string[] = []): Promise<Omit<Meal, 'id' | 'date' | 'time'>> => {
  if (!process.env.GOOGLE_API_KEY) throw new Error("Missing API Key");

  const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  const prompt = `
  You are a JSON-only Nutrition Calculator API.
  You DO NOT chat. You DO NOT say "Okay". You ONLY output JSON.
  
  RULES:
  1. Use EXACT standard nutritional values for weights given (e.g. 200g Chicken = 62g Protein).
  2. Assume "Cooked" for meat unless specified.
  3. No weight? Use standard serving.
  
  USER SPECIFIC CONTEXT (Apply these strictly):
  ${rules.map(r => `- ${r}`).join('\n')}
  
  INPUT: "${description}"
  
  RESPONSE JSON:
  {
    "description": "Cleaned description",
    "macros": { "calories": 0, "protein": 0, "carbs": 0, "fat": 0 },
    "ai_analysis": "Brief calculation note"
  }
  `;

  // Retry Logic
  for (let i = 0; i < 3; i++) {
    try {
        const result = await model.generateContent(prompt);
        let text = result.response.text();

        // Extract JSON block
        const firstBrace = text.indexOf('{');
        const lastBrace = text.lastIndexOf('}');
        
        if (firstBrace !== -1 && lastBrace !== -1) {
            text = text.substring(firstBrace, lastBrace + 1);
        }

        return JSON.parse(text);
    } catch (e) {
        console.warn(`AI Parse Retry ${i+1}/3...`);
    }
  }
  throw new Error("AI failed to generate valid JSON after 3 attempts.");
};
