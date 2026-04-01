import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { HomePage } from './pages/HomePage'; 
import ChatPage from './pages/Chatpage';
import { LoginPage } from './pages/LoginPage';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './hooks/useAuth';

// --- THE SECURITY GATEKEEPER ---
// This component checks if a user is logged in. 
// If not, it kicks them back to the login page.
const ProtectedRoute = ({ children }) => {
  const { auth } = useAuth();
  
  // If no auth in Context, check LocalStorage as a backup
  const hasToken = auth?.token || localStorage.getItem("access_token");
  
  if (!hasToken) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-zinc-950">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            
            {/* Protected Chat Route */}
            <Route 
              path="/chat" 
              element={
                <ProtectedRoute>
                  <ChatPage />
                </ProtectedRoute>
              } 
            />

            {/* Redirect any unknown routes to Home */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;