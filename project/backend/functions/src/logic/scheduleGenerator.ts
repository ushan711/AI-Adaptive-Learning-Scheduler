import * as admin from 'firebase-admin';

export class ScheduleGenerator {
  private db = admin.firestore();

  async generateSchedule(userId: string, preferences: any, userData: any) {
    try {
      // Get user's subjects
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

      // Generate time slots based on preferences
      const timeSlots = this.generateTimeSlots(preferences);
      
      // Allocate subjects to time slots
      const sessions = this.allocateSubjectsToSlots(subjects, timeSlots, preferences);

      // Create schedule object
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
    const { availableTimeSlots, preferredStudyHours, breakDuration } = preferences;

    for (const timeSlot of availableTimeSlots) {
      if (timeSlot.isAvailable) {
        const startTime = new Date(`2024-01-01T${timeSlot.startTime}:00`);
        const endTime = new Date(`2024-01-01T${timeSlot.endTime}:00`);
        
        // Split into study sessions with breaks
        let currentTime = startTime;
        while (currentTime < endTime) {
          const sessionEnd = new Date(currentTime.getTime() + (90 * 60 * 1000)); // 90 minutes
          
          if (sessionEnd <= endTime) {
            slots.push({
              startTime: new Date(currentTime),
              endTime: sessionEnd,
              duration: 90,
            });
            
            // Add break
            currentTime = new Date(sessionEnd.getTime() + (breakDuration * 60 * 1000));
          } else {
            break;
          }
        }
      }
    }

    return slots;
  }

  private allocateSubjectsToSlots(subjects: any[], timeSlots: any[], preferences: any) {
    const sessions = [];
    let slotIndex = 0;

    for (const subject of subjects) {
      const sessionsNeeded = Math.ceil(subject.estimatedDuration / 90);
      
      for (let i = 0; i < sessionsNeeded && slotIndex < timeSlots.length; i++) {
        const slot = timeSlots[slotIndex];
        
        sessions.push({
          id: `session_${Date.now()}_${slotIndex}`,
          userId: subject.userId,
          subjectId: subject.id,
          subject: subject,
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