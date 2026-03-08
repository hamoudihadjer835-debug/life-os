import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { NotificationProvider } from './context/NotificationContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Finance from './pages/Finance';
import Projects from './pages/Projects';
import Habits from './pages/Habits';
import Profile from './pages/Profile';
import Notes from './pages/Notes';


const PrivateRoute = ({ children }) => {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <NotificationProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
              <Route path="/finance" element={<PrivateRoute><Finance /></PrivateRoute>} />
              <Route path="/projects" element={<PrivateRoute><Projects /></PrivateRoute>} />
              <Route path="/habits" element={<PrivateRoute><Habits /></PrivateRoute>} />
              <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
             <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
              <Route path="/notes" element={<PrivateRoute><Notes /></PrivateRoute>} />
            </Routes>
          </BrowserRouter>
        </NotificationProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;