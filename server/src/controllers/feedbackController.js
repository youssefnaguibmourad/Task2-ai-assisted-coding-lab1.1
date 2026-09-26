import Joi from 'joi';
import mongoose from 'mongoose';
import { Feedback } from '../models/Feedback.js';

const createSchema = Joi.object({
  workshopCode: Joi.string().trim().min(1).required(),
  score: Joi.number().integer().min(1).max(5).required(),
  comment: Joi.string().allow('').optional(),
  submittedBy: Joi.string()
    .custom((value, helpers) =>
      mongoose.Types.ObjectId.isValid(value) ? value : helpers.error('any.invalid')
    )
    .optional()
});

// GET /api/feedback
export async function getAllFeedbacks(req, res, next) {
  try {
    const feedbacks = await Feedback.find().sort({ createdAt: -1 }).lean();
    res.json({ feedbacks });
  } catch (err) { next(err); }
}

// GET /api/feedback/:id
export async function getFeedback(req, res, next) {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({ message: 'Feedback not found' });
    }

    const feedback = await Feedback.findById(req.params.id);
    if (!feedback) return res.status(404).json({ message: 'Feedback not found' });
    res.json({ feedback });
  } catch (err) { next(err); }
}

// POST /api/feedback
export async function createFeedback(req, res, next) {
  try {
    const { value, error } = createSchema.validate(req.body, { stripUnknown: true });
    if (error) return res.status(400).json({ message: error.message });

    const feedback = await Feedback.create(value);
    res.status(201).json({ feedback });
  } catch (err) {
    if (err?.code === 11000) {
      return res.status(409).json({ message: 'Feedback already submitted for this workshop' });
    }
    next(err);
  }
}

// GET /api/feedback/summary?workshopCode=WS101
export async function getFeedbackSummary(req, res, next) {
  try {
    const { workshopCode } = req.query;
    if (!workshopCode) return res.status(400).json({ message: 'workshopCode is required' });

    const [summary] = await Feedback.aggregate([
      { $match: { workshopCode } },
      { $group: { _id: '$workshopCode', averageScore: { $avg: '$score' }, feedbackCount: { $sum: 1 } } }
    ]);

    res.json({
      workshopCode,
      averageScore: summary?.averageScore ?? 0,
      feedbackCount: summary?.feedbackCount ?? 0
    });
  } catch (err) { next(err); }
}
