import React from 'react';
import { useSchedule } from '@/hooks/useSchedule';

// Achievements: Page to view user milestones
const Achievements = () => {
  const { currentSchedule } = useSchedule();
  const completedCount = currentSchedule?.sessions?.filter(s => s.status === 'Completed').length || 0;

  const achievements = [
    { id: 1, name: 'First Step', description: 'Completed your first session', unlocked: completedCount >= 1 },
    { id: 2, name: 'Dedicated Learner', description: 'Completed 5 sessions', unlocked: completedCount >= 5 },
    { id: 3, name: 'Master Planner', description: 'Completed 10 sessions', unlocked: completedCount >= 10 },
  ];

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Your Achievements</h2>
      <p className="text-gray-600 mb-4">Celebrate your study milestones!</p>
      {achievements.length > 0 ? (
        <ul className="space-y-4">
          {achievements.map((ach) => (
            <li
              key={ach.id}
              className={`p-4 rounded-md ${ach.unlocked ? 'bg-green-100' : 'bg-gray-100'}`}
            >
              <h3 className="font-semibold text-gray-800">{ach.name}</h3>
              <p className="text-sm text-gray-600">{ach.description}</p>
              <p className="text-sm text-gray-500 mt-1">{ach.unlocked ? 'Unlocked!' : 'Locked'}</p>
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