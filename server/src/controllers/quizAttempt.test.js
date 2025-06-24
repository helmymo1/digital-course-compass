const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../index'); // Load the Express app

// Import models
const User = require('../models/User');
const Course = require('../models/Course');
const Lesson = require('../models/Lesson');
const Quiz = require('../models/Quiz');
const QuizAttempt = require('../models/QuizAttempt');

process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret-key-for-quiz-attempt-tests';

let mongoServer;
let adminUser, instructorUser, studentUser, otherStudentUser;
let adminToken, instructorToken, studentToken, otherStudentToken;
let testCourse, testLesson, testQuiz;

const loginUser = async (email, password) => {
    const res = await request(app).post('/api/v1/auth/login').send({ email, password });
    return res.body.token;
};

beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);

    // Users
    instructorUser = await User.create({ name: 'Instructor User AT', email: 'instructor.at@example.com', password: 'password123', roles: ['Instructor'], emailVerified: true });
    adminUser = await User.create({ name: 'Admin User AT', email: 'admin.at@example.com', password: 'password123', roles: ['Admin'], emailVerified: true });
    studentUser = await User.create({ name: 'Student User AT', email: 'student.at@example.com', password: 'password123', roles: ['Student'], emailVerified: true });
    otherStudentUser = await User.create({ name: 'Other Student AT', email: 'other.student.at@example.com', password: 'password123', roles: ['Student'], emailVerified: true });

    instructorToken = await loginUser('instructor.at@example.com', 'password123');
    adminToken = await loginUser('admin.at@example.com', 'password123');
    studentToken = await loginUser('student.at@example.com', 'password123');
    otherStudentToken = await loginUser('other.student.at@example.com', 'password123');
});

afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
});

beforeEach(async () => {
    await Course.deleteMany({});
    await Lesson.deleteMany({});
    await Quiz.deleteMany({});
    await QuizAttempt.deleteMany({});

    testCourse = await Course.create({
        title: 'Test Course for Attempts',
        description: 'A course for quiz attempts.',
        instructor: instructorUser._id,
        category: 'Testing',
        status: 'published',
    });

    testLesson = await Lesson.create({
        module: new mongoose.Types.ObjectId(),
        course: testCourse._id,
        title: 'Test Lesson for Attempts',
        lessonType: 'quiz',
        order: 1,
    });

    testQuiz = await Quiz.create({
        lesson: testLesson._id,
        title: 'Attempt This Quiz!',
        questions: [
            { _id: new mongoose.Types.ObjectId(), questionText: 'Q1: 1+1=?', questionType: 'single-choice', options: [{ text: '1', isCorrect: false }, { _id: new mongoose.Types.ObjectId(), text: '2', isCorrect: true }] },
            { _id: new mongoose.Types.ObjectId(), questionText: 'Q2: Sky is green?', questionType: 'true-false', options: [{ text: 'True', isCorrect: false }, { _id: new mongoose.Types.ObjectId(), text: 'False', isCorrect: true }] },
            { _id: new mongoose.Types.ObjectId(), questionText: 'Q3: Capital of France?', questionType: 'short-answer', options: [{ text: 'Paris', isCorrect: true }] }
        ],
        passingScorePercentage: 60,
    });
    // Make sure options have _ids if we are referencing them
    testQuiz.questions[0].options[1]._id = testQuiz.questions[0].options[1]._id || new mongoose.Types.ObjectId();
    testQuiz.questions[1].options[1]._id = testQuiz.questions[1].options[1]._id || new mongoose.Types.ObjectId();
    await testQuiz.save();


    // TODO: For full authorization, studentUser should be enrolled in testCourse.
    // For now, controller logic for submitQuizAttempt does not deeply check enrollment status.
});

