import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import { AuthProvider, useAuth } from "@/lib/auth";
import { setAuthTokenGetter } from "@workspace/api-client-react";

// Pages
import LandingPage from "@/pages/landing";
import AuthPage from "@/pages/auth";
import VolunteerDashboard from "@/pages/volunteer/dashboard";
import VolunteerMapView from "@/pages/volunteer/map-view";
import VolunteerRSVPs from "@/pages/volunteer/rsvps";
import VolunteerProfile from "@/pages/volunteer/profile";
import OrganizerDashboard from "@/pages/organizer/dashboard";
import CreateEvent from "@/pages/organizer/create-event";

// Register the auth token getter so every generated API hook automatically
// sends the JWT. The custom fetch client calls this before each request.
setAuthTokenGetter(() => localStorage.getItem("token"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    }
  }
});

// Route Guard Component
function ProtectedRoute({ component: Component, allowedRole }: { component: any, allowedRole: string }) {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  if (isLoading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" /></div>;

  if (!user || user.role !== allowedRole) {
    setLocation("/auth");
    return null;
  }

  return <Component />;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={LandingPage} />
      <Route path="/auth" component={AuthPage} />
      
      {/* Volunteer Routes */}
      <Route path="/volunteer/dashboard">
        {() => <ProtectedRoute component={VolunteerDashboard} allowedRole="volunteer" />}
      </Route>
      <Route path="/volunteer/map-view">
        {() => <ProtectedRoute component={VolunteerMapView} allowedRole="volunteer" />}
      </Route>
      <Route path="/volunteer/rsvps">
        {() => <ProtectedRoute component={VolunteerRSVPs} allowedRole="volunteer" />}
      </Route>
      <Route path="/volunteer/profile">
        {() => <ProtectedRoute component={VolunteerProfile} allowedRole="volunteer" />}
      </Route>

      {/* Organizer Routes */}
      <Route path="/organizer/dashboard">
        {() => <ProtectedRoute component={OrganizerDashboard} allowedRole="organizer" />}
      </Route>
      <Route path="/organizer/create-event">
        {() => <ProtectedRoute component={CreateEvent} allowedRole="organizer" />}
      </Route>
      <Route path="/organizer/analytics">
        {() => <ProtectedRoute component={OrganizerDashboard} allowedRole="organizer" />} {/* Redirects to dashboard for now */}
      </Route>

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <AuthProvider>
            <Router />
          </AuthProvider>
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
