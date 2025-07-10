import React from 'react';
import { Calendar, Clock, TrendingUp, Brain, Target, Award } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useSchedule } from '@/hooks/useSchedule';
import LoadingSpinner from '@/components/Common/LoadingSpinner';
import { format } from 'date-fns';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { currentSchedule, isLoading } = useSchedule();

  if (isLoading) {
    return <LoadingSpinner size="large" text="Loading your dashboard..." />;
  }

  const todaysSessions = currentSchedule?.sessions.filter(
    session => format(session.startTime, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')
  ) || [];

  const upcomingSession = todaysSessions.find(
    session => session.status === 'pending' && new Date(session.startTime) > new Date()
  );

  const completedToday = todaysSessions.filter(session => session.status === 'completed').length;
  const totalToday = todaysSessions.length;

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-primary-500 to-secondary-500 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">
              Welcome back, {user?.displayName || 'Student'}! 👋
            </h1>
            <p className="text-primary-100 mt-1">
              Ready to tackle your learning goals today?
            </p>
          </div>
          <div className="hidden md:block">
            <Brain className="h-16 w-16 text-white opacity-80" />
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Today's Progress</p>
              <p className="text-2xl font-bold text-gray-900">
                {completedToday}/{totalToday}
              </p>
            </div>
            <div className="p-3 bg-primary-100 rounded-full">
              <Target className="h-6 w-6 text-primary-600" />
            </div>
          </div>
          <div className="mt-4 w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-primary-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${totalToday > 0 ? (completedToday / totalToday) * 100 : 0}%` }}
            />
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">This Week</p>
              <p className="text-2xl font-bold text-gray-900">24h</p>
            </div>
            <div className="p-3 bg-accent-100 rounded-full">
              <Clock className="h-6 w-6 text-accent-600" />
            </div>
          </div>
          <p className="text-sm text-accent-600 mt-2">+12% from last week</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Streak</p>
              <p className="text-2xl font-bold text-gray-900">7 days</p>
            </div>
            <div className="p-3 bg-warning-100 rounded-full">
              <Award className="h-6 w-6 text-warning-600" />
            </div>
          </div>
          <p className="text-sm text-warning-600 mt-2">Keep it up!</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Performance</p>
              <p className="text-2xl font-bold text-gray-900">85%</p>
            </div>
            <div className="p-3 bg-secondary-100 rounded-full">
              <TrendingUp className="h-6 w-6 text-secondary-600" />
            </div>
          </div>
          <p className="text-sm text-secondary-600 mt-2">Above average</p>
        </div>
      </div>

      {/* Today's Schedule */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Today's Schedule</h2>
              <Calendar className="h-5 w-5 text-gray-400" />
            </div>
            
            {todaysSessions.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No sessions scheduled for today</p>
                <p className="text-sm text-gray-400 mt-1">
                  Visit the preferences page to generate your schedule
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {todaysSessions.map((session) => (
                  <div
                    key={session.id}
                    className={`flex items-center p-3 rounded-lg border ${
                      session.status === 'completed'
                        ? 'bg-green-50 border-green-200'
                        : session.status === 'in-progress'
                        ? 'bg-blue-50 border-blue-200'
                        : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium text-gray-900">
                          {session.subject.name}
                        </h3>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          session.status === 'completed'
                            ? 'bg-green-100 text-green-800'
                            : session.status === 'in-progress'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {session.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        {format(session.startTime, 'HH:mm')} - {format(session.endTime, 'HH:mm')}
                        {' '}({session.duration} min)
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Upcoming & AI Insights */}
        <div className="space-y-6">
          {/* Next Session */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Up Next</h3>
            {upcomingSession ? (
              <div className="space-y-3">
                <div className="flex items-center p-3 bg-primary-50 rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium text-primary-900">
                      {upcomingSession.subject.name}
                    </h4>
                    <p className="text-sm text-primary-600">
                      {format(upcomingSession.startTime, 'HH:mm')} - {format(upcomingSession.endTime, 'HH:mm')}
                    </p>
                  </div>
                  <div className="ml-3 p-2 bg-primary-100 rounded-full">
                    <Clock className="h-4 w-4 text-primary-600" />
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No upcoming sessions today</p>
            )}
          </div>

          {/* AI Insights */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">AI Insights</h3>
            <div className="space-y-3">
              <div className="flex items-start p-3 bg-blue-50 rounded-lg">
                <Brain className="h-5 w-5 text-blue-600 mt-0.5 mr-3" />
                <div>
                  <p className="text-sm font-medium text-blue-900">
                    Optimal Study Time
                  </p>
                  <p className="text-xs text-blue-700 mt-1">
                    Your productivity peaks at 9 AM - 11 AM
                  </p>
                </div>
              </div>
              <div className="flex items-start p-3 bg-green-50 rounded-lg">
                <TrendingUp className="h-5 w-5 text-green-600 mt-0.5 mr-3" />
                <div>
                  <p className="text-sm font-medium text-green-900">
                    Great Progress!
                  </p>
                  <p className="text-xs text-green-700 mt-1">
                    You're 15% ahead of your weekly goal
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;