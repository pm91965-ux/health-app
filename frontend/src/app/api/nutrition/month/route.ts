import { NextResponse } from 'next/server';
import { getNutritionHistory } from '@/lib/nutrition_store';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const month = searchParams.get('month'); // "YYYY-MM"

  if (!month) return NextResponse.json({ error: "Month required" }, { status: 400 });

  const history = getNutritionHistory();
  
  // Filter by month
  const daysInMonth = history.filter(m => m.date.startsWith(month));
  
  // Group by Date
  const dailyTotals: Record<string, any> = {};
  
  daysInMonth.forEach(meal => {
    if (!dailyTotals[meal.date]) {
      dailyTotals[meal.date] = { calories: 0, protein: 0, carbs: 0, fat: 0 };
    }
    dailyTotals[meal.date].calories += meal.macros.calories;
    dailyTotals[meal.date].protein += meal.macros.protein;
    dailyTotals[meal.date].carbs += meal.macros.carbs;
    dailyTotals[meal.date].fat += meal.macros.fat;
  });

  return NextResponse.json(dailyTotals);
}
