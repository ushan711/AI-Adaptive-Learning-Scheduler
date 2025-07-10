import * as admin from 'firebase-admin';

export class AnalyticsEngine {
  private db = admin.firestore();

  async generateWeeklyReport(userId: string, weekStart: string) {
    try {
      const startDate = new Date(weekStart);
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 7);

      // Get sessions for the week
      const sessionsQuery = await this.db.collection('sessions')
        .where('userId', '==', userId)
        .where('startTime', '>=', startDate)
        .where('startTime', '<', endDate)
        .get();

      const sessions = sessionsQuery.docs.map(doc => doc.data());

      // Get feedback for the week
      const feedbackQuery = await this.db.collection('feedback')
        .where('userId', '==', userId)
        .where('createdAt', '>=', startDate)
        .where('createdAt', '<', endDate)
        .get();

      const feedback = feedbackQuery.docs.map(doc => doc.data());

      // Calculate metrics
      const totalStudyTime = sessions.reduce((total, session) => {
        return total + (session.actualDuration || session.duration || 0);
      }, 0);

      const completedSessions = sessions.filter(s => s.status === 'completed').length;
      const missedSessions = sessions.filter(s => s.status === 'missed').length;

      const averageStressLevel = feedback.length > 0 
        ? feedback.reduce((sum, f) => sum + f.stressLevel, 0) / feedback.length 
        : 0;

      // Subject breakdown
      const subjectBreakdown = this.calculateSubjectBreakdown(sessions, feedback);

      const report = {
        userId,
        week: weekStart,
        totalStudyTime,
        completedSessions,
        missedSessions,
        averageStressLevel,
        subjectBreakdown,
        goals: [], // Will be populated from user goals
        createdAt: new Date(),
      };

      return report;
    } catch (error) {
      console.error('Weekly report generation error:', error);
      throw error;
    }
  }

  async getProgressStats(userId: string) {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      // Get sessions for the last 30 days
      const sessionsQuery = await this.db.collection('sessions')
        .where('userId', '==', userId)
        .where('startTime', '>=', thirtyDaysAgo)
        .get();

      const sessions = sessionsQuery.docs.map(doc => doc.data());

      // Calculate statistics
      const totalSessions = sessions.length;
      const completedSessions = sessions.filter(s => s.status === 'completed').length;
      const completionRate = totalSessions > 0 ? completedSessions / totalSessions : 0;

      const totalStudyTime = sessions.reduce((total, session) => {
        return total + (session.actualDuration || session.duration || 0);
      }, 0);

      const averageSessionDuration = completedSessions > 0 
        ? totalStudyTime / completedSessions 
        : 0;

      // Daily progress
      const dailyProgress = this.calculateDailyProgress(sessions);

      return {
        totalSessions,
        completedSessions,
        completionRate,
        totalStudyTime,
        averageSessionDuration,
        dailyProgress,
        period: '30 days',
      };
    } catch (error) {
      console.error('Progress stats error:', error);
      throw error;
    }
  }

  private calculateSubjectBreakdown(sessions: any[], feedback: any[]) {
    const subjectMap = new Map();

    sessions.forEach(session => {
      const subjectId = session.subjectId;
      if (!subjectMap.has(subjectId)) {
        subjectMap.set(subjectId, {
          subjectId,
          subjectName: session.subject?.name || 'Unknown',
          totalTime: 0,
          completedSessions: 0,
          stressLevels: [],
          difficulties: [],
        });
      }

      const subject = subjectMap.get(subjectId);
      subject.totalTime += session.actualDuration || session.duration || 0;
      
      if (session.status === 'completed') {
        subject.completedSessions++;
      }
    });

    feedback.forEach(fb => {
      const subjectId = fb.subjectId;
      if (subjectMap.has(subjectId)) {
        const subject = subjectMap.get(subjectId);
        subject.stressLevels.push(fb.stressLevel);
        subject.difficulties.push(fb.difficultyRating);
      }
    });

    return Array.from(subjectMap.values()).map(subject => ({
      ...subject,
      averageStressLevel: subject.stressLevels.length > 0 
        ? subject.stressLevels.reduce((a, b) => a + b, 0) / subject.stressLevels.length 
        : 0,
      averageDifficulty: subject.difficulties.length > 0 
        ? subject.difficulties.reduce((a, b) => a + b, 0) / subject.difficulties.length 
        : 0,
    }));
  }

  private calculateDailyProgress(sessions: any[]) {
    const dailyMap = new Map();

    sessions.forEach(session => {
      const date = new Date(session.startTime).toISOString().split('T')[0];
      if (!dailyMap.has(date)) {
        dailyMap.set(date, {
          date,
          totalTime: 0,
          completedSessions: 0,
          totalSessions: 0,
        });
      }

      const day = dailyMap.get(date);
      day.totalSessions++;
      day.totalTime += session.actualDuration || session.duration || 0;
      
      if (session.status === 'completed') {
        day.completedSessions++;
      }
    });

    return Array.from(dailyMap.values()).sort((a, b) => a.date.localeCompare(b.date));
  }
}