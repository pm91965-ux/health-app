
import 'dotenv/config';
import express, { Request, Response, NextFunction } from 'express'; // Explicitly import Request, Response, NextFunction
import cors from 'cors';
import { PrismaClient, Prisma } from '@prisma/client'; // Import Prisma for JsonValue type
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
// import { getRecommendation, analyzeSession } from './aiService'; // Commented out AI import
// import { WorkoutSession, UserProfile, DayNutrition, LabResult } from './types'; // Commented out AI-related types import

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 4000;
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretjwtkey'; // This should be a strong, randomly generated key in production

app.use(express.json());
// Configure CORS to be more restrictive in production
app.use(cors({ origin: process.env.FRONTEND_URL || '*' })); // IMPORTANT: Set FRONTEND_URL in Vercel for production

// --- Authentication Routes ---

app.post('/api/auth/register', async (req: Request, res: Response) => { // Use explicit types
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required.' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        username,
        passwordHash: hashedPassword,
      },
    });
    res.status(201).json({ message: 'User registered successfully.', userId: user.id });
  } catch (error: any) {
    if (error.code === 'P2002') { // Unique constraint failed for username
      return res.status(409).json({ message: 'Username already exists.' });
    }
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
});

app.post('/api/auth/login', async (req: Request, res: Response) => { // Use explicit types
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required.' });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { username },
    });

    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    const token = jwt.sign({ userId: user.id, username: user.username }, JWT_SECRET, { expiresIn: '1h' });
    res.json({ message: 'Login successful.', token });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
});

// --- Authentication Middleware ---

interface AuthRequest extends Request { // Extend Request from express
  userId?: string;
  username?: string;
}

const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Authentication token required.' });
  }

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token.' });
    }
    req.userId = user.userId;
    req.username = user.username;
    next();
  });
};

// --- Protected Workout Routes (Requires Authentication) ---

app.get('/api/workouts', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const workouts = await prisma.workoutSession.findMany({
      where: { userId: req.userId },
      include: { exercises: true },
      orderBy: { date: 'desc' },
    });
    res.json(workouts);
  } catch (error) {
    console.error('Error fetching workouts:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
});

app.post('/api/workouts', authenticateToken, async (req: AuthRequest, res: Response) => {
  const { date, exercises } = req.body;
  if (!date || !exercises || !Array.isArray(exercises)) {
    return res.status(400).json({ message: 'Date and exercises are required.' });
  }

  try {
    const newSession = await prisma.workoutSession.create({
      data: {
        date: new Date(date),
        userId: req.userId!,
        exercises: {
          create: exercises.map((ex: any) => ({
            name: ex.name,
            sets: ex.sets as Prisma.JsonArray, // Explicitly cast to Prisma.JsonArray
          })),
        },
      },
      include: { exercises: true },
    });

    res.status(201).json({ message: 'Workout session saved.', session: newSession });
  } catch (error) {
    console.error('Error saving workout session:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
});

// AI Recommendation route - now uses aiService
// app.post('/api/recommend', authenticateToken, async (req: AuthRequest, res) => {
//   try {
//     const { history, profile, nutrition, labs, focus } = req.body;
    
//     const recommendation = await getRecommendation(history, profile, nutrition, labs, focus);
//     res.json(recommendation);
//   } catch (error) {
//     console.error('Error getting recommendation:', error);
//     res.status(500).json({ message: 'Error generating recommendation.' });
//   }
// });

// New AI Workout Analysis route
// app.post('/api/workout-analysis', authenticateToken, async (req: AuthRequest, res) => {
//   try {
//     const { session, history, profile } = req.body; // Expecting these from frontend
//     const analysis = await analyzeSession(session, history, profile);
//     res.json(analysis);
//   } catch (error) {
//     console.error('Error during workout analysis:', error);
//     res.status(500).json({ message: 'Error performing workout analysis.' });
//   }
// });

// Start the server
export default app;
