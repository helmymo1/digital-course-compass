// Placeholder for quiz attempt controller functions
const Quiz = require('../models/Quiz');
const QuizAttempt = require('../models/QuizAttempt');
const Lesson = require('../models/Lesson');
const Course = require('../models/Course');
const User = require('../models/User');

// @desc    Submit an attempt for a quiz
// @route   POST /api/v1/quizzes/:quizId/attempts
// @access  Private (Student enrolled in the course)
exports.submitQuizAttempt = async (req, res) => {
    const { quizId } = req.params;
    const userId = req.user.id;
    const { answers } = req.body; // answers: [{ questionId: "...", selectedOptionId: "..." or answerText: "..."}]

    try {
        const quiz = await Quiz.findById(quizId).populate({
            path: 'lesson',
            select: 'course'
        });

        if (!quiz) {
            return res.status(404).json({ message: 'Quiz not found' });
        }

        // TODO: Authorization: Student must be enrolled in the course quiz.lesson.course
        // For now, skipping detailed enrollment check for brevity

        // Basic validation of answers structure (more can be added)
        if (!Array.isArray(answers) || answers.length === 0) {
            return res.status(400).json({ message: 'Answers must be a non-empty array.' });
        }

        // Calculate score (basic example, can be expanded)
        let score = 0;
        let detailedResults = [];

        for (const attemptAnswer of answers) {
            const question = quiz.questions.id(attemptAnswer.questionId);
            if (!question) {
                // Or skip this answer and log a warning
                return res.status(400).json({ message: `Question with ID ${attemptAnswer.questionId} not found in this quiz.` });
            }

            let isCorrect = false;
            if (question.questionType === 'multiple-choice' || question.questionType === 'single-choice') {
                const correctOption = question.options.find(opt => opt.isCorrect);
                // For single-choice, selectedOptionId should be a string.
                // For multiple-choice, if answers can have multiple selected options, logic needs adjustment.
                // Assuming selectedOptionId refers to the _id of the chosen option.
                if (correctOption && attemptAnswer.selectedOptionId && correctOption._id.toString() === attemptAnswer.selectedOptionId) {
                    isCorrect = true;
                }
            } else if (question.questionType === 'true-false') {
                // Assuming selectedOptionId is 'true' or 'false' (string) or boolean
                const correctOption = question.options.find(opt => opt.isCorrect); // expects one option to be marked correct
                if (correctOption && attemptAnswer.selectedOptionValue !== undefined &&
                    String(correctOption.text).toLowerCase() === String(attemptAnswer.selectedOptionValue).toLowerCase()) {
                     isCorrect = true;
                }
            } else if (question.questionType === 'short-answer') {
                // Basic case-insensitive comparison for short answers
                // More complex logic (regex, keywords) can be added here.
                const correctAnswer = question.options.find(opt => opt.isCorrect); // Assuming correct answer is stored in options[0].text
                if (correctAnswer && attemptAnswer.answerText && correctAnswer.text.toLowerCase() === attemptAnswer.answerText.toLowerCase()) {
                    isCorrect = true;
                }
            }

            if (isCorrect) {
                score++; // Assuming 1 point per correct answer for now
            }
            detailedResults.push({
                questionId: attemptAnswer.questionId,
                selectedOptionId: attemptAnswer.selectedOptionId,
                answerText: attemptAnswer.answerText,
                isCorrect: isCorrect,
                // correctAnswer: could be added here for review
            });
        }

        const totalQuestions = quiz.questions.length;
        const percentageScore = totalQuestions > 0 ? (score / totalQuestions) * 100 : 0;
        const passed = percentageScore >= (quiz.passingScorePercentage || 0);

        const quizAttempt = new QuizAttempt({
            quiz: quizId,
            user: userId,
            answers: detailedResults, // Save the processed answers and correctness
            score: score,
            totalQuestions: totalQuestions,
            percentageScore: percentageScore,
            passed: passed,
            submittedAt: Date.now()
        });

        await quizAttempt.save();

        // TODO: Update student progress, e.g., mark lesson as completed if quiz passed.

        res.status(201).json(quizAttempt);

    } catch (error) {
        console.error('Error submitting quiz attempt:', error);
        if (error.name === 'ValidationError') {
            return res.status(400).json({ message: error.message });
        }
        res.status(500).json({ message: 'Server error while submitting quiz attempt.' });
    }
};

// @desc    Get all attempts for a specific quiz (for Instructors/Admins of the course)
// @route   GET /api/v1/quizzes/:quizId/attempts
// @access  Private (Instructor, Admin)
exports.getAttemptsForQuiz = async (req, res) => {
    const { quizId } = req.params;
    const userId = req.user.id;

    try {
        const quiz = await Quiz.findById(quizId).populate({
            path: 'lesson',
            select: 'course'
        });

        if (!quiz) {
            return res.status(404).json({ message: 'Quiz not found' });
        }

        // Authorization: User must be an instructor for the course or an Admin.
        const course = await Course.findById(quiz.lesson.course);
        if (!course) {
            return res.status(404).json({ message: 'Course not found for this quiz.' });
        }

        const user = await User.findById(userId);
        if (!user || (course.instructor.toString() !== userId && !user.roles.includes('Admin'))) {
            return res.status(403).json({ message: 'User not authorized to view attempts for this quiz.' });
        }

        const attempts = await QuizAttempt.find({ quiz: quizId }).populate('user', 'name email');
        res.json(attempts);

    } catch (error) {
        console.error('Error fetching quiz attempts:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get a specific quiz attempt by its ID
// @route   GET /api/v1/quiz-attempts/:attemptId  (Note: Changed base path for clarity)
// @access  Private (Student who owns it, Instructor of the course, Admin)
exports.getQuizAttemptById = async (req, res) => {
    const { attemptId } = req.params;
    const userId = req.user.id;

    try {
        const attempt = await QuizAttempt.findById(attemptId)
            .populate('quiz', 'title lesson')
            .populate('user', 'name email'); // Populate user who made the attempt

        if (!attempt) {
            return res.status(404).json({ message: 'Quiz attempt not found' });
        }

        // Populate lesson and course for authorization check
        await attempt.populate({
            path: 'quiz.lesson',
            model: 'Lesson', // Explicitly state model if not directly in quiz schema
            select: 'course'
        });
        // This population above might be tricky. Let's get course via quiz.
        const quizDetails = await Quiz.findById(attempt.quiz._id).populate({path: 'lesson', select: 'course'});
        if (!quizDetails || !quizDetails.lesson || !quizDetails.lesson.course) {
            return res.status(500).json({message: "Could not retrieve course details for authorization."})
        }

        const courseId = quizDetails.lesson.course;
        const course = await Course.findById(courseId);
         if (!course) {
            return res.status(500).json({ message: 'Course associated with this attempt not found.' });
        }

        // Authorization:
        // 1. User who made the attempt.
        // 2. Instructor of the course.
        // 3. Admin.
        const user = await User.findById(userId);
        if (!user || (attempt.user._id.toString() !== userId && course.instructor.toString() !== userId && !user.roles.includes('Admin'))) {
            return res.status(403).json({ message: 'User not authorized to view this quiz attempt.' });
        }

        res.json(attempt);
    } catch (error) {
        console.error('Error fetching quiz attempt by ID:', error);
        if (error.kind === 'ObjectId') {
             return res.status(400).json({ message: 'Invalid attempt ID format.' });
        }
        res.status(500).json({ message: 'Server error' });
    }
};
