import * as admin from 'firebase-admin';

export class ScheduleGenerator {
  private db = admin.firestore();

  async generateSchedule(userId: string, preferences: any, userData: any) {
    try {
      // 1. Get subjects
      const subjectsQuery = await this.db.collection('subjects')
        .where('userId', '==', userId)
        .orderBy('priority', 'desc')
        .get();

      const subjects = subjectsQuery.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));

      if (subjects.length === 0) {
        throw new Error('No subjects found for user');
      }

      // 2. Create time slots
      const timeSlots = this.generateTimeSlots(preferences);
      if (timeSlots.length === 0) {
        throw new Error('No available time slots generated');
      }

      // 3. Allocate subjects
      const sessions = this.allocateSubjectsToSlots(subjects, timeSlots, userId);

      // 4. Create final schedule object
      const schedule = {
        userId,
        date: new Date(),
        sessions,
        isGenerated: true,
        preferences,
      };

      return schedule;
    } catch (error) {
      console.error('Schedule generation error:', error);
      throw error;
    }
  }

  private generateTimeSlots(preferences: any) {
    const slots = [];
    const { availableTimeSlots = [], breakDuration = 15 } = preferences;

    for (const timeSlot of availableTimeSlots) {
      if (!timeSlot.isAvailable || !timeSlot.startTime || !timeSlot.endTime) continue;

      const startTime = new Date(`1970-01-01T${timeSlot.startTime}:00`);
      const endTime = new Date(`1970-01-01T${timeSlot.endTime}:00`);

      if (isNaN(startTime.getTime()) || isNaN(endTime.getTime()) || startTime >= endTime) continue;

      let currentTime = startTime;
      while (currentTime < endTime) {
        const sessionEnd = new Date(currentTime.getTime() + (90 * 60 * 1000)); // 90 mins

        if (sessionEnd <= endTime) {
          slots.push({
            startTime: new Date(currentTime),
            endTime: new Date(sessionEnd),
            duration: 90,
          });

          // Add break
          currentTime = new Date(sessionEnd.getTime() + (breakDuration * 60 * 1000));
        } else {
          break;
        }
      }
    }

    return slots;
  }

  private allocateSubjectsToSlots(subjects: any[], timeSlots: any[], userId: string) {
    const sessions = [];
    let slotIndex = 0;

    for (const subject of subjects) {
      const estimated = subject.estimatedDuration || 90; // fallback to 90 mins if not set
      const sessionsNeeded = Math.ceil(estimated / 90);

      for (let i = 0; i < sessionsNeeded && slotIndex < timeSlots.length; i++) {
        const slot = timeSlots[slotIndex];

        sessions.push({
          id: `session_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
          userId: userId,
          subjectId: subject.id,
          subject: {
            name: subject.name,
            priority: subject.priority,
            difficulty: subject.difficulty,
            color: subject.color,
          },
          startTime: slot.startTime,
          endTime: slot.endTime,
          duration: slot.duration,
          priority: subject.priority,
          status: 'pending',
          createdAt: new Date(),
          updatedAt: new Date(),
        });

        slotIndex++;
      }
    }

    return sessions;
  }
}
