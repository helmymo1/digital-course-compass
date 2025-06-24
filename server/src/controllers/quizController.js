const Quiz = require('../models/Quiz');
const Lesson = require('../models/Lesson');
const Course = require('../models/Course'); // To check instructor permissions
const User = require('../models/User'); // To check user roles

// @desc    Get a quiz by its ID
// @route   GET /api/v1/quizzes/:quizId
// @access  Private (Students enrolled in the course, Instructor of the course, Admin)
exports.getQuizById = async (req, res) => {
    try {
        const quiz = await Quiz.findById(req.params.quizId).populate({
            path: 'lesson',
            select: 'course title'
        });
        if (!quiz) {
            return res.status(404).json({ message: 'Quiz not found' });
        }
        // TODO: Implement full permission checks (student enrollment, instructor ownership)
        res.json(quiz);
    } catch (error) {
        console.error('Error getting quiz by ID:', error);
        if (error.kind === 'ObjectId') {
            return res.status(400).json({ message: 'Invalid quiz ID format.' });
        }
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get a quiz by its lesson ID
// @route   GET /api/v1/lessons/:lessonId/quiz
// @access  Private (Students enrolled, Instructor, Admin)
exports.getQuizByLesson = async (req, res) => {
    const { lessonId } = req.params;
    try {
        const lesson = await Lesson.findById(lessonId);
        if (!lesson) {
            return res.status(404).json({ message: 'Lesson not found.' });
        }

        const quiz = await Quiz.findOne({ lesson: lessonId }).populate({
            path: 'lesson', // Though we have lessonId, populating helps confirm & get other details if needed
            select: 'course title'
        });

        if (!quiz) {
            return res.status(404).json({ message: 'No quiz found for this lesson.' });
        }
        // TODO: Implement full permission checks
        res.json(quiz);
    } catch (error) {
        console.error('Error fetching quiz by lesson ID:', error);
        if (error.kind === 'ObjectId') {
            return res.status(400).json({ message: 'Invalid lesson ID format.' });
        }
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Create a quiz for a lesson
// @route   POST /api/v1/lessons/:lessonId/quiz
// @access  Private (Instructor of the course, Admin)
exports.createQuizForLesson = async (req, res) => {
    const { lessonId } = req.params;
    const { title, questions, passingScorePercentage } = req.body;
    const userId = req.user.id;

    try {
        const lesson = await Lesson.findById(lessonId).populate('course'); // course for auth check
        if (!lesson) {
            return res.status(404).json({ message: 'Lesson not found' });
        }

        const existingQuiz = await Quiz.findOne({ lesson: lessonId });
        if (existingQuiz) {
            return res.status(400).json({ message: 'A quiz already exists for this lesson. Use PUT to update it.' });
        }

        // Authorization: User must be an instructor for the course this lesson belongs to, or an Admin.
        // Assuming lesson.course correctly populates the course ID.
        const course = await Course.findById(lesson.course);
        if (!course) {
            return res.status(404).json({ message: 'Course not found for this lesson.' });
        }

        const user = await User.findById(userId);
        if (!user || (course.instructor.toString() !== userId && !user.roles.includes('Admin'))) {
            return res.status(403).json({ message: 'User not authorized to create a quiz for this lesson.' });
        }

        if (lesson.lessonType !== 'quiz') {
            // Consider if this should auto-update lesson.lessonType or be a strict requirement.
            // For now, strict.
            return res.status(400).json({ message: `Lesson is not of type 'quiz'. Please update the lesson type first.`});
        }

        const newQuiz = new Quiz({
            lesson: lessonId,
            title,
            questions,
            passingScorePercentage
        });

        await newQuiz.save();
        res.status(201).json(newQuiz);

    } catch (error) {
        console.error('Error creating quiz for lesson:', error);
        if (error.name === 'ValidationError') {
            return res.status(400).json({ message: error.message });
        }
        if (error.kind === 'ObjectId') {
            return res.status(400).json({ message: 'Invalid lesson ID format.' });
        }
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Update a quiz
// @route   PUT /api/v1/quizzes/:quizId
// @access  Private (Instructor of the course, Admin)
exports.updateQuiz = async (req, res) => {
    const { quizId } = req.params;
    const { title, questions, passingScorePercentage } = req.body;
    const userId = req.user.id;

    try {
        const quiz = await Quiz.findById(quizId).populate({
            path: 'lesson',
            populate: { path: 'course' } // Populate course from lesson for auth
        });

        if (!quiz) {
            return res.status(404).json({ message: 'Quiz not found' });
        }

        if (!quiz.lesson || !quiz.lesson.course) {
            return res.status(500).json({ message: "Failed to get lesson/course details for quiz authorization." });
        }

        const courseInstructorId = quiz.lesson.course.instructor;
        const user = await User.findById(userId);

        if (!user || (courseInstructorId.toString() !== userId && !user.roles.includes('Admin'))) {
            return res.status(403).json({ message: 'User not authorized to update this quiz.' });
        }

        if (title) quiz.title = title;
        if (questions) quiz.questions = questions;
        if (passingScorePercentage !== undefined) quiz.passingScorePercentage = passingScorePercentage;

        const updatedQuiz = await quiz.save();
        res.json(updatedQuiz);
    } catch (error) {
        console.error('Error updating quiz:', error);
        if (error.name === 'ValidationError') {
            return res.status(400).json({ message: error.message });
        }
        if (error.kind === 'ObjectId') {
            return res.status(400).json({ message: 'Invalid quiz ID format.' });
        }
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Delete a quiz
// @route   DELETE /api/v1/quizzes/:quizId
// @access  Private (Instructor of the course, Admin)
exports.deleteQuiz = async (req, res) => {
    const { quizId } = req.params;
    const userId = req.user.id;

    try {
        const quiz = await Quiz.findById(quizId).populate({
            path: 'lesson',
            populate: { path: 'course' } // Populate course from lesson for auth
        });

        if (!quiz) {
            return res.status(404).json({ message: 'Quiz not found' });
        }

        if (!quiz.lesson || !quiz.lesson.course) {
            return res.status(500).json({ message: "Failed to get lesson/course details for quiz authorization." });
        }

        const courseInstructorId = quiz.lesson.course.instructor;
        const user = await User.findById(userId);

        if (!user || (courseInstructorId.toString() !== userId && !user.roles.includes('Admin'))) {
            return res.status(403).json({ message: 'User not authorized to delete this quiz.' });
        }

        await quiz.deleteOne();
        // Consider if lesson's type should be changed if it was 'quiz'
        res.json({ message: 'Quiz deleted successfully' });
    } catch (error) {
        console.error('Error deleting quiz:', error);
        if (error.kind === 'ObjectId') {
            return res.status(400).json({ message: 'Invalid quiz ID format.' });
        }
        res.status(500).json({ message: 'Server error' });
    }
};
