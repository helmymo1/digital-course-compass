# Simple Flask Backend API

This project implements a simple backend API using Flask to manage courses, lessons, content, quizzes, and assignments. All data is stored in-memory.

## Endpoints

### Content
- `POST /api/content/upload-video`
  - Body: `{"filename": "video_name.mp4"}`
  - Simulates video upload.
- `POST /api/content/upload-document`
  - Body: `{"filename": "document_name.pdf"}`
  - Simulates document upload.

### Courses & Lessons
- `GET /api/courses/:course_id/lessons`
  - Retrieves all lessons for a given `course_id`.
- `POST /api/courses/:course_id/lessons`
  - Body: `{"title": "New Lesson Title", "content_ids": ["video_name.mp4"]}`
  - Creates a new lesson for a `course_id`. `content_ids` is optional.
- `PUT /api/lessons/:lesson_id`
  - Body: `{"title": "Updated Title", "content_ids": []}`
  - Updates a lesson. Fields are optional.
- `DELETE /api/lessons/:lesson_id`
  - Deletes a lesson.
- `GET /api/lessons/:lesson_id/content`
  - Retrieves content associated with a lesson.

### Quizzes
- `POST /api/quizzes`
  - Body: `{"title": "Math Quiz", "questions": [{"q": "2+2?", "a": "4"}], "lesson_id": 1}`
  - Creates a new quiz. `lesson_id` is optional.
- `GET /api/quizzes/:quiz_id`
  - Retrieves a quiz by its `quiz_id`.

### Assignments
- `POST /api/assignments`
  - Body: `{"title": "History Essay", "description": "Write an essay on...", "lesson_id": 2}`
  - Creates a new assignment. `lesson_id` is optional.

## Setup and Running

1.  **Create a virtual environment (recommended):**
    ```bash
    python -m venv venv
    source venv/bin/activate  # On Windows use `venv\Scripts\activate`
    ```

2.  **Install dependencies:**
    ```bash
    pip install -r requirements.txt
    ```

3.  **Run the Flask application:**
    ```bash
    python app.py
    ```
    The application will start in debug mode, typically on `http://127.0.0.1:5000/`.

## In-Memory Data

The application uses a Python dictionary (`db`) in `app.py` to store all data. This means:
- Data is not persistent and will be lost when the application stops.
- `course_id`s are implicitly created when a lesson is added to them.
- `lesson_id`, `quiz_id`, and `assignment_id` are auto-incrementing integers.
- `content_ids` in lessons are expected to match filenames "uploaded" via the content upload endpoints for the `GET /api/lessons/:lesson_id/content` endpoint to resolve them.
