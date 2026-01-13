const express = require('express');
const router = express.Router();
const { 
    createGoal, 
    getGoals, 
    getGoalById, 
    updateGoal, 
    deleteGoal 
} = require('../controllers/goalController');
const { protect } = require('../middleware/authMiddleware');

// Protect all goal routes
router.use(protect);

router.route('/')
    .post(createGoal)
    .get(getGoals);

router.route('/:id')
    .get(getGoalById)
    .put(updateGoal)
    .delete(deleteGoal);

module.exports = router;