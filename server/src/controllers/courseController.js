const Course = require('../models/Course');
const User = require('../models/User'); // Needed to check instructor role
const SearchAnalytics = require('../models/SearchAnalytics'); // Added SearchAnalytics
const recommendationService = require('../services/recommendationService'); // Added recommendationService
const asyncHandler = require('express-async-handler'); // For async route handlers

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
    const {
      // Existing filters
      category, status, /* instructor - will be handled differently */
      sortBy: oldSortBy, order = 'asc', // Renamed sortBy to avoid conflict with new sorting
      page = 1, limit = 10,
      search: querySearch, // Renamed search to avoid conflict with general 'query' term
      level, minRating,
      // minDuration, maxDuration, // Will be handled by 'duration' array

      // New filters from AdvancedSearch
      q, // General search query, alternative to 'search'
      price, // e.g., "Free", "$0-$50"
      language,
      instructorName, // For searching by instructor's name
      features, // Comma-separated string of features
      duration, // e.g., "0,50" for min,max duration

      // New sorting parameter
      sort // e.g., "relevance", "price_asc", "rating"
    } = req.query;

    const query = {};
    const searchTerm = q || querySearch;

    if (searchTerm) {
      query.$text = { $search: searchTerm };
    }

    if (category) {
      query.category = category;
    }

    if (level) {
      query.level = level;
    }

    if (minRating) {
      const rating = parseFloat(minRating);
      if (!isNaN(rating)) {
        query.averageRating = { $gte: rating };
      }
    }

    // Handle duration: [min, max]
    if (duration) {
      const parts = duration.split(',').map(parseFloat);
      if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
        const [minDur, maxDur] = parts;
        query.estimatedDurationHours = {};
        if (minDur > 0) {
          query.estimatedDurationHours.$gte = minDur;
        }
        if (maxDur > 0 && maxDur >= minDur) { // maxDur should be positive and greater than min
          query.estimatedDurationHours.$lte = maxDur;
        }
         // If only one part of range is zero, it might mean no limit on that side.
        // If $gte and $lte are the same, it's an exact match.
        // If query.estimatedDurationHours ends up empty, remove it.
        if (Object.keys(query.estimatedDurationHours).length === 0) {
            delete query.estimatedDurationHours;
        }
      }
    }

    // Handle price: "Free", "$0-$50", "$50-$100", "$100-$200", "$200+"
    if (price) {
      if (price.toLowerCase() === 'free') {
        query.price = 0;
      } else if (price.startsWith('$')) {
        const parts = price.substring(1).split('-');
        if (parts.length === 2) {
          const minPrice = parseFloat(parts[0]);
          const maxPrice = parseFloat(parts[1]);
          if (!isNaN(minPrice) && !isNaN(maxPrice)) {
            query.price = { $gte: minPrice, $lte: maxPrice };
          }
        } else if (price.endsWith('+')) {
          const minPrice = parseFloat(price.substring(1, price.length - 1));
          if (!isNaN(minPrice)) {
            query.price = { $gte: minPrice };
          }
        }
      }
    }

    if (language) {
      query.language = language;
    }

    // Handle features (comma-separated string)
    if (features) {
      const featureList = features.split(',').map(f => f.trim()).filter(f => f);
      if (featureList.length > 0) {
        query.features = { $all: featureList };
      }
    }

    // Handle instructorName search
    if (instructorName) {
      // This requires an async operation, so we find instructor IDs first
      // This is a simplified example. Error handling & performance for many instructors would be needed.
      try {
        const instructors = await User.find({
          name: { $regex: instructorName, $options: 'i' },
          roles: 'Instructor'
        }).select('_id');

        if (instructors.length > 0) {
          query.instructor = { $in: instructors.map(inst => inst._id) };
        } else {
          // If instructorName is specified but no instructors found, effectively no courses will match.
          // Add a condition that's impossible to satisfy, or return empty results early.
          query.instructor = { _id: null }; // No course will have a null instructor ID this way
        }
      } catch (e) {
        console.error("Error searching for instructor:", e);
        // Potentially don't filter by instructor if search fails, or return error
      }
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

    // --- Sorting Logic ---
    const sortOptions = {};
    if (sort) {
        switch (sort) {
            case 'relevance':
                if (searchTerm) {
                    sortOptions.score = { $meta: 'textScore' };
                } else {
                    sortOptions.createdAt = -1; // Default if no search term for relevance
                }
                break;
            case 'price_asc':
                sortOptions.price = 1;
                break;
            case 'price_desc':
                sortOptions.price = -1;
                break;
            case 'rating':
                sortOptions.averageRating = -1; // Higher rating first
                break;
            case 'newest':
                sortOptions.createdAt = -1;
                break;
            default: // Fallback to old sortBy or newest
                if (oldSortBy) {
                    sortOptions[oldSortBy] = order === 'desc' ? -1 : 1;
                } else {
                    sortOptions.createdAt = -1;
                }
        }
    } else if (oldSortBy) { // Support old sortBy if new 'sort' is not provided
        sortOptions[oldSortBy] = order === 'desc' ? -1 : 1;
    } else {
        sortOptions.createdAt = -1; // Default sort
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

    // Log search analytics if search term or significant filters were used
    const currentFiltersForAnalytics = {
        query: searchTerm,
        category,
        level,
        minRating,
        price,
        language,
        instructorName,
        features,
        duration,
        status: query.status, // status from query object after role check
        sort,
        // oldSortBy, // if you want to log legacy sort params too
        // order
    };
    // Remove undefined keys to keep analytics data clean
    Object.keys(currentFiltersForAnalytics).forEach(key => currentFiltersForAnalytics[key] === undefined && delete currentFiltersForAnalytics[key]);

    if (searchTerm || Object.keys(currentFiltersForAnalytics).filter(k => k !== 'query' && k !== 'status').length > 0) { // Log if search or any filter other than default status
      SearchAnalytics.create({
        query: searchTerm || null,
        userId: req.user ? req.user.id : null,
        filtersApplied: currentFiltersForAnalytics,
        resultsCount: totalCourses,
      }).catch(err => console.error('Failed to log search analytics:', err)); // Fire and forget
    }

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

// @desc    Get course recommendations
// @route   GET /api/courses/:id/recommendations
// @route   GET /api/courses/recommendations/me (for personalized based on user)
// @access  Public / Private (for /me)
exports.getCourseRecommendations = asyncHandler(async (req, res) => {
  const courseId = req.params.id; // For "users who took this also took..."
  const userId = req.user ? req.user.id : null; // For personalized "based on your activity"

  let recommendations = [];
  const limit = parseInt(req.query.limit) || 5;

  if (courseId) {
    // Strategy 1: Users who enrolled in this course also enrolled in...
    recommendations = await recommendationService.getRecommendationsBasedOnCourseEnrollments(courseId, userId, limit);
  } else if (userId && req.path.endsWith('/me')) { // Check if it's the /me route
    // Strategy 2: Based on categories of courses the current user is enrolled in
    recommendations = await recommendationService.getRecommendationsBasedOnUserCategories(userId, limit);
  } else {
    // Fallback or general recommendations (e.g., top popular courses if no specific context)
    // For now, if no specific context, return empty or could fetch top popular courses
    // recommendations = await Course.find({ status: 'published' }).sort({ enrollmentCount: -1 }).limit(limit);
  }

  if (!recommendations || recommendations.length === 0) {
    // If no specific recommendations found, could fallback to general popular courses
    // For now, let's indicate no specific recommendations found.
    // Or, fetch some popular ones as a generic fallback:
    // recommendations = await Course.find({ status: 'published' }).sort({ enrollmentCount: -1 }).limit(limit).select('-description');
  }

  // If still no recommendations (e.g. user has no enrollments for category based),
  // and we want to ensure some are always returned, fetch general popular ones.
  if (recommendations.length === 0) {
      recommendations = await Course.find({ status: 'published', _id: { $ne: courseId } }) // Exclude current course if courseId was given
                                  .sort({ enrollmentCount: -1, averageRating: -1 })
                                  .limit(limit)
                                  .select('-description -modules'); // Example: exclude heavy fields
  }


  res.status(200).json({
    success: true,
    count: recommendations.length,
    data: recommendations,
  });
});

// @desc    Get popular courses
// @route   GET /api/courses/popular
// @access  Public
exports.getPopularCourses = asyncHandler(async (req, res) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 10; // Default to 10 popular courses

    // Define 'popular' by high enrollment count, then by high average rating
    // Ensure courses are published
    const courses = await Course.find({ status: 'published' })
                                .sort({ enrollmentCount: -1, averageRating: -1 })
                                .limit(limit)
                                .populate('instructor', 'name') // Populate instructor's name
                                .select('-description -modules -ratings -enrollments'); // Exclude heavier fields for a list/widget view

    res.json({
      success: true,
      count: courses.length,
      data: courses,
    });
  } catch (error) {
    console.error('Error fetching popular courses:', error);
    res.status(500).json({ message: 'Server error while fetching popular courses.' });
  }
});

