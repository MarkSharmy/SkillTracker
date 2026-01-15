const Subtask = require('../models/Subtask');
const Task = require('../models/Task');
const Goal = require('../models/Goal');

// HELPER FUNCTION: Recalculate progress for Task and Goal
// This ensures "Progress calculations must always reflect current state" (Requirement 3.4)
const updateHierarchyProgress = async (taskId) => {
    const allSubtasks = await Subtask.find({ task: taskId });
    
    // 1. Calculate Task Progress
    let taskProgress = 0;
    if (allSubtasks.length > 0) {
        const completed = allSubtasks.filter(s => s.isCompleted).length;
        taskProgress = Math.round((completed / allSubtasks.length) * 100);
    }

    const updatedTask = await Task.findByIdAndUpdate(
        taskId, 
        { progress: taskProgress, isCompleted: taskProgress === 100 }, 
        { new: true }
    );

    // 2. Calculate Goal Progress
    const goalId = updatedTask.goal;
    const allTasks = await Task.find({ goal: goalId });
    
    let goalProgress = 0;
    if (allTasks.length > 0) {
        const totalTaskProgress = allTasks.reduce((acc, curr) => acc + curr.progress, 0);
        goalProgress = Math.round(totalTaskProgress / allTasks.length);
    }

    await Goal.findByIdAndUpdate(goalId, { progress: goalProgress });
};

// @desc    Create a new subtask
// @route   POST /api/subtasks
exports.createSubtask = async (req, res) => {
    try {
        const { title, taskId } = req.body;
        const subtask = await Subtask.create({ title, task: taskId });
        
        // Trigger trickle-up calculation
        await updateHierarchyProgress(taskId);
        
        res.status(201).json(subtask);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Get a single subtask by ID
// @route   GET /api/subtasks/:id
exports.getSubtaskById = async (req, res) => {
    try {
        // Find the subtask and populate the task to eventually verify goal ownership if needed
        const subtask = await Subtask.findById(req.params.id);

        if (!subtask) {
            return res.status(404).json({ message: "Subtask not found" });
        }

        // Optional: Add a security check here similar to Task controller 
        // if you want to ensure the user owns the parent goal.

        res.status(200).json(subtask);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Toggle subtask completion status
// @route   PATCH /api/subtasks/:id/toggle
exports.toggleSubtask = async (req, res) => {
    try {
        const subtask = await Subtask.findById(req.params.id);
        if (!subtask) return res.status(404).json({ message: "Subtask not found" });

        subtask.isCompleted = !subtask.isCompleted;
        await subtask.save();

        await updateHierarchyProgress(subtask.task);

        res.status(200).json(subtask);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Update subtask title
// @route   PUT /api/subtasks/:id
exports.updateSubtask = async (req, res) => {
    try {
        const subtask = await Subtask.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.status(200).json(subtask);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Delete a subtask
// @route   DELETE /api/subtasks/:id
exports.deleteSubtask = async (req, res) => {
    try {
        const subtask = await Subtask.findById(req.params.id);
        if (!subtask) return res.status(404).json({ message: "Subtask not found" });

        const taskId = subtask.task;
        await subtask.deleteOne();

        // Recalculate progress after removal
        await updateHierarchyProgress(taskId);

        res.status(200).json({ message: "Subtask removed" });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};