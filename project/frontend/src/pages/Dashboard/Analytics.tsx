import { useSchedule } from '@/hooks/useSchedule';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

// Analytics: Page to view study progress analytics with charts
const Analytics = () => {
  const { currentSchedule } = useSchedule();

  const getStats = () => {
    if (!currentSchedule?.sessions) return { pending: 0, completed: 0, missed: 0 };
    return currentSchedule.sessions.reduce(
      (acc, session) => {
        const key = session.status.toLowerCase() as 'pending' | 'completed' | 'missed';
        acc[key] = (acc[key] || 0) + 1;
        return acc;
      },
      { pending: 0, completed: 0, missed: 0 }
    );
  };

  const stats = getStats();

  // Simulate daily breakdown for bar chart (replace with real data when backend is ready)
  type SessionStats = { pending: number; completed: number; missed: number };
  const getDailyStats = (): Record<string, SessionStats> => {
    if (!currentSchedule?.sessions) return {};
    const dailyStats: Record<string, SessionStats> = {};
    currentSchedule.sessions.forEach(session => {
      const date = new Date(session.startTime).toLocaleDateString();
      dailyStats[date] = dailyStats[date] || { pending: 0, completed: 0, missed: 0 };
      dailyStats[date][session.status.toLowerCase() as keyof SessionStats] += 1;
    });
    return dailyStats;
  };

  const dailyStats = getDailyStats();

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Study Analytics</h2>
      <p className="text-gray-600 mb-4">Track your progress with these insights.</p>
          <div style={{ height: 300 }}>
            <Pie
              data={{
                labels: ['Pending', 'Completed', 'Missed'],
                datasets: [{
                  data: [stats.pending, stats.completed, stats.missed],
                  backgroundColor: ['#3B82F6', '#10B981', '#EF4444'],
                  borderWidth: 1,
                  borderColor: '#FFFFFF',
                }],
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { position: 'top' },
                  title: { display: true, text: 'Session Status' },
                },
              }}
            />
          </div>
        {/* Bar Chart for Daily Session Breakdown */}
        <div>
          <div style={{ height: 300 }}>
            <Bar
              data={{
                labels: Object.keys(dailyStats),
                datasets: [
                  {
                    label: 'Pending',
                    data: Object.values(dailyStats).map(d => d.pending),
                    backgroundColor: '#3B82F6',
                    borderColor: '#3B82F6',
                    borderWidth: 1,
                  },
                  {
                    label: 'Completed',
                    data: Object.values(dailyStats).map(d => d.completed),
                    backgroundColor: '#10B981',
                    borderColor: '#10B981',
                    borderWidth: 1,
                  },
                  {
                    label: 'Missed',
                    data: Object.values(dailyStats).map(d => d.missed),
                    backgroundColor: '#EF4444',
                    borderColor: '#EF4444',
                    borderWidth: 1,
                  },
                ],
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { position: 'top' },
                  title: { display: true, text: 'Sessions by Day' },
                },
                scales: {
                  y: { beginAtZero: true, title: { display: true, text: 'Number of Sessions' } },
                },
              }}
            />
          </div>
        </div>
        {!currentSchedule && <p className="text-gray-500 mt-4">No data available yet. Generate a schedule to see analytics.</p>}
      </div>
  );
};

export default Analytics;