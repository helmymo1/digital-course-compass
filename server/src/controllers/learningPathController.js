const LearningPath = require('../models/LearningPath');
const UserLearningPath = require('../models/UserLearningPath');
const Course = require('../models/Course'); // For validating courses in a path
const asyncHandler = require('express-async-handler');

// @desc    Create a new learning path
// @route   POST /api/v1/learning-paths
// @access  Private/Admin (or Instructor if they can create paths)
exports.createLearningPath = asyncHandler(async (req, res) => {
    const { title, description, courses, targetAudience, isActive } = req.body;
    // courses should be an array of objects: [{ course: ObjectId, order: Number }]

    // Validate that all course IDs in the courses array are valid
    if (courses && courses.length > 0) {
        for (const item of courses) {
            if (!item.course || !await Course.findById(item.course)) {
                res.status(400);
                throw new Error(`Invalid course ID found in learning path: ${item.course}`);
            }
            if (item.order === undefined || typeof item.order !== 'number') {
                res.status(400);
                throw new Error('Each course in a learning path must have a numeric order.');
            }
        }
    }

    const learningPath = new LearningPath({
        title,
        description,
        courses,
        targetAudience,
        isActive,
        // createdBy: req.user._id // If tracking who created it
    });

    const createdPath = await learningPath.save();
    res.status(201).json(createdPath);
});

// @desc    Get all learning paths
// @route   GET /api/v1/learning-paths
// @access  Public (or Private for enrolled/specific roles)
exports.getAllLearningPaths = asyncHandler(async (req, res) => {
    // Filter for active paths for non-admins, or add query param for status
    const query = req.user && req.user.roles.includes('Admin') ? {} : { isActive: true };

    const paths = await LearningPath.find(query)
        .populate({
            path: 'courses.course',
            select: 'title description instructor category price', // Select fields you need
            populate: { path: 'instructor', select: 'name' }
        })
        .sort('title');

    res.status(200).json(paths);
});

// @desc    Get a single learning path by ID
// @route   GET /api/v1/learning-paths/:pathId
// @access  Public (or Private)
exports.getLearningPathById = asyncHandler(async (req, res) => {
    const path = await LearningPath.findById(req.params.pathId)
        .populate({
            path: 'courses.course',
            select: 'title description instructor category price',
            populate: { path: 'instructor', select: 'name' }
        });

    if (!path) {
        res.status(404);
        throw new Error('Learning path not found');
    }
    if (!path.isActive && !(req.user && req.user.roles.includes('Admin'))) {
        res.status(403);
        throw new Error('This learning path is not currently active.');
    }
    res.status(200).json(path);
});

// @desc    Update a learning path
// @route   PUT /api/v1/learning-paths/:pathId
// @access  Private/Admin
exports.updateLearningPath = asyncHandler(async (req, res) => {
    const { title, description, courses, targetAudience, isActive } = req.body;
    const path = await LearningPath.findById(req.params.pathId);

    if (!path) {
        res.status(404);
        throw new Error('Learning path not found');
    }

    // Authorization check (e.g., only Admin or original creator if applicable)
    // if (!req.user.roles.includes('Admin')) { ... }

    if (courses && courses.length > 0) {
        for (const item of courses) {
            if (!item.course || !await Course.findById(item.course)) {
                res.status(400);
                throw new Error(`Invalid course ID found in learning path: ${item.course}`);
            }
             if (item.order === undefined || typeof item.order !== 'number') {
                res.status(400);
                throw new Error('Each course in a learning path must have a numeric order.');
            }
        }
    }

    path.title = title !== undefined ? title : path.title;
    path.description = description !== undefined ? description : path.description;
    path.courses = courses !== undefined ? courses : path.courses;
    path.targetAudience = targetAudience !== undefined ? targetAudience : path.targetAudience;
    path.isActive = isActive !== undefined ? isActive : path.isActive;

    const updatedPath = await path.save();
    res.status(200).json(updatedPath);
});

