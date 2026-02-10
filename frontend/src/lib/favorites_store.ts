import fs from 'fs';
import path from 'path';
import { Macro } from './nutrition_types';

export interface FavoriteMeal {
  id: string;
  name: string; // e.g. "Morning Shake"
  description: string; // "Banana and protein..."
  macros: Macro;
}

const DATA_DIR = path.join(process.cwd(), 'data');
const FAVORITES_FILE = path.join(DATA_DIR, 'favorites.json');

export const getFavorites = (): FavoriteMeal[] => {
  if (!fs.existsSync(FAVORITES_FILE)) return [];
  const data = fs.readFileSync(FAVORITES_FILE, 'utf-8');
  return JSON.parse(data);
};

export const saveFavorite = (fav: FavoriteMeal): void => {
  const list = getFavorites();
  list.push(fav);
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(FAVORITES_FILE, JSON.stringify(list, null, 2));
};

export const deleteFavorite = (id: string): void => {
  let list = getFavorites();
  list = list.filter(f => f.id !== id);
  fs.writeFileSync(FAVORITES_FILE, JSON.stringify(list, null, 2));
};
