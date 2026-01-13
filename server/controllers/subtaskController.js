const Subtask = require('../models/Subtask');
const Task = require('../models/Task');
const Goal = require('../models/Goal');

// @desc    Toggle subtask completion and update hierarchy progress
// @route   PATCH /api/subtasks/:id/toggle
exports.toggleSubtask = async (req, res) => {
  try {
    const subtask = await Subtask.findById(req.params.id);
    if (!subtask) return res.status(404).json({ message: 'Subtask not found' });

    // 1. Toggle completion
    subtask.isCompleted = !subtask.isCompleted;
    await subtask.save();

    // 2. Recalculate Parent Task Progress
    const taskId = subtask.task;
    const allSubtasks = await Subtask.find({ task: taskId });
    const completedSubtasks = allSubtasks.filter(s => s.isCompleted).length;
    const taskProgress = Math.round((completedSubtasks / allSubtasks.length) * 100);

    const updatedTask = await Task.findByIdAndUpdate(
      taskId,
      { 
        progress: taskProgress, 
        isCompleted: taskProgress === 100 
      },
      { new: true }
    );

    // 3. Recalculate Parent Goal Progress
    const goalId = updatedTask.goal;
    const allTasks = await Task.find({ goal: goalId });
    
    // Average progress of all tasks under this goal
    const totalProgress = allTasks.reduce((acc, curr) => acc + curr.progress, 0);
    const goalProgress = Math.round(totalProgress / allTasks.length);

    await Goal.findByIdAndUpdate(goalId, { progress: goalProgress });

    res.status(200).json({
      message: "Progress updated",
      subtask,
      taskProgress,
      goalProgress
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};