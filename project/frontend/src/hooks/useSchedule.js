import { useState, useEffect, useCallback } from 'react';
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';
import { useAuth } from '@/hooks/useAuth';
import axios from 'axios';

// useSchedule: Custom hook to manage schedule fetching and generation
export const useSchedule = () => {
  const { user } = useAuth(); // Get authenticated user
  const [currentSchedule, setCurrentSchedule] = useState(null); // Store current schedule
  const [isLoading, setIsLoading] = useState(false); // Track loading state
  const [error, setError] = useState(null); // Track errors

  // Fetch user's schedule from Firestore
  const fetchSchedule = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const db = getFirestore();
      const scheduleQuery = query(
        collection(db, 'schedules'),
        where('userId', '==', user.uid)
      );
      const querySnapshot = await getDocs(scheduleQuery);
      const schedule = querySnapshot.docs[0]?.data();
      if (schedule) {
        setCurrentSchedule({
          id: querySnapshot.docs[0].id,
          ...schedule,
          sessions: schedule.sessions || [],
        });
      }
    } catch (err) {
      setError('Unable to fetch schedule. Please try again later.');
      console.error('Fetch schedule error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Generate a new schedule with local fallback if backend fails
  const generateSchedule = useCallback(async (preferences) => {
    if (!user) throw new Error('Please log in to generate a schedule.');
    setIsLoading(true);
    try {
      // Attempt to call the backend API (replace with your actual URL)
      const response = await axios.post('YOUR_FIREBASE_FUNCTION_URL/generateSchedule', {
        userId: user.uid,
        preferences,
      });
      const { sessions } = response.data;
      setCurrentSchedule({ id: 'temp-id', userId: user.uid, sessions });
    } catch (err) {
      console.error('Backend call failed, using local simulation:', err);
      // Fallback: Simulate a basic schedule if backend is unavailable
      if (preferences.subjectPriorities && Object.keys(preferences.subjectPriorities).length > 0) {
        const startHour = parseInt(preferences.preferredStudyHours.start.split(':')[0]);
        const sessions = Object.entries(preferences.subjectPriorities).map(([subject, priority], index) => {
          const startTime = new Date();
          startTime.setHours(startHour + index * 2, 0, 0, 0);
          const endTime = new Date(startTime);
          endTime.setHours(startTime.getHours() + 1);
          return {
            id: `${user.uid}-${index}`,
            subject: { name: subject, priority },
            startTime,
            endTime,
            status: 'Pending',
          };
        });
        setCurrentSchedule({ id: 'simulated-id', userId: user.uid, sessions });
      } else {
        throw new Error('No subjects provided for schedule generation.');
      }
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Fetch schedule when component mounts or user changes
  useEffect(() => {
    fetchSchedule();
  }, [fetchSchedule]);

  return { generateSchedule, currentSchedule, isLoading, error };
};