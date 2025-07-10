import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as express from 'express';
import * as cors from 'cors';

// Import routes
import { scheduleRoutes } from './routes/schedule';
import { feedbackRoutes } from './routes/feedback';
import { analyticsRoutes } from './routes/analytics';
import { subjectRoutes } from './routes/subjects';

// Initialize Firebase Admin
admin.initializeApp();

// Create Express app
const app = express();

// Middleware
app.use(cors({ origin: true }));
app.use(express.json());

// Authentication middleware
const authenticateUser = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const token = req.headers.authorization?.split('Bearer ')[1];
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error('Auth error:', error);
    return res.status(401).json({ error: 'Invalid token' });
  }
};

// Apply authentication middleware to all routes
app.use('/api', authenticateUser);

// Routes
app.use('/api/schedule', scheduleRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/subjects', subjectRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Export the Express app as a Firebase Cloud Function
export const api = functions.https.onRequest(app);

// Scheduled functions
export const dailyScheduleGeneration = functions.pubsub
  .schedule('0 6 * * *')
  .timeZone('UTC')
  .onRun(async (context) => {
    console.log('Running daily schedule generation');
    // Implementation will be added later
    return null;
  });

export const weeklyAnalytics = functions.pubsub
  .schedule('0 0 * * 0')
  .timeZone('UTC')
  .onRun(async (context) => {
    console.log('Running weekly analytics');
    // Implementation will be added later
    return null;
  });

// Firestore triggers
export const onUserCreated = functions.firestore
  .document('users/{userId}')
  .onCreate(async (snap, context) => {
    const userData = snap.data();
    console.log('New user created:', userData);
    
    // Initialize user's default subjects
    // Implementation will be added later
    
    return null;
  });

export const onFeedbackSubmitted = functions.firestore
  .document('feedback/{feedbackId}')
  .onCreate(async (snap, context) => {
    const feedbackData = snap.data();
    console.log('New feedback submitted:', feedbackData);
    
    // Trigger AI model update
    // Implementation will be added later
    
    return null;
  });

declare global {
  namespace Express {
    interface Request {
      user?: admin.auth.DecodedIdToken;
    }
  }
}