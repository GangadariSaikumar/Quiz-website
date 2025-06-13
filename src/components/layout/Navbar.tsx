
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();

  return (
    <nav className="bg-quiz-primary text-white p-4 shadow-md">
      <div className="container mx-auto flex items-center justify-between">
        <Link to="/" className="text-2xl font-bold">QuizMaster</Link>
        
        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <>
              <span className="hidden md:inline-block text-sm">
                Welcome, {user?.name}
              </span>
              <Button 
                variant="outline" 
                className="bg-transparent text-white hover:bg-white hover:text-quiz-primary"
                onClick={logout}
              >
                Logout
              </Button>
              {user?.role === 'admin' ? (
                <Link to="/admin/dashboard">
                  <Button className="bg-white text-quiz-primary hover:bg-quiz-light">
                    Dashboard
                  </Button>
                </Link>
              ) : (
                <Link to="/student/dashboard">
                  <Button className="bg-white text-quiz-primary hover:bg-quiz-light">
                    My Quizzes
                  </Button>
                </Link>
              )}
            </>
          ) : (
            <Link to="/login">
              <Button className="bg-white text-quiz-primary hover:bg-quiz-light">
                Login
              </Button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
