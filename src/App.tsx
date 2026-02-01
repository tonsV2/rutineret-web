import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context';
import ProtectedRoute from './components/auth/ProtectedRoute';
import OAuthCallbackHandler from './components/auth/OAuthCallbackHandler';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import ProfilePage from './pages/ProfilePage';
import TodayPage from './pages/TodayPage';
import RoutinesPage from './pages/RoutinesPage';
import RoutineDetailPage from './pages/RoutineDetailPage';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            
            {/* OAuth callback route */}
            <Route path="/auth/google/callback" element={<OAuthCallbackHandler />} />
            
            {/* Protected routes */}
            <Route 
              path="/today" 
              element={
                <ProtectedRoute>
                  <TodayPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/routines" 
              element={
                <ProtectedRoute>
                  <RoutinesPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/routines/:id" 
              element={
                <ProtectedRoute>
                  <RoutineDetailPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/profile" 
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              } 
            />
            
            {/* Catch all route - redirect to home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
