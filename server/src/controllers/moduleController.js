const Module = require('../models/Module');
const Course = require('../models/Course');
const asyncHandler = require('express-async-handler'); // Assuming you have this for error handling

// @desc    Create a new module for a course
// @route   POST /api/v1/courses/:courseId/modules
// @access  Private/Instructor/Admin
exports.createModule = asyncHandler(async (req, res) => {
    const { title, description, order } = req.body;
    const { courseId } = req.params;

    const course = await Course.findById(courseId);
    if (!course) {
        res.status(404);
        throw new Error('Course not found');
    }

    // Optional: Check if logged-in user is the instructor of the course or an Admin
    // if (course.instructor.toString() !== req.user.id && !req.user.roles.includes('Admin')) {
    //     res.status(403);
    //     throw new Error('User not authorized to add modules to this course');
    // }

    const module = new Module({
        course: courseId,
        title,
        description,
        order,
    });

    const createdModule = await module.save();
    res.status(201).json(createdModule);
});

// @desc    Get all modules for a course
// @route   GET /api/v1/courses/:courseId/modules
// @access  Public (or Private if only for enrolled students/instructors)
exports.getModulesByCourse = asyncHandler(async (req, res) => {
    const { courseId } = req.params;

    const course = await Course.findById(courseId);
    if (!course) {
        res.status(404);
        throw new Error('Course not found');
    }

    const modules = await Module.find({ course: courseId }).sort('order');
    res.status(200).json(modules);
});

// @desc    Get a single module by ID
// @route   GET /api/v1/modules/:moduleId
// @access  Public (or Private)
exports.getModuleById = asyncHandler(async (req, res) => {
    const module = await Module.findById(req.params.moduleId).populate('course', 'title');
    if (!module) {
        res.status(404);
        throw new Error('Module not found');
    }
    res.status(200).json(module);
});

// @desc    Update a module
// @route   PUT /api/v1/modules/:moduleId
// @access  Private/Instructor/Admin
exports.updateModule = asyncHandler(async (req, res) => {
    const { title, description, order } = req.body;
    const module = await Module.findById(req.params.moduleId);

    if (!module) {
        res.status(404);
        throw new Error('Module not found');
    }

    // Optional: Authorization check - is user instructor of module.course or Admin
    // const course = await Course.findById(module.course);
    // if (course.instructor.toString() !== req.user.id && !req.user.roles.includes('Admin')) {
    //     res.status(403);
    //     throw new Error('User not authorized to update this module');
    // }

    module.title = title || module.title;
    module.description = description || module.description;
    module.order = order === undefined ? module.order : order;

    const updatedModule = await module.save();
    res.status(200).json(updatedModule);
});

// @desc    Delete a module
// @route   DELETE /api/v1/modules/:moduleId
// @access  Private/Instructor/Admin
exports.deleteModule = asyncHandler(async (req, res) => {
    const module = await Module.findById(req.params.moduleId);

    if (!module) {
        res.status(404);
        throw new Error('Module not found');
    }

    // Optional: Authorization check
    // const course = await Course.findById(module.course);
    // if (course.instructor.toString() !== req.user.id && !req.user.roles.includes('Admin')) {
    //     res.status(403);
    //     throw new Error('User not authorized to delete this module');
    // }

    // TODO: Consider what happens to lessons within this module. Delete them? Unlink them?
    // For now, just deleting the module. Add Lesson.deleteMany({ module: module._id }) if cascading delete is desired.

    await module.remove(); // or module.deleteOne() in newer mongoose
    res.status(200).json({ message: 'Module removed' });
});
