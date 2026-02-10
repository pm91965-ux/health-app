"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const readline_1 = __importDefault(require("readline"));
const store_1 = require("./store");
const ai_1 = require("./ai");
const rl = readline_1.default.createInterface({
    input: process.stdin,
    output: process.stdout
});
const ask = (q) => new Promise(r => rl.question(q + ' ', r));
const main = async () => {
    console.log("🏋️  GYM CORE 1.0");
    const mode = await ask("Mode (recommend/log/quit):");
    if (mode === 'recommend') {
        console.log("Thinking...");
        try {
            const history = (0, store_1.getHistory)();
            const rec = await (0, ai_1.getRecommendation)(history);
            console.log("\n📋 Coach Says:");
            console.log(JSON.stringify(rec, null, 2));
        }
        catch (e) {
            console.error("Error:", e.message);
        }
    }
    else if (mode === 'log') {
        const session = {
            id: Date.now().toString(),
            date: new Date().toISOString(),
            exercises: [],
        };
        while (true) {
            const lift = await ask("Lift (Bench/Squat/Deadlift or done):");
            if (lift === 'done')
                break;
            const weight = await ask("Weight (kg):");
            const reps = await ask("Reps:");
            const rpe = await ask("RPE (1-10):");
            session.exercises.push({
                name: lift,
                sets: [{ weight: Number(weight), reps: Number(reps), rpe: Number(rpe) }]
            });
        }
        (0, store_1.saveSession)(session);
        console.log("✅ Saved.");
    }
    rl.close();
};
main();
