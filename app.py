from flask import Flask, jsonify, request

app = Flask(__name__)

# In-memory storage
db = {
    "courses": {},
    "lessons": {},
    "quizzes": {},
    "assignments": {},
    "content_uploads": {"videos": [], "documents": []}
}
lesson_id_counter = 1
quiz_id_counter = 1
assignment_id_counter = 1

@app.route('/')
def hello_world():
    return 'Hello, World!'

# --- Content Upload Endpoints ---
@app.route('/api/content/upload-video', methods=['POST'])
def upload_video():
    # For now, we'll just simulate a successful upload
    # In a real app, you'd handle file saving, metadata, etc.
    video_data = request.json
    if not video_data or 'filename' not in video_data:
        return jsonify({"error": "Missing filename in request body"}), 400

    db["content_uploads"]["videos"].append(video_data['filename'])
    return jsonify({"message": "Video uploaded successfully (simulated)", "filename": video_data['filename']}), 201

@app.route('/api/content/upload-document', methods=['POST'])
def upload_document():
    # Similar simulation for document upload
    doc_data = request.json
    if not doc_data or 'filename' not in doc_data:
        return jsonify({"error": "Missing filename in request body"}), 400

    db["content_uploads"]["documents"].append(doc_data['filename'])
    return jsonify({"message": "Document uploaded successfully (simulated)", "filename": doc_data['filename']}), 201

# --- Course and Lesson Endpoints ---
@app.route('/api/courses/<int:course_id>/lessons', methods=['GET'])
def get_course_lessons(course_id):
    # For simplicity, we're not strictly checking if course_id exists in db["courses"]
    # In a real app, you'd validate this and potentially create courses separately.
    course_lessons = [lesson for lesson in db["lessons"].values() if lesson.get("course_id") == course_id]
    return jsonify(course_lessons), 200

@app.route('/api/courses/<int:course_id>/lessons', methods=['POST'])
def create_course_lesson(course_id):
    global lesson_id_counter
    lesson_data = request.json
    if not lesson_data or 'title' not in lesson_data:
        return jsonify({"error": "Missing title in request body"}), 400

    new_lesson_id = lesson_id_counter
    lesson_id_counter += 1

    new_lesson = {
        "id": new_lesson_id,
        "course_id": course_id,
        "title": lesson_data['title'],
        "content_ids": lesson_data.get("content_ids", []) # e.g., IDs of uploaded videos/docs
    }
    db["lessons"][new_lesson_id] = new_lesson
    # Simulate adding the course if it doesn't exist for simplicity
    if course_id not in db["courses"]:
        db["courses"][course_id] = {"id": course_id, "name": f"Course {course_id}", "lesson_ids": []}
    db["courses"][course_id]["lesson_ids"].append(new_lesson_id)

    return jsonify(new_lesson), 201

@app.route('/api/lessons/<int:lesson_id>', methods=['PUT'])
def update_lesson(lesson_id):
    if lesson_id not in db["lessons"]:
        return jsonify({"error": "Lesson not found"}), 404

    lesson_data = request.json
    if not lesson_data:
        return jsonify({"error": "Request body cannot be empty"}), 400

    updated_lesson = db["lessons"][lesson_id]
    if 'title' in lesson_data:
        updated_lesson['title'] = lesson_data['title']
    if 'content_ids' in lesson_data:
        updated_lesson['content_ids'] = lesson_data['content_ids']

    db["lessons"][lesson_id] = updated_lesson
    return jsonify(updated_lesson), 200

@app.route('/api/lessons/<int:lesson_id>', methods=['DELETE'])
def delete_lesson(lesson_id):
    if lesson_id not in db["lessons"]:
        return jsonify({"error": "Lesson not found"}), 404

    lesson_course_id = db["lessons"][lesson_id]["course_id"]
    del db["lessons"][lesson_id]

    # Remove lesson_id from the course's lesson list
    if lesson_course_id in db["courses"] and lesson_id in db["courses"][lesson_course_id]["lesson_ids"]:
        db["courses"][lesson_course_id]["lesson_ids"].remove(lesson_id)

    return jsonify({"message": "Lesson deleted successfully"}), 200

@app.route('/api/lessons/<int:lesson_id>/content', methods=['GET'])
def get_lesson_content(lesson_id):
    if lesson_id not in db["lessons"]:
        return jsonify({"error": "Lesson not found"}), 404

    lesson = db["lessons"][lesson_id]
    # This is a placeholder. In a real app, you'd fetch actual content based on content_ids
    # For example, looking up filenames from db["content_uploads"]
    content_details = []
    for content_id in lesson.get("content_ids", []):
        # This assumes content_ids are filenames for simplicity
        if content_id in db["content_uploads"]["videos"]:
            content_details.append({"id": content_id, "type": "video", "url": f"/path/to/video/{content_id}"})
        elif content_id in db["content_uploads"]["documents"]:
            content_details.append({"id": content_id, "type": "document", "url": f"/path/to/document/{content_id}"})
        else:
            content_details.append({"id": content_id, "type": "unknown", "message": "Content not found in uploads"})

    return jsonify({"lesson_id": lesson_id, "content": content_details}), 200

# --- Quiz and Assignment Endpoints ---
@app.route('/api/quizzes', methods=['POST'])
def create_quiz():
    global quiz_id_counter
    quiz_data = request.json
    if not quiz_data or 'title' not in quiz_data or 'questions' not in quiz_data:
        return jsonify({"error": "Missing title or questions in request body"}), 400

    new_quiz_id = quiz_id_counter
    quiz_id_counter += 1

    new_quiz = {
        "id": new_quiz_id,
        "title": quiz_data['title'],
        "questions": quiz_data['questions'], # Expecting a list of question objects
        "lesson_id": quiz_data.get("lesson_id") # Optional: link quiz to a lesson
    }
    db["quizzes"][new_quiz_id] = new_quiz
    return jsonify(new_quiz), 201

@app.route('/api/quizzes/<int:quiz_id>', methods=['GET'])
def get_quiz(quiz_id):
    if quiz_id not in db["quizzes"]:
        return jsonify({"error": "Quiz not found"}), 404
    return jsonify(db["quizzes"][quiz_id]), 200

@app.route('/api/assignments', methods=['POST'])
def create_assignment():
    global assignment_id_counter
    assignment_data = request.json
    if not assignment_data or 'title' not in assignment_data or 'description' not in assignment_data:
        return jsonify({"error": "Missing title or description in request body"}), 400

    new_assignment_id = assignment_id_counter
    assignment_id_counter += 1

    new_assignment = {
        "id": new_assignment_id,
        "title": assignment_data['title'],
        "description": assignment_data['description'],
        "lesson_id": assignment_data.get("lesson_id") # Optional: link assignment to a lesson
    }
    db["assignments"][new_assignment_id] = new_assignment
    return jsonify(new_assignment), 201

if __name__ == '__main__':
    app.run(debug=True)