// @desc    Get trending courses
// @route   GET /api/courses/trending
// @access  Public
exports.getTrendingCourses = asyncHandler(async (req, res) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 10; // Default to 10 trending courses

    // Define 'trending' by recency, then high enrollment count and average rating.
    // Consider courses published recently (e.g., last 90 days) that are also popular.
    // For a simpler approach without adding a specific "trending score" field:
    // Sort by creation date (newest first), then by popularity metrics.
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    const courses = await Course.find({
      status: 'published',
      // createdAt: { $gte: ninetyDaysAgo } // Optional: only consider courses created in last 90 days
    })
    .sort({ createdAt: -1, enrollmentCount: -1, averageRating: -1 })
    .limit(limit)
    .populate('instructor', 'name')
    .select('-description -modules -ratings -enrollments'); // Slim payload

    res.json({
      success: true,
      count: courses.length,
      data: courses,
    });
  } catch (error) {
    console.error('Error fetching trending courses:', error);
    res.status(500).json({ message: 'Server error while fetching trending courses.' });
  }
});

// @desc    Get courses similar to a given course
// @route   GET /api/courses/similar/:courseId
// @access  Public
exports.getSimilarCourses = asyncHandler(async (req, res) => {
  try {
    const targetCourseId = req.params.courseId;
    const limit = parseInt(req.query.limit, 10) || 5; // Default to 5 similar courses

    const targetCourse = await Course.findById(targetCourseId);

    if (!targetCourse) {
      return res.status(404).json({ message: 'Target course not found.' });
    }

    // Find courses that are in the same category OR by the same instructor,
    // are published, and are not the target course itself.
    const similarCourses = await Course.find({
      _id: { $ne: targetCourseId }, // Exclude the target course itself
      status: 'published',
      $or: [
        { category: targetCourse.category },
        { instructor: targetCourse.instructor }
      ]
    })
    .sort({ averageRating: -1, enrollmentCount: -1 }) // Sort by rating and popularity
    .limit(limit)
    .populate('instructor', 'name')
    .select('-description -modules -ratings -enrollments'); // Slim payload

    res.json({
      success: true,
      count: similarCourses.length,
      data: similarCourses,
    });

  } catch (error) {
    console.error('Error fetching similar courses:', error);
    if (error.kind === 'ObjectId') {
        return res.status(400).json({ message: 'Invalid course ID format.' });
    }
    res.status(500).json({ message: 'Server error while fetching similar courses.' });
  }
});
