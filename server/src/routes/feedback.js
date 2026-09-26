import { Router } from 'express';
import {
  getAllFeedbacks,
  getFeedback,
  createFeedback,
  getFeedbackSummary
} from '../controllers/feedbackController.js';

const router = Router();

router.get('/', getAllFeedbacks);
// Declared before '/:id' so the literal path wins over the parameter.
router.get('/summary', getFeedbackSummary);
router.get('/:id', getFeedback);
router.post('/', createFeedback);

export default router;
