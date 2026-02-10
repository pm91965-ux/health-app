import fs from 'fs';
import path from 'path';
import { WorkoutSession, UserProfile } from './types';

const DATA_DIR = path.join(process.cwd(), 'data');
const HISTORY_FILE = path.join(DATA_DIR, 'history.json');
const PROFILE_FILE = path.join(DATA_DIR, 'profile.json');

// --- History ---
export const getHistory = (): WorkoutSession[] => {
  if (!fs.existsSync(HISTORY_FILE)) return [];
  const data = fs.readFileSync(HISTORY_FILE, 'utf-8');
  return JSON.parse(data);
};

export const saveSession = (session: WorkoutSession): void => {
  const history = getHistory();
  history.push(session);
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(HISTORY_FILE, JSON.stringify(history, null, 2));
};

// --- Profile ---
export const getProfile = (): UserProfile => {
  if (!fs.existsSync(PROFILE_FILE)) {
      return { name: "User", goals: {}, principles: [], physical_context: [], takeaways: [] };
  }
  const data = fs.readFileSync(PROFILE_FILE, 'utf-8');
  return JSON.parse(data);
};

export const saveProfile = (profile: UserProfile): void => {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(PROFILE_FILE, JSON.stringify(profile, null, 2));
};
