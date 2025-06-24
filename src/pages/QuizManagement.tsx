
import React, { useState } from 'react';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Edit, Trash2, FileText, Users, Trophy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const QuizManagement = () => {
  const { toast } = useToast();
  const [quizzes, setQuizzes] = useState([
    {
      id: '1',
      title: 'HTML & CSS Fundamentals',
      description: 'Test your knowledge of HTML and CSS basics',
      lesson: 'Introduction to Web Development',
      questions: 15,
      duration: 30,
      attempts: 234,
      averageScore: 78.5,
      status: 'active'
    },
    {
      id: '2',
      title: 'JavaScript ES6+ Features',
      description: 'Advanced JavaScript concepts and modern syntax',
      lesson: 'Modern JavaScript',
      questions: 20,
      duration: 45,
      attempts: 189,
      averageScore: 72.3,
      status: 'active'
    }
  ]);

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newQuiz, setNewQuiz] = useState({
    title: '',
    description: '',
    lesson: '',
    questions: [],
    duration: ''
  });

  const [questions, setQuestions] = useState([
    { question: '', options: ['', '', '', ''], correctAnswer: 0 }
  ]);

  const handleCreateQuiz = () => {
    const quiz = {
      id: Date.now().toString(),
      ...newQuiz,
      questions: questions.length,
      duration: parseInt(newQuiz.duration),
      attempts: 0,
      averageScore: 0,
      status: 'draft'
    };
    setQuizzes([...quizzes, quiz]);
    setIsCreateDialogOpen(false);
    setNewQuiz({ title: '', description: '', lesson: '', questions: [], duration: '' });
    setQuestions([{ question: '', options: ['', '', '', ''], correctAnswer: 0 }]);
    toast({
      title: "Quiz Created",
      description: "Your new quiz has been created successfully.",
    });
  };

  const handleDeleteQuiz = (id: string) => {
    setQuizzes(quizzes.filter(quiz => quiz.id !== id));
    toast({
      title: "Quiz Deleted",
      description: "The quiz has been removed.",
    });
  };

  const addQuestion = () => {
    setQuestions([...questions, { question: '', options: ['', '', '', ''], correctAnswer: 0 }]);
  };

  const updateQuestion = (index: number, field: string, value: any) => {
    const updatedQuestions = [...questions];
    if (field === 'question') {
      updatedQuestions[index].question = value;
    } else if (field.startsWith('option')) {
      const optionIndex = parseInt(field.split('-')[1]);
      updatedQuestions[index].options[optionIndex] = value;
    } else if (field === 'correctAnswer') {
      updatedQuestions[index].correctAnswer = value;
    }
    setQuestions(updatedQuestions);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header userRole="teacher" userName="John Instructor" />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Quiz Management</h1>
            <p className="text-muted-foreground">Create and manage course quizzes</p>
          </div>
          
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Quiz
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Quiz</DialogTitle>
              </DialogHeader>
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="quiz-title">Quiz Title</Label>
                    <Input
                      id="quiz-title"
                      value={newQuiz.title}
                      onChange={(e) => setNewQuiz({...newQuiz, title: e.target.value})}
                      placeholder="Enter quiz title"
                    />
                  </div>
                  <div>
                    <Label htmlFor="quiz-duration">Duration (minutes)</Label>
                    <Input
                      id="quiz-duration"
                      type="number"
                      value={newQuiz.duration}
                      onChange={(e) => setNewQuiz({...newQuiz, duration: e.target.value})}
                      placeholder="30"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="quiz-description">Description</Label>
                  <Textarea
                    id="quiz-description"
                    value={newQuiz.description}
                    onChange={(e) => setNewQuiz({...newQuiz, description: e.target.value})}
                    placeholder="Quiz description"
                  />
                </div>
                <div>
                  <Label htmlFor="quiz-lesson">Associated Lesson</Label>
                  <Input
                    id="quiz-lesson"
                    value={newQuiz.lesson}
                    onChange={(e) => setNewQuiz({...newQuiz, lesson: e.target.value})}
                    placeholder="Lesson name"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-4">
                    <Label>Questions</Label>
                    <Button type="button" onClick={addQuestion} variant="outline" size="sm">
                      Add Question
                    </Button>
                  </div>
                  
                  {questions.map((q, index) => (
                    <Card key={index} className="mb-4">
                      <CardContent className="p-4">
                        <div className="space-y-3">
                          <div>
                            <Label>Question {index + 1}</Label>
                            <Textarea
                              value={q.question}
                              onChange={(e) => updateQuestion(index, 'question', e.target.value)}
                              placeholder="Enter your question"
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            {q.options.map((option, optionIndex) => (
                              <div key={optionIndex}>
                                <Label>Option {optionIndex + 1}</Label>
                                <Input
                                  value={option}
                                  onChange={(e) => updateQuestion(index, `option-${optionIndex}`, e.target.value)}
                                  placeholder={`Option ${optionIndex + 1}`}
                                />
                              </div>
                            ))}
                          </div>
                          <div>
                            <Label>Correct Answer</Label>
                            <select
                              value={q.correctAnswer}
                              onChange={(e) => updateQuestion(index, 'correctAnswer', parseInt(e.target.value))}
                              className="w-full p-2 border rounded"
                            >
                              <option value={0}>Option 1</option>
                              <option value={1}>Option 2</option>
                              <option value={2}>Option 3</option>
                              <option value={3}>Option 4</option>
                            </select>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <Button onClick={handleCreateQuiz} className="w-full">
                  Create Quiz
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-6">
          {quizzes.map((quiz) => (
            <Card key={quiz.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl">{quiz.title}</CardTitle>
                    <p className="text-muted-foreground mt-1">{quiz.description}</p>
                    <p className="text-sm text-blue-600 mt-1">Lesson: {quiz.lesson}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={quiz.status === 'active' ? 'default' : 'secondary'}>
                      {quiz.status}
                    </Badge>
                    <Button variant="ghost" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDeleteQuiz(quiz.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="flex items-center space-x-2">
                    <FileText className="h-4 w-4 text-blue-600" />
                    <div>
                      <p className="text-sm text-muted-foreground">Questions</p>
                      <p className="font-semibold">{quiz.questions}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4 text-green-600" />
                    <div>
                      <p className="text-sm text-muted-foreground">Attempts</p>
                      <p className="font-semibold">{quiz.attempts}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Trophy className="h-4 w-4 text-yellow-600" />
                    <div>
                      <p className="text-sm text-muted-foreground">Avg Score</p>
                      <p className="font-semibold">{quiz.averageScore}%</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <FileText className="h-4 w-4 text-purple-600" />
                    <div>
                      <p className="text-sm text-muted-foreground">Duration</p>
                      <p className="font-semibold">{quiz.duration}min</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default QuizManagement;
