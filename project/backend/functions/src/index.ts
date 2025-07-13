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

// ✅ Middleware
app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(express.json());

// ✅ Debug logger (optional but helpful)
app.use((req, res, next) => {
  console.log(`[${req.method}] ${req.path}`);
  next();
});

// ✅ Authentication middleware
const authenticateUser = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
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

// ✅ Protected API routes
app.use('/api', authenticateUser);
app.use('/api/schedule', scheduleRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/subjects', subjectRoutes);

// ✅ Public route for health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// ✅ Export Express app as Cloud Function
export const api = functions.https.onRequest(app);

//
// 🔁 Scheduled Functions
//
export const dailyScheduleGeneration = functions.pubsub
  .schedule('0 6 * * *')
  .timeZone('UTC')
  .onRun(async () => {
    console.log('Running daily schedule generation for all users.');
    const usersSnapshot = await admin.firestore().collection('users').get();

    if (usersSnapshot.empty) {
      console.log('No users found to generate schedules for.');
      return null;
    }

    const scheduleGenerator = new (require('./logic/scheduleGenerator').ScheduleGenerator)();
    const aiEngine = new (require('./logic/aiEngine').AIEngine)();

    for (const userDoc of usersSnapshot.docs) {
      const user = userDoc.data();
      const userId = userDoc.id;

      if (user && user.preferences) {
        try {
          console.log(`Generating schedule for user: ${userId}`);
          const schedule = await scheduleGenerator.generateSchedule(userId, user.preferences, user);
          const optimizedSchedule = await aiEngine.optimizeSchedule(schedule, user);

          await admin.firestore().collection('schedules').add({
            userId,
            ...optimizedSchedule,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          });

          console.log(`Successfully generated schedule for user: ${userId}`);
        } catch (error) {
          console.error(`Failed to generate schedule for user ${userId}:`, error);
        }
      }
    }

    return null;
  });

export const weeklyAnalytics = functions.pubsub
  .schedule('0 0 * * 0')
  .timeZone('UTC')
  .onRun(async () => {
    console.log('Running weekly analytics for all users.');
    const usersSnapshot = await admin.firestore().collection('users').get();

    if (usersSnapshot.empty) {
      console.log('No users found to generate analytics for.');
      return null;
    }

    const analyticsEngine = new (require('./logic/analyticsEngine').AnalyticsEngine)();

    for (const userDoc of usersSnapshot.docs) {
      const userId = userDoc.id;
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - 7);

      try {
        console.log(`Generating weekly report for user: ${userId}`);
        const weeklyReport = await analyticsEngine.generateWeeklyReport(userId, weekStart.toISOString());

        await admin.firestore().collection('analytics').add(weeklyReport);
        console.log(`Successfully generated weekly report for user: ${userId}`);
      } catch (error) {
        console.error(`Failed to generate weekly report for user ${userId}:`, error);
      }
    }

    return null;
  });

//
// 🔁 Firestore Triggers
//
export const onUserCreated = functions.firestore
  .document('users/{userId}')
  .onCreate(async (snap, context) => {
    const newUser = snap.data();
    const userId = context.params.userId;

    if (!newUser) {
      console.error('No user data found for newly created user:', userId);
      return null;
    }

    const defaultSubjects = [
      { name: 'Mathematics', priority: 3, difficulty: 'hard', color: '#3b82f6' },
      { name: 'Physics', priority: 4, difficulty: 'hard', color: '#ef4444' },
      { name: 'Chemistry', priority: 2, difficulty: 'medium', color: '#10b981' },
      { name: 'General English', priority: 1, difficulty: 'easy', color: '#f59e0b' },
    ];

    const batch = admin.firestore().batch();

    defaultSubjects.forEach(subject => {
      const subjectRef = admin.firestore().collection('subjects').doc();
      batch.set(subjectRef, {
        ...subject,
        userId: userId,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    });

    const userRef = admin.firestore().collection('users').doc(userId);
    batch.update(userRef, {
      preferences: {
        availableTimeSlots: [],
        subjectPriorities: [],
        preferredStudyHours: 6,
        breakDuration: 15,
        maxStudySession: 90,
        studyStyle: 'focused',
        notifications: true,
        weeklyGoal: 40,
      },
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    try {
      await batch.commit();
      console.log(`Default subjects and preferences initialized for user: ${userId}`);
    } catch (error) {
      console.error('Error initializing user data:', error);
    }

    return null;
  });

export const onFeedbackSubmitted = functions.firestore
  .document('feedback/{feedbackId}')
  .onCreate(async (snap, context) => {
    const feedbackData = snap.data();
    const userId = feedbackData?.userId;

    if (!feedbackData || !userId) {
      console.error('Feedback data or userId is missing.');
      return null;
    }

    console.log('New feedback submitted:', feedbackData);

    const userRef = admin.firestore().collection('users').doc(userId);

    try {
      const userDoc = await userRef.get();
      if (userDoc.exists) {
        const userData = userDoc.data();
        const oldStressLevel = userData?.averageStressLevel || 0;
        const newStressLevel = (oldStressLevel + feedbackData.stressLevel) / 2;

        await userRef.update({
          averageStressLevel: newStressLevel,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        console.log(`Updated average stress level for user ${userId} to ${newStressLevel}`);
      }
    } catch (error) {
      console.error('Error updating user stress level:', error);
    }

    return null;
  });

// Type augmentation for Express user injection
declare global {
  namespace Express {
    interface Request {
      user?: admin.auth.DecodedIdToken;
    }
  }
}
