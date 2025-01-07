import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { Navigation } from './components/Navigation';
import { HomePage } from './pages/HomePage';
import { UploadPage } from './pages/UploadPage';
import { MySQLConnectionPage } from './pages/MySQLConnectionPage';
import { TripList } from './components/TripList';
import { UpdatesPage } from './pages/UpdatesPage';
import { AuthProvider } from './contexts/AuthContext';
import { useAuth } from './contexts/AuthContext';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { session } = useAuth();
  return session ? <>{children}</> : <Navigate to="/" replace />;
}

export function App() {
  const { session } = useAuth();

  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <Toaster position="top-right" />
        {session && <Navigation />}
        
        <Routes>
          <Route 
            path="/" 
            element={session ? <TripList /> : <HomePage />} 
          />
          <Route path="/upload" element={<PrivateRoute><UploadPage /></PrivateRoute>} />
          <Route path="/updates" element={<PrivateRoute><UpdatesPage /></PrivateRoute>} />
          <Route path="/mysql" element={<PrivateRoute><MySQLConnectionPage /></PrivateRoute>} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;