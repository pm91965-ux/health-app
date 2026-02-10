import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { getHistory, getProfile } from '@/lib/store';
import { getDailyNutrition } from '@/lib/nutrition_store';
import { getLabs } from '@/lib/labs_store';

export async function POST(request: Request) {
  try {
    const { messages } = await request.json();
    
    if (!process.env.GOOGLE_API_KEY) {
      return NextResponse.json({ error: "Missing API Key" }, { status: 500 });
    }

    // Load ALL context
    const profile = getProfile();
    const history = getHistory().slice(-5); // Last 5 workouts
    const nutrition = getDailyNutrition(new Date().toISOString().split('T')[0]);
    const labs = getLabs().slice(-5); // Last 5 labs

    const systemContext = `
    You are a private, holistic Health Assistant for ${profile.name}.
    You have access to the user's entire health data:
    
    1. **Profile (Stats & Principles):** ${JSON.stringify(profile)}
    2. **Recent Workouts:** ${JSON.stringify(history)}
    3. **Today's Nutrition:** ${JSON.stringify(nutrition)}
    4. **Lab Results:** ${JSON.stringify(labs)}
    
    **Goal:** Help the user optimize their health, performance, and recovery.
    **Style:** Direct, empathetic, evidence-based. Reference their specific data when answering.
    
    If they say they feel bad/sick, check their recent data for clues (e.g. low calories, hard workout yesterday, bad labs).
    `;

    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    // Construct chat history for Gemini
    // Gemini expects specific format, but simple prompt appending works well for short context
    const chatPrompt = `
    ${systemContext}
    
    CONVERSATION HISTORY:
    ${messages.map((m: any) => `${m.role.toUpperCase()}: ${m.content}`).join('\n')}
    
    ASSISTANT:
    `;

    const result = await model.generateContent(chatPrompt);
    const response = result.response.text();

    return NextResponse.json({ role: 'assistant', content: response });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
