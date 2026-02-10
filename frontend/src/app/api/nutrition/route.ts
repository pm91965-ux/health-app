import { NextResponse } from 'next/server';
import { analyzeFood } from '@/lib/nutrition_ai';
import { saveMeal, getDailyNutrition, deleteMeal, updateMeal } from '@/lib/nutrition_store';
import { getProfile } from '@/lib/store';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get('date') || new Date().toISOString().split('T')[0];
  const data = getDailyNutrition(date);
  return NextResponse.json(data);
}

export async function POST(request: Request) {
  try {
    const { description, date, macros, ai_analysis } = await request.json();
    console.log("📝 Adding Food:", description); // LOG 1
    
    let analysis;
    
    if (macros) {
        analysis = { description, macros, ai_analysis: ai_analysis || "Copied meal" };
    } else {
        try {
            const profile = getProfile();
            analysis = await analyzeFood(description, profile.nutrition_rules || []);
            console.log("✅ AI Analysis:", analysis); // LOG 2
        } catch (err: any) {
            console.error("❌ AI Error:", err.message); // LOG 3
            throw err;
        }
    }
    
    // 2. Construct Meal Object
    const meal = {
      id: Date.now().toString(),
      date: date || new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      ...analysis
    };

    // 3. Save
    saveMeal(meal);
    
    return NextResponse.json(meal);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const meal = await request.json();
    updateMeal(meal);
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { id } = await request.json();
    deleteMeal(id);
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
