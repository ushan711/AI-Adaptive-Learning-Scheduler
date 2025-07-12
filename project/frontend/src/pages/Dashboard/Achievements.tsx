import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { analyticsAPI } from '@/services/api';
import LoadingSpinner from '@/components/Common/LoadingSpinner';

const Achievements = () => {
  const { user } = useAuth();
  const [completedCount, setCompletedCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      if (!user) return;
      try {
        const progressStats = await analyticsAPI.getProgressStats(user.uid);
        setCompletedCount(progressStats.completedSessions);
      } catch (error) {
        console.error("Failed to fetch stats for achievements:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, [user]);

  const achievements = [
    { id: 1, name: 'First Step', description: 'Completed your first session', unlocked: completedCount >= 1 },
    { id: 2, name: 'Dedicated Learner', description: 'Completed 5 sessions', unlocked: completedCount >= 5 },
    { id: 3, name: 'Master Planner', description: 'Completed 10 sessions', unlocked: completedCount >= 10 },
    { id: 4, name: 'Study Pro', description: 'Completed 25 sessions', unlocked: completedCount >= 25 },
    { id: 5, name: 'Scheduling Guru', description: 'Completed 50 sessions', unlocked: completedCount >= 50 },
  ];

  if (isLoading) {
    return <LoadingSpinner text="Loading achievements..." />;
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Your Achievements</h2>
      <p className="text-gray-600 mb-4">Celebrate your study milestones!</p>
      {achievements.length > 0 ? (
        <ul className="space-y-4">
          {achievements.map((ach) => (
            <li
              key={ach.id}
              className={`p-4 rounded-md transition-all duration-300 ${ach.unlocked ? 'bg-green-100 border-l-4 border-green-500' : 'bg-gray-100'}`}
            >
              <h3 className={`font-semibold ${ach.unlocked ? 'text-green-800' : 'text-gray-800'}`}>{ach.name}</h3>
              <p className="text-sm text-gray-600">{ach.description}</p>
              <p className={`text-sm font-bold mt-1 ${ach.unlocked ? 'text-green-600' : 'text-gray-500'}`}>
                {ach.unlocked ? 'Unlocked!' : 'Locked'}
              </p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-500">No achievements yet. Complete sessions to earn some!</p>
      )}
    </div>
  );
};

export default Achievements;