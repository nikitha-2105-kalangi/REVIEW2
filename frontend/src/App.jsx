import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { ProtectedRoute, AdminRoute } from "./components/ProtectedRoute";

// Pages & Modules
import LandingPage from "./pages/LandingPage";
import SignupPage from "./modules/registration/SignupPage";
import LoginPage from "./modules/registration/LoginPage";
import AdminLoginPage from "./modules/registration/AdminLoginPage";
import DashboardPage from "./modules/user/DashboardPage";
import AddApplicationPage from "./modules/user/AddApplicationPage";
import MyApplicationsPage from "./modules/user/MyApplicationsPage";
import InterviewsPage from "./modules/user/InterviewsPage";
import StatisticsPage from "./modules/user/StatisticsPage";
import ProfilePage from "./modules/user/ProfilePage";
import AdminDashboardPage from "./modules/admin/AdminDashboardPage";

export function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/admin-login" element={<AdminLoginPage />} />

      {/* Protected User Routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/add-application"
        element={
          <ProtectedRoute>
            <AddApplicationPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/my-applications"
        element={
          <ProtectedRoute>
            <MyApplicationsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/interviews"
        element={
          <ProtectedRoute>
            <InterviewsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/statistics"
        element={
          <ProtectedRoute>
            <StatisticsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        }
      />

      {/* Protected Admin Routes */}
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <AdminDashboardPage />
          </AdminRoute>
        }
      />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
