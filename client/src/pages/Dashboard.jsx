import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { API } from '../api';
import ProgressBar from '../components/ProgressBar';
import { Plus, Target, ChevronRight, TrendingUp } from 'lucide-react';

const Dashboard = () => {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGoals = async () => {
      try {
        const { data } = await API.get('/goals');
        setGoals(data);
        setLoading(false);
      } catch (err) {
        console.error("Failed to fetch goals", err);
        setLoading(false);
      }
    };
    fetchGoals();
  }, []);

  if (loading) return <div className="flex justify-center mt-20">Loading your progress...</div>;

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Header Section */}
      <header className="bg-white border-b">
        <div className="max-w-5xl mx-auto px-6 py-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Goals</h1>
            <p className="text-gray-500 mt-1">Track your progress and achieve more.</p>
          </div>
          <Link 
            to="/create-goal" 
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            <Plus size={20} /> New Goal
          </Link>
        </div>
      </header>

      {/* Stats Summary Section */}
      <div className="max-w-5xl mx-auto px-6 mt-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
          <div className="bg-white p-4 rounded-xl border border-gray-200 flex items-center gap-4">
            <div className="p-3 bg-blue-100 text-blue-600 rounded-lg"><Target /></div>
            <div>
              <p className="text-sm text-gray-500">Active Goals</p>
              <p className="text-xl font-bold">{goals.length}</p>
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-gray-200 flex items-center gap-4">
            <div className="p-3 bg-green-100 text-green-600 rounded-lg"><TrendingUp /></div>
            <div>
              <p className="text-sm text-gray-500">Avg. Progress</p>
              <p className="text-xl font-bold">
                {goals.length > 0 
                  ? Math.round(goals.reduce((a, b) => a + b.progress, 0) / goals.length) 
                  : 0}%
              </p>
            </div>
          </div>
        </div>

        {/* Goals Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {goals.map((goal) => (
            <Link key={goal._id} to={`/goals/${goal._id}`} className="group">
              <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm group-hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-blue-500 bg-blue-50 px-2 py-1 rounded">
                      {goal.category || 'General'}
                    </span>
                    <h3 className="text-xl font-bold text-gray-900 mt-2">{goal.title}</h3>
                  </div>
                  <ChevronRight className="text-gray-300 group-hover:text-blue-500 transition-colors" />
                </div>
                
                <p className="text-gray-500 text-sm line-clamp-2 mb-6">
                  {goal.description}
                </p>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-gray-700">Progress</span>
                    <span className="font-bold text-blue-600">{goal.progress}%</span>
                  </div>
                  <ProgressBar progress={goal.progress} />
                </div>
              </div>
            </Link>
          ))}

          {goals.length === 0 && (
            <div className="col-span-full py-20 text-center bg-white rounded-2xl border-2 border-dashed border-gray-200">
              <p className="text-gray-500">No goals set yet. Start by creating your first objective!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;