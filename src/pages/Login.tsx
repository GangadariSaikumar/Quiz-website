
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PageLayout from "@/components/layout/PageLayout";

const Login = () => {
  const [activeTab, setActiveTab] = useState<string>("student");
  const [email, setEmail] = useState<string>("");
  const { login } = useAuth();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Use the appropriate demo account based on the active tab
    const loginEmail = activeTab === "admin" 
      ? "admin@example.com" 
      : "student@example.com";
    
    login(loginEmail);
  };

  return (
    <PageLayout>
      <div className="flex items-center justify-center min-h-[80vh]">
        <Card className="w-[350px] shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl text-center text-quiz-primary">Login</CardTitle>
            <CardDescription className="text-center">
              Choose your role and login to access quizzes
            </CardDescription>
          </CardHeader>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="student">Student</TabsTrigger>
              <TabsTrigger value="admin">Admin</TabsTrigger>
            </TabsList>
            
            <TabsContent value="student">
              <form onSubmit={handleLogin}>
                <CardContent className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="student-email">Email</Label>
                    <Input 
                      id="student-email" 
                      placeholder="student@example.com" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                    <p className="text-xs text-gray-500">
                      Demo: Use "student@example.com"
                    </p>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" className="w-full bg-quiz-primary hover:bg-quiz-secondary">
                    Login as Student
                  </Button>
                </CardFooter>
              </form>
            </TabsContent>
            
            <TabsContent value="admin">
              <form onSubmit={handleLogin}>
                <CardContent className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="admin-email">Email</Label>
                    <Input 
                      id="admin-email" 
                      placeholder="admin@example.com" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                    <p className="text-xs text-gray-500">
                      Demo: Use "admin@example.com"
                    </p>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" className="w-full bg-quiz-primary hover:bg-quiz-secondary">
                    Login as Admin
                  </Button>
                </CardFooter>
              </form>
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </PageLayout>
  );
};

export default Login;
