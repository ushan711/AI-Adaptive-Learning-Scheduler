import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { getUserData, updateUserPreferences } from '@/services/auth';
import Button from '@/components/Common/Button';
import LoadingSpinner from '@/components/Common/LoadingSpinner';

const Preferences = () => {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const loadPreferences = async () => {
      if (user) {
        const userData = await getUserData(user.uid);
        if (userData && userData.preferences) {
          setPreferences(userData.preferences);
        }
        setIsLoading(false);
      }
    };
    loadPreferences();
  }, [user]);

  const handlePreferenceChange = (e) => {
    const { name, value, type, checked } = e.target;
    const [section, key] = name.split('.');

    if (key) {
      setPreferences(prev => ({ ...prev, [section]: { ...prev[section], [key]: value } }));
    } else if (type === 'checkbox') {
      setPreferences(prev => ({ ...prev, [name]: checked }));
    } else {
      setPreferences(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSave = async () => {
    if (!user) return;
    setIsSaving(true);
    try {
      await updateUserPreferences(user.uid, preferences);
      alert('Preferences saved successfully!');
    } catch (error) {
      console.error("Failed to save preferences:", error);
      alert('Failed to save preferences. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <LoadingSpinner text="Loading preferences..." />;
  }

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Study Preferences</h2>
      <p className="text-gray-600 mb-4">Customize your learning experience.</p>
      {preferences && (
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
                name="notifications"
                checked={preferences.notifications}
                onChange={handlePreferenceChange}
                className="mr-2 h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              Enable Notifications
            </label>
            <p className="text-xs text-gray-500 mt-1">Get reminders for your study sessions.</p>
          </div>
          <Button onClick={handleSave} loading={isSaving} className="w-full">
            Save Preferences
          </Button>
        </div>
      )}
    </div>
  );
};

export default Preferences;