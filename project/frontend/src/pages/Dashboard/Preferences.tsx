import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';

// Preferences: Page to set user study preferences
const Preferences = () => {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState({
    preferredStudyHours: { start: '09:00', end: '21:00' },
    enableNotifications: false,
  });

  // Load preferences from user data
  useEffect(() => {
    if (user?.preferences) {
      setPreferences({
        preferredStudyHours: user.preferences.preferredStudyHours || { start: '09:00', end: '21:00' },
        enableNotifications: user.preferences.enableNotifications || false,
      });
    }
  }, [user]);

  // Handle preference changes
  const handlePreferenceChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name.includes('preferredStudyHours')) {
      const [_, key] = name.split('.');
      setPreferences({
        ...preferences,
        preferredStudyHours: { ...preferences.preferredStudyHours, [key]: value },
      });
    } else if (type === 'checkbox') {
      setPreferences({ ...preferences, [name]: checked });
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Study Preferences</h2>
      <p className="text-gray-600 mb-4">Customize your learning experience.</p>
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">Preferred Study Hours</label>
          <div className="flex space-x-2 mt-1">
            <input
              type="time"
              name="preferredStudyHours.start"
              value={preferences.preferredStudyHours.start}
              onChange={handlePreferenceChange}
              className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm p-2"
            />
            <input
              type="time"
              name="preferredStudyHours.end"
              value={preferences.preferredStudyHours.end}
              onChange={handlePreferenceChange}
              className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm p-2"
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">Set your daily study window.</p>
        </div>
        <div>
          <label className="flex items-center text-sm font-medium text-gray-700">
            <input
              type="checkbox"
              name="enableNotifications"
              checked={preferences.enableNotifications}
              onChange={handlePreferenceChange}
              className="mr-2 h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            Enable Notifications
          </label>
          <p className="text-xs text-gray-500 mt-1">Get reminders for your study sessions.</p>
        </div>
      </div>
      <button
        onClick={() => alert('Preferences saved! (Backend integration pending)')}
        className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 transition-colors mt-6"
      >
        Save Preferences
      </button>
    </div>
  );
};

export default Preferences;