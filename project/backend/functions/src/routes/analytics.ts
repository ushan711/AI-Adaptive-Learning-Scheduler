import * as express from 'express';
import * as admin from 'firebase-admin';
import { AnalyticsEngine } from '../logic/analyticsEngine';

const router = express.Router();
const db = admin.firestore();

// Get weekly report
router.get('/weekly/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    const requestingUserId = req.user?.uid;
    
    if (userId !== requestingUserId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const weekStart = req.query.weekStart as string;
    const analyticsEngine = new AnalyticsEngine();
    
    const weeklyReport = await analyticsEngine.generateWeeklyReport(userId, weekStart);
    
    res.json(weeklyReport);
  } catch (error) {
    console.error('Get weekly report error:', error);
    res.status(500).json({ error: 'Failed to get weekly report' });
  }
});

// Get progress stats
router.get('/progress/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    const requestingUserId = req.user?.uid;
    
    if (userId !== requestingUserId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const analyticsEngine = new AnalyticsEngine();
    const progressStats = await analyticsEngine.getProgressStats(userId);
    
    res.json(progressStats);
  } catch (error) {
    console.error('Get progress stats error:', error);
    res.status(500).json({ error: 'Failed to get progress stats' });
  }
});

export { router as analyticsRoutes };