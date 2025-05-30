import express from 'express';
const router = express.Router();
import controller from '../controllers/taskController';

router.post('/', controller.create);
router.get('/', controller.getAll);
router.get('/:id', controller.getOne);
router.put('/:id', controller.update);
router.delete('/:id', controller.remove);
router.post('/:id', controller.start);


export default router;
