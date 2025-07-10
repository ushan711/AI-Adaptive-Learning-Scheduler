import { useState, useEffect } from 'react';
import { Schedule, StudySession } from '@/types';
import { scheduleAPI } from '@/services/api';
import { useAuth } from './useAuth';

export const useSchedule = () => {
  const { user } = useAuth();
  const [currentSchedule, setCurrentSchedule] = useState<Schedule | null>(null);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSchedule = async (date?: string) => {
    if (!user) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const schedule = await scheduleAPI.getUserSchedule(user.uid, date);
      setCurrentSchedule(schedule);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch schedule');
    } finally {
      setIsLoading(false);
    }
  };

  const generateSchedule = async (preferences: any) => {
    if (!user) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const schedule = await scheduleAPI.generateSchedule(preferences);
      setCurrentSchedule(schedule);
      return schedule;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate schedule');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updateSession = async (sessionId: string, updates: Partial<StudySession>) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const updatedSession = await scheduleAPI.updateScheduleBlock(sessionId, updates);
      
      // Update local state
      if (currentSchedule) {
        const updatedSessions = currentSchedule.sessions.map(session =>
          session.id === sessionId ? { ...session, ...updatedSession } : session
        );
        setCurrentSchedule({ ...currentSchedule, sessions: updatedSessions });
      }
      
      return updatedSession;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update session');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteSession = async (sessionId: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      await scheduleAPI.deleteScheduleBlock(sessionId);
      
      // Update local state
      if (currentSchedule) {
        const updatedSessions = currentSchedule.sessions.filter(
          session => session.id !== sessionId
        );
        setCurrentSchedule({ ...currentSchedule, sessions: updatedSessions });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete session');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchSchedule();
    }
  }, [user]);

  return {
    currentSchedule,
    schedules,
    isLoading,
    error,
    fetchSchedule,
    generateSchedule,
    updateSession,
    deleteSession,
  };
};