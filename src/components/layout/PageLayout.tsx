
import Navbar from "./Navbar";

interface PageLayoutProps {
  children: React.ReactNode;
  className?: string;
}

const PageLayout = ({ children, className = "" }: PageLayoutProps) => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <main className={`flex-1 container mx-auto p-4 md:p-6 py-6 ${className}`}>
        <div className="bg-white rounded-lg shadow-sm p-4 md:p-6">
          {children}
        </div>
      </main>
      <footer className="bg-quiz-dark text-white p-4 text-center">
        <div className="container mx-auto">
          <p className="text-sm">&copy; {new Date().getFullYear()} QuizMaster. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default PageLayout;
