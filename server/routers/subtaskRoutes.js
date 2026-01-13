const express = require('express');
const router = express.Router();
const { toggleSubtask } = require('../controllers/subtaskController');

router.post('/', createSubtask);
router.patch('/:id/toggle', toggleSubtask);
router.put('/:id', updateSubtask);
router.delete('/:id', deleteSubtask);

module.exports = router;