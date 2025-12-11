import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/lib/auth";
import { ProtectedRoute } from "@/components/ProtectedRoute";

import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import LandownerDashboard from "./pages/LandownerDashboard";
import GardenerDashboard from "./pages/GardenerDashboard";
import SpaceForm from "./pages/SpaceForm";
import LandownerRequests from "./pages/LandownerRequests";
import SpaceDetail from "./pages/SpaceDetail";
import ChatPage from "./pages/ChatPage";
import QRCodePage from "./pages/QRCodePage";
import NotFound from "./pages/NotFound";
import Profile from "./pages/Profile";
import Guide from "./pages/Guide"; // Import

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/auth" element={<Auth />} />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            {/* เพิ่ม Route สำหรับหน้าคู่มือ (เข้าถึงได้ทุกคน ไม่ต้องล็อกอิน) */}
            <Route path="/guide" element={<Guide />} />
            
            {/* Landowner Routes */}
            <Route
              path="/dashboard/landowner"
              element={
                <ProtectedRoute requiredRole="landowner">
                  <LandownerDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/landowner/spaces/new"
              element={
                <ProtectedRoute requiredRole="landowner">
                  <SpaceForm />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/landowner/spaces/:id/edit"
              element={
                <ProtectedRoute requiredRole="landowner">
                  <SpaceForm />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/landowner/requests"
              element={
                <ProtectedRoute requiredRole="landowner">
                  <LandownerRequests />
                </ProtectedRoute>
              }
            />

            {/* Gardener Routes */}
            <Route
              path="/dashboard/gardener"
              element={
                <ProtectedRoute requiredRole="gardener">
                  <GardenerDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/spaces/:id"
              element={
                <ProtectedRoute requiredRole="gardener">
                  <SpaceDetail />
                </ProtectedRoute>
              }
            />

            {/* Shared Routes (both roles) */}
            <Route
              path="/requests/:id/chat"
              element={
                <ProtectedRoute>
                  <ChatPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/requests/:id/qr"
              element={<QRCodePage />}
            />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

