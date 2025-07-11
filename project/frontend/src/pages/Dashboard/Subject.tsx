import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';

// Subject: Page to manage subjects and their priorities
const Subject = () => {
  const { user } = useAuth();
  const [subjects, setSubjects] = useState([]);
  const [newSubject, setNewSubject] = useState('');
  const [newPriority, setNewPriority] = useState(1);
  const [error, setError] = useState('');

  // Load subjects from user preferences
  useEffect(() => {
    if (user?.preferences?.subjectPriorities) {
      setSubjects(user.preferences.subjectPriorities.map(({ subject, priority }) => ({ subject, priority })));
    }
  }, [user]);

  // Add a new subject
  const handleAddSubject = () => {
    if (!newSubject.trim()) {
      setError('Please enter a subject name.');
      return;
    }
    if (newPriority < 1 || newPriority > 5) {
      setError('Priority must be between 1 and 5.');
      return;
    }
    if (subjects.some(s => s.subject.toLowerCase() === newSubject.trim().toLowerCase())) {
      setError('This subject is already added.');
      return;
    }
    setSubjects([...subjects, { subject: newSubject.trim(), priority: parseInt(newPriority) }]);
    setNewSubject('');
    setNewPriority(1);
    setError('');
  };

  // Remove a subject
  const handleRemoveSubject = (subject) => {
    setSubjects(subjects.filter(s => s.subject !== subject));
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Manage Your Subjects</h2>
      <p className="text-gray-600 mb-4">Add and prioritize your study subjects for scheduling.</p>
      <div className="flex space-x-2 mb-4">
        <input
          type="text"
          value={newSubject}
          onChange={(e) => setNewSubject(e.target.value)}
          placeholder="e.g., Math"
          className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm p-2"
        />
        <input
          type="number"
          min="1"
          max="5"
          value={newPriority}
          onChange={(e) => setNewPriority(parseInt(e.target.value) || 1)}
          className="w-20 border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm p-2"
        />
        <button
          onClick={handleAddSubject}
          className="bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 transition-colors"
        >
          Add
        </button>
      </div>
      {error && <div className="text-red-600 text-sm mb-2">{error}</div>}
      {subjects.length > 0 ? (
        <ul className="space-y-2">
          {subjects.map(({ subject, priority }) => (
            <li key={subject} className="flex justify-between items-center bg-gray-100 p-2 rounded-md">
              <span>{subject}: Priority {priority}</span>
              <button
                onClick={() => handleRemoveSubject(subject)}
                className="text-red-600 hover:text-red-800 text-sm"
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-500">No subjects added yet.</p>
      )}
    </div>
  );
};

export default Subject;