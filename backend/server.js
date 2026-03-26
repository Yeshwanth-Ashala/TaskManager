import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import connectDB from './config/db.js';
import { errorHandler } from './middleware/error.js';
import authRoutes from './routes/authRoutes.js';
import taskRoutes from './routes/taskRoutes.js';

// Connect to Database
connectDB();

const app = express();

// --- CORS CONFIGURATION ---
const allowedOrigins = [
  'http://localhost:5173',
  'https://taskmanager-app-nine.vercel.app',    // Changed 'web' to 'app'
  'https://taskmanager-app-nine.vercel.app/'    // Changed 'web' to 'app'
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);

    // Check if the origin is in our allowed list
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log("Blocked by CORS. Origin was:", origin); // Helps you debug in Render logs
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// This handles the "Pre-flight" OPTIONS request specifically
app.options('*', cors());
// --------------------------

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);

// Basic route to check if Backend is alive
app.get('/', (req, res) => {
  res.send('Task Management API is running...');
});

// Error Middleware
app.use(errorHandler);

const PORT = process.env.PORT || 10000; // Render uses 10000 by default

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});