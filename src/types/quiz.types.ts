
export interface Option {
  id: string;
  text: string;
  isCorrect: boolean;
}

export interface Question {
  id: string;
  text: string;
  options: Option[];
}

export interface Quiz {
  id: string;
  title: string;
  description: string;
  questions: Question[];
  createdBy: string;
  createdAt: Date;
}

export interface QuizResult {
  id: string;
  quizId: string;
  userId: string;
  score: number;
  totalQuestions: number;
  timeSpent: number; // in seconds
  completedAt: Date;
  answers: {
    questionId: string;
    selectedOptionId: string;
    isCorrect: boolean;
  }[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'student';
}
