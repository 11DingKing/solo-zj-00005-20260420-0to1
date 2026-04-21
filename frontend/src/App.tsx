import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/useAuthStore';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import LobbyPage from './pages/LobbyPage';
import ChatRoomPage from './pages/ChatRoomPage';

function App() {
  const { token, checkAuth } = useAuthStore();

  useEffect(() => {
    if (token) {
      checkAuth();
    }
  }, [token, checkAuth]);

  return (
    <Routes>
      <Route 
        path="/login" 
        element={token ? <Navigate to="/" replace /> : <LoginPage />} 
      />
      <Route 
        path="/register" 
        element={token ? <Navigate to="/" replace /> : <RegisterPage />} 
      />
      <Route 
        path="/" 
        element={token ? <LobbyPage /> : <Navigate to="/login" replace />} 
      />
      <Route 
        path="/room/:roomId" 
        element={token ? <ChatRoomPage /> : <Navigate to="/login" replace />} 
      />
    </Routes>
  );
}

export default App;
