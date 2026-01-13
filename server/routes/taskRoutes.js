const express = require('express');
const router = express.Router();
const { createTask, getTasksByGoal, updateTask, deleteTask } = require('../controllers/taskController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect); // Protect all task operations

router.post('/', createTask);
router.get('/goal/:goalId', getTasksByGoal);
router.put('/:id', updateTask);
router.delete('/:id', deleteTask);

module.exports = router;