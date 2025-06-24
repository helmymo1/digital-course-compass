const Course = require('../models/Course');
const User = require('../models/User'); // Needed to check instructor role

// @desc    Create a new course
// @route   POST /api/courses
// @access  Private (Instructor, Admin)
exports.createCourse = async (req, res) => {
  try {
    const { title, description, category, price } = req.body;
    const instructorId = req.user.id; // Assuming req.user is populated by auth middleware

    // Validate instructor
    const instructor = await User.findById(instructorId);
    if (!instructor || (!instructor.roles.includes('Instructor') && !instructor.roles.includes('Admin'))) {
      return res.status(403).json({ message: 'User does not have permission to create courses.' });
    }

    if (!title || !description) {
        return res.status(400).json({ message: 'Title and description are required.' });
    }

    const course = new Course({
      title,
      description,
      instructor: instructorId,
      category,
      price,
      // status defaults to 'draft'
    });

    const createdCourse = await course.save();
    res.status(201).json(createdCourse);
  } catch (error) {
    console.error('Error creating course:', error);
    // Check for Mongoose validation error
    if (error.name === 'ValidationError') {
        const messages = Object.values(error.errors).map(val => val.message);
        return res.status(400).json({ message: messages.join('. ') });
    }
    res.status(500).json({ message: 'Server error while creating course.' });
  }
};

// @desc    Get all courses
// @route   GET /api/courses
// @access  Public (with filtering for published courses for students)
exports.getAllCourses = async (req, res) => {
  try {
    const { category, status, instructor, sortBy, order = 'asc', page = 1, limit = 10 } = req.query;
    const query = {};

    if (category) {
      query.category = category;
    }

    // By default, non-authenticated or student users should only see 'published' courses.
    // Instructors/Admins can see all or filter by status.
    if (req.user && (req.user.roles.includes('Instructor') || req.user.roles.includes('Admin'))) {
        if (status) {
            query.status = status;
        }
    } else {
        query.status = 'published';
    }


    if (instructor) {
      query.instructor = instructor; // Assuming instructor ID is passed
    }

    const sortOptions = {};
    if (sortBy) {
        sortOptions[sortBy] = order === 'desc' ? -1 : 1;
    } else {
        sortOptions.createdAt = -1; // Default sort by newest
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const courses = await Course.find(query)
                                .populate('instructor', 'name email') // Populate instructor details
                                .sort(sortOptions)
                                .skip(skip)
                                .limit(limitNum);

    const totalCourses = await Course.countDocuments(query);

    res.json({
        courses,
        currentPage: pageNum,
        totalPages: Math.ceil(totalCourses / limitNum),
        totalCourses
    });
  } catch (error) {
    console.error('Error fetching courses:', error);
    res.status(500).json({ message: 'Server error while fetching courses.' });
  }
};

// @desc    Get a single course by ID
// @route   GET /api/courses/:id
// @access  Public (with restrictions for draft courses)
exports.getCourseById = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id).populate('instructor', 'name email');

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // If the course is a draft, only the instructor or an admin can view it.
    if (course.status === 'draft') {
        if (!req.user || !(req.user.id === course.instructor._id.toString() || req.user.roles.includes('Admin'))) {
            return res.status(403).json({ message: 'You do not have permission to view this course.' });
        }
    }

    res.json(course);
  } catch (error) {
    console.error('Error fetching course by ID:', error);
    if (error.kind === 'ObjectId') {
        return res.status(400).json({ message: 'Invalid course ID format.' });
    }
    res.status(500).json({ message: 'Server error while fetching course.' });
  }
};

// @desc    Update a course
// @route   PUT /api/courses/:id
// @access  Private (Instructor who owns course, Admin)
exports.updateCourse = async (req, res) => {
  try {
    const { title, description, category, price, status } = req.body;
    const courseId = req.params.id;
    const userId = req.user.id; // From auth middleware

    const course = await Course.findById(courseId);

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Check if the user is the instructor or an admin
    const user = await User.findById(userId);
    if (!user || (course.instructor.toString() !== userId && !user.roles.includes('Admin'))) {
      return res.status(403).json({ message: 'User not authorized to update this course' });
    }

    // Update fields if they are provided
    if (title) course.title = title;
    if (description) course.description = description;
    if (category) course.category = category;
    if (price !== undefined) course.price = price;
    if (status) course.status = status; // Add validation for allowed status values if needed

    const updatedCourse = await course.save();
    res.json(updatedCourse);
  } catch (error) {
    console.error('Error updating course:', error);
     if (error.name === 'ValidationError') {
        const messages = Object.values(error.errors).map(val => val.message);
        return res.status(400).json({ message: messages.join('. ') });
    }
    if (error.kind === 'ObjectId') {
        return res.status(400).json({ message: 'Invalid course ID format.' });
    }
    res.status(500).json({ message: 'Server error while updating course.' });
  }
};

