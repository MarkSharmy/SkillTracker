import React, { useState } from 'react';
import { X, Target, Tag, AlignLeft } from 'lucide-react';
import { API } from '../api';
import './CreateGoalModal.css';

const CreateGoalModal = ({ isOpen, onClose, refreshGoals }) => {
  const [formData, setFormData] = useState({
    title: '',
    category: 'General',
    description: ''
  });
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await API.post('/goals', formData);
      setFormData({ title: '', category: 'General', description: '' });
      refreshGoals(); // Refresh the dashboard list
      onClose();      // Close the modal
    } catch (err) {
      console.error("Failed to create goal", err);
      alert("Error creating goal. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content animate-pop">
        <div className="modal-header">
          <h2 className="modal-title">Create New Goal</h2>
          <button onClick={onClose} className="close-btn">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="input-group">
            <label><Target size={16} /> Goal Title</label>
            <input
              required
              type="text"
              placeholder="e.g., Master React Native"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          <div className="input-group">
            <label><AlignLeft size={16} /> Description</label>
            <textarea
              placeholder="What do you want to achieve?"
              rows="3"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="modal-actions">
            <button type="button" onClick={onClose} className="cancel-btn">
              Cancel
            </button>
            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? "Creating..." : "Set Goal"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateGoalModal;