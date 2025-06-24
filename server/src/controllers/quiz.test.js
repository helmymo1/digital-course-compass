const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../index'); // Load the Express app

// Import models
const User = require('../models/User');
const Course = require('../models/Course');
const Lesson = require('../models/Lesson');
const Quiz = require('../models/Quiz');

// Set a default JWT_SECRET for testing if not already set
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret-key-for-quiz-tests';

let mongoServer;
let adminUser, instructorUser, studentUser;
let adminToken, instructorToken, studentToken;
let testCourse, testLesson;

// Helper function to login a user and get a token
const loginUser = async (email, password) => {
    const res = await request(app)
        .post('/api/v1/auth/login')
        .send({ email, password });
    return res.body.token;
};

beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);

    // Create users with different roles
    instructorUser = await User.create({
        name: 'Instructor User',
        email: 'instructor@example.com',
        password: 'password123',
        roles: ['Instructor'],
        emailVerified: true,
    });
    adminUser = await User.create({
        name: 'Admin User',
        email: 'admin@example.com',
        password: 'password123',
        roles: ['Admin'],
        emailVerified: true,
    });
    studentUser = await User.create({
        name: 'Student User',
        email: 'student@example.com',
        password: 'password123',
        roles: ['Student'],
        emailVerified: true,
    });

    // Log in users to get tokens
    instructorToken = await loginUser('instructor@example.com', 'password123');
    adminToken = await loginUser('admin@example.com', 'password123');
    studentToken = await loginUser('student@example.com', 'password123');
});

afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
});

beforeEach(async () => {
    // Clear relevant collections, or specific documents if preferred
    await Course.deleteMany({});
    await Lesson.deleteMany({});
    await Quiz.deleteMany({});
    // Note: Users are created once in beforeAll and not cleared each time for this setup.
    // If tests modify users, clear and recreate them in beforeEach or manage state carefully.

    // Setup common test data
    testCourse = await Course.create({
        title: 'Test Course for Quizzes',
        description: 'A course to test quiz functionality.',
        instructor: instructorUser._id,
        category: 'Development',
        price: 100,
        status: 'published',
    });

    testLesson = await Lesson.create({
        module: new mongoose.Types.ObjectId(), // Dummy module ID
        course: testCourse._id,
        title: 'Test Lesson for Quiz',
        lessonType: 'quiz', // Important: lessonType must be 'quiz'
        content: 'This lesson will have a quiz.',
        order: 1,
    });
});

describe('Quiz Controller - POST /api/v1/lessons/:lessonId/quiz', () => {
    const getCreateQuizUrl = (lessonId) => `/api/v1/lessons/${lessonId}/quiz`;

    const validQuizData = {
        title: 'My First Quiz',
        questions: [
            {
                questionText: 'What is 2+2?',
                questionType: 'single-choice',
                options: [
                    { text: '3', isCorrect: false },
                    { text: '4', isCorrect: true },
                    { text: '5', isCorrect: false },
                ],
            },
            {
                questionText: 'Is the sky blue?',
                questionType: 'true-false',
                options: [
                    { text: 'True', isCorrect: true },
                    { text: 'False', isCorrect: false },
                ],
            },
        ],
        passingScorePercentage: 70,
    };

    it('should create a quiz for a lesson successfully by an authorized instructor', async () => {
        const res = await request(app)
            .post(getCreateQuizUrl(testLesson._id))
            .set('Authorization', `Bearer ${instructorToken}`)
            .send(validQuizData);

        expect(res.statusCode).toEqual(201);
        expect(res.body).toHaveProperty('_id');
        expect(res.body.title).toBe(validQuizData.title);
        expect(res.body.lesson.toString()).toBe(testLesson._id.toString());
        expect(res.body.questions.length).toBe(validQuizData.questions.length);
        expect(res.body.passingScorePercentage).toBe(validQuizData.passingScorePercentage);

        const dbQuiz = await Quiz.findById(res.body._id);
        expect(dbQuiz).toBeTruthy();
        expect(dbQuiz.title).toBe(validQuizData.title);
    });

    it('should create a quiz for a lesson successfully by an admin', async () => {
        const res = await request(app)
            .post(getCreateQuizUrl(testLesson._id))
            .set('Authorization', `Bearer ${adminToken}`)
            .send(validQuizData);

        expect(res.statusCode).toEqual(201);
        expect(res.body).toHaveProperty('_id');
        expect(res.body.title).toBe(validQuizData.title);
    });

    it('should return 403 if user is not an instructor or admin (e.g., student)', async () => {
        const res = await request(app)
            .post(getCreateQuizUrl(testLesson._id))
            .set('Authorization', `Bearer ${studentToken}`)
            .send(validQuizData);

        expect(res.statusCode).toEqual(403);
        // Message might vary based on checkRole vs controller logic, adjust as needed
        expect(res.body.message).toMatch(/User not authorized/i);
    });

    it('should return 401 if no token is provided', async () => {
        const res = await request(app)
            .post(getCreateQuizUrl(testLesson._id))
            .send(validQuizData);

        expect(res.statusCode).toEqual(401); // Assuming protect middleware sends 401
    });

    it('should return 400 if a quiz already exists for the lesson', async () => {
        // Create a quiz first
        await Quiz.create({ ...validQuizData, lesson: testLesson._id });

        const res = await request(app)
            .post(getCreateQuizUrl(testLesson._id))
            .set('Authorization', `Bearer ${instructorToken}`)
            .send(validQuizData);

        expect(res.statusCode).toEqual(400);
        expect(res.body.message).toMatch(/A quiz already exists for this lesson/i);
    });

    it('should return 404 if lesson does not exist', async () => {
        const nonExistentLessonId = new mongoose.Types.ObjectId();
        const res = await request(app)
            .post(getCreateQuizUrl(nonExistentLessonId))
            .set('Authorization', `Bearer ${instructorToken}`)
            .send(validQuizData);

        expect(res.statusCode).toEqual(404);
        expect(res.body.message).toMatch(/Lesson not found/i);
    });

    it('should return 400 if lesson type is not "quiz"', async () => {
        const textLesson = await Lesson.create({
            module: new mongoose.Types.ObjectId(),
            course: testCourse._id,
            title: 'Text Lesson, Not Quiz',
            lessonType: 'text', // Not 'quiz'
            content: 'Some text content.',
            order: 2,
        });

        const res = await request(app)
            .post(getCreateQuizUrl(textLesson._id))
            .set('Authorization', `Bearer ${instructorToken}`)
            .send(validQuizData);

        expect(res.statusCode).toEqual(400);
        expect(res.body.message).toMatch(/Lesson is not of type 'quiz'/i);
    });

    it('should return 400 for missing quiz title (validation error)', async () => {
        const invalidData = { ...validQuizData, title: '' }; // Missing title
        const res = await request(app)
            .post(getCreateQuizUrl(testLesson._id))
            .set('Authorization', `Bearer ${instructorToken}`)
            .send(invalidData);

        expect(res.statusCode).toEqual(400);
        // Mongoose validation error message might vary slightly
        expect(res.body.message).toMatch(/validation failed: title: Path `title` is required/i);
    });

    it('should return 400 for invalid question structure (e.g., missing questionText)', async () => {
        const invalidQuestionData = {
            ...validQuizData,
            questions: [
                {
                    // questionText: 'Missing text', // Missing questionText
                    questionType: 'single-choice',
                    options: [{ text: 'A', isCorrect: true }],
                }
            ]
        };
        const res = await request(app)
            .post(getCreateQuizUrl(testLesson._id))
            .set('Authorization', `Bearer ${instructorToken}`)
            .send(invalidQuestionData);

        expect(res.statusCode).toEqual(400);
        expect(res.body.message).toMatch(/validation failed: questions.0.questionText: Path `questionText` is required/i);
    });
});

describe('Quiz Controller - GET /api/v1/quizzes/:quizId', () => {
    const getQuizUrl = (quizId) => `/api/v1/quizzes/${quizId}`;
    let existingQuiz;

    beforeEach(async () => {
        existingQuiz = await Quiz.create({
            lesson: testLesson._id,
            title: 'Existing Quiz Title',
            questions: [{ questionText: 'Q1?', questionType: 'true-false', options: [{text: 'True', isCorrect: true}] }],
            passingScorePercentage: 50,
        });
    });

    it('should get a quiz by its ID successfully for an authorized user (instructor)', async () => {
        const res = await request(app)
            .get(getQuizUrl(existingQuiz._id))
            .set('Authorization', `Bearer ${instructorToken}`);

        expect(res.statusCode).toEqual(200);
        expect(res.body._id.toString()).toBe(existingQuiz._id.toString());
        expect(res.body.title).toBe(existingQuiz.title);
    });

    // TODO: Add tests for student access (once enrollment & permissions are fully fleshed out)
    // For now, assuming studentToken might not have direct access unless enrolled and quiz controller explicitly allows.
    // The getQuizById controller has a TODO for full permission checks.

    it('should return 404 if quiz does not exist', async () => {
        const nonExistentQuizId = new mongoose.Types.ObjectId();
        const res = await request(app)
            .get(getQuizUrl(nonExistentQuizId))
            .set('Authorization', `Bearer ${instructorToken}`);

        expect(res.statusCode).toEqual(404);
        expect(res.body.message).toMatch(/Quiz not found/i);
    });

    it('should return 401 if no token is provided', async () => {
        const res = await request(app)
            .get(getQuizUrl(existingQuiz._id));
        expect(res.statusCode).toEqual(401);
    });
});

describe('Quiz Controller - GET /api/v1/lessons/:lessonId/quiz', () => {
    const getQuizByLessonUrl = (lessonId) => `/api/v1/lessons/${lessonId}/quiz`;
    let quizForLesson;

    beforeEach(async () => {
        quizForLesson = await Quiz.create({
            lesson: testLesson._id,
            title: 'Quiz for Specific Lesson',
            questions: [{ questionText: 'Q?', questionType: 'true-false', options: [{text: 'T', isCorrect: true}]}],
            passingScorePercentage: 60,
        });
    });

    it('should get the quiz for a given lesson ID successfully', async () => {
        const res = await request(app)
            .get(getQuizByLessonUrl(testLesson._id))
            .set('Authorization', `Bearer ${instructorToken}`);

        expect(res.statusCode).toEqual(200);
        expect(res.body._id.toString()).toBe(quizForLesson._id.toString());
        expect(res.body.lesson.toString()).toBe(testLesson._id.toString());
    });

    it('should return 404 if no quiz exists for the lesson', async () => {
        const lessonWithNoQuiz = await Lesson.create({
            module: new mongoose.Types.ObjectId(),
            course: testCourse._id,
            title: 'Lesson With No Quiz',
            lessonType: 'quiz', // Still a quiz type lesson, but no quiz document linked
            order: 3,
        });
        const res = await request(app)
            .get(getQuizByLessonUrl(lessonWithNoQuiz._id))
            .set('Authorization', `Bearer ${instructorToken}`);

        expect(res.statusCode).toEqual(404);
        expect(res.body.message).toMatch(/No quiz found for this lesson/i);
    });

    it('should return 404 if the lesson itself does not exist', async () => {
        const nonExistentLessonId = new mongoose.Types.ObjectId();
        const res = await request(app)
            .get(getQuizByLessonUrl(nonExistentLessonId))
            .set('Authorization', `Bearer ${instructorToken}`);

        expect(res.statusCode).toEqual(404);
        // This message comes from the lesson check in the controller
        expect(res.body.message).toMatch(/Lesson not found/i);
    });
});

describe('Quiz Controller - PUT /api/v1/quizzes/:quizId', () => {
    const getUpdateQuizUrl = (quizId) => `/api/v1/quizzes/${quizId}`;
    let quizToUpdate;
    const updateData = {
        title: 'Updated Quiz Title',
        questions: [
            {
                questionText: 'Updated Q1?',
                questionType: 'single-choice',
                options: [{ text: 'Yes', isCorrect: true }, { text: 'No', isCorrect: false }],
            }
        ],
        passingScorePercentage: 85,
    };

    beforeEach(async () => {
        quizToUpdate = await Quiz.create({
            lesson: testLesson._id,
            title: 'Original Title',
            questions: [{ questionText: 'Original Q?', questionType: 'true-false', options: [{text: 'Original', isCorrect: true}]}],
            passingScorePercentage: 50,
        });
    });

    it('should update a quiz successfully by an authorized instructor', async () => {
        const res = await request(app)
            .put(getUpdateQuizUrl(quizToUpdate._id))
            .set('Authorization', `Bearer ${instructorToken}`)
            .send(updateData);

        expect(res.statusCode).toEqual(200);
        expect(res.body.title).toBe(updateData.title);
        expect(res.body.questions.length).toBe(updateData.questions.length);
        expect(res.body.questions[0].questionText).toBe(updateData.questions[0].questionText);
        expect(res.body.passingScorePercentage).toBe(updateData.passingScorePercentage);

        const dbQuiz = await Quiz.findById(quizToUpdate._id);
        expect(dbQuiz.title).toBe(updateData.title);
    });

    it('should be updatable by an admin', async () => {
         const res = await request(app)
            .put(getUpdateQuizUrl(quizToUpdate._id))
            .set('Authorization', `Bearer ${adminToken}`)
            .send(updateData);
        expect(res.statusCode).toEqual(200);
        expect(res.body.title).toBe(updateData.title);
    });

    it('should return 403 if user is not the course instructor or admin', async () => {
        // Create a course and lesson by another instructor
        const otherInstructor = await User.create({ name: 'Other Instructor', email: 'other@example.com', password: 'password123', roles: ['Instructor'], emailVerified: true });
        const otherCourse = await Course.create({ title: 'Other Course', instructor: otherInstructor._id, status: 'published' });
        const otherLesson = await Lesson.create({ module: new mongoose.Types.ObjectId(), course: otherCourse._id, title: 'Other Lesson', lessonType: 'quiz', order: 1 });
        const quizOfOtherInstructor = await Quiz.create({ lesson: otherLesson._id, title: 'Protected Quiz' });

        const res = await request(app)
            .put(getUpdateQuizUrl(quizOfOtherInstructor._id))
            .set('Authorization', `Bearer ${instructorToken}`) // Current instructorToken is for instructorUser, not otherInstructor
            .send(updateData);

        expect(res.statusCode).toEqual(403);
        expect(res.body.message).toMatch(/User not authorized to update this quiz/i);
    });

    it('should return 404 if quiz to update does not exist', async () => {
        const nonExistentQuizId = new mongoose.Types.ObjectId();
        const res = await request(app)
            .put(getUpdateQuizUrl(nonExistentQuizId))
            .set('Authorization', `Bearer ${instructorToken}`)
            .send(updateData);

        expect(res.statusCode).toEqual(404);
    });

    it('should return 400 for validation error during update (e.g. empty title)', async () => {
        const invalidUpdateData = { ...updateData, title: "" };
        const res = await request(app)
            .put(getUpdateQuizUrl(quizToUpdate._id))
            .set('Authorization', `Bearer ${instructorToken}`)
            .send(invalidUpdateData);

        expect(res.statusCode).toEqual(400);
        expect(res.body.message).toMatch(/validation failed: title: Path `title` is required/i);
    });
});

describe('Quiz Controller - DELETE /api/v1/quizzes/:quizId', () => {
    const getDeleteQuizUrl = (quizId) => `/api/v1/quizzes/${quizId}`;
    let quizToDelete;

    beforeEach(async () => {
        quizToDelete = await Quiz.create({
            lesson: testLesson._id,
            title: 'Quiz to be Deleted',
            questions: [{ questionText: 'Q?', questionType: 'true-false', options: [{text: 'T', isCorrect: true}]}],
        });
    });

    it('should delete a quiz successfully by an authorized instructor', async () => {
        const res = await request(app)
            .delete(getDeleteQuizUrl(quizToDelete._id))
            .set('Authorization', `Bearer ${instructorToken}`);

        expect(res.statusCode).toEqual(200);
        expect(res.body.message).toMatch(/Quiz deleted successfully/i);

        const dbQuiz = await Quiz.findById(quizToDelete._id);
        expect(dbQuiz).toBeNull();
    });

    it('should be deletable by an admin', async () => {
        const res = await request(app)
            .delete(getDeleteQuizUrl(quizToDelete._id))
            .set('Authorization', `Bearer ${adminToken}`);

        expect(res.statusCode).toEqual(200);
        const dbQuiz = await Quiz.findById(quizToDelete._id);
        expect(dbQuiz).toBeNull();
    });

    it('should return 403 if user is not the course instructor or admin', async () => {
        const otherInstructor = await User.create({ name: 'Other Instructor Del', email: 'otherdel@example.com', password: 'password123', roles: ['Instructor'], emailVerified: true });
        const otherCourse = await Course.create({ title: 'Other Course Del', instructor: otherInstructor._id, status: 'published' });
        const otherLesson = await Lesson.create({ module: new mongoose.Types.ObjectId(), course: otherCourse._id, title: 'Other Lesson Del', lessonType: 'quiz', order: 1 });
        const quizOfOtherInstructor = await Quiz.create({ lesson: otherLesson._id, title: 'Protected Quiz Del' });

        const res = await request(app)
            .delete(getDeleteQuizUrl(quizOfOtherInstructor._id))
            .set('Authorization', `Bearer ${instructorToken}`)
            .send();

        expect(res.statusCode).toEqual(403);
    });

    it('should return 404 if quiz to delete does not exist', async () => {
        const nonExistentQuizId = new mongoose.Types.ObjectId();
        const res = await request(app)
            .delete(getDeleteQuizUrl(nonExistentQuizId))
            .set('Authorization', `Bearer ${instructorToken}`);

        expect(res.statusCode).toEqual(404);
    });
});
