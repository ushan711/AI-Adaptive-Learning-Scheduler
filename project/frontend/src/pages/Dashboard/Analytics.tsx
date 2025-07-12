import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { analyticsAPI } from '@/services/api';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';
import LoadingSpinner from '@/components/Common/LoadingSpinner';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

const Analytics = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      if (!user) return;
      try {
        const progressStats = await analyticsAPI.getProgressStats(user.uid);
        setStats(progressStats);
      } catch (error) {
        console.error("Failed to fetch analytics:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, [user]);

  if (isLoading) {
    return <LoadingSpinner text="Loading analytics..." />;
  }

  if (!stats) {
    return <p>No analytics data available.</p>;
  }

  const pieData = {
    labels: ['Completed', 'Missed', 'Pending'],
    datasets: [{
      data: [stats.completedSessions, stats.totalSessions - stats.completedSessions, 0], // Assuming no pending status from backend
      backgroundColor: ['#10B981', '#EF4444', '#3B82F6'],
      borderColor: '#FFFFFF',
      borderWidth: 1,
    }],
  };

  const barData = {
    labels: stats.dailyProgress.map(d => new Date(d.date).toLocaleDateString()),
    datasets: [
      {
        label: 'Completed',
        data: stats.dailyProgress.map(d => d.completedSessions),
        backgroundColor: '#10B981',
      },
      {
        label: 'Total',
        data: stats.dailyProgress.map(d => d.totalSessions),
        backgroundColor: '#3B82F6',
      },
    ],
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Study Analytics</h2>
      <p className="text-gray-600 mb-4">Track your progress with these insights.</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div style={{ height: 300 }}>
          <Pie data={pieData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'top' }, title: { display: true, text: 'Session Status Breakdown' } } }} />
        </div>
        <div style={{ height: 300 }}>
          <Bar data={barData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'top' }, title: { display: true, text: 'Daily Progress' } }, scales: { y: { beginAtZero: true } } }} />
        </div>
      </div>
    </div>
  );
};

export default Analytics;