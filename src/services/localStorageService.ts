
import { Quiz, QuizResult, User } from "@/types/quiz.types";

// Initialize local storage with sample data if empty
const initializeLocalStorage = () => {
  if (!localStorage.getItem('quizzes')) {
    localStorage.setItem('quizzes', JSON.stringify([]));
  }
  if (!localStorage.getItem('quizResults')) {
    localStorage.setItem('quizResults', JSON.stringify([]));
  }
  if (!localStorage.getItem('users')) {
    const defaultUsers = [
      {
        id: '1',
        name: 'Admin User',
        email: 'admin@example.com',
        role: 'admin'
      },
      {
        id: '2',
        name: 'Student User',
        email: 'student@example.com',
        role: 'student'
      }
    ];
    localStorage.setItem('users', JSON.stringify(defaultUsers));
  }
  if (!localStorage.getItem('currentUser')) {
    localStorage.setItem('currentUser', '');
  }
};

// Call initialization
initializeLocalStorage();

// User methods
export const getUsers = (): User[] => {
  const users = localStorage.getItem('users');
  return users ? JSON.parse(users) : [];
};

export const getUserById = (id: string): User | undefined => {
  const users = getUsers();
  return users.find(user => user.id === id);
};

export const getCurrentUser = (): User | null => {
  const currentUserId = localStorage.getItem('currentUser');
  if (!currentUserId) return null;
  return getUserById(currentUserId) || null;
};

export const setCurrentUser = (userId: string) => {
  localStorage.setItem('currentUser', userId);
};

export const logout = () => {
  localStorage.setItem('currentUser', '');
};

export const authenticateUser = (email: string): User | null => {
  const users = getUsers();
  const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (user) {
    setCurrentUser(user.id);
    return user;
  }
  return null;
};

// Quiz methods
export const getQuizzes = (): Quiz[] => {
  const quizzes = localStorage.getItem('quizzes');
  return quizzes ? JSON.parse(quizzes) : [];
};

export const getQuizById = (id: string): Quiz | undefined => {
  const quizzes = getQuizzes();
  return quizzes.find(quiz => quiz.id === id);
};

export const saveQuiz = (quiz: Quiz): Quiz => {
  const quizzes = getQuizzes();
  const existingIndex = quizzes.findIndex(q => q.id === quiz.id);
  
  if (existingIndex >= 0) {
    quizzes[existingIndex] = quiz;
  } else {
    quizzes.push(quiz);
  }
  
  localStorage.setItem('quizzes', JSON.stringify(quizzes));
  return quiz;
};

export const deleteQuiz = (id: string): boolean => {
  const quizzes = getQuizzes();
  const filteredQuizzes = quizzes.filter(quiz => quiz.id !== id);
  
  if (filteredQuizzes.length < quizzes.length) {
    localStorage.setItem('quizzes', JSON.stringify(filteredQuizzes));
    return true;
  }
  return false;
};

// Quiz results methods
export const getQuizResults = (): QuizResult[] => {
  const results = localStorage.getItem('quizResults');
  return results ? JSON.parse(results) : [];
};

export const getQuizResultById = (id: string): QuizResult | undefined => {
  const results = getQuizResults();
  return results.find(result => result.id === id);
};

export const getQuizResultsByUser = (userId: string): QuizResult[] => {
  const results = getQuizResults();
  return results.filter(result => result.userId === userId);
};

export const getQuizResultsByQuiz = (quizId: string): QuizResult[] => {
  const results = getQuizResults();
  return results.filter(result => result.quizId === quizId);
};

export const saveQuizResult = (result: QuizResult): QuizResult => {
  const results = getQuizResults();
  const existingIndex = results.findIndex(r => r.id === result.id);
  
  if (existingIndex >= 0) {
    results[existingIndex] = result;
  } else {
    results.push(result);
  }
  
  localStorage.setItem('quizResults', JSON.stringify(results));
  return result;
};
