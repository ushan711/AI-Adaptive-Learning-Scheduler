import * as express from 'express';
import * as admin from 'firebase-admin';
import { ScheduleGenerator } from '../logic/scheduleGenerator';
import { AIEngine } from '../logic/aiEngine';

const router = express.Router();
const db = admin.firestore();

// Generate schedule
router.post('/generate', async (req, res) => {
  try {
    const userId = req.user?.uid;
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const preferences = req.body;
    
    // Get user's existing data
    const userDoc = await db.collection('users').doc(userId).get();
    const userData = userDoc.data();
    
    if (!userData) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Generate schedule using AI
    const scheduleGenerator = new ScheduleGenerator();
    const aiEngine = new AIEngine();
    
    const schedule = await scheduleGenerator.generateSchedule(userId, preferences, userData);
    const optimizedSchedule = await aiEngine.optimizeSchedule(schedule, userData);
    
    // Save to Firestore
    const scheduleRef = await db.collection('schedules').add({
      userId,
      ...optimizedSchedule,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    res.json({ id: scheduleRef.id, ...optimizedSchedule });
  } catch (error) {
    console.error('Schedule generation error:', error);
    res.status(500).json({ error: 'Failed to generate schedule' });
  }
});

// Get user schedule
router.get('/user/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    const requestingUserId = req.user?.uid;
    
    if (userId !== requestingUserId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const date = req.query.date as string;
    let query = db.collection('schedules').where('userId', '==', userId);
    
    if (date) {
      const startDate = new Date(date);
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 1);
      
      query = query.where('date', '>=', startDate).where('date', '<', endDate);
    }

    const schedules = await query.orderBy('date', 'desc').limit(1).get();
    
    if (schedules.empty) {
      return res.json(null);
    }

    const schedule = schedules.docs[0];
    res.json({ id: schedule.id, ...schedule.data() });
  } catch (error) {
    console.error('Get schedule error:', error);
    res.status(500).json({ error: 'Failed to get schedule' });
  }
});

// Update schedule block
router.put('/session/:sessionId', async (req, res) => {
  try {
    const sessionId = req.params.sessionId;
    const userId = req.user?.uid;
    const updates = req.body;

    // Verify session belongs to user
    const sessionDoc = await db.collection('sessions').doc(sessionId).get();
    if (!sessionDoc.exists) {
      return res.status(404).json({ error: 'Session not found' });
    }

    const sessionData = sessionDoc.data();
    if (sessionData?.userId !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Update session
    await db.collection('sessions').doc(sessionId).update({
      ...updates,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    res.json({ message: 'Session updated successfully' });
  } catch (error) {
    console.error('Update session error:', error);
    res.status(500).json({ error: 'Failed to update session' });
  }
});

// Delete schedule block
router.delete('/session/:sessionId', async (req, res) => {
  try {
    const sessionId = req.params.sessionId;
    const userId = req.user?.uid;

    // Verify session belongs to user
    const sessionDoc = await db.collection('sessions').doc(sessionId).get();
    if (!sessionDoc.exists) {
      return res.status(404).json({ error: 'Session not found' });
    }

    const sessionData = sessionDoc.data();
    if (sessionData?.userId !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Delete session
    await db.collection('sessions').doc(sessionId).delete();

    res.json({ message: 'Session deleted successfully' });
  } catch (error) {
    console.error('Delete session error:', error);
    res.status(500).json({ error: 'Failed to delete session' });
  }
});

export { router as scheduleRoutes };