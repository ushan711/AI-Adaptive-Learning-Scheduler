import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '@/services/firebase';
import Layout from '@/components/Layout/Layout';
import LoadingSpinner from '@/components/Common/LoadingSpinner';
// import ScheduleGenerator from '@/pages/Dashboard/SchedulePage';
// import Subject from './pages/Dashboard/Subject';  
import Analytics from './pages/Dashboard/Analytics';
import Feedback from './pages/Dashboard/Feedback';
import Achievements from './pages/Dashboard/Achievements';
import Preferences from './pages/Dashboard/Preferences';
import   MergedSchedule from '@/pages/Dashboard/MergedSchedule';
// Auth Pages
import Login from '@/pages/Auth/Login';
import Register from '@/pages/Auth/Register';

// Main Pages
import Dashboard from '@/pages/Dashboard/Dashboard';

// Auth state logic moved here
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" text="Loading..." />
      </div>
    );
  }

  return user ? <>{children}</> : <Navigate to="/login" />;
};

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Protected Routes */}
        <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="schedule" element={<MergedSchedule/>} />
          <Route path="preferences" element={<Preferences/>} />
          {/* <Route path="subjects" element={<Subject/>} /> */}
          <Route path="analytics" element={<Analytics/>} />
          <Route path="feedback" element={<Feedback/>} />
          <Route path="achievements" element={<Achievements/>} />
        </Route>
        
        {/* Catch all */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
};

export default App;