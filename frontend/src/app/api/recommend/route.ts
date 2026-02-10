import { NextResponse } from 'next/server';
import { getHistory, getProfile } from '@/lib/store';
import { getDailyNutrition } from '@/lib/nutrition_store';
import { getLabs } from '@/lib/labs_store';
import { getRecommendation } from '@/lib/ai';

export async function POST(request: Request) {
  try {
    const { focus } = await request.json();
    const history = getHistory();
    const profile = getProfile();
    const nutrition = getDailyNutrition(new Date().toISOString().split('T')[0]);
    const labs = getLabs();
    
    const plan = await getRecommendation(history, profile, nutrition, labs, focus);
    return NextResponse.json(plan);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
