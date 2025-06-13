
import { Option, Question, Quiz, QuizResult } from "@/types/quiz.types";
import { v4 as uuidv4 } from "uuid";

// Create a new empty question with 4 options
export const createEmptyQuestion = (): Question => {
  return {
    id: uuidv4(),
    text: "",
    options: Array(4)
      .fill(null)
      .map(() => ({
        id: uuidv4(),
        text: "",
        isCorrect: false,
      })),
  };
};

// Create a new empty quiz
export const createEmptyQuiz = (userId: string): Quiz => {
  return {
    id: uuidv4(),
    title: "",
    description: "",
    questions: [createEmptyQuestion()],
    createdBy: userId,
    createdAt: new Date(),
  };
};

// Calculate the score for a quiz result
export const calculateScore = (
  answers: { questionId: string; selectedOptionId: string }[],
  quiz: Quiz
): number => {
  let score = 0;
  
  answers.forEach((answer) => {
    const question = quiz.questions.find((q) => q.id === answer.questionId);
    if (question) {
      const selectedOption = question.options.find(
        (o) => o.id === answer.selectedOptionId
      );
      if (selectedOption?.isCorrect) {
        score += 1;
      }
    }
  });
  
  return score;
};

// Format time from seconds to mm:ss
export const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
};

// Validate if a question is complete
export const isQuestionComplete = (question: Question): boolean => {
  if (!question.text.trim()) return false;
  
  // Check if all options have text
  if (question.options.some(option => !option.text.trim())) return false;
  
  // Check if exactly one option is marked as correct
  const correctOptions = question.options.filter(option => option.isCorrect);
  return correctOptions.length === 1;
};

// Validate if a quiz is complete and ready to be saved
export const isQuizComplete = (quiz: Quiz): boolean => {
  if (!quiz.title.trim() || !quiz.description.trim()) return false;
  if (quiz.questions.length === 0) return false;
  
  return quiz.questions.every(isQuestionComplete);
};
