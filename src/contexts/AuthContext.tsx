
import { createContext, useContext, useEffect, useState } from "react";
import { User } from "@/types/quiz.types";
import { authenticateUser, getCurrentUser, logout } from "@/services/localStorageService";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";

interface AuthContextType {
  user: User | null;
  login: (email: string) => boolean;
  logout: () => void;
  isAdmin: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Check if user is already logged in
    const currentUser = getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
    }
  }, []);

  const loginHandler = (email: string): boolean => {
    const authenticatedUser = authenticateUser(email);
    if (authenticatedUser) {
      setUser(authenticatedUser);
      toast({
        title: "Login Successful",
        description: `Welcome back, ${authenticatedUser.name}!`,
      });
      navigate(authenticatedUser.role === 'admin' ? '/admin/dashboard' : '/student/dashboard');
      return true;
    }
    toast({
      variant: "destructive",
      title: "Login Failed",
      description: "Invalid email. Please try again.",
    });
    return false;
  };

  const logoutHandler = () => {
    logout();
    setUser(null);
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
    });
    navigate('/');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login: loginHandler,
        logout: logoutHandler,
        isAdmin: user?.role === 'admin',
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
