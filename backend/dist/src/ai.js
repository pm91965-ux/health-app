"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRecommendation = void 0;
const generative_ai_1 = require("@google/generative-ai");
const prompts_1 = require("./prompts");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const getRecommendation = async (history, focus) => {
    if (!process.env.GOOGLE_API_KEY) {
        throw new Error("Missing GOOGLE_API_KEY in .env");
    }
    const genAI = new generative_ai_1.GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    // Optimize context: last 5 sessions
    const recentHistory = history.slice(-5);
    const prompt = `
  ${prompts_1.SYSTEM_PROMPT}
  
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
    }
    catch (e) {
        console.error("Failed to parse AI response:", text);
        throw new Error("AI returned invalid JSON");
    }
};
exports.getRecommendation = getRecommendation;
