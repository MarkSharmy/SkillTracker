const Goal = require('../models/goal');
const Task = require('../models/task');
const Subtask = require('../models/subtask');

// @desc    Create a new goal
// @route   POST /api/goals
exports.createGoal = async (req, res) => {
    try {
        const { title, description, category } = req.body;
        
        // The user ID comes from the Auth Middleware (Security Requirement 4)
        const goal = await Goal.create({
            user: req.user.id,
            title,
            description,
            category
        });

        res.status(201).json(goal);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Get all goals for the logged-in user
// @route   GET /api/goals
exports.getGoals = async (req, res) => {
    try {
        const goals = await Goal.find({ user: req.user.id }).sort({ createdAt: -1 });
        res.status(200).json(goals);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get a single goal with its tasks and subtasks
// @route   GET /api/goals/:id
exports.getGoalById = async (req, res) => {
    try {
        const goal = await Goal.findOne({ _id: req.params.id, user: req.user.id });
        
        if (!goal) return res.status(404).json({ message: "Goal not found" });

        // Deep population to get the full hierarchy for the UI
        const tasks = await Task.find({ goal: goal._id });
        
        // We return the goal and its tasks so the frontend can build the tree view
        res.status(200).json({ goal, tasks });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update goal details
// @route   PUT /api/goals/:id
exports.updateGoal = async (req, res) => {
    try {
        const goal = await Goal.findOneAndUpdate(
            { _id: req.params.id, user: req.user.id },
            req.body,
            { new: true, runValidators: true }
        );

        if (!goal) return res.status(404).json({ message: "Goal not found" });

        res.status(200).json(goal);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Delete a goal and all nested tasks/subtasks
// @route   DELETE /api/goals/:id
exports.deleteGoal = async (req, res) => {
    try {
        const goal = await Goal.findOne({ _id: req.params.id, user: req.user.id });

        if (!goal) return res.status(404).json({ message: "Goal not found" });

        // CASCADE DELETE: Requirement 3.4 (Data Integrity)
        // Find all tasks related to this goal
        const tasks = await Task.find({ goal: goal._id });
        const taskIds = tasks.map(task => task._id);

        // Delete all subtasks belonging to those tasks
        await Subtask.deleteMany({ task: { $in: taskIds } });
        
        // Delete the tasks
        await Task.deleteMany({ goal: goal._id });

        // Finally, delete the goal
        await goal.deleteOne();

        res.status(200).json({ message: "Goal and all associated tasks deleted" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};