// server/src/models/enrollment.test.js
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const Enrollment = require('./Enrollment'); // Adjust path as necessary
const User = require('./User'); // Assuming User model is in the same directory
const Course = require('./Course'); // Assuming Course model is in the same directory

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  // Clear all collections before each test
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany({});
  }
});


describe('Enrollment Model', () => {
  let mockUser;
  let mockCourse;

  beforeEach(async () => {
    // Create mock user and course for tests
    mockUser = await User.create({ name: 'Test User', email: 'test@example.com', password: 'password123' });
    mockCourse = await Course.create({ title: 'Test Course', description: 'A test course', instructor: mockUser._id, price: 10 });
  });

  test('should create a new enrollment successfully', async () => {
    const enrollmentData = {
      user: mockUser._id,
      course: mockCourse._id,
      status: 'pending_payment',
    };
    const enrollment = new Enrollment(enrollmentData);
    const savedEnrollment = await enrollment.save();

    expect(savedEnrollment._id).toBeDefined();
    expect(savedEnrollment.user.toString()).toBe(mockUser._id.toString());
    expect(savedEnrollment.course.toString()).toBe(mockCourse._id.toString());
    expect(savedEnrollment.status).toBe('pending_payment');
    expect(savedEnrollment.createdAt).toBeDefined();
    expect(savedEnrollment.updatedAt).toBeDefined();
  });

  test('should fail if required fields (user, course) are missing', async () => {
    let enrollmentData = { course: mockCourse._id, status: 'pending_payment' };
    let enrollment = new Enrollment(enrollmentData);
    await expect(enrollment.save()).rejects.toThrow(mongoose.Error.ValidationError);

    enrollmentData = { user: mockUser._id, status: 'pending_payment' };
    enrollment = new Enrollment(enrollmentData);
    await expect(enrollment.save()).rejects.toThrow(mongoose.Error.ValidationError);
  });

  test('should default status to "pending_payment" if not provided', async () => {
     const enrollmentData = { user: mockUser._id, course: mockCourse._id };
     const enrollment = new Enrollment(enrollmentData);
     const savedEnrollment = await enrollment.save();
     expect(savedEnrollment.status).toBe('pending_payment');
  });

  test('should fail for invalid status enum value', async () => {
    const enrollmentData = { user: mockUser._id, course: mockCourse._id, status: 'invalid_status_value' };
    const enrollment = new Enrollment(enrollmentData);
    await expect(enrollment.save()).rejects.toThrow(mongoose.Error.ValidationError);
  });

  describe('Unique Enrollment Index (user, course, status)', () => {
    const createActiveEnrollment = async () => {
      return Enrollment.create({ user: mockUser._id, course: mockCourse._id, status: 'active' });
    };
    const createPendingEnrollment = async () => {
      return Enrollment.create({ user: mockUser._id, course: mockCourse._id, status: 'pending_payment' });
    };

    test('should prevent duplicate "active" enrollments for the same user and course', async () => {
      await createActiveEnrollment();
      await expect(createActiveEnrollment()).rejects.toThrow(/duplicate key error/);
    });

    test('should prevent duplicate "pending_payment" enrollments for the same user and course', async () => {
      await createPendingEnrollment();
      await expect(createPendingEnrollment()).rejects.toThrow(/duplicate key error/);
    });

    test('should prevent an "active" enrollment if a "pending_payment" one exists for same user/course', async () => {
      await createPendingEnrollment();
      await expect(createActiveEnrollment()).rejects.toThrow(/duplicate key error/);
    });

    test('should prevent a "pending_payment" enrollment if an "active" one exists for same user/course', async () => {
      await createActiveEnrollment();
      await expect(createPendingEnrollment()).rejects.toThrow(/duplicate key error/);
    });

    test('should ALLOW an "active" enrollment if a "cancelled" one exists for same user/course', async () => {
      await Enrollment.create({ user: mockUser._id, course: mockCourse._id, status: 'cancelled' });
      const activeEnrollment = await createActiveEnrollment();
      expect(activeEnrollment.status).toBe('active');
    });

    test('should ALLOW an "active" enrollment if a "completed" one exists for same user/course', async () => {
      await Enrollment.create({ user: mockUser._id, course: mockCourse._id, status: 'completed' });
      const activeEnrollment = await createActiveEnrollment();
      expect(activeEnrollment.status).toBe('active');
    });

    test('should ALLOW different users to have "active" enrollments for the same course', async () => {
      const anotherUser = await User.create({ name: 'Another User', email: 'another@example.com', password: 'password123' });
      await createActiveEnrollment(); // mockUser enrollment

      const anotherUserEnrollment = await Enrollment.create({ user: anotherUser._id, course: mockCourse._id, status: 'active' });
      expect(anotherUserEnrollment.status).toBe('active');
      expect(anotherUserEnrollment.user.toString()).not.toBe(mockUser._id.toString());
    });
  });
});
