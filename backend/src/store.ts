import fs from 'fs';
import path from 'path';
import { WorkoutSession } from './types';

const DATA_DIR = path.join(__dirname, '../data');
const FILE_PATH = path.join(DATA_DIR, 'history.json');

// Ensure data dir exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR);
}

export const getHistory = (): WorkoutSession[] => {
  if (!fs.existsSync(FILE_PATH)) {
    return [];
  }
  const data = fs.readFileSync(FILE_PATH, 'utf-8');
  return JSON.parse(data);
};

export const saveSession = (session: WorkoutSession): void => {
  const history = getHistory();
  history.push(session);
  fs.writeFileSync(FILE_PATH, JSON.stringify(history, null, 2));
};

export const getLastSession = (): WorkoutSession | undefined => {
  const history = getHistory();
  return history.length > 0 ? history[history.length - 1] : undefined;
};
