const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  questionText: { type: String, required: true },
  questionType: { type: String, enum: ['multiple-choice', 'single-choice', 'true-false', 'short-answer'], required: true },
  options: [{
    text: { type: String, required: true },
    isCorrect: { type: Boolean, default: false }
  }],
  // For short-answer, correct answer might be a regex or a set of keywords
  // points: { type: Number, default: 1 }
});

const quizSchema = new mongoose.Schema({
  lesson: { type: mongoose.Schema.Types.ObjectId, ref: 'Lesson', required: true, unique: true, index: true }, // Quiz is part of a lesson
  title: { type: String, required: true },
  questions: [questionSchema],
  passingScorePercentage: { type: Number, min: 0, max: 100, default: 70 },
}, { timestamps: true });

const Quiz = mongoose.model('Quiz', quizSchema);
module.exports = Quiz;
