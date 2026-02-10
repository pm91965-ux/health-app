"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRecommendation = void 0;
const openai_1 = __importDefault(require("openai"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const openai = new openai_1.default({
    apiKey: process.env.OPENAI_API_KEY || 'sk-placeholder', // Will fail if not set, handled in UI
});
const SYSTEM_PROMPT = `
You are a strength and conditioning coach.
Your goal is to increase the user's 1RM on the Big 3: Bench, Squat, Deadlift.
Analyze their history and provide the NEXT workout recommendation.
Be specific: Sets, Reps, Weight (kg).
Apply progressive overload.
Output JSON format only:
{
  "reasoning": "brief explanation",
  "plan": [
    { "name": "Squat", "sets": 3, "reps": 5, "weight": 100 }
  ]
}
`;
const getRecommendation = async (history, focus) => {
    if (!process.env.OPENAI_API_KEY) {
        throw new Error("Missing OPENAI_API_KEY in .env");
    }
    // Optimize context window - only send last 5 sessions
    const recentHistory = history.slice(-5);
    const completion = await openai.chat.completions.create({
        messages: [
            { role: "system", content: SYSTEM_PROMPT },
            { role: "user", content: `History: ${JSON.stringify(recentHistory)}. Focus today: ${focus || "General"}` }
        ],
        model: "gpt-4-turbo-preview", // Or gpt-3.5-turbo
        response_format: { type: "json_object" }
    });
    const content = completion.choices[0].message.content;
    return content ? JSON.parse(content) : null;
};
exports.getRecommendation = getRecommendation;
