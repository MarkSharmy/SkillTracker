import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { API } from '../api';
import { Plus, Target, TrendingUp, CheckCircle, List, LogOut } from 'lucide-react';
import CreateGoalModal from '../components/CreateGoalModal';
import './dashboard.css'; 

const Dashboard = () => {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchGoals();
  }, []);

  const fetchGoals = async () => {
    try {
      const { data } = await API.get('/goals');
      setGoals(data);
      setLoading(false);
    } catch (err) {
      console.error("Fetch error:", err);
      // If unauthorized (token expired), force logout
      if (err.response?.status === 401) handleLogout();
      setLoading(false);
    }
  };

  const handleLogout = () => {
    // 1. Clear the token from storage
    localStorage.removeItem('token');
    // 2. Redirect to the landing/login page
    navigate('/');
  };

  // --- FRONTEND LOGIC CALCULATIONS ---
  const avgProgress = goals.length > 0 
    ? Math.round(goals.reduce((acc, curr) => acc + (curr.progress || 0), 0) / goals.length) 
    : 0;

  const totalTasksCompleted = goals.reduce((acc, goal) => {
    const completedInGoal = goal.tasks?.filter(task => task.completed).length || 0;
    return acc + completedInGoal;
  }, 0);

  const completedGoals = goals.filter(g => g.progress === 100).length;

  if (loading) return <div className="loading">Loading Skill Tracker...</div>;

  return (
    <div className="dashboard-container">
      {/* --- NAVBAR --- */}
      <nav className="navbar">
        <h1 className="brand-logo">Skill Tracker</h1>
        
        <div className="nav-actions">
          <button className="create-btn" onClick={() => setIsModalOpen(true)}>
            Create Goal <Plus size={20} />
          </button>
          
          <button className="logout-btn" onClick={handleLogout} title="Logout">
            <LogOut size={20} />
          </button>
        </div>
      </nav>

      {/* --- STATS GRID --- */}
      <div className="stats-grid">
        <StatCard 
          title="Active Goals" 
          value={goals.length} 
          icon={<Target className="text-blue-500" />} 
          colorClass="bg-blue-50" 
          borderClass="border-blue-200" 
        />
        <StatCard 
          title="Tasks Completed" 
          value={totalTasksCompleted} 
          icon={<CheckCircle className="text-green-500" />} 
          colorClass="bg-green-50" 
          borderClass="border-green-200" 
        />
        <StatCard 
          title="Avg Progress" 
          value={`${avgProgress}%`} 
          icon={<TrendingUp className="text-orange-500" />} 
          colorClass="bg-orange-50" 
          borderClass="border-orange-200" 
        />
        <StatCard 
          title="Goals Finished" 
          value={completedGoals} 
          icon={<CheckCircle className="text-blue-500" />} 
          colorClass="bg-blue-50" 
          borderClass="border-blue-200" 
        />
      </div>

      {/* --- GOALS LIST --- */}
      <div className="goals-section">
        <h2 className="section-title">My Goals</h2>
        
        {goals.length === 0 ? (
          <div className="no-goals">
            <p>No goals found. Click "Create Goal" to get started!</p>
          </div>
        ) : (
          goals.map((goal) => (
            <Link key={goal._id} to={`/goals/${goal._id}`} className="goal-item-link">
              <div className="goal-card">
                <div className="goal-left">
                  <div className="goal-icon-bg">
                    <Target size={24} className="text-gray-600" />
                  </div>
                  <h3 className="goal-title">{goal.title}</h3>
                </div>

                <div className="goal-middle">
                  <div className="flex items-center gap-3">
                    <List size={20} className="text-gray-400" />
                    <span className="task-count-text">
                      Number of Tasks: <span className="text-gray-900 ml-1">{goal.tasks?.length || 0}</span>
                    </span>
                  </div>
                </div>

                <div className="goal-right">
                  <span className="font-black text-sm text-gray-900">Progress:</span>
                  <div className="progress-container">
                    <div className="progress-fill" style={{ width: `${goal.progress}%` }} />
                  </div>
                  <span className="text-xs font-bold text-gray-500">{goal.progress}%</span>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>

      <CreateGoalModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        refreshGoals={fetchGoals} 
      />
    </div>
  );
};

const StatCard = ({ title, value, icon, colorClass, borderClass }) => (
  <div className={`stat-card ${colorClass} ${borderClass}`}>
    <div className="stat-icon-wrapper">{icon}</div>
    <div className="stat-info">
      <span className="stat-label">{title}:</span>
      <span className="stat-value">{value}</span>
    </div>
  </div>
);

export default Dashboard;