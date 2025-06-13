
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import PageLayout from "@/components/layout/PageLayout";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const Index = () => {
  const { isAuthenticated, user } = useAuth();
  
  const getStartedLink = isAuthenticated
    ? user?.role === 'admin'
      ? '/admin/dashboard'
      : '/student/dashboard'
    : '/login';

  return (
    <PageLayout>
      <div className="py-12 md:py-24">
        <div className="container px-4 md:px-6">
          <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
            <div className="space-y-4">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-quiz-primary">
                Interactive Quizzes Made Simple
              </h1>
              <p className="text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                QuizMaster helps educators create engaging quizzes and students to test their knowledge with immediate feedback.
              </p>
              <div className="flex flex-col gap-2 min-[400px]:flex-row">
                <Link to={getStartedLink}>
                  <Button className="bg-quiz-primary hover:bg-quiz-secondary text-white px-8">
                    Get Started
                  </Button>
                </Link>
              </div>
            </div>
            <div className="flex items-center justify-center">
              <div className="grid grid-cols-2 gap-4 md:gap-8">
                <Card className="bg-quiz-accent text-quiz-primary rounded-xl">
                  <CardContent className="p-6 flex flex-col items-center text-center">
                    <div className="h-12 w-12 flex items-center justify-center rounded-full bg-quiz-primary text-white text-lg font-bold mb-4">
                      A
                    </div>
                    <h3 className="text-xl font-bold">For Admins</h3>
                    <p className="text-sm mt-2">Create custom quizzes with multiple-choice questions</p>
                  </CardContent>
                </Card>
                <Card className="bg-quiz-light text-quiz-primary rounded-xl">
                  <CardContent className="p-6 flex flex-col items-center text-center">
                    <div className="h-12 w-12 flex items-center justify-center rounded-full bg-quiz-secondary text-white text-lg font-bold mb-4">
                      S
                    </div>
                    <h3 className="text-xl font-bold">For Students</h3>
                    <p className="text-sm mt-2">Take quizzes, track your progress, and view detailed results</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
        
        <div className="container px-4 md:px-6 mt-16">
          <h2 className="text-2xl font-bold text-center mb-8 text-quiz-primary">Key Features</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardContent className="p-6 flex flex-col items-center text-center">
                <div className="h-12 w-12 bg-quiz-light rounded-full flex items-center justify-center text-quiz-primary mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect width="18" height="18" x="3" y="3" rx="2" />
                    <path d="M9 10h6" />
                    <path d="M12 7v6" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold">Create Quizzes</h3>
                <p className="text-sm text-gray-500 mt-2">Easily create multiple-choice quizzes with up to four options per question</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6 flex flex-col items-center text-center">
                <div className="h-12 w-12 bg-quiz-light rounded-full flex items-center justify-center text-quiz-primary mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Z" />
                    <path d="M12 8v4l3 3" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold">Time Tracking</h3>
                <p className="text-sm text-gray-500 mt-2">Track how long students spend on each quiz for better insights</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6 flex flex-col items-center text-center">
                <div className="h-12 w-12 bg-quiz-light rounded-full flex items-center justify-center text-quiz-primary mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m9 11 3 3L22 4" />
                    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold">Instant Results</h3>
                <p className="text-sm text-gray-500 mt-2">Get immediate feedback and detailed scoring after completing a quiz</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default Index;
