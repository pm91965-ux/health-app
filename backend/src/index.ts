import readline from 'readline';
import { getHistory, saveSession } from './store';
import { getRecommendation } from './ai';
import { WorkoutSession, Exercise } from './types';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const ask = (q: string): Promise<string> => new Promise(r => rl.question(q + ' ', r));

const main = async () => {
  console.log("🏋️  GYM CORE 1.0");
  const mode = await ask("Mode (recommend/log/quit):");

  if (mode === 'recommend') {
    console.log("Thinking...");
    try {
      const history = getHistory();
      const rec = await getRecommendation(history);
      console.log("\n📋 Coach Says:");
      console.log(JSON.stringify(rec, null, 2));
    } catch (e: any) {
      console.error("Error:", e.message);
    }
  } else if (mode === 'log') {
    const session: WorkoutSession = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      exercises: [],
    };
    
    while (true) {
      const lift = await ask("Lift (Bench/Squat/Deadlift or done):");
      if (lift === 'done') break;
      
      const weight = await ask("Weight (kg):");
      const reps = await ask("Reps:");
      const rpe = await ask("RPE (1-10):");

      session.exercises.push({
        name: lift as any,
        sets: [{ weight: Number(weight), reps: Number(reps), rpe: Number(rpe) }]
      });
    }
    
    saveSession(session);
    console.log("✅ Saved.");
  }

  rl.close();
};

main();
