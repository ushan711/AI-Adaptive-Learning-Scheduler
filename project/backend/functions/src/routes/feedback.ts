import * as express from 'express';
import * as admin from 'firebase-admin';
import { AIEngine } from '../logic/aiEngine';

const router = express.Router();
const db = admin.firestore();

// Submit feedback
router.post('/', async (req, res) => {
  try {
    const userId = req.user?.uid;
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const feedbackData = {
      userId,
      ...req.body,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    // Save feedback to Firestore
    const feedbackRef = await db.collection('feedback').add(feedbackData);

    // Trigger AI model update
    const aiEngine = new AIEngine();
    await aiEngine.processFeedback(feedbackData);

    res.json({ id: feedbackRef.id, message: 'Feedback submitted successfully' });
  } catch (error) {
    console.error('Submit feedback error:', error);
    res.status(500).json({ error: 'Failed to submit feedback' });
  }
});

// Get feedback history
router.get('/user/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    const requestingUserId = req.user?.uid;
    
    if (userId !== requestingUserId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const feedbackQuery = await db.collection('feedback')
      .where('userId', '==', userId)
      .orderBy('createdAt', 'desc')
      .limit(50)
      .get();

    const feedback = feedbackQuery.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.json(feedback);
  } catch (error) {
    console.error('Get feedback error:', error);
    res.status(500).json({ error: 'Failed to get feedback' });
  }
});

export { router as feedbackRoutes };