describe('Quiz Attempt Controller - POST /api/v1/quizzes/:quizId/attempts', () => {
    const getSubmitAttemptUrl = (quizId) => `/api/v1/quizzes/${quizId}/attempts`;

    it('should allow a student to submit a quiz attempt successfully', async () => {
        const attemptAnswers = [
            { questionId: testQuiz.questions[0]._id, selectedOptionId: testQuiz.questions[0].options.find(o => o.isCorrect)._id }, // Correct
            { questionId: testQuiz.questions[1]._id, selectedOptionValue: 'False' }, // Correct
            { questionId: testQuiz.questions[2]._id, answerText: 'Paris' } // Correct
        ];

        const res = await request(app)
            .post(getSubmitAttemptUrl(testQuiz._id))
            .set('Authorization', `Bearer ${studentToken}`)
            .send({ answers: attemptAnswers });

        expect(res.statusCode).toEqual(201);
        expect(res.body).toHaveProperty('_id');
        expect(res.body.quiz.toString()).toBe(testQuiz._id.toString());
        expect(res.body.user.toString()).toBe(studentUser._id.toString());
        expect(res.body.score).toBe(3); // All correct
        expect(res.body.totalQuestions).toBe(3);
        expect(res.body.percentageScore).toBe(100);
        expect(res.body.passed).toBe(true);
        expect(res.body.answers.length).toBe(3);
        expect(res.body.answers[0].isCorrect).toBe(true);
        expect(res.body.answers[1].isCorrect).toBe(true);
        expect(res.body.answers[2].isCorrect).toBe(true);

        const dbAttempt = await QuizAttempt.findById(res.body._id);
        expect(dbAttempt).toBeTruthy();
    });

    it('should calculate score correctly for partially correct answers', async () => {
        const attemptAnswers = [
            { questionId: testQuiz.questions[0]._id, selectedOptionId: testQuiz.questions[0].options.find(o => !o.isCorrect)._id }, // Incorrect
            { questionId: testQuiz.questions[1]._id, selectedOptionValue: 'False' }, // Correct
            { questionId: testQuiz.questions[2]._id, answerText: 'Lyon' } // Incorrect
        ];

        const res = await request(app)
            .post(getSubmitAttemptUrl(testQuiz._id))
            .set('Authorization', `Bearer ${studentToken}`)
            .send({ answers: attemptAnswers });

        expect(res.statusCode).toEqual(201);
        expect(res.body.score).toBe(1);
        expect(res.body.percentageScore).toBeCloseTo(33.33);
        expect(res.body.passed).toBe(false);
        expect(res.body.answers[0].isCorrect).toBe(false);
        expect(res.body.answers[1].isCorrect).toBe(true);
        expect(res.body.answers[2].isCorrect).toBe(false);
    });

    it('should return 403 if a non-student (e.g., instructor) tries to submit an attempt', async () => {
        const res = await request(app)
            .post(getSubmitAttemptUrl(testQuiz._id))
            .set('Authorization', `Bearer ${instructorToken}`)
            .send({ answers: [] });

        expect(res.statusCode).toEqual(403); // Based on checkRole(['Student'])
    });

    it('should return 400 if answers array is missing or empty', async () => {
        const res1 = await request(app)
            .post(getSubmitAttemptUrl(testQuiz._id))
            .set('Authorization', `Bearer ${studentToken}`)
            .send({}); // Missing answers
        expect(res1.statusCode).toEqual(400);
        expect(res1.body.message).toMatch(/Answers must be a non-empty array/i);

        const res2 = await request(app)
            .post(getSubmitAttemptUrl(testQuiz._id))
            .set('Authorization', `Bearer ${studentToken}`)
            .send({ answers: [] }); // Empty answers array
        expect(res2.statusCode).toEqual(400);
        expect(res2.body.message).toMatch(/Answers must be a non-empty array/i);
    });

    it('should return 404 if quiz does not exist', async () => {
        const nonExistentQuizId = new mongoose.Types.ObjectId();
        const res = await request(app)
            .post(getSubmitAttemptUrl(nonExistentQuizId))
            .set('Authorization', `Bearer ${studentToken}`)
            .send({ answers: [{ questionId: "someId", answerText: "someText"}] });
        expect(res.statusCode).toEqual(404);
        expect(res.body.message).toMatch(/Quiz not found/i);
    });
});