// @desc    Delete a course
// @route   DELETE /api/courses/:id
// @access  Private (Instructor who owns course, Admin)
exports.deleteCourse = async (req, res) => {
  try {
    const courseId = req.params.id;
    const userId = req.user.id; // From auth middleware

    const course = await Course.findById(courseId);

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Check if the user is the instructor or an admin
    const user = await User.findById(userId);
     if (!user || (course.instructor.toString() !== userId && !user.roles.includes('Admin'))) {
      return res.status(403).json({ message: 'User not authorized to delete this course' });
    }

    await course.deleteOne(); // Mongoose v6+ uses deleteOne()
    res.json({ message: 'Course removed successfully' });
  } catch (error) {
    console.error('Error deleting course:', error);
    if (error.kind === 'ObjectId') {
        return res.status(400).json({ message: 'Invalid course ID format.' });
    }
    res.status(500).json({ message: 'Server error while deleting course.' });
  }
};

// @desc    Enroll in a course
// @route   POST /api/courses/:id/enroll
// @access  Private (Student)
exports.enrollCourse = async (req, res) => {
  try {
    const courseId = req.params.id;
    const userId = req.user.id; // From auth middleware
    const userRoles = req.user.roles; // from auth middleware

    // Ensure only users with 'Student' role can enroll
    if (!userRoles.includes('Student')) {
        return res.status(403).json({ message: 'Only students can enroll in courses.' });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found.' });
    }

    // Check if course is published
    if (course.status !== 'published') {
        return res.status(400).json({ message: 'This course is not available for enrollment.' });
    }

    // Check if user is already enrolled
    const isEnrolled = course.enrollments.some(enrollment => enrollment.userId.toString() === userId);
    if (isEnrolled) {
      return res.status(400).json({ message: 'You are already enrolled in this course.' });
    }

    // Prevent instructor from enrolling in their own course
    if (course.instructor.toString() === userId) {
        return res.status(400).json({ message: 'Instructors cannot enroll in their own courses.' });
    }

    course.enrollments.push({ userId });
    await course.save();

    res.status(200).json({ message: 'Successfully enrolled in the course.', course });

  } catch (error) {
    console.error('Error enrolling in course:', error);
    if (error.kind === 'ObjectId') {
        return res.status(400).json({ message: 'Invalid course ID format.' });
    }
    res.status(500).json({ message: 'Server error while enrolling in course.' });
  }
};

// @desc    Add or update a review for a course
// @route   POST /api/courses/:id/reviews
// @access  Private (Student who is enrolled)
exports.addCourseReview = async (req, res) => {
  const { rating, review } = req.body;
  const courseId = req.params.id;
  const userId = req.user.id;

  try {
    if (!req.user.roles.includes('Student')) {
      return res.status(403).json({ message: 'Only students can review courses.' });
    }

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be a number between 1 and 5.' });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found.' });
    }

    // Check if user is enrolled in the course
    const isEnrolled = course.enrollments.some(enrollment => enrollment.userId.toString() === userId);
    if (!isEnrolled) {
      return res.status(403).json({ message: 'You must be enrolled in this course to review it.' });
    }

    const existingReviewIndex = course.ratings.findIndex(r => r.userId.toString() === userId);

    if (existingReviewIndex > -1) {
      // Update existing review
      course.ratings[existingReviewIndex].rating = Number(rating);
      course.ratings[existingReviewIndex].review = review || ''; // Allow empty review text
      course.ratings[existingReviewIndex].reviewedAt = Date.now();
    } else {
      // Add new review
      course.ratings.push({ userId, rating: Number(rating), review: review || '', reviewedAt: Date.now() });
    }

    await course.save();
    // Optionally, recalculate an average rating for the course here and save it if you add an averageRating field to Course schema

    res.status(201).json({ message: 'Review submitted successfully.', course });

  } catch (error) {
    console.error('Error adding course review:', error);
    if (error.kind === 'ObjectId') {
        return res.status(400).json({ message: 'Invalid course ID format.' });
    }
    if (error.name === 'ValidationError') {
        const messages = Object.values(error.errors).map(val => val.message);
        return res.status(400).json({ message: messages.join('. ') });
    }
    res.status(500).json({ message: 'Server error while adding review.' });
  }
};
