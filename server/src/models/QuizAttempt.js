const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema({
  questionId: { type: mongoose.Schema.Types.ObjectId, required: true }, // Reference to the question within the Quiz.questions array
  answer: { type: mongoose.Schema.Types.Mixed }, // Could be string, array of strings (for multiple choice)
  isCorrect: { type: Boolean },
  // pointsAwarded: { type: Number }
});

const quizAttemptSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  quiz: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz', required: true, index: true },
  lesson: { type: mongoose.Schema.Types.ObjectId, ref: 'Lesson', required: true, index: true }, // Denormalized
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true, index: true }, // Denormalized
  answers: [answerSchema],
  score: { type: Number, required: true },
  passed: { type: Boolean, required: true },
  startedAt: { type: Date, default: Date.now },
  completedAt: { type: Date },
}, { timestamps: true });

quizAttemptSchema.index({ user: 1, quiz: 1 });
quizAttemptSchema.index({ user: 1, course: 1 });

const QuizAttempt = mongoose.model('QuizAttempt', quizAttemptSchema);
module.exports = QuizAttempt;
