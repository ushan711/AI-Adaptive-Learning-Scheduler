// Example: Add to Dashboard or a new SchedulePage
import React, { useState } from 'react';
import { useSchedule } from '@/hooks/useSchedule';
import { useAuth } from '@/hooks/useAuth';

const ScheduleGenerator: React.FC = () => {
  const { user } = useAuth();
  const { generateSchedule, currentSchedule, isLoading, error } = useSchedule();
  const [generating, setGenerating] = useState(false);

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      // You may want to collect preferences from a form instead
      const preferences = user?.preferences || {};
      await generateSchedule(preferences);
    } catch (err) {
      // Handle error
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div>
      <button
        className="bg-primary-500 text-white px-4 py-2 rounded"
        onClick={handleGenerate}
        disabled={generating || isLoading}
      >
        {generating || isLoading ? 'Generating...' : 'Generate Schedule'}
      </button>
      {error && <div className="text-red-500 mt-2">{error}</div>}
      {currentSchedule && (
        <div className="mt-4">
          <h3 className="font-bold">Your Schedule</h3>
          <ul>
            {currentSchedule.sessions.map(session => (
              <li key={session.id}>
                {session.subject.name}: {new Date(session.startTime).toLocaleString()} - {new Date(session.endTime).toLocaleString()}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ScheduleGenerator;