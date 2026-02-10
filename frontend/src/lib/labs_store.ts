import fs from 'fs';
import path from 'path';
import { LabResult } from './labs_types';

const DATA_DIR = path.join(process.cwd(), 'data');
const LABS_FILE = path.join(DATA_DIR, 'labs.json');

export const getLabs = (): LabResult[] => {
  if (!fs.existsSync(LABS_FILE)) return [];
  const data = fs.readFileSync(LABS_FILE, 'utf-8');
  return JSON.parse(data);
};

export const saveLabResult = (result: LabResult): void => {
  const history = getLabs();
  history.push(result);
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(LABS_FILE, JSON.stringify(history, null, 2));
};

export const deleteLabResult = (id: string): void => {
  let history = getLabs();
  history = history.filter(r => r.id !== id);
  fs.writeFileSync(LABS_FILE, JSON.stringify(history, null, 2));
};
