import React from "react";
import { Toaster } from "../src/components/ui/sonner";
import { Toaster as Sonner } from "../src/components/ui/sonner";
import { TooltipProvider } from "../src/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "../src/hooks/useAuth";
import ProtectedRoute from "../src/components/ProtectedRoute";
import Login from "../src/pages/Login";
import Register from "../src/pages/Register";
import ProfilePage from "../src/pages/ProfilePage";
import NotFound from "../src/pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<Navigate to="/dashboard/profile" replace />} />
              <Route path="/dashboard/profile" element={<ProfilePage />} />
              <Route path="/dashboard/assistant" element={<Navigate to="/dashboard/profile" replace />} />
            </Route>
            <Route path="/" element={<Navigate to="/dashboard/profile" replace />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          {/* Global chat widget on protected pages */}
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
