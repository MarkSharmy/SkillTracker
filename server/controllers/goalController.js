const Goal = require('../models/Goal');

exports.createGoal = async (req, res) => {
  try {
    const { title, description, category } = req.body;
    // req.user.id comes from your Auth Middleware
    const newGoal = new Goal({
      user: req.user.id,
      title,
      description,
      category
    });
    await newGoal.save();
    res.status(201).json(newGoal);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getGoals = async (req, res) => {
  try {
    const goals = await Goal.find({ user: req.user.id });
    res.status(200).json(goals);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};