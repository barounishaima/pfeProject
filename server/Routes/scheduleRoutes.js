import express from 'express';
const router = express.Router();
const controller = require('../controllers/scheduleController');

router.post('/', controller.create);
router.get('/', controller.getAll);
router.get('/:id', controller.getOne);
router.put('/:id', controller.update);
router.delete('/:id', controller.remove);

export default router;