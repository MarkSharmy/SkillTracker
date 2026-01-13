import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { API } from '../api'; // Use the Axios instance we created
import ProgressBar from '../components/ProgressBar';
import { CheckCircle, Circle, ChevronDown, ChevronRight } from 'lucide-react';

const GoalDetail = () => {
  const { id } = useParams();
  const [goal, setGoal] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

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

  const handleSubtaskToggle = async (subtaskId) => {
    try {
      await API.patch(`/subtasks/${subtaskId}/toggle`);
      // Refresh data to show "immediate feedback" (Requirement 3.2)
      fetchGoalData(); 
    } catch (err) {
      console.error("Toggle failed", err);
    }
  };

  if (loading) return <div className="p-10 text-center">Loading Goal...</div>;

  return (
    <div className="max-w-3xl mx-auto p-6">
      {/* Goal Header */}
      <header className="mb-10">
        <h1 className="text-4xl font-bold text-gray-900">{goal.title}</h1>
        <p className="text-gray-500 mt-2">{goal.description}</p>
        <div className="mt-6">
          <div className="flex justify-between text-sm mb-1 font-medium">
            <span>Overall Progress</span>
            <span>{goal.progress}%</span>
          </div>
          <ProgressBar progress={goal.progress} color="bg-green-500" />
        </div>
      </header>

      {/* Task List */}
      <div className="space-y-8">
        {tasks.map(task => (
          <div key={task._id} className={`p-5 rounded-xl border ${task.isCompleted ? 'bg-green-50 border-green-200' : 'bg-white border-gray-100'}`}>
            <div className="flex justify-between items-center mb-4">
              <h3 className={`text-lg font-semibold ${task.isCompleted ? 'text-green-800' : 'text-gray-800'}`}>
                {task.title}
              </h3>
              <span className="text-xs font-bold px-2 py-1 bg-gray-200 rounded text-gray-600">
                {task.progress}%
              </span>
            </div>
            
            <ProgressBar progress={task.progress} color={task.isCompleted ? "bg-green-600" : "bg-blue-500"} />

            {/* Subtasks - This implements the Hierarchy (Requirement 5.1) */}
            <div className="mt-4 ml-2 space-y-3">
              {task.subtasks?.map(sub => (
                <div 
                  key={sub._id} 
                  onClick={() => handleSubtaskToggle(sub._id)}
                  className="flex items-center gap-3 cursor-pointer group"
                >
                  {sub.isCompleted ? 
                    <CheckCircle className="text-green-500 w-5 h-5" /> : 
                    <Circle className="text-gray-300 group-hover:text-blue-400 w-5 h-5" />
                  }
                  <span className={`text-sm ${sub.isCompleted ? 'line-through text-gray-400' : 'text-gray-700'}`}>
                    {sub.title}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GoalDetail;