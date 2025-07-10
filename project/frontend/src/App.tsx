import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '@/services/firebase';
import Layout from '@/components/Layout/Layout';
import LoadingSpinner from '@/components/Common/LoadingSpinner';

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
          <Route path="schedule" element={<div className="p-8 text-center">Schedule Page (Coming Soon)</div>} />
          <Route path="preferences" element={<div className="p-8 text-center">Preferences Page (Coming Soon)</div>} />
          <Route path="subjects" element={<div className="p-8 text-center">Subjects Page (Coming Soon)</div>} />
          <Route path="analytics" element={<div className="p-8 text-center">Analytics Page (Coming Soon)</div>} />
          <Route path="feedback" element={<div className="p-8 text-center">Feedback Page (Coming Soon)</div>} />
          <Route path="achievements" element={<div className="p-8 text-center">Achievements Page (Coming Soon)</div>} />
        </Route>
        
        {/* Catch all */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
};

export default App;