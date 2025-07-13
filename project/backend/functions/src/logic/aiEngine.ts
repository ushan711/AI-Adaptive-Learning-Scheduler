import * as tf from '@tensorflow/tfjs-node';
import * as admin from 'firebase-admin';

export class AIEngine {
  private model: tf.LayersModel;

  constructor() {
    this.model = this.initializeModel();
  }

  private initializeModel(): tf.LayersModel {
    const model = tf.sequential({
      layers: [
        tf.layers.dense({ inputShape: [10], units: 32, activation: 'relu' }),
        tf.layers.dense({ units: 16, activation: 'relu' }),
        tf.layers.dense({ units: 8, activation: 'relu' }),
        tf.layers.dense({ units: 1, activation: 'sigmoid' }),
      ],
    });

    model.compile({
      optimizer: 'adam',
      loss: 'binaryCrossentropy',
      metrics: ['accuracy'],
    });

    console.log('✅ AI model initialized');
    return model;
  }

  async optimizeSchedule(schedule: any, userData: any) {
    try {
      if (!this.model) {
        console.warn('⚠️ AI model not initialized');
        return schedule;
      }

      const historicalData = await this.getHistoricalData(userData.uid || userData.userId);
      if (historicalData.length > 0) {
        await this.trainModel(historicalData);
      }

      const optimizedSessions = [];
      for (const session of schedule.sessions) {
        const features = this.extractFeatures(session, userData);
        const optimizationScore = await this.predictOptimization(features);

        optimizedSessions.push({
          ...session,
          aiScore: optimizationScore,
          optimized: true,
        });
      }

      optimizedSessions.sort((a, b) => b.aiScore - a.aiScore);

      return {
        ...schedule,
        sessions: optimizedSessions,
        aiOptimized: true,
      };
    } catch (error) {
      console.error('❌ Schedule optimization error:', error);
      return schedule;
    }
  }

  async processFeedback(feedbackData: any) {
    console.log('📨 Received feedback:', feedbackData);
    // Future logic to store & process feedback
    return { success: true };
  }

  private async getHistoricalData(userId: string) {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const firestoreDate = admin.firestore.Timestamp.fromDate(thirtyDaysAgo);

    const sessionsQuery = await admin.firestore()
      .collection('sessions')
      .where('userId', '==', userId)
      .where('startTime', '>=', firestoreDate)
      .get();

    const feedbackQuery = await admin.firestore()
      .collection('feedback')
      .where('userId', '==', userId)
      .where('createdAt', '>=', firestoreDate)
      .get();

    const sessions = sessionsQuery.docs.map(doc => doc.data());
    const feedback = feedbackQuery.docs.map(doc => doc.data());

    const historicalData = sessions.map(session => {
      const match = feedback.find(f => f.sessionId === session.id);
      return {
        ...session,
        ...(match || {}),
        success: session.status === 'completed',
      };
    });

    return historicalData;
  }

  private async trainModel(historicalData: any[]) {
    if (!this.model || historicalData.length === 0) return;

    const features = historicalData.map(d => this.extractFeatures(d, {}));
    const labels = historicalData.map(d => d.success ? 1 : 0);

    const xs = tf.tensor2d(features);
    const ys = tf.tensor2d(labels, [labels.length, 1]);

    await this.model.fit(xs, ys, {
      epochs: 50,
      batchSize: 32,
      validationSplit: 0.2,
      callbacks: {
        onEpochEnd: (epoch, logs) => {
          console.log(`Epoch ${epoch + 1}: loss=${logs?.loss}, acc=${logs?.accuracy}`);
        },
      },
    });

    xs.dispose();
    ys.dispose();
    console.log('✅ Model trained successfully');
  }

  private extractFeatures(session: any, userData: any): number[] {
    return [
      session.priority || 0,
      session.duration || 90,
      session.subject?.difficulty === 'hard' ? 1 : 0,
      session.subject?.difficulty === 'medium' ? 1 : 0,
      new Date(session.startTime).getHours() / 24,
      new Date(session.startTime).getDay() / 7,
      userData.averageStressLevel ?? 0.5,
      userData.completionRate ?? 0.5,
      userData.preferredStudyHours ?? 6,
      session.subject?.estimatedDuration ?? 90,
    ];
  }

  private async predictOptimization(features: number[]): Promise<number> {
    try {
      if (!this.model) return Math.random();

      const input = tf.tensor2d([features]);
      const prediction = this.model.predict(input) as tf.Tensor;
      const score = await prediction.data();

      input.dispose();
      prediction.dispose();

      return score[0];
    } catch (error) {
      console.error('❌ Prediction error:', error);
      return Math.random();
    }
  }
}
