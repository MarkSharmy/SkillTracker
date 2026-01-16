import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { API } from '../api';
import { 
  CheckCircle, Circle, ArrowLeft, List, Target, TrendingUp, Trash2, Plus, X 
} from 'lucide-react';
import './goalDetail.css';

const GoalDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [goal, setGoal] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');

  useEffect(() => {
    fetchGoalData();
  }, [id]);

  const fetchGoalData = async () => {
    try {
      const response = await API.get(`/goals/${id}`);
      setGoal(response.data.goal);
      setTasks(response.data.tasks);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching goal", err);
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      // Sending title and the parent goal ID
      await API.post('/tasks', { 
        title: newTaskTitle, 
        goalId: id 
      });
      setNewTaskTitle('');
      setIsModalOpen(false);
      fetchGoalData(); // Refresh list
    } catch (err) {
      console.error("Task creation failed", err);
    }
  };

  const handleDeleteGoal = async () => {
    const confirmed = window.confirm("Are you sure you want to delete this goal? This action cannot be undone.");
    if (!confirmed) return;

    try {
      await API.delete(`/goals/${id}`);
      navigate('/dashboard'); 
    } catch (err) {
      alert("Failed to delete goal.");
    }
  };

  const handleSubtaskToggle = async (e, subtaskId) => {
    e.stopPropagation();
    try {
      await API.patch(`/subtasks/${subtaskId}/toggle`);
      fetchGoalData(); 
    } catch (err) {
      console.error("Toggle failed", err);
    }
  };

  if (loading) return <div className="loading">Analyzing Goal Path...</div>;

  const totalSubtasks = tasks.reduce((acc, t) => acc + (t.subtasks?.length || 0), 0);
  const completedSubtasks = tasks.reduce((acc, t) => 
    acc + (t.subtasks?.filter(s => s.isCompleted).length || 0), 0
  );

  return (
    <div className="goaldetail-container">
      <header className="detail-header">
        <div className="header-content flex justify-between items-start">
          <div>
            <Link to="/dashboard" className="back-link">
              <ArrowLeft size={18} /> Back to Dashboard
            </Link>
            <h1 className="goal-main-title">{goal.title}</h1>
            <p className="text-gray-500 font-bold mt-2 uppercase tracking-widest text-xs">
              {goal.description || "No description provided"}
            </p>
          </div>
          
          <div className="flex gap-3">
            <button onClick={() => setIsModalOpen(true)} className="create-btn">
              <Plus size={20} />
              <span>Add Milestone</span>
            </button>
            <button onClick={handleDeleteGoal} className="delete-goal-btn">
              <Trash2 size={20} />
            </button>
          </div>
        </div>
      </header>

      <div className="stats-grid">
        <StatCard title="Total Tasks" value={tasks.length} icon={<List className="text-blue-500" />} colorClass="bg-blue-50" borderClass="border-blue-200" />
        <StatCard title="Steps Done" value={`${completedSubtasks}/${totalSubtasks}`} icon={<CheckCircle className="text-green-500" />} colorClass="bg-green-50" borderClass="border-green-200" />
        <StatCard title="Goal Progress" value={`${goal.progress}%`} icon={<TrendingUp className="text-orange-500" />} colorClass="bg-orange-50" borderClass="border-orange-200" />
      </div>

      <div className="tasks-section">
        <h2 className="section-title">Milestones & Tasks</h2>
        
        {tasks.length === 0 ? (
          <p className="text-gray-400 italic">No milestones yet. Click "Add Milestone" to start breaking down your goal.</p>
        ) : (
          tasks.map(task => (
            <div key={task._id} className="task-card">
              <Link to={`/tasks/${task._id}`} className="task-card-nav">
                <div className="task-card-header">
                  <div className="task-title-area">
                    <div className="goal-icon-bg"><Target size={20} className="text-gray-400" /></div>
                    <h3 className="goal-title">{task.title}</h3>
                  </div>
                  <div className="task-divider"></div>
                  <div className="goal-right">
                    <span className="font-black text-xs text-gray-900 uppercase">Task Progress:</span>
                    <div className="progress-container">
                      <div className="progress-fill" style={{ width: `${task.progress}%` }} />
                    </div>
                    <span className="text-xs font-bold text-gray-500">{task.progress}%</span>
                  </div>
                </div>
              </Link>

              <div className="subtask-list">
                {task.subtasks?.map(sub => (
                  <div key={sub._id} className="subtask-item" onClick={(e) => handleSubtaskToggle(e, sub._id)}>
                    {sub.isCompleted ? <CheckCircle className="text-green-500" size={20} /> : <Circle className="text-gray-300" size={20} />}
                    <span className={`subtask-text ${sub.isCompleted ? 'completed' : ''}`}>{sub.title}</span>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {/* CREATE TASK MODAL */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content animate-pop">
            <div className="modal-header">
              <h2 className="modal-title">New Milestone</h2>
              <button onClick={() => setIsModalOpen(false)} className="close-btn"><X /></button>
            </div>
            <form onSubmit={handleCreateTask} className="modal-form">
              <div className="input-group">
                <label>Milestone Title</label>
                <input 
                  autoFocus
                  required
                  type="text" 
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  placeholder="e.g., Complete Fundamentals Module" 
                />
              </div>
              <div className="modal-actions">
                <button type="button" onClick={() => setIsModalOpen(false)} className="cancel-btn">Cancel</button>
                <button type="submit" className="submit-btn">Create Milestone</button>
              </div>
            </form>
          </div>
        </div>
      )}
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

export default GoalDetail;