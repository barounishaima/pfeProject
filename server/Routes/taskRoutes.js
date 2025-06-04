const express = require('express');
const router = express.Router();
const controller = require('../controllers/taskController');

router.post('/', controller.create);
router.get('/', controller.getAll);
router.get('/:id', controller.getOne);
router.put('/:id', controller.update);
router.delete('/:id', controller.remove);
router.post('/:id', controller.start);


module.exports = router;