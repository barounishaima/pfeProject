//routes/observableByIdRoutes.js

import express from 'express';
import { updateObservable, deleteObservable } from '../controllers/observableController.js';

const router = express.Router();

/**
 * @route   PATCH /api/observables/:observableId
 * @desc    Update an observable by ID
 */
router.patch('/:observableId', updateObservable);

/**
 * @route   DELETE /api/observables/:observableId
 * @desc    Delete an observable by ID
 */
router.delete('/:observableId', deleteObservable);

export default router;