describe('Quiz Attempt Controller - GET /api/v1/quizzes/:quizId/attempts', () => {
    const getAllAttemptsUrl = (quizId) => `/api/v1/quizzes/${quizId}/attempts`;
    let attempt1, attempt2;

    beforeEach(async () => {
        attempt1 = await QuizAttempt.create({ quiz: testQuiz._id, user: studentUser._id, score: 1, totalQuestions: 3, percentageScore: 33.3, passed: false, answers: [] });
        attempt2 = await QuizAttempt.create({ quiz: testQuiz._id, user: otherStudentUser._id, score: 3, totalQuestions: 3, percentageScore: 100, passed: true, answers: [] });
    });

    it('should allow instructor to get all attempts for their quiz', async () => {
        const res = await request(app)
            .get(getAllAttemptsUrl(testQuiz._id))
            .set('Authorization', `Bearer ${instructorToken}`);

        expect(res.statusCode).toEqual(200);
        expect(res.body).toBeInstanceOf(Array);
        expect(res.body.length).toBe(2);
        // Check if user details are populated
        expect(res.body[0].user).toHaveProperty('name', studentUser.name);
        expect(res.body[1].user).toHaveProperty('name', otherStudentUser.name);
    });

    it('should allow admin to get all attempts for any quiz', async () => {
        const res = await request(app)
            .get(getAllAttemptsUrl(testQuiz._id))
            .set('Authorization', `Bearer ${adminToken}`);

        expect(res.statusCode).toEqual(200);
        expect(res.body.length).toBe(2);
    });

    it('should return 403 if a student tries to get all attempts', async () => {
        const res = await request(app)
            .get(getAllAttemptsUrl(testQuiz._id))
            .set('Authorization', `Bearer ${studentToken}`);
        expect(res.statusCode).toEqual(403); // checkRole(['Instructor', 'Admin'])
    });

    it('should return 404 if quiz does not exist', async () => {
        const nonExistentQuizId = new mongoose.Types.ObjectId();
        const res = await request(app)
            .get(getAllAttemptsUrl(nonExistentQuizId))
            .set('Authorization', `Bearer ${instructorToken}`);
        expect(res.statusCode).toEqual(404);
    });
});

describe('Quiz Attempt Controller - GET /api/v1/quiz-attempts/:attemptId', () => {
    const getAttemptByIdUrl = (attemptId) => `/api/v1/quiz-attempts/${attemptId}`;
    let studentAttempt, otherStudentAttempt;

    beforeEach(async() => {
        studentAttempt = await QuizAttempt.create({ quiz: testQuiz._id, user: studentUser._id, score: 2, totalQuestions: 3, percentageScore: 66.6, passed: true, answers: [] });
        otherStudentAttempt = await QuizAttempt.create({ quiz: testQuiz._id, user: otherStudentUser._id, score: 1, totalQuestions: 3, percentageScore: 33.3, passed: false, answers: [] });
    });

    it('should allow a student to get their own attempt by ID', async () => {
        const res = await request(app)
            .get(getAttemptByIdUrl(studentAttempt._id))
            .set('Authorization', `Bearer ${studentToken}`);

        expect(res.statusCode).toEqual(200);
        expect(res.body._id.toString()).toBe(studentAttempt._id.toString());
        expect(res.body.user.name).toBe(studentUser.name); // Check populated user
    });

    it('should allow an instructor of the course to get any attempt by ID for their quiz', async () => {
        const res = await request(app)
            .get(getAttemptByIdUrl(otherStudentAttempt._id)) // Instructor getting other student's attempt
            .set('Authorization', `Bearer ${instructorToken}`);

        expect(res.statusCode).toEqual(200);
        expect(res.body._id.toString()).toBe(otherStudentAttempt._id.toString());
    });

    it('should allow an admin to get any attempt by ID', async () => {
        const res = await request(app)
            .get(getAttemptByIdUrl(studentAttempt._id))
            .set('Authorization', `Bearer ${adminToken}`);

        expect(res.statusCode).toEqual(200);
        expect(res.body._id.toString()).toBe(studentAttempt._id.toString());
    });

    it('should return 403 if a student tries to get another student\'s attempt', async () => {
        const res = await request(app)
            .get(getAttemptByIdUrl(otherStudentAttempt._id)) // studentUser trying to get otherStudentUser's attempt
            .set('Authorization', `Bearer ${studentToken}`);

        expect(res.statusCode).toEqual(403);
        expect(res.body.message).toMatch(/User not authorized to view this quiz attempt/i);
    });

    it('should return 404 if attempt ID does not exist', async () => {
        const nonExistentAttemptId = new mongoose.Types.ObjectId();
        const res = await request(app)
            .get(getAttemptByIdUrl(nonExistentAttemptId))
            .set('Authorization', `Bearer ${studentToken}`);

        expect(res.statusCode).toEqual(404);
        expect(res.body.message).toMatch(/Quiz attempt not found/i);
    });
});
