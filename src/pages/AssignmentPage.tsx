
import React from 'react';
import Navigation from '@/components/Navigation';
import AssignmentSubmission from '@/components/assessment/AssignmentSubmission';
import { useParams } from 'react-router-dom';

const AssignmentPage = () => {
  const { assignmentId } = useParams();

  // Mock assignment data
  const mockAssignment = {
    id: assignmentId || '1',
    title: 'Web Development Project',
    description: 'Create a responsive website using HTML, CSS, and JavaScript. The website should include a navigation menu, hero section, and contact form. Demonstrate your understanding of modern web development practices.',
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    maxPoints: 100,
    allowedFileTypes: ['.zip', '.html', '.css', '.js', '.pdf'],
    maxFileSize: 25 // 25MB
  };

  const handleSubmission = (submission: {
    title: string;
    description: string;
    files: File[];
  }) => {
    console.log('Assignment submitted:', submission);
    // In a real app, you would send the submission to your backend
    alert('Assignment submitted successfully!');
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <AssignmentSubmission
          assignment={mockAssignment}
          onSubmit={handleSubmission}
        />
      </div>
    </div>
  );
};

export default AssignmentPage;
