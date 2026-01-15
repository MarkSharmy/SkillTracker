const express = require('express');
const router = express.Router();
const { createTask, getTaskById,  getTasksByGoal, updateTask, deleteTask } = require('../controllers/taskController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect); // Protect all task operations

router.post('/', createTask);
router.get('/goal/:goalId', getTaskById);
router.get('/:id', getTaskById);
router.put('/:id', updateTask);
router.delete('/:id', deleteTask);

module.exports = router;