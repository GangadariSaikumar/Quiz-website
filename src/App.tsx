
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import Index from "./pages/Index";
import Login from "./pages/Login";
import AdminDashboard from "./pages/admin/Dashboard";
import CreateQuiz from "./pages/admin/CreateQuiz";
import EditQuiz from "./pages/admin/EditQuiz";
import StudentDashboard from "./pages/student/Dashboard";
import TakeQuiz from "./pages/student/TakeQuiz";
import QuizResults from "./pages/student/QuizResults";
import ProtectedRoute from "./components/ProtectedRoute";
import NotFound from "./pages/NotFound";
import { useState } from "react";

const App = () => {
  // Create a new QueryClient instance inside the component
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <BrowserRouter>
          <AuthProvider>
            <Toaster />
            <Sonner />
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              
              {/* Admin Routes */}
              <Route 
                path="/admin/dashboard" 
                element={
                  <ProtectedRoute requiredRole="admin">
                    <AdminDashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/create-quiz" 
                element={
                  <ProtectedRoute requiredRole="admin">
                    <CreateQuiz />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/edit-quiz/:quizId" 
                element={
                  <ProtectedRoute requiredRole="admin">
                    <EditQuiz />
                  </ProtectedRoute>
                } 
              />
              
              {/* Student Routes */}
              <Route 
                path="/student/dashboard" 
                element={
                  <ProtectedRoute requiredRole="student">
                    <StudentDashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/student/take-quiz/:quizId" 
                element={
                  <ProtectedRoute requiredRole="student">
                    <TakeQuiz />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/student/results/:resultId" 
                element={
                  <ProtectedRoute requiredRole="student">
                    <QuizResults />
                  </ProtectedRoute>
                } 
              />
              
              {/* 404 Route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
