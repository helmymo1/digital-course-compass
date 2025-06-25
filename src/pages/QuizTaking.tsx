
import React, { useState } from 'react';
import Navigation from '@/components/Navigation';
import QuizInterface from '@/components/assessment/QuizInterface';
import { useParams, useNavigate } from 'react-router-dom';

const QuizTaking = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();

  // Mock quiz data
  const mockQuiz = {
    id: quizId || '1',
    title: 'JavaScript Fundamentals Quiz',
    questions: [
      {
        id: '1',
        type: 'multiple-choice' as const,
        question: 'What is the correct way to declare a variable in JavaScript?',
        options: ['var x = 5;', 'variable x = 5;', 'v x = 5;', 'declare x = 5;'],
        correctAnswer: 'var x = 5;'
      },
      {
        id: '2',
        type: 'multiple-select' as const,
        question: 'Which of the following are JavaScript data types?',
        options: ['String', 'Number', 'Boolean', 'Integer', 'Float'],
        correctAnswer: ['String', 'Number', 'Boolean']
      },
      {
        id: '3',
        type: 'text' as const,
        question: 'Explain the difference between == and === in JavaScript.',
        correctAnswer: '== compares values with type coercion, === compares values and types strictly'
      }
    ]
  };

  const handleQuizSubmit = (answers: Record<string, string | string[]>) => {
    console.log('Quiz submitted:', answers);
    // In a real app, you would send the answers to your backend
    navigate('/quiz-results', { state: { answers, quiz: mockQuiz } });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <QuizInterface
          quizId={mockQuiz.title}
          questions={mockQuiz.questions}
          timeLimit={15} // 15 minutes
          onSubmit={handleQuizSubmit}
        />
      </div>
    </div>
  );
};

export default QuizTaking;
