import React from 'react';
import { Link } from 'react-router-dom';
import { Target, TrendingUp, Award, CheckCircle } from 'lucide-react';
import './LandingPage.css';

const LandingPage = () => {
  return (
    <div className="landing-container">
      {/* Navigation Header */}
      <header className="landing-header">
        <div className="logo">
          <Target className="logo-icon" size={32} />
          <span>SkillTracker</span>
        </div>
        <nav className="auth-nav">
          <Link to="/login" className="nav-btn login-btn">Login</Link>
          <Link to="/register" className="nav-btn register-btn">Get Started</Link>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">
            Master Any Skill. <br />
            <span>One Milestone at a Time.</span>
          </h1>
          <p className="hero-subtitle">
            Break down complex goals into manageable tasks, track your progress 
            with real-time analytics, and visualize your journey toward mastery.
          </p>
          <div className="hero-actions">
            <Link to="/register" className="cta-primary">Start Tracking for Free</Link>
            <Link to="/about" className="cta-secondary">How it Works</Link>
          </div>
        </div>
        <div className="hero-visual">
          {/* A placeholder for a dashboard preview or abstract graphic */}
          <div className="dashboard-preview-card">
            <div className="preview-header"></div>
            <div className="preview-line long"></div>
            <div className="preview-line medium"></div>
            <div className="preview-line short"></div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-grid">
        <FeatureCard 
          icon={<TrendingUp size={24} />}
          title="Visualize Progress"
          desc="Watch your skill bars grow as you complete milestones and subtasks."
        />
        <FeatureCard 
          icon={<Award size={24} />}
          title="Set Goals"
          desc="Define your North Star and track the small wins that get you there."
        />
        <FeatureCard 
          icon={<CheckCircle size={24} />}
          title="Stay Disciplined"
          desc="Interactive checklists keep you focused on the next immediate step."
        />
      </section>

      <footer className="landing-footer">
        <p>© 2026 SkillTracker. Built for lifelong learners.</p>
      </footer>
    </div>
  );
};

const FeatureCard = ({ icon, title, desc }) => (
  <div className="feature-card">
    <div className="feature-icon">{icon}</div>
    <h3>{title}</h3>
    <p>{desc}</p>
  </div>
);

export default LandingPage;