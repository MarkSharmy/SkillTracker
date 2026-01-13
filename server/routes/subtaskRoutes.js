const express = require('express');
const router = express.Router();
const { createSubtask, toggleSubtask, updateSubtask, deleteSubtask } = require('../controllers/subtaskController');

router.post('/', createSubtask);
router.patch('/:id/toggle', toggleSubtask);
router.put('/:id', updateSubtask);
router.delete('/:id', deleteSubtask);

module.exports = router;