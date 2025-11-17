import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Login from "./pages/Login";
import Register from "./pages/Register";
import WaitingApproval from "./pages/WaitingApproval";
import StudentDashboard from "./pages/StudentDashboard";
import TeacherDashboard from "./pages/TeacherDashboard";
import Lesson from "./pages/Lesson";
import ScoreHistory from "./pages/ScoreHistory";
import { useAuth } from "@/_core/hooks/useAuth";

function Router() {
  const { user, isAuthenticated, loading } = useAuth();

  // Show loading screen while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">กำลังโหลด...</p>
        </div>
      </div>
    );
  }

  // Determine which dashboard to show based on user role
  const getDashboardRoute = () => {
    if (!isAuthenticated) {
      return <Login />;
    }

    if (user?.role === "teacher") {
      return <TeacherDashboard />;
    }

    return <StudentDashboard />;
  };

  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route path="/waiting-approval" component={WaitingApproval} />
      <Route path="/dashboard" component={StudentDashboard} />
      <Route path="/teacher" component={TeacherDashboard} />
      <Route path="/lesson" component={Lesson} />
      <Route path="/history" component={ScoreHistory} />
      <Route path="/" component={() => getDashboardRoute()} />
      <Route path="/404" component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
