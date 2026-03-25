import express from 'express';
import {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
  updateTaskStatus,
  getAnalytics,
} from '../controllers/taskController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect); // All task routes are protected

// Note: /analytics must come before /:id so it's not treated as an ID
router.get('/analytics', getAnalytics);

router.route('/').get(getTasks).post(createTask);
router.route('/:id').put(updateTask).delete(deleteTask);
router.patch('/:id/status', updateTaskStatus);

export default router;