// @desc    Delete a learning path
// @route   DELETE /api/v1/learning-paths/:pathId
// @access  Private/Admin
exports.deleteLearningPath = asyncHandler(async (req, res) => {
    const path = await LearningPath.findById(req.params.pathId);
    if (!path) {
        res.status(404);
        throw new Error('Learning path not found');
    }
    // Consider implications: what happens to UserLearningPath records?
    // await UserLearningPath.deleteMany({ learningPath: path._id });
    await path.deleteOne();
    res.status(200).json({ message: 'Learning path removed' });
});


// --- User specific Learning Path actions ---

// @desc    Enroll user in a learning path (or start it)
// @route   POST /api/v1/learning-paths/:pathId/enroll
// @access  Private (Authenticated User)
exports.enrollInLearningPath = asyncHandler(async (req, res) => {
    const { pathId } = req.params;
    const userId = req.user._id;

    const learningPath = await LearningPath.findById(pathId);
    if (!learningPath || !learningPath.isActive) {
        res.status(404);
        throw new Error('Learning path not found or not active.');
    }

    let userLearningPath = await UserLearningPath.findOne({ user: userId, learningPath: pathId });

    if (userLearningPath) {
        // User is already enrolled, maybe update status or just return current status
        // For now, let's assume re-enrolling doesn't change much if already 'in-progress' or 'not-started'
        if (userLearningPath.status === 'completed') {
            // Optionally allow re-starting a completed path
             userLearningPath.status = 'in-progress'; // Or 'not-started'
             userLearningPath.completedAt = null;
             userLearningPath.startedAt = Date.now();
        } else if (userLearningPath.status === 'not-started'){
            userLearningPath.status = 'in-progress';
            userLearningPath.startedAt = Date.now();
        }
        // If 'in-progress', no change by default
    } else {
        userLearningPath = new UserLearningPath({
            user: userId,
            learningPath: pathId,
            status: 'in-progress', // Or 'not-started' and let user explicitly start
            startedAt: Date.now()
        });
    }

    const savedUserPath = await userLearningPath.save();
    res.status(200).json(savedUserPath);
});

// @desc    Get logged-in user's learning paths and their progress
// @route   GET /api/v1/me/learning-paths
// @access  Private (Authenticated User)
exports.getMyLearningPaths = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const myPaths = await UserLearningPath.find({ user: userId })
        .populate({
            path: 'learningPath',
            populate: {
                path: 'courses.course',
                select: 'title description' // Fields for the course
            }
        });

    // Further enhancement: Calculate progressPercentage for each learning path
    // based on completion of courses within it, using StudentProgress or Enrollment data.
    // This would be more involved. For now, just returning the UserLearningPath records.

    res.status(200).json(myPaths);
});

// @desc    Update progress on a user's learning path (e.g., mark as completed)
// @route   PUT /api/v1/me/learning-paths/:userPathId
// @access  Private (Authenticated User, owner)
exports.updateMyLearningPathStatus = asyncHandler(async (req, res) => {
    const { userPathId } = req.params; // This is UserLearningPath _id
    const userId = req.user._id;
    const { status } = req.body; // e.g., "completed"

    if (!status || !['not-started', 'in-progress', 'completed'].includes(status)) {
        res.status(400);
        throw new Error('Invalid status provided.');
    }

    const userLearningPath = await UserLearningPath.findById(userPathId);

    if (!userLearningPath) {
        res.status(404);
        throw new Error('User learning path enrollment not found.');
    }

    if (!userLearningPath.user.equals(userId)) {
        res.status(403);
        throw new Error('User not authorized to update this learning path enrollment.');
    }

    userLearningPath.status = status;
    if (status === 'completed' && !userLearningPath.completedAt) {
        userLearningPath.completedAt = Date.now();
    } else if (status !== 'completed') {
        userLearningPath.completedAt = null;
    }
    if (status === 'in-progress' && !userLearningPath.startedAt) {
        userLearningPath.startedAt = Date.now();
    }


    const updatedEntry = await userLearningPath.save();
    res.status(200).json(updatedEntry);
});
