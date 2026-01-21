import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import RelationsPresse from "./pages/RelationsPresse";
import GrowthMarketing from "./pages/GrowthMarketing";
import SocialMedia from "./pages/SocialMedia";
import SocialMediaPaid from "./pages/SocialMediaPaid";
import Admin from "./pages/Admin";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/relations-presse"
              element={
                <ProtectedRoute>
                  <RelationsPresse />
                </ProtectedRoute>
              }
            />
            <Route
              path="/growth-marketing"
              element={
                <ProtectedRoute>
                  <GrowthMarketing />
                </ProtectedRoute>
              }
            />
            <Route
              path="/social-media"
              element={
                <ProtectedRoute>
                  <SocialMedia />
                </ProtectedRoute>
              }
            />
            <Route
              path="/social-media-paid"
              element={
                <ProtectedRoute>
                  <SocialMediaPaid />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <ProtectedRoute requireAdmin>
                  <Admin />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
