const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
  goal: { type: mongoose.Schema.Types.ObjectId, ref: 'Goal', required: true },
  title: { type: String, required: true },
  progress: { type: Number, default: 0 }, // Calculated from Subtasks
  isCompleted: { type: Boolean, default: false } // Becomes true when progress is 100
}, { timestamps: true });

module.exports = mongoose.model('Task', TaskSchema);