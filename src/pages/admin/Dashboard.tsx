
import { useState, useEffect } from "react";
import PageLayout from "@/components/layout/PageLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { getQuizzes, deleteQuiz, getQuizResults } from "@/services/localStorageService";
import { Quiz, QuizResult } from "@/types/quiz.types";
import { useAuth } from "@/contexts/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { PieChart, Pie, BarChart, Bar, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { AreaChart, Area } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Calendar, Clock, Users, BookOpen } from "lucide-react";

const AdminDashboard = () => {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [results, setResults] = useState<QuizResult[]>([]);
  const [activeFilter, setActiveFilter] = useState<"all" | "recent">("all");
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    // Load all quizzes created by the current admin
    const allQuizzes = getQuizzes();
    if (user) {
      const adminQuizzes = allQuizzes.filter(quiz => quiz.createdBy === user.id);
      setQuizzes(adminQuizzes);
      
      // Load all quiz results
      const allResults = getQuizResults();
      const relevantResults = allResults.filter(result => 
        adminQuizzes.some(quiz => quiz.id === result.quizId)
      );
      setResults(relevantResults);
    }
  }, [user]);

  const handleDeleteQuiz = (quizId: string) => {
    if (window.confirm("Are you sure you want to delete this quiz? This action cannot be undone.")) {
      const result = deleteQuiz(quizId);
      if (result) {
        setQuizzes(quizzes.filter(quiz => quiz.id !== quizId));
        toast({
          title: "Quiz Deleted",
          description: "The quiz has been successfully deleted.",
        });
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to delete the quiz. Please try again.",
        });
      }
    }
  };

  const handleCreateQuiz = () => {
    navigate("/admin/create-quiz");
  };

  // Calculate dashboard stats
  const totalAttempts = results.length;
  const averageScore = results.length > 0 
    ? Math.round(results.reduce((sum, result) => sum + result.score, 0) / results.length) 
    : 0;
  const averageTime = results.length > 0
    ? Math.round(results.reduce((sum, result) => sum + (result.timeSpent || 0), 0) / results.length)
    : 0;

  // Prepare data for charts
  const quizAttemptsData = quizzes.map(quiz => {
    const quizAttempts = results.filter(result => result.quizId === quiz.id);
    return {
      name: quiz.title.length > 15 ? quiz.title.substring(0, 15) + '...' : quiz.title,
      attempts: quizAttempts.length,
      avgScore: quizAttempts.length > 0 
        ? Math.round(quizAttempts.reduce((sum, result) => sum + result.score, 0) / quizAttempts.length) 
        : 0,
    };
  });

  // Time distribution data
  const timeDistributionData = [
    { name: "< 1 min", value: results.filter(r => (r.timeSpent || 0) < 60).length },
    { name: "1-2 min", value: results.filter(r => (r.timeSpent || 0) >= 60 && (r.timeSpent || 0) < 120).length },
    { name: "2-5 min", value: results.filter(r => (r.timeSpent || 0) >= 120 && (r.timeSpent || 0) < 300).length },
    { name: "> 5 min", value: results.filter(r => (r.timeSpent || 0) >= 300).length },
  ];

  // Score distribution data
  const scoreDistribution = [
    { name: "0-25%", value: results.filter(r => r.score <= 25).length },
    { name: "26-50%", value: results.filter(r => r.score > 25 && r.score <= 50).length },
    { name: "51-75%", value: results.filter(r => r.score > 50 && r.score <= 75).length },
    { name: "76-100%", value: results.filter(r => r.score > 75 && r.score <= 100).length },
  ];

  // Activity chart data (last 7 days)
  const last7Days = Array.from({length: 7}, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - i);
    return date.toISOString().split('T')[0];
  }).reverse();
  
  const activityData = last7Days.map(date => {
    const attemptsOnDay = results.filter(r => 
      new Date(r.completedAt).toISOString().split('T')[0] === date
    ).length;
    
    return {
      date: new Date(date).toLocaleDateString('en-US', {month: 'short', day: 'numeric'}),
      attempts: attemptsOnDay
    };
  });

  // Colors for charts
  const COLORS = ['#6E59A5', '#9b87f5', '#D6BCFA', '#E5DEFF'];

  return (
    <PageLayout>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-quiz-primary mb-1">Admin Dashboard</h1>
          <p className="text-gray-500">Welcome back! Here's an overview of your quizzes.</p>
        </div>
        <Button 
          className="bg-quiz-primary hover:bg-quiz-secondary"
          onClick={handleCreateQuiz}
        >
          Create New Quiz
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card className="bg-white border-l-4 border-l-quiz-primary">
          <CardContent className="flex items-center pt-6">
            <div className="bg-quiz-light p-4 rounded-full mr-4">
              <BookOpen className="h-6 w-6 text-quiz-primary" />
            </div>
            <div>
              <p className="text-gray-500 text-sm">Total Quizzes</p>
              <h3 className="text-2xl font-bold">{quizzes.length}</h3>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white border-l-4 border-l-quiz-secondary">
          <CardContent className="flex items-center pt-6">
            <div className="bg-quiz-light p-4 rounded-full mr-4">
              <Users className="h-6 w-6 text-quiz-secondary" />
            </div>
            <div>
              <p className="text-gray-500 text-sm">Total Attempts</p>
              <h3 className="text-2xl font-bold">{totalAttempts}</h3>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white border-l-4 border-l-quiz-accent">
          <CardContent className="flex items-center pt-6">
            <div className="bg-quiz-light p-4 rounded-full mr-4">
              <Calendar className="h-6 w-6 text-quiz-accent" />
            </div>
            <div>
              <p className="text-gray-500 text-sm">Average Score</p>
              <h3 className="text-2xl font-bold">{averageScore}%</h3>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white border-l-4 border-l-purple-400">
          <CardContent className="flex items-center pt-6">
            <div className="bg-quiz-light p-4 rounded-full mr-4">
              <Clock className="h-6 w-6 text-purple-400" />
            </div>
            <div>
              <p className="text-gray-500 text-sm">Avg. Time Spent</p>
              <h3 className="text-2xl font-bold">{Math.floor(averageTime / 60)}:{(averageTime % 60).toString().padStart(2, '0')}</h3>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      {results.length > 0 && (
        <div className="grid gap-6 md:grid-cols-2 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-quiz-primary">Quiz Attempts</CardTitle>
              <CardDescription>Number of attempts for each quiz</CardDescription>
            </CardHeader>
            <CardContent className="h-64">
              <ChartContainer 
                config={{}} 
                className="w-full h-full"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={quizAttemptsData}
                    margin={{ top: 10, right: 30, left: 0, bottom: 30 }}
                  >
                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={70} />
                    <YAxis />
                    <Tooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="attempts" fill="#6E59A5" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-quiz-primary">Activity Overview</CardTitle>
              <CardDescription>Quiz attempts over the last 7 days</CardDescription>
            </CardHeader>
            <CardContent className="h-64">
              <ChartContainer 
                config={{}} 
                className="w-full h-full"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={activityData}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="colorAttempts" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6E59A5" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#6E59A5" stopOpacity={0.1}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip content={<ChartTooltipContent />} />
                    <Area type="monotone" dataKey="attempts" stroke="#6E59A5" fillOpacity={1} fill="url(#colorAttempts)" />
                  </AreaChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>
      )}

      {results.length > 0 && (
        <div className="grid gap-6 md:grid-cols-2 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-quiz-primary">Time Distribution</CardTitle>
              <CardDescription>How long students spend on quizzes</CardDescription>
            </CardHeader>
            <CardContent className="h-64">
              <ChartContainer 
                config={{}} 
                className="w-full h-full"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={timeDistributionData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {timeDistributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<ChartTooltipContent />} />
                  </PieChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-quiz-primary">Score Distribution</CardTitle>
              <CardDescription>Performance breakdown across all quizzes</CardDescription>
            </CardHeader>
            <CardContent className="h-64">
              <ChartContainer 
                config={{}} 
                className="w-full h-full"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={scoreDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {scoreDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<ChartTooltipContent />} />
                  </PieChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Quiz List with Filter */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-quiz-primary">Your Quizzes</h2>
        <div className="flex space-x-2">
          <Button 
            variant={activeFilter === "all" ? "default" : "outline"} 
            size="sm" 
            onClick={() => setActiveFilter("all")}
            className={activeFilter === "all" ? "bg-quiz-primary" : ""}
          >
            All Quizzes
          </Button>
          <Button 
            variant={activeFilter === "recent" ? "default" : "outline"} 
            size="sm" 
            onClick={() => setActiveFilter("recent")}
            className={activeFilter === "recent" ? "bg-quiz-primary" : ""}
          >
            Recently Created
          </Button>
        </div>
      </div>

      {quizzes.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <h3 className="text-lg font-medium mb-2">No Quizzes Created Yet</h3>
            <p className="text-gray-500 mb-4">
              Get started by creating your first quiz!
            </p>
            <Button 
              className="bg-quiz-primary hover:bg-quiz-secondary"
              onClick={handleCreateQuiz}
            >
              Create Quiz
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {(activeFilter === "all" ? quizzes : quizzes.slice().sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 6)).map(quiz => {
            const quizAttempts = results.filter(r => r.quizId === quiz.id).length;
            const avgScore = quizAttempts > 0 
              ? Math.round(results.filter(r => r.quizId === quiz.id).reduce((sum, r) => sum + r.score, 0) / quizAttempts) 
              : 0;
            
            return (
              <Card key={quiz.id} className="overflow-hidden border border-gray-200 hover:shadow-md transition-shadow">
                <CardHeader className="bg-quiz-light p-4">
                  <CardTitle className="text-quiz-primary">{quiz.title}</CardTitle>
                  <div className="flex items-center text-xs text-gray-500 space-x-2">
                    <span>{new Date(quiz.createdAt).toLocaleDateString()}</span>
                    <span>•</span>
                    <span>{quiz.questions.length} Questions</span>
                  </div>
                </CardHeader>
                <CardContent className="p-4">
                  <p className="text-gray-500 text-sm mb-4 line-clamp-2">
                    {quiz.description}
                  </p>
                  
                  <div className="grid grid-cols-2 gap-2 mb-4 text-xs">
                    <div className="bg-gray-50 p-2 rounded">
                      <p className="text-gray-500">Attempts</p>
                      <p className="font-medium text-sm">{quizAttempts}</p>
                    </div>
                    <div className="bg-gray-50 p-2 rounded">
                      <p className="text-gray-500">Avg. Score</p>
                      <p className="font-medium text-sm">{avgScore}%</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      className="flex-1 border-quiz-primary text-quiz-primary hover:bg-quiz-light"
                      onClick={() => navigate(`/admin/edit-quiz/${quiz.id}`)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      className="flex-1"
                      onClick={() => handleDeleteQuiz(quiz.id)}
                    >
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </PageLayout>
  );
};

export default AdminDashboard;
