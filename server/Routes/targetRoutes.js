import express from 'express';
const router = express.Router();
import { 
  create,
  getAll,
  getOne,
  update,
  remove
} from '../controllers/targetController.js'; 

router.post('/', create);
router.get('/', getAll);
router.get('/:id', getOne);
router.put('/:id', update);
router.delete('/:id', remove);

export { router as targetRouter };