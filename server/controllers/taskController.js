const Task = require('../models/Task');
const Goal = require('../models/Goal');
const Subtask = require('../models/Subtask');

// HELPER: Recalculate Goal Progress
// Called whenever a task is added, removed, or its progress changes
const updateGoalProgress = async (goalId) => {
    const allTasks = await Task.find({ goal: goalId });
    
    let goalProgress = 0;
    if (allTasks.length > 0) {
        const totalTaskProgress = allTasks.reduce((acc, curr) => acc + curr.progress, 0);
        goalProgress = Math.round(totalTaskProgress / allTasks.length);
    }

    await Goal.findByIdAndUpdate(goalId, { progress: goalProgress });
};

// @desc    Create a new task under a goal
// @route   POST /api/tasks
exports.createTask = async (req, res) => {
    try {
        const { title, goalId } = req.body;
        
        // Verify the goal belongs to the user before adding a task
        const goal = await Goal.findOne({ _id: goalId, user: req.user.id });
        if (!goal) return res.status(404).json({ message: "Goal not found" });

        const task = await Task.create({
            title,
            goal: goalId,
            progress: 0
        });

        // Adding a new 0% task dilutes the total goal progress
        await updateGoalProgress(goalId);

        res.status(201).json(task);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Get all tasks for a specific goal
// @route   GET /api/tasks/goal/:goalId
exports.getTasksByGoal = async (req, res) => {
    try {
        const tasks = await Task.find({ goal: req.params.goalId });
        res.status(200).json(tasks);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get a single task and its subtasks
// @route   GET /api/tasks/:id
exports.getTaskById = async (req, res) => {
    try {
        // 1. Find the task and populate the goal to check ownership
        const task = await Task.findById(req.params.id).populate('goal');
        
        if (!task) {
            return res.status(404).json({ message: "Task not found" });
        }

        // 2. Security: Ensure the goal this task belongs to is owned by the user
        if (task.goal.user.toString() !== req.user.id) {
            return res.status(401).json({ message: "Not authorized" });
        }

        // 3. Fetch all subtasks associated with this task
        const subtasks = await Subtask.find({ task: req.params.id });

        // 4. Return both the task details and the list of subtasks
        res.status(200).json({
            task,
            subtasks
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update task title
// @route   PUT /api/tasks/:id
exports.updateTask = async (req, res) => {
    try {
        const task = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!task) return res.status(404).json({ message: "Task not found" });
        
        res.status(200).json(task);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Delete a task and its subtasks
// @route   DELETE /api/tasks/:id
exports.deleteTask = async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);
        if (!task) return res.status(404).json({ message: "Task not found" });

        const goalId = task.goal;

        // 1. Cascade Delete: Remove all subtasks first
        await Subtask.deleteMany({ task: task._id });

        // 2. Remove the task
        await task.deleteOne();

        // 3. Recalculate Goal Progress (as the number of tasks has changed)
        await updateGoalProgress(goalId);

        res.status(200).json({ message: "Task and subtasks deleted" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};