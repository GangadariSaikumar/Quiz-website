
import { useState, useEffect } from "react";
import PageLayout from "@/components/layout/PageLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { getQuizzes, getQuizResultsByUser } from "@/services/localStorageService";
import { Quiz, QuizResult } from "@/types/quiz.types";
import { formatTime } from "@/utils/quizUtils";
import { BookOpen, Clock, PieChart, TrendingUp } from "lucide-react";
import { 
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent
} from "@/components/ui/chart";
import { PieChart as PieChartComponent, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";

const StudentDashboard = () => {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [attemptedQuizzes, setAttemptedQuizzes] = useState<{ quiz: Quiz; result: QuizResult }[]>([]);
  const [stats, setStats] = useState({
    totalQuizzesTaken: 0,
    averageScore: 0,
    totalScore: 0,
    averageTimeSpent: 0,
    totalTimeSpent: 0,
  });
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      // Get all available quizzes
      const allQuizzes = getQuizzes();
      setQuizzes(allQuizzes);
      
      // Get results for the current user
      const userResults = getQuizResultsByUser(user.id);
      
      // Map results to quizzes
      const attempted = userResults
        .map(result => {
          const quiz = allQuizzes.find(q => q.id === result.quizId);
          return quiz ? { quiz, result } : null;
        })
        .filter((item): item is { quiz: Quiz; result: QuizResult } => item !== null);
      
      setAttemptedQuizzes(attempted);

      // Calculate stats
      if (attempted.length > 0) {
        const totalQuizzesTaken = attempted.length;
        const totalScore = attempted.reduce((sum, item) => sum + item.result.score, 0);
        const totalTimeSpent = attempted.reduce((sum, item) => sum + item.result.timeSpent, 0);
        
        setStats({
          totalQuizzesTaken,
          averageScore: Math.round((totalScore / totalQuizzesTaken) * 10) / 10,
          totalScore,
          averageTimeSpent: Math.round(totalTimeSpent / totalQuizzesTaken),
          totalTimeSpent
        });
      }
    }
  }, [user]);

  const handleTakeQuiz = (quizId: string) => {
    navigate(`/student/take-quiz/${quizId}`);
  };

  const handleViewResults = (resultId: string) => {
    navigate(`/student/results/${resultId}`);
  };

  // Data for score distribution chart
  const scoreDistributionData = [
    { name: 'Correct', value: stats.totalScore, color: '#4ade80' },
    { 
      name: 'Incorrect', 
      value: attemptedQuizzes.reduce((sum, item) => sum + (item.result.totalQuestions - item.result.score), 0),
      color: '#f87171' 
    }
  ];

  const COLORS = ['#4ade80', '#f87171'];

  return (
    <PageLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-quiz-primary">Student Dashboard</h1>
        <p className="text-gray-500">Take quizzes and review your results</p>
      </div>

      {/* Stats Overview Section */}
      {attemptedQuizzes.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Your Quiz Statistics</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 rounded-lg mr-4">
                    <BookOpen className="h-6 w-6 text-quiz-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Quizzes Completed</p>
                    <h3 className="text-2xl font-bold">{stats.totalQuizzesTaken}</h3>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg mr-4">
                    <TrendingUp className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Average Score</p>
                    <h3 className="text-2xl font-bold">{stats.averageScore} / {attemptedQuizzes[0]?.quiz.questions.length}</h3>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg mr-4">
                    <PieChart className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Total Score</p>
                    <h3 className="text-2xl font-bold">{stats.totalScore} points</h3>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center">
                  <div className="p-2 bg-orange-100 rounded-lg mr-4">
                    <Clock className="h-6 w-6 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Average Time</p>
                    <h3 className="text-2xl font-bold">{formatTime(stats.averageTimeSpent)}</h3>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Score Distribution Chart */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="md:col-span-1">
              <CardHeader>
                <CardTitle className="text-lg">Score Distribution</CardTitle>
              </CardHeader>
              <CardContent className="h-[240px] flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChartComponent>
                    <Pie
                      data={scoreDistributionData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {scoreDistributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                  </PieChartComponent>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="text-lg">Recent Quiz Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {attemptedQuizzes.slice(0, 3).map(({ quiz, result }) => (
                    <div key={result.id} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{quiz.title}</p>
                        <p className="text-sm text-gray-500">
                          {new Date(result.completedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <p className="font-medium">{result.score}/{result.totalQuestions}</p>
                          <p className="text-sm text-gray-500">{formatTime(result.timeSpent)}</p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewResults(result.id)}
                        >
                          Details
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      <Tabs defaultValue="available">
        <TabsList className="mb-4">
          <TabsTrigger value="available">Available Quizzes</TabsTrigger>
          <TabsTrigger value="attempted">My Results</TabsTrigger>
        </TabsList>
        
        <TabsContent value="available">
          {quizzes.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <h3 className="text-lg font-medium mb-2">No Quizzes Available</h3>
                <p className="text-gray-500">
                  There are currently no quizzes available to take.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {quizzes.map(quiz => {
                const hasAttempted = attemptedQuizzes.some(a => a.quiz.id === quiz.id);
                
                return (
                  <Card key={quiz.id} className="overflow-hidden border border-gray-200">
                    <CardHeader className="bg-quiz-light p-4">
                      <CardTitle className="text-quiz-primary">{quiz.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4">
                      <p className="text-gray-500 text-sm mb-4 line-clamp-2">
                        {quiz.description}
                      </p>
                      <div className="text-sm text-gray-500 mb-4">
                        <p>{quiz.questions.length} Questions</p>
                      </div>
                      <Button 
                        className={hasAttempted ? "w-full bg-quiz-secondary" : "w-full bg-quiz-primary"}
                        onClick={() => handleTakeQuiz(quiz.id)}
                      >
                        {hasAttempted ? "Retake Quiz" : "Start Quiz"}
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="attempted">
          {attemptedQuizzes.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <h3 className="text-lg font-medium mb-2">No Completed Quizzes</h3>
                <p className="text-gray-500 mb-4">
                  You haven't completed any quizzes yet.
                </p>
                <Button 
                  className="bg-quiz-primary hover:bg-quiz-secondary"
                  onClick={() => document.querySelector('[value="available"]')?.dispatchEvent(new Event('click'))}
                >
                  Find Quizzes to Take
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {attemptedQuizzes.map(({ quiz, result }) => (
                <Card key={result.id} className="overflow-hidden border border-gray-200">
                  <CardHeader className="p-4">
                    <CardTitle className="text-quiz-primary">{quiz.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4">
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Score:</span>
                        <span className="font-medium">{result.score}/{result.totalQuestions}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Time Spent:</span>
                        <span className="font-medium">{formatTime(result.timeSpent)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Completed:</span>
                        <span className="font-medium">{new Date(result.completedAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        className="flex-1 border-quiz-primary text-quiz-primary hover:bg-quiz-light"
                        onClick={() => handleViewResults(result.id)}
                      >
                        View Details
                      </Button>
                      <Button 
                        className="flex-1 bg-quiz-primary hover:bg-quiz-secondary"
                        onClick={() => handleTakeQuiz(quiz.id)}
                      >
                        Retake
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </PageLayout>
  );
};

// Custom tooltip for the chart
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-2 border rounded shadow text-sm">
        <p className="font-semibold">{payload[0].name}: {payload[0].value}</p>
      </div>
    );
  }
  return null;
};

export default StudentDashboard;
