import fs from 'fs';
import path from 'path';
import { Meal, DayNutrition } from './nutrition_types';

const DATA_DIR = path.join(process.cwd(), 'data');
const NUTRITION_FILE = path.join(DATA_DIR, 'nutrition.json');

export const getNutritionHistory = (): Meal[] => {
  if (!fs.existsSync(NUTRITION_FILE)) return [];
  const data = fs.readFileSync(NUTRITION_FILE, 'utf-8');
  return JSON.parse(data);
};

export const saveMeal = (meal: Meal): void => {
  const history = getNutritionHistory();
  history.push(meal);
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(NUTRITION_FILE, JSON.stringify(history, null, 2));
};

export const updateMeal = (updatedMeal: Meal): void => {
  let history = getNutritionHistory();
  history = history.map(m => m.id === updatedMeal.id ? updatedMeal : m);
  fs.writeFileSync(NUTRITION_FILE, JSON.stringify(history, null, 2));
};

export const deleteMeal = (id: string): void => {
  let history = getNutritionHistory();
  history = history.filter(m => m.id !== id);
  fs.writeFileSync(NUTRITION_FILE, JSON.stringify(history, null, 2));
};

export const getDailyNutrition = (date: string): DayNutrition => {
  const history = getNutritionHistory();
  const daysMeals = history.filter(m => m.date === date);
  
  const total = daysMeals.reduce((acc, curr) => ({
    calories: acc.calories + curr.macros.calories,
    protein: acc.protein + curr.macros.protein,
    carbs: acc.carbs + curr.macros.carbs,
    fat: acc.fat + curr.macros.fat,
  }), { calories: 0, protein: 0, carbs: 0, fat: 0 });

  return { date, meals: daysMeals, total };
};
