const Task = require('../models/Task');
const Goal = require('../models/Goal');

exports.addTask = async (req, res) => {
  try {
    const { goalId, title } = req.body;
    const newTask = new Task({ goal: goalId, title });
    await newTask.save();

    // Reset Goal progress calculation since a new 0% task was added
    const allTasks = await Task.find({ goal: goalId });
    const totalProgress = allTasks.reduce((acc, curr) => acc + curr.progress, 0);
    const goalProgress = Math.round(totalProgress / allTasks.length);
    
    await Goal.findByIdAndUpdate(goalId, { progress: goalProgress });

    res.status(201).json(newTask);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};