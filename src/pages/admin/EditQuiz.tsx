
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import PageLayout from "@/components/layout/PageLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import { getQuizById, saveQuiz } from "@/services/localStorageService";
import { Question, Quiz } from "@/types/quiz.types";
import { createEmptyQuestion, isQuizComplete } from "@/utils/quizUtils";

const EditQuiz = () => {
  const { quizId } = useParams<{ quizId: string }>();
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (quizId) {
      const existingQuiz = getQuizById(quizId);
      if (existingQuiz) {
        setQuiz(existingQuiz);
      } else {
        toast({
          variant: "destructive",
          title: "Quiz Not Found",
          description: "The requested quiz could not be found.",
        });
        navigate("/admin/dashboard");
      }
    }
    setLoading(false);
  }, [quizId, navigate, toast]);

  const handleQuizChange = (field: keyof Quiz, value: string) => {
    if (quiz) {
      setQuiz({ ...quiz, [field]: value });
    }
  };

  const handleQuestionChange = (questionIndex: number, field: keyof Question, value: string) => {
    if (quiz) {
      const updatedQuestions = [...quiz.questions];
      updatedQuestions[questionIndex] = {
        ...updatedQuestions[questionIndex],
        [field]: value
      };
      setQuiz({ ...quiz, questions: updatedQuestions });
    }
  };

  const handleOptionChange = (questionIndex: number, optionIndex: number, value: string) => {
    if (quiz) {
      const updatedQuestions = [...quiz.questions];
      updatedQuestions[questionIndex].options[optionIndex].text = value;
      setQuiz({ ...quiz, questions: updatedQuestions });
    }
  };

  const handleCorrectOptionChange = (questionIndex: number, optionIndex: number) => {
    if (quiz) {
      const updatedQuestions = [...quiz.questions];
      // Reset all options to not correct
      updatedQuestions[questionIndex].options.forEach(opt => opt.isCorrect = false);
      // Set the selected option as correct
      updatedQuestions[questionIndex].options[optionIndex].isCorrect = true;
      setQuiz({ ...quiz, questions: updatedQuestions });
    }
  };

  const addQuestion = () => {
    if (quiz) {
      setQuiz({
        ...quiz,
        questions: [...quiz.questions, createEmptyQuestion()]
      });
    }
  };

  const removeQuestion = (index: number) => {
    if (quiz && quiz.questions.length > 1) {
      const updatedQuestions = [...quiz.questions];
      updatedQuestions.splice(index, 1);
      setQuiz({ ...quiz, questions: updatedQuestions });
    }
  };

  const handleSaveQuiz = () => {
    if (!quiz) return;

    if (!isQuizComplete(quiz)) {
      toast({
        variant: "destructive",
        title: "Incomplete Quiz",
        description: "Please fill out all fields and ensure each question has a correct answer.",
      });
      return;
    }

    try {
      saveQuiz(quiz);
      toast({
        title: "Quiz Updated",
        description: "Your quiz has been successfully updated!",
      });
      navigate("/admin/dashboard");
    } catch (error) {
      console.error("Error updating quiz:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update quiz. Please try again.",
      });
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!quiz) return <div>Quiz not found</div>;

  return (
    <PageLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-quiz-primary">Edit Quiz</h1>
        <p className="text-gray-500">Update your quiz details below</p>
      </div>

      <div className="space-y-6">
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Quiz Title</Label>
                <Input
                  id="title"
                  value={quiz.title}
                  onChange={(e) => handleQuizChange("title", e.target.value)}
                  placeholder="Enter quiz title"
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={quiz.description}
                  onChange={(e) => handleQuizChange("description", e.target.value)}
                  placeholder="Enter quiz description"
                  rows={3}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {quiz.questions.map((question, questionIndex) => (
          <Card key={question.id} className="relative">
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">Question {questionIndex + 1}</h3>
                  {quiz.questions.length > 1 && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => removeQuestion(questionIndex)}
                    >
                      Remove
                    </Button>
                  )}
                </div>
                <div>
                  <Label htmlFor={`question-${questionIndex}`}>Question Text</Label>
                  <Input
                    id={`question-${questionIndex}`}
                    value={question.text}
                    onChange={(e) => handleQuestionChange(questionIndex, "text", e.target.value)}
                    placeholder="Enter your question"
                  />
                </div>
                <Separator />
                <div>
                  <Label>Options</Label>
                  <p className="text-xs text-gray-500 mb-2">
                    Select the correct answer using the radio buttons
                  </p>
                  <RadioGroup
                    value={question.options.findIndex(opt => opt.isCorrect).toString()}
                    onValueChange={(value) => handleCorrectOptionChange(questionIndex, parseInt(value))}
                  >
                    <div className="space-y-2">
                      {question.options.map((option, optionIndex) => (
                        <div key={option.id} className="flex items-center space-x-2">
                          <RadioGroupItem
                            value={optionIndex.toString()}
                            id={`option-${questionIndex}-${optionIndex}`}
                          />
                          <Input
                            value={option.text}
                            onChange={(e) => handleOptionChange(questionIndex, optionIndex, e.target.value)}
                            placeholder={`Option ${optionIndex + 1}`}
                            className="flex-1"
                          />
                        </div>
                      ))}
                    </div>
                  </RadioGroup>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        <div className="flex gap-4">
          <Button
            onClick={addQuestion}
            variant="outline"
            className="border-quiz-primary text-quiz-primary hover:bg-quiz-light"
          >
            Add Question
          </Button>
          <Button
            onClick={handleSaveQuiz}
            className="bg-quiz-primary hover:bg-quiz-secondary"
          >
            Save Changes
          </Button>
        </div>
      </div>
    </PageLayout>
  );
};

export default EditQuiz;
