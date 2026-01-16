import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { API } from '../api';
import { Target, Mail, Lock, User, ArrowRight, ShieldCheck } from 'lucide-react';
import './Auth.css';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      return setError("Passwords do not match");
    }

    setLoading(true);
    setError('');

    try {
      await API.post('/users/register', {
        username: formData.username,
        email: formData.email,
        password: formData.password
      });
      // Redirect to login or auto-login the user
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card animate-pop">
        <div className="auth-header">
          <div className="auth-logo">
            <Target size={32} />
          </div>
          <h1 className="auth-title">Create Account</h1>
        </div>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleRegister} className="auth-form">
          <div className="auth-input-group">
            <label>Full Name</label>
            <div className="input-wrapper">
              <User className="input-icon" size={18} />
              <input 
                name="username"
                type="text" 
                placeholder="John Doe" 
                value={formData.username}
                onChange={handleChange}
                required 
              />
            </div>
          </div>

          <div className="auth-input-group">
            <label>Email Address</label>
            <div className="input-wrapper">
              <Mail className="input-icon" size={18} />
              <input 
                name="email"
                type="email" 
                placeholder="name@company.com" 
                value={formData.email}
                onChange={handleChange}
                required 
              />
            </div>
          </div>

          <div className="auth-input-group">
            <label>Password</label>
            <div className="input-wrapper">
              <Lock className="input-icon" size={18} />
              <input 
                name="password"
                type="password" 
                placeholder="Min. 8 characters" 
                value={formData.password}
                onChange={handleChange}
                required 
              />
            </div>
          </div>

          <div className="auth-input-group">
            <label>Confirm Password</label>
            <div className="input-wrapper">
              <ShieldCheck className="input-icon" size={18} />
              <input 
                name="confirmPassword"
                type="password" 
                placeholder="Repeat password" 
                value={formData.confirmPassword}
                onChange={handleChange}
                required 
              />
            </div>
          </div>

          <button type="submit" className="auth-submit-btn" disabled={loading}>
            {loading ? 'Creating Account...' : 'Create Account'} 
            {!loading && <ArrowRight size={18} />}
          </button>
        </form>

        <p className="auth-footer">
          Already have an account? <Link to="/login">Sign in here</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;