
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import PageLayout from "@/components/layout/PageLayout";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { getQuizById, saveQuizResult } from "@/services/localStorageService";
import { Quiz, QuizResult } from "@/types/quiz.types";
import { calculateScore, formatTime } from "@/utils/quizUtils";
import { v4 as uuidv4 } from "uuid";

const TakeQuiz = () => {
  const { quizId } = useParams<{ quizId: string }>();
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
  const [timeSpent, setTimeSpent] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [result, setResult] = useState<QuizResult | null>(null);
  const [loading, setLoading] = useState(true);
  
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Load quiz data
  useEffect(() => {
    if (quizId) {
      const quizData = getQuizById(quizId);
      if (quizData) {
        setQuiz(quizData);
        setLoading(false);
      } else {
        toast({
          variant: "destructive",
          title: "Quiz Not Found",
          description: "The requested quiz could not be found.",
        });
        navigate("/student/dashboard");
      }
    }
  }, [quizId, navigate, toast]);

  // Timer effect
  useEffect(() => {
    if (!quiz || isFinished) return;
    
    const timer = setInterval(() => {
      setTimeSpent(prev => prev + 1);
    }, 1000);
    
    return () => clearInterval(timer);
  }, [quiz, isFinished]);

  const handleOptionSelect = (questionId: string, optionId: string) => {
    setSelectedOptions({
      ...selectedOptions,
      [questionId]: optionId
    });
  };

  const handleNext = () => {
    if (!quiz) return;
    
    // Check if there's a selection for the current question
    const currentQuestionId = quiz.questions[currentQuestion].id;
    if (!selectedOptions[currentQuestionId]) {
      toast({
        variant: "destructive",
        title: "Selection Required",
        description: "Please select an answer to continue.",
      });
      return;
    }
    
    if (currentQuestion < quiz.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      finishQuiz();
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const finishQuiz = () => {
    if (!quiz || !user) return;
    
    // Convert selectedOptions to array format needed for result
    const answers = Object.entries(selectedOptions).map(([questionId, optionId]) => {
      const question = quiz.questions.find(q => q.id === questionId);
      const option = question?.options.find(o => o.id === optionId);
      
      return {
        questionId,
        selectedOptionId: optionId,
        isCorrect: option?.isCorrect || false
      };
    });
    
    const score = calculateScore(
      answers.map(a => ({ questionId: a.questionId, selectedOptionId: a.selectedOptionId })),
      quiz
    );
    
    const quizResult: QuizResult = {
      id: uuidv4(),
      quizId: quiz.id,
      userId: user.id,
      score,
      totalQuestions: quiz.questions.length,
      timeSpent,
      completedAt: new Date(),
      answers
    };
    
    saveQuizResult(quizResult);
    setResult(quizResult);
    setIsFinished(true);
  };

  const handleViewResults = () => {
    if (result) {
      navigate(`/student/results/${result.id}`);
    }
  };

  const handleRetakeQuiz = () => {
    setCurrentQuestion(0);
    setSelectedOptions({});
    setTimeSpent(0);
    setIsFinished(false);
    setResult(null);
  };

  if (loading) return <div className="flex justify-center items-center h-screen">Loading...</div>;
  if (!quiz) return <div className="flex justify-center items-center h-screen">Quiz not found</div>;
  
  const currentQuestionData = quiz.questions[currentQuestion];
  const progress = ((currentQuestion + 1) / quiz.questions.length) * 100;

  return (
    <PageLayout>
      {!isFinished ? (
        <>
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-quiz-primary">{quiz.title}</h1>
              <p className="text-gray-500">Question {currentQuestion + 1} of {quiz.questions.length}</p>
            </div>
            <div className="text-right space-y-1">
              <p className="text-sm text-gray-500">Time Elapsed</p>
              <p className="font-medium text-xl">{formatTime(timeSpent)}</p>
            </div>
          </div>
          
          <Progress value={progress} className="mb-6 h-2" />
          
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>{currentQuestionData.text}</CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup
                value={selectedOptions[currentQuestionData.id] || ""}
                onValueChange={(value) => handleOptionSelect(currentQuestionData.id, value)}
              >
                <div className="space-y-3">
                  {currentQuestionData.options.map((option) => (
                    <div key={option.id} className="flex items-center space-x-2">
                      <RadioGroupItem value={option.id} id={option.id} />
                      <Label htmlFor={option.id} className="text-base cursor-pointer">
                        {option.text}
                      </Label>
                    </div>
                  ))}
                </div>
              </RadioGroup>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentQuestion === 0}
              >
                Previous
              </Button>
              <Button
                onClick={handleNext}
              >
                {currentQuestion === quiz.questions.length - 1 ? "Finish" : "Next"}
              </Button>
            </CardFooter>
          </Card>
        </>
      ) : (
        <div className="max-w-md mx-auto">
          <Card className="text-center">
            <CardHeader>
              <CardTitle className="text-2xl text-quiz-primary">Quiz Completed!</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-quiz-light rounded-full inline-block mx-auto">
                <div className="text-4xl font-bold text-quiz-primary">
                  {result?.score}/{result?.totalQuestions}
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-lg">
                  You scored {result?.score} out of {result?.totalQuestions}
                </p>
                <p className="text-gray-500">
                  Time taken: {formatTime(timeSpent)}
                </p>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button
                variant="outline"
                onClick={handleRetakeQuiz}
              >
                Retake Quiz
              </Button>
              <Button
                onClick={handleViewResults}
              >
                View Details
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}
    </PageLayout>
  );
};

export default TakeQuiz;
