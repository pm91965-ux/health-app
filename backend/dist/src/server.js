"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const client_1 = require("@prisma/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const app = (0, express_1.default)();
const prisma = new client_1.PrismaClient();
const PORT = process.env.PORT || 4000;
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretjwtkey'; // This should be a strong, randomly generated key in production
app.use(express_1.default.json());
app.use((0, cors_1.default)()); // Enable CORS for frontend communication
// --- Authentication Routes ---
app.post('/api/auth/register', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required.' });
    }
    try {
        const hashedPassword = await bcryptjs_1.default.hash(password, 10);
        const user = await prisma.user.create({
            data: {
                username,
                passwordHash: hashedPassword,
            },
        });
        res.status(201).json({ message: 'User registered successfully.', userId: user.id });
    }
    catch (error) {
        if (error.code === 'P2002') { // Unique constraint failed for username
            return res.status(409).json({ message: 'Username already exists.' });
        }
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
});
app.post('/api/auth/login', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required.' });
    }
    try {
        const user = await prisma.user.findUnique({
            where: { username },
        });
        if (!user || !(await bcryptjs_1.default.compare(password, user.passwordHash))) {
            return res.status(401).json({ message: 'Invalid credentials.' });
        }
        const token = jsonwebtoken_1.default.sign({ userId: user.id, username: user.username }, JWT_SECRET, { expiresIn: '1h' });
        res.json({ message: 'Login successful.', token });
    }
    catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
});
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
        return res.status(401).json({ message: 'Authentication token required.' });
    }
    jsonwebtoken_1.default.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ message: 'Invalid or expired token.' });
        }
        req.userId = user.userId;
        req.username = user.username;
        next();
    });
};
// --- Protected Workout Routes (Requires Authentication) ---
app.get('/api/workouts', authenticateToken, async (req, res) => {
    try {
        const workouts = await prisma.workoutSession.findMany({
            where: { userId: req.userId },
            include: { exercises: true },
            orderBy: { date: 'desc' },
        });
        res.json(workouts);
    }
    catch (error) {
        console.error('Error fetching workouts:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
});
app.post('/api/workouts', authenticateToken, async (req, res) => {
    const { date, exercises } = req.body;
    if (!date || !exercises || !Array.isArray(exercises)) {
        return res.status(400).json({ message: 'Date and exercises are required.' });
    }
    try {
        const newSession = await prisma.workoutSession.create({
            data: {
                date: new Date(date),
                userId: req.userId,
                exercises: {
                    create: exercises.map((ex) => ({
                        name: ex.name,
                        sets: ex.sets, // Assuming sets is already an array of objects
                    })),
                },
            },
            include: { exercises: true },
        });
        res.status(201).json({ message: 'Workout session saved.', session: newSession });
    }
    catch (error) {
        console.error('Error saving workout session:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
});
// Recommendation route - This will need to integrate with the existing AI logic
// For now, it's a placeholder. The original AI logic is CLI-based.
// We'll need to adapt getHistory and getRecommendation.
const ai_1 = require("./ai"); // Assuming ai.ts can be used directly or adapted
app.post('/api/recommendation', authenticateToken, async (req, res) => {
    try {
        // Fetch history for the authenticated user from PostgreSQL
        const history = await prisma.workoutSession.findMany({
            where: { userId: req.userId },
            include: { exercises: true },
            orderBy: { date: 'asc' }, // Order by date for history
        });
        // Adapt the history to the format expected by getRecommendation if necessary
        const adaptedHistory = history.map(session => ({
            id: session.id,
            date: session.date.toISOString(),
            exercises: session.exercises.map(exercise => ({
                name: exercise.name, // Cast as any if Exercise type is stricter
                sets: exercise.sets, // Cast as any if Sets type is stricter
            })),
        }));
        // Call the AI recommendation function
        const recommendation = await (0, ai_1.getRecommendation)(adaptedHistory);
        res.json(recommendation);
    }
    catch (error) {
        console.error('Error getting recommendation:', error);
        res.status(500).json({ message: 'Error generating recommendation.' });
    }
});
// Start the server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
