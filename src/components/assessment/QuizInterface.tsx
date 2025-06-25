
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Clock, CheckCircle, AlertCircle } from 'lucide-react';

interface QuizQuestion {
  id: string;
  type: 'multiple-choice' | 'multiple-select' | 'text';
  question: string;
  options?: string[];
  correctAnswer?: string | string[];
}

interface QuizInterfaceProps {
  quizId: string;
  questions: QuizQuestion[];
  timeLimit?: number; // in minutes
  onSubmit: (answers: Record<string, string | string[]>) => void;
}

const QuizInterface: React.FC<QuizInterfaceProps> = ({
  quizId,
  questions,
  timeLimit = 30,
  onSubmit
}) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [timeRemaining, setTimeRemaining] = useState(timeLimit * 60);
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    if (timeRemaining > 0 && !isSubmitted) {
      const timer = setTimeout(() => setTimeRemaining(timeRemaining - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeRemaining === 0) {
      handleSubmit();
    }
  }, [timeRemaining, isSubmitted]);

  const handleAnswerChange = (questionId: string, answer: string | string[]) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  const handleSubmit = () => {
    setIsSubmitted(true);
    onSubmit(answers);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = ((currentQuestion + 1) / questions.length) * 100;
  const currentQ = questions[currentQuestion];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Quiz: {quizId}</CardTitle>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span className={`font-mono ${timeRemaining < 300 ? 'text-red-600' : ''}`}>
                  {formatTime(timeRemaining)}
                </span>
              </div>
              <div className="text-sm text-muted-foreground">
                Question {currentQuestion + 1} of {questions.length}
              </div>
            </div>
          </div>
          <Progress value={progress} className="mt-2" />
        </CardHeader>
      </Card>

      {/* Question */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            {currentQ.question}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {currentQ.type === 'multiple-choice' && (
            <RadioGroup
              value={answers[currentQ.id] as string || ''}
              onValueChange={(value) => handleAnswerChange(currentQ.id, value)}
            >
              {currentQ.options?.map((option, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <RadioGroupItem value={option} id={`${currentQ.id}-${index}`} />
                  <Label htmlFor={`${currentQ.id}-${index}`}>{option}</Label>
                </div>
              ))}
            </RadioGroup>
          )}

          {currentQ.type === 'multiple-select' && (
            <div className="space-y-2">
              {currentQ.options?.map((option, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <Checkbox
                    id={`${currentQ.id}-${index}`}
                    checked={(answers[currentQ.id] as string[] || []).includes(option)}
                    onCheckedChange={(checked) => {
                      const currentAnswers = (answers[currentQ.id] as string[]) || [];
                      if (checked) {
                        handleAnswerChange(currentQ.id, [...currentAnswers, option]);
                      } else {
                        handleAnswerChange(currentQ.id, currentAnswers.filter(a => a !== option));
                      }
                    }}
                  />
                  <Label htmlFor={`${currentQ.id}-${index}`}>{option}</Label>
                </div>
              ))}
            </div>
          )}

          {currentQ.type === 'text' && (
            <Textarea
              placeholder="Enter your answer here..."
              value={answers[currentQ.id] as string || ''}
              onChange={(e) => handleAnswerChange(currentQ.id, e.target.value)}
              className="min-h-[100px]"
            />
          )}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between items-center">
        <Button
          variant="outline"
          onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
          disabled={currentQuestion === 0}
        >
          Previous
        </Button>

        <div className="flex gap-2">
          {questions.map((_, index) => (
            <Button
              key={index}
              variant={index === currentQuestion ? 'default' : 'outline'}
              size="sm"
              onClick={() => setCurrentQuestion(index)}
              className="w-8 h-8 p-0"
            >
              {answers[questions[index].id] ? (
                <CheckCircle className="h-3 w-3" />
              ) : (
                index + 1
              )}
            </Button>
          ))}
        </div>

        {currentQuestion === questions.length - 1 ? (
          <Button onClick={handleSubmit} disabled={isSubmitted}>
            Submit Quiz
          </Button>
        ) : (
          <Button
            onClick={() => setCurrentQuestion(Math.min(questions.length - 1, currentQuestion + 1))}
          >
            Next
          </Button>
        )}
      </div>

      {/* Unanswered Questions Warning */}
      {Object.keys(answers).length < questions.length && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-orange-600" />
              <span className="text-sm text-orange-800">
                You have {questions.length - Object.keys(answers).length} unanswered questions
              </span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default QuizInterface;
