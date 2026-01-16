import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { API } from '../api';
import { ArrowLeft, CheckCircle, Circle, Trash2, Plus, X, Edit3 } from 'lucide-react';
import './TaskDetail.css';

const TaskDetail = () => {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Modals State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  
  // Form State
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [selectedSubtask, setSelectedSubtask] = useState(null);

  const fetchTask = async () => {
    try {
      const { data } = await API.get(`/tasks/${taskId}`);
      setTask(data);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching task:", err);
      navigate('/dashboard');
    }
  };

  useEffect(() => {
    fetchTask();
  }, [taskId]);

  // --- ACTIONS ---

  const handleCreateSubtask = async (e) => {
    e.preventDefault();
    try {
      await API.post('/subtasks', { title: newSubtaskTitle, taskId });
      setNewSubtaskTitle('');
      setIsCreateModalOpen(false);
      fetchTask();
    } catch (err) { console.error(err); }
  };

  const handleToggleSubtask = async (e, subid) => {
    e.stopPropagation(); // Prevents the Edit Modal from opening
    try {
      await API.patch(`/subtasks/${subid}/toggle`);
      fetchTask();
    } catch (err) { console.error(err); }
  };

  const handleOpenEditModal = (sub) => {
    setSelectedSubtask({ ...sub });
    setIsEditModalOpen(true);
  };

  const handleUpdateSubtask = async (e) => {
    e.preventDefault();
    try {
      await API.patch(`/subtasks/${selectedSubtask._id}`, { title: selectedSubtask.title });
      setIsEditModalOpen(false);
      fetchTask();
    } catch (err) { console.error(err); }
  };

  const handleDeleteSubtask = async () => {
    if (!window.confirm("Delete this step?")) return;
    try {
      await API.delete(`/subtasks/${selectedSubtask._id}`);
      setIsEditModalOpen(false);
      fetchTask();
    } catch (err) { console.error(err); }
  };

  if (loading) return <div className="loading">Loading Milestone Details...</div>;

  return (
    <div className="task-detail-container">
      <header className="detail-header">
        <div className="header-content flex justify-between items-start">
          <div>
            <button onClick={() => navigate(-1)} className="back-link back-btn-wrapper cursor-pointer">
              <ArrowLeft size={18} /> Back to Goal
            </button>
            <h1 className="goal-main-title">{task.title}</h1>
            <div className="flex gap-4 mt-4">
              <span className="status-badge">{task.progress}% Complete</span>
            </div>
          </div>
          <button onClick={() => { if(window.confirm("Delete milestone?")) API.delete(`/tasks/${taskId}`).then(()=>navigate(-1))}} className="delete-goal-btn">
            <Trash2 size={20} /> <span>Delete Milestone</span>
          </button>
        </div>
      </header>

      <div className="tasks-section">
        <div className="task-card-content">
          <div className="flex justify-between items-center mb-6">
            <h3 className="checklist-title mb-0">Checklist</h3>
            <button onClick={() => setIsCreateModalOpen(true)} className="create-btn py-2 text-sm">
              <Plus size={16} /> Add Step
            </button>
          </div>

          <div className="checklist-container">
            {task.subtasks?.map(sub => (
              <div key={sub._id} className="checklist-item cursor-pointer group" onClick={() => handleOpenEditModal(sub)}>
                <div onClick={(e) => handleToggleSubtask(e, sub._id)} className="flex items-center">
                  {sub.isCompleted ? <CheckCircle className="text-green-500" size={22} /> : <Circle className="text-gray-300 hover:text-blue-400" size={22} />}
                </div>
                <span className={`checklist-text flex-1 ${sub.isCompleted ? 'completed' : ''}`}>{sub.title}</span>
                <Edit3 size={16} className="text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CREATE MODAL */}
      {isCreateModalOpen && (
        <Modal title="New Subtask" onClose={() => setIsCreateModalOpen(false)}>
          <form onSubmit={handleCreateSubtask} className="modal-form">
            <div className="input-group">
              <label>Step Title</label>
              <input autoFocus required type="text" value={newSubtaskTitle} onChange={(e) => setNewSubtaskTitle(e.target.value)} />
            </div>
            <div className="modal-actions"><button type="submit" className="submit-btn">Create Step</button></div>
          </form>
        </Modal>
      )}

      {/* EDIT MODAL */}
      {isEditModalOpen && (
        <Modal title="Edit Step" onClose={() => setIsEditModalOpen(false)}>
          <form onSubmit={handleUpdateSubtask} className="modal-form">
            <div className="input-group">
              <label>Step Title</label>
              <input autoFocus required type="text" value={selectedSubtask.title} onChange={(e) => setSelectedSubtask({...selectedSubtask, title: e.target.value})} />
            </div>
            <div className="modal-actions gap-3">
              <button type="button" onClick={handleDeleteSubtask} className="cancel-btn bg-red-50 text-red-600 hover:bg-red-100">Delete</button>
              <button type="submit" className="submit-btn">Save Changes</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

// Reusable Internal Modal Wrapper
const Modal = ({ title, onClose, children }) => (
  <div className="modal-overlay" onClick={onClose}>
    <div className="modal-content animate-pop" onClick={e => e.stopPropagation()}>
      <div className="modal-header">
        <h2 className="modal-title">{title}</h2>
        <button onClick={onClose} className="close-btn"><X /></button>
      </div>
      {children}
    </div>
  </div>
);

export default TaskDetail;