const Lesson = require('../models/Lesson');
const Module = require('../models/Module');
const Course = require('../models/Course'); // For denormalized course ID on lesson
const asyncHandler = require('express-async-handler'); // Assuming this utility is available

// @desc    Create a new lesson for a module
// @route   POST /api/v1/modules/:moduleId/lessons
// @access  Private/Instructor/Admin
exports.createLesson = asyncHandler(async (req, res) => {
    const { title, lessonType, content, videoUrl, duration, order } = req.body;
    const { moduleId } = req.params;

    const module = await Module.findById(moduleId);
    if (!module) {
        res.status(404);
        throw new Error('Module not found');
    }

    // Optional: Authorization check if user can add lesson to this module
    // Example: Ensure req.user is Admin or instructor of module.course
    // const course = await Course.findById(module.course);
    // if (!(req.user.roles.includes('Admin') || course.instructor.equals(req.user._id))) {
    //     res.status(403);
    //     throw new Error('User not authorized to add lessons to this module');
    // }

    const lesson = new Lesson({
        module: moduleId,
        course: module.course, // Denormalize course ID for easier lookups
        title,
        lessonType,
        content,
        videoUrl,
        duration,
        order,
    });

    const createdLesson = await lesson.save();
    res.status(201).json(createdLesson);
});

// @desc    Get all lessons for a module
// @route   GET /api/v1/modules/:moduleId/lessons
// @access  Public (or Private based on enrollment/ownership)
exports.getLessonsByModule = asyncHandler(async (req, res) => {
    const { moduleId } = req.params;

    const moduleExists = await Module.findById(moduleId);
    if (!moduleExists) {
        res.status(404);
        throw new Error('Module not found');
    }

    // TODO: Add access control, e.g., only enrolled students or course instructors can see lessons
    const lessons = await Lesson.find({ module: moduleId }).sort('order');
    res.status(200).json(lessons);
});

// @desc    Get a single lesson by ID
// @route   GET /api/v1/lessons/:lessonId
// @access  Public (or Private)
exports.getLessonById = asyncHandler(async (req, res) => {
    const lesson = await Lesson.findById(req.params.lessonId).populate('module', 'title course');
    if (!lesson) {
        res.status(404);
        throw new Error('Lesson not found');
    }
    // TODO: Add access control here too
    res.status(200).json(lesson);
});

// @desc    Update a lesson
// @route   PUT /api/v1/lessons/:lessonId
// @access  Private/Instructor/Admin
exports.updateLesson = asyncHandler(async (req, res) => {
    const { title, lessonType, content, videoUrl, duration, order } = req.body;
    const lesson = await Lesson.findById(req.params.lessonId);

    if (!lesson) {
        res.status(404);
        throw new Error('Lesson not found');
    }

    // Optional: Authorization check (user is instructor of lesson.course or Admin)
    // const course = await Course.findById(lesson.course);
    // if (!(req.user.roles.includes('Admin') || course.instructor.equals(req.user._id))) {
    //     res.status(403);
    //     throw new Error('User not authorized to update this lesson');
    // }

    lesson.title = title !== undefined ? title : lesson.title;
    lesson.lessonType = lessonType !== undefined ? lessonType : lesson.lessonType;
    lesson.content = content !== undefined ? content : lesson.content;
    lesson.videoUrl = videoUrl !== undefined ? videoUrl : lesson.videoUrl;
    lesson.duration = duration !== undefined ? duration : lesson.duration;
    lesson.order = order !== undefined ? order : lesson.order;

    const updatedLesson = await lesson.save();
    res.status(200).json(updatedLesson);
});

// @desc    Delete a lesson
// @route   DELETE /api/v1/lessons/:lessonId
// @access  Private/Instructor/Admin
exports.deleteLesson = asyncHandler(async (req, res) => {
    const lesson = await Lesson.findById(req.params.lessonId);

    if (!lesson) {
        res.status(404);
        throw new Error('Lesson not found');
    }

    // Optional: Authorization check
    // const course = await Course.findById(lesson.course);
    // if (!(req.user.roles.includes('Admin') || course.instructor.equals(req.user._id))) {
    //     res.status(403);
    //     throw new Error('User not authorized to delete this lesson');
    // }

    // Consider implications: student progress, quiz attempts linked to this lesson.
    // await StudentProgress.deleteMany({ lesson: lesson._id }); // Example cleanup

    await lesson.deleteOne(); // Mongoose v5+ uses deleteOne() or deleteMany()
    res.status(200).json({ message: 'Lesson removed successfully' });
});
