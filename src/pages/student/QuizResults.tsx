
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import PageLayout from "@/components/layout/PageLayout";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import { getQuizById, getQuizResultById } from "@/services/localStorageService";
import { Quiz, QuizResult } from "@/types/quiz.types";
import { formatTime } from "@/utils/quizUtils";

const QuizResults = () => {
  const { resultId } = useParams<{ resultId: string }>();
  const [result, setResult] = useState<QuizResult | null>(null);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);
  
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (resultId) {
      const resultData = getQuizResultById(resultId);
      if (resultData) {
        setResult(resultData);
        
        const quizData = getQuizById(resultData.quizId);
        if (quizData) {
          setQuiz(quizData);
        } else {
          toast({
            variant: "destructive",
            title: "Quiz Not Found",
            description: "The related quiz could not be found.",
          });
        }
      } else {
        toast({
          variant: "destructive",
          title: "Result Not Found",
          description: "The requested result could not be found.",
        });
        navigate("/student/dashboard");
      }
    }
    setLoading(false);
  }, [resultId, navigate, toast]);

  const getQuestionAndOption = (questionId: string, optionId: string) => {
    if (!quiz) return { questionText: '', optionText: '', isCorrect: false };
    
    const question = quiz.questions.find(q => q.id === questionId);
    if (!question) return { questionText: '', optionText: '', isCorrect: false };
    
    const option = question.options.find(o => o.id === optionId);
    if (!option) return { questionText: question.text, optionText: '', isCorrect: false };
    
    return {
      questionText: question.text,
      optionText: option.text,
      isCorrect: option.isCorrect
    };
  };

  const getCorrectOptionText = (questionId: string) => {
    if (!quiz) return '';
    
    const question = quiz.questions.find(q => q.id === questionId);
    if (!question) return '';
    
    const correctOption = question.options.find(o => o.isCorrect);
    return correctOption?.text || '';
  };

  if (loading) return <div>Loading...</div>;
  if (!result || !quiz) return <div>Result not found</div>;

  return (
    <PageLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-quiz-primary">Quiz Results</h1>
        <p className="text-gray-500">{quiz.title}</p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Summary</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 text-center bg-quiz-light rounded-md">
            <p className="text-sm text-gray-500 mb-1">Score</p>
            <p className="text-3xl font-bold text-quiz-primary">{result.score}/{result.totalQuestions}</p>
            <p className="text-sm text-gray-500 mt-1">
              {Math.round((result.score / result.totalQuestions) * 100)}%
            </p>
          </div>
          <div className="p-4 text-center bg-quiz-light rounded-md">
            <p className="text-sm text-gray-500 mb-1">Time Spent</p>
            <p className="text-3xl font-bold text-quiz-primary">{formatTime(result.timeSpent)}</p>
            <p className="text-sm text-gray-500 mt-1">mm:ss</p>
          </div>
          <div className="p-4 text-center bg-quiz-light rounded-md">
            <p className="text-sm text-gray-500 mb-1">Completed</p>
            <p className="text-3xl font-bold text-quiz-primary">{new Date(result.completedAt).toLocaleDateString()}</p>
            <p className="text-sm text-gray-500 mt-1">{new Date(result.completedAt).toLocaleTimeString()}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Detailed Results</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {result.answers.map((answer, index) => {
            const { questionText, optionText, isCorrect } = getQuestionAndOption(
              answer.questionId, 
              answer.selectedOptionId
            );
            
            const correctOptionText = getCorrectOptionText(answer.questionId);
            
            return (
              <div key={answer.questionId}>
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-medium">Question {index + 1}</h3>
                    <p className="mt-1">{questionText}</p>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-sm ${
                    answer.isCorrect 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {answer.isCorrect ? 'Correct' : 'Incorrect'}
                  </div>
                </div>
                
                <div className="mt-2 pl-4 border-l-2 border-gray-200">
                  <div className="mb-1">
                    <span className="text-sm text-gray-500">Your answer: </span>
                    <span className={answer.isCorrect ? 'text-green-600' : 'text-red-600'}>
                      {optionText}
                    </span>
                  </div>
                  
                  {!answer.isCorrect && (
                    <div>
                      <span className="text-sm text-gray-500">Correct answer: </span>
                      <span className="text-green-600">{correctOptionText}</span>
                    </div>
                  )}
                </div>
                
                {index < result.answers.length - 1 && (
                  <Separator className="my-4" />
                )}
              </div>
            );
          })}
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button
            variant="outline"
            onClick={() => navigate('/student/dashboard')}
          >
            Back to Dashboard
          </Button>
          <Button
            onClick={() => navigate(`/student/take-quiz/${quiz.id}`)}
          >
            Retake Quiz
          </Button>
        </CardFooter>
      </Card>
    </PageLayout>
  );
};

export default QuizResults;
