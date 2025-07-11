import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useSchedule } from '@/hooks/useSchedule';
import { format } from 'date-fns';

// ScheduleGenerator: Main component for generating and viewing schedules with chatbot
const ScheduleGenerator = () => {
  const { user } = useAuth();
  const { generateSchedule, currentSchedule, isLoading, error } = useSchedule();
  const [preferences, setPreferences] = useState({
    availableTimeSlots: [],
    subjectPriorities: [],
    preferredStudyHours: { start: '09:00', end: '21:00' },
  });
  const [newSubject, setNewSubject] = useState('');
  const [newPriority, setNewPriority] = useState(1);
  const [subjectError, setSubjectError] = useState('');
  const [generating, setGenerating] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([{ text: 'Hello! I’ll help you create your study schedule. Let’s start with your subjects. Please enter a subject (e.g., Math).', sender: 'bot' }]);
  const [userInput, setUserInput] = useState('');
  const [chatStep, setChatStep] = useState('subjects');

  useEffect(() => {
    if (user?.preferences) {
      setPreferences({
        availableTimeSlots: user.preferences.availableTimeSlots || [],
        subjectPriorities: user.preferences.subjectPriorities || [],
        preferredStudyHours: user.preferences.preferredStudyHours || { start: '09:00', end: '21:00' },
      });
    }
  }, [user]);

  const handlePreferenceChange = (e) => {
    const { name, value } = e.target;
    if (name === 'availableTimeSlots') {
      setPreferences({ ...preferences, availableTimeSlots: value.split(',').map(slot => slot.trim()) });
    } else if (name.includes('preferredStudyHours')) {
      const [_, key] = name.split('.');
      setPreferences({
        ...preferences,
        preferredStudyHours: { ...preferences.preferredStudyHours, [key]: value },
      });
    }
  };

  const handleAddSubject = () => {
    if (!newSubject.trim()) {
      setSubjectError('Please enter a subject name.');
      return;
    }
    if (newPriority < 1 || newPriority > 5) {
      setSubjectError('Priority must be between 1 and 5.');
      return;
    }
    if (preferences.subjectPriorities.some(item => item.subject.toLowerCase() === newSubject.trim().toLowerCase())) {
      setSubjectError('This subject is already added.');
      return;
    }
    setPreferences({
      ...preferences,
      subjectPriorities: [...preferences.subjectPriorities, { subject: newSubject.trim(), priority: parseInt(newPriority) }],
    });
    setNewSubject('');
    setNewPriority(1);
    setSubjectError('');
  };

  const handleRemoveSubject = (subject) => {
    setPreferences({
      ...preferences,
      subjectPriorities: preferences.subjectPriorities.filter(item => item.subject !== subject),
    });
  };

  const handleGenerate = async () => {
    if (!user) {
      alert('Please log in to generate a schedule.');
      return;
    }
    if (preferences.subjectPriorities.length === 0) {
      setSubjectError('Please add at least one subject before generating a schedule.');
      return;
    }
    setGenerating(true);
    try {
      const formattedPreferences = {
        ...preferences,
        subjectPriorities: preferences.subjectPriorities.reduce((acc, { subject, priority }) => {
          acc[subject] = priority;
          return acc;
        }, {}),
      };
      await generateSchedule(formattedPreferences);
    } catch (err) {
      console.error('Error generating schedule:', err);
      if (!error) {
        setSubjectError('Failed to generate schedule. Check your internet or try again later.');
      }
    } finally {
      setGenerating(false);
    }
  };

  const handleSendMessage = () => {
    if (!userInput.trim()) return;
    const messages = [...chatMessages, { text: userInput, sender: 'user' }];
    setChatMessages(messages);
    setUserInput('');

    let response = '';
    switch (chatStep) {
      case 'subjects':
        if (preferences.subjectPriorities.some(s => s.subject.toLowerCase() === userInput.trim().toLowerCase())) {
          response = 'That subject is already added. Please enter a new subject or type "done" to proceed.';
        } else {
          setPreferences({
            ...preferences,
            subjectPriorities: [...preferences.subjectPriorities, { subject: userInput.trim(), priority: 1 }],
          });
          response = 'Subject added! Please enter the priority (1-5) for ' + userInput.trim() + ' or type "next" to add another subject.';
        }
        setChatStep('priorities');
        break;
      case 'priorities':
        const priority = parseInt(userInput);
        if (isNaN(priority) || priority < 1 || priority > 5) {
          response = 'Please enter a valid priority between 1 and 5.';
        } else {
          const lastSubject = preferences.subjectPriorities[preferences.subjectPriorities.length - 1];
          lastSubject.priority = priority;
          response = 'Priority set! Type "done" when you’ve added all subjects, or enter another subject.';
          setChatStep('subjects');
        }
        break;
      case 'dates':
        if (!/^\d{2}-\d{2}-\d{4}$/.test(userInput.trim())) {
          response = 'Please enter a date in DD-MM-YYYY format (e.g., 12-07-2025).';
        } else {
          setPreferences({ ...preferences, availableTimeSlots: [...preferences.availableTimeSlots, userInput.trim()] });
          response = 'Date added! Please enter available time slots for this date (e.g., 09:00-12:00) or type "next" to move on.';
          setChatStep('times');
        }
        break;
      case 'times':
        if (!/^\d{2}:\d{2}-\d{2}:\d{2}$/.test(userInput.trim())) {
          response = 'Please enter a time slot in HH:MM-HH:MM format (e.g., 09:00-12:00).';
        } else {
          setPreferences({ ...preferences, availableTimeSlots: [...preferences.availableTimeSlots, userInput.trim()] });
          response = 'Time slot added! Enter another time slot or type "done" to finish.';
        }
        break;
      case 'done':
        response = 'Great! Your schedule preferences are set. Click "Generate My Schedule" to create your plan.';
        setIsChatOpen(false);
        break;
      default:
        response = 'Type "start" to begin setting up your schedule.';
    }

    if (userInput.toLowerCase() === 'done' && chatStep !== 'done') {
      if (preferences.subjectPriorities.length === 0) {
        response = 'Please add at least one subject before finishing.';
      } else if (chatStep === 'subjects' || chatStep === 'priorities') {
        response = 'Please add dates and times next. Type a date in DD-MM-YYYY format.';
        setChatStep('dates');
      } else if (chatStep === 'dates' || chatStep === 'times') {
        response = 'Schedule setup complete! Click "Generate My Schedule" to proceed.';
        setChatStep('done');
      }
    } else if (userInput.toLowerCase() === 'next' && chatStep === 'subjects') {
      response = 'Moving to priorities. Enter a priority (1-5) for the last subject or type "next" to add another.';
      setChatStep('priorities');
    } else if (userInput.toLowerCase() === 'next' && chatStep === 'priorities') {
      response = 'Moving to dates. Please enter a date in DD-MM-YYYY format (e.g., 12-07-2025).';
      setChatStep('dates');
    } else if (userInput.toLowerCase() === 'next' && chatStep === 'times') {
      response = 'Schedule setup complete! Click "Generate My Schedule" to proceed.';
      setChatStep('done');
    } else if (userInput.toLowerCase() === 'start') {
      response = 'Let’s start! Please enter a subject (e.g., Math).';
      setChatStep('subjects');
    }

    setChatMessages([...messages, { text: response, sender: 'bot' }]);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">Plan Your Study Schedule</h2>
        <p className="text-gray-600 mb-4">Enter your available times, subjects, and preferred study hours to create a personalized schedule.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Available Time Slots</label>
            <input
              type="text"
              name="availableTimeSlots"
              value={preferences.availableTimeSlots.join(', ')}
              onChange={handlePreferenceChange}
              placeholder="e.g., Mon 9-12, Tue 14-17"
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm p-2"
            />
            <p className="text-xs text-gray-500 mt-1">Enter days and times you're free, separated by commas.</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Preferred Study Hours</label>
            <div className="flex space-x-2">
              <input
                type="time"
                name="preferredStudyHours.start"
                value={preferences.preferredStudyHours.start}
                onChange={handlePreferenceChange}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm p-2"
              />
              <input
                type="time"
                name="preferredStudyHours.end"
                value={preferences.preferredStudyHours.end}
                onChange={handlePreferenceChange}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm p-2"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">Choose your daily study start and end times.</p>
          </div>
        </div>
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700">Subject Priorities</label>
          {preferences.subjectPriorities.length > 0 && (
            <ul className="mt-2 space-y-2">
              {preferences.subjectPriorities.map(({ subject, priority }) => (
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
          )}
          {subjectError && <div className="text-red-600 text-sm mt-2">{subjectError}</div>}
        </div>
      </div>
      <button
        onClick={handleGenerate}
        disabled={generating || isLoading}
        className={`w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 transition-colors ${generating || isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        {generating || isLoading ? 'Generating Schedule...' : 'Generate My Schedule'}
      </button>
      {error && <div className="mt-4 text-red-600 bg-red-100 p-3 rounded-md">{error}</div>}
      {currentSchedule && (
        <div className="mt-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Your Study Schedule</h3>
          <div className="grid gap-4">
            {currentSchedule.sessions.map((session) => (
              <div
                key={session.id}
                className={`p-4 rounded-md shadow-sm flex justify-between items-center ${
                  session.status === 'Completed' ? 'bg-green-100' :
                  session.status === 'Missed' ? 'bg-red-100' : 'bg-blue-100'
                }`}
              >
                <div>
                  <h4 className="font-semibold text-gray-800">{session.subject.name}</h4>
                  <p className="text-sm text-gray-600">
                    {format(new Date(session.startTime), 'PPp')} - {format(new Date(session.endTime), 'p')}
                  </p>
                  <p className="text-sm text-gray-600">Priority: {session.subject.priority}</p>
                  <p className="text-sm text-gray-600">Status: {session.status}</p>
                </div>
                <div className="space-x-2">
                  <button
                    onClick={() => alert('Edit functionality coming soon!')}
                    className="text-indigo-600 hover:text-indigo-800 text-sm"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => alert('Delete functionality coming soon!')}
                    className="text-red-600 hover:text-red-800 text-sm"
                  >
                    Delete
                  </button>
                  <button
                    onClick={() => alert('Mark as Complete functionality coming soon!')}
                    className="text-green-600 hover:text-green-800 text-sm"
                  >
                    Mark as Complete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      <button
        onClick={() => setIsChatOpen(true)}
        className="fixed bottom-4 right-4 bg-indigo-600 text-white p-3 rounded-full hover:bg-indigo-700 transition-colors"
      >
        Chat
      </button>
      {isChatOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-96 h-96 flex flex-col">
            <div className="flex-1 overflow-y-auto space-y-4">
              {chatMessages.map((msg, index) => (
                <div
                  key={index}
                  className={`p-2 rounded-md ${msg.sender === 'bot' ? 'bg-gray-100' : 'bg-indigo-100 ml-auto'}`}
                >
                  {msg.text}
                </div>
              ))}
            </div>
            <div className="flex mt-4">
              <input
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                className="flex-1 border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 p-2"
                placeholder="Type your response..."
              />
              <button
                onClick={handleSendMessage}
                className="ml-2 bg-indigo-600 text-white p-2 rounded-md hover:bg-indigo-700"
              >
                Send
              </button>
            </div>
            <button
              onClick={() => setIsChatOpen(false)}
              className="mt-2 bg-red-600 text-white p-2 rounded-md hover:bg-red-700"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScheduleGenerator;