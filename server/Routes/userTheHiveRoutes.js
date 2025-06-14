import express from 'express';
import {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
  setPassword,
  changePassword
} from '../controllers/userTheHiveController.js';

const router = express.Router();

router.get('/', getUsers);
router.post('/', createUser);
router.patch('/:userId', updateUser);
router.delete('/:userId', deleteUser);

// Password endpoints
router.post('/:userId/password/set', setPassword);
router.post('/:userId/password/change', changePassword);

export default router;
