import * as express from 'express';
import * as admin from 'firebase-admin';

const router = express.Router();
const db = admin.firestore();

// Get user subjects
router.get('/user/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    const requestingUserId = req.user?.uid;
    
    if (userId !== requestingUserId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const subjectsQuery = await db.collection('subjects')
      .where('userId', '==', userId)
      .orderBy('priority', 'desc')
      .get();

    const subjects = subjectsQuery.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.json(subjects);
  } catch (error) {
    console.error('Get subjects error:', error);
    res.status(500).json({ error: 'Failed to get subjects' });
  }
});

// Create subject
router.post('/', async (req, res) => {
  try {
    const userId = req.user?.uid;
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const subjectData = {
      userId,
      ...req.body,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    const subjectRef = await db.collection('subjects').add(subjectData);

    res.json({ id: subjectRef.id, ...subjectData });
  } catch (error) {
    console.error('Create subject error:', error);
    res.status(500).json({ error: 'Failed to create subject' });
  }
});

// Update subject
router.put('/:subjectId', async (req, res) => {
  try {
    const subjectId = req.params.subjectId;
    const userId = req.user?.uid;
    const updates = req.body;

    // Verify subject belongs to user
    const subjectDoc = await db.collection('subjects').doc(subjectId).get();
    if (!subjectDoc.exists) {
      return res.status(404).json({ error: 'Subject not found' });
    }

    const subjectData = subjectDoc.data();
    if (subjectData?.userId !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Update subject
    await db.collection('subjects').doc(subjectId).update({
      ...updates,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    res.json({ message: 'Subject updated successfully' });
  } catch (error) {
    console.error('Update subject error:', error);
    res.status(500).json({ error: 'Failed to update subject' });
  }
});

// Delete subject
router.delete('/:subjectId', async (req, res) => {
  try {
    const subjectId = req.params.subjectId;
    const userId = req.user?.uid;

    // Verify subject belongs to user
    const subjectDoc = await db.collection('subjects').doc(subjectId).get();
    if (!subjectDoc.exists) {
      return res.status(404).json({ error: 'Subject not found' });
    }

    const subjectData = subjectDoc.data();
    if (subjectData?.userId !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Delete subject
    await db.collection('subjects').doc(subjectId).delete();

    res.json({ message: 'Subject deleted successfully' });
  } catch (error) {
    console.error('Delete subject error:', error);
    res.status(500).json({ error: 'Failed to delete subject' });
  }
});

export { router as subjectRoutes };