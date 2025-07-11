import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import axios from 'axios';

// Feedback: Page to submit session feedback
const Feedback = () => {
  const { user } = useAuth();
  const [stressLevel, setStressLevel] = useState(1);
  const [completionStatus, setCompletionStatus] = useState('Completed');
  const [comments, setComments] = useState('');
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Handle feedback submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      setError('Please log in to submit feedback.');
      return;
    }
    setIsLoading(true);
    try {
      // Replace with your Firebase Cloud Function endpoint
      await axios.post('YOUR_FIREBASE_FUNCTION_URL/submitFeedback', {
        userId: user.uid,
        stressLevel,
        completionStatus,
        comments,
      });
      alert('Feedback submitted successfully!');
      setStressLevel(1);
      setCompletionStatus('Completed');
      setComments('');
    } catch (err) {
      setError('Failed to submit feedback. Try again later.');
      console.error('Feedback error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Provide Feedback</h2>
      <p className="text-gray-600 mb-4">Share your experience to improve your schedule.</p>
      {error && <div className="text-red-600 bg-red-100 p-3 rounded-md mb-4">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div>
          <label className="block text-sm font-medium text-gray-700">Stress Level (1-5)</label>
          <input
            type="number"
            min="1"
            max="5"
            value={stressLevel}
            onChange={(e) => setStressLevel(parseInt(e.target.value) || 1)}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm p-2"
          />
          <p className="text-xs text-gray-500 mt-1">1 = Not stressed, 5 = Very stressed</p>
        </div>
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700">Completion Status</label>
          <select
            value={completionStatus}
            onChange={(e) => setCompletionStatus(e.target.value)}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm p-2"
          >
            <option value="Completed">Completed</option>
            <option value="Missed">Missed</option>
            <option value="Partial">Partially Completed</option>
          </select>
        </div>
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700">Comments (Optional)</label>
          <textarea
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            placeholder="Any additional feedback?"
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm p-2"
            rows="4"
          />
        </div>
        <button
          type="submit"
          disabled={isLoading}
          className={`w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 transition-colors mt-6 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {isLoading ? 'Submitting...' : 'Submit Feedback'}
        </button>
      </form>
    </div>
  );
};

export default Feedback;