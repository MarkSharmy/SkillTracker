import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import GoalDetail from './pages/GoalDetail';
import TaskDetail from './pages/TaskDetail';

// 1. PrivateRoute: Only allows logged-in users
const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" />;
};

// 2. PublicRoute: Redirects logged-in users AWAY from Login/Register
const PublicRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? <Navigate to="/dashboard" /> : children;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Wrap Login and Register in PublicRoute */}
        <Route path="/login" element={
          <PublicRoute><Login /></PublicRoute>
        } />
        <Route path="/register" element={
          <PublicRoute><Register /></PublicRoute>
        } />
        
        {/* Protected Routes */}
        <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/goals/:id" element={<PrivateRoute><GoalDetail /></PrivateRoute>} />
        <Route path="/" element={<Navigate to="/dashboard" />} />
        <Route path="/tasks/:taskId" element={<PrivateRoute><TaskDetail /></PrivateRoute>} />
        
      </Routes>
    </BrowserRouter>
  );
}

export default App;