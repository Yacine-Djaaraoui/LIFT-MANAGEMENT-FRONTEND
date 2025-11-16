import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Login } from "@/pages/Login";
import { Dashboard } from "@/pages/Dashboard";
import { Stock } from "@/pages/Stock";
import { Clients } from "@/pages/Clients";
import { Projects } from "@/pages/Projects";
import { Invoices } from "@/pages/Invoices";
import { CalendarComponent } from "@/pages/Calendar";
import { Statistics } from "@/pages/Statistics";
import { Employers } from "@/pages/Employers";
import { Assistants } from "@/pages/Assistants";
import { Layout } from "@/components/Layout/Layout";
import { useCurrentUser } from "@/hooks/useAuth";
import { ScrollToTop } from "@/components/ScrollToTop";

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { data: user, isLoading } = useCurrentUser();
  const token = localStorage.getItem("access_token");

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Chargement...</div>
      </div>
    );
  }

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  return <Layout>{children}</Layout>;
};

const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const token = localStorage.getItem("access_token");

  if (token) {
    return <Navigate to="/statistics" replace />;
  }

  return <>{children}</>;
};

export const AllRoutes: React.FC = () => {
  const { data: user, isLoading } = useCurrentUser();

  return (
    <>
      <ScrollToTop /> {/* <-- added here, works for ALL pages */}
      <Routes>
        {/* Public Routes */}
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />

        {/* Protected Routes */}
        <Route
          path="/statistics"
          element={
            <ProtectedRoute>
              <Statistics />
            </ProtectedRoute>
          }
        />

        <Route
          path="/stock"
          element={
            <ProtectedRoute>
              <Stock />
            </ProtectedRoute>
          }
        />

        <Route
          path="/clients"
          element={
            <ProtectedRoute>
              <Clients />
            </ProtectedRoute>
          }
        />

        <Route
          path="/projects"
          element={
            <ProtectedRoute>
              <Projects />
            </ProtectedRoute>
          }
        />

        <Route
          path="/invoices"
          element={
            <ProtectedRoute>
              <Invoices />
            </ProtectedRoute>
          }
        />

        <Route
          path="/calendar"
          element={
            <ProtectedRoute>
              <CalendarComponent />
            </ProtectedRoute>
          }
        />

        {/* {user?.role === "ADMIN" && (
        <Route
          path="/statistics"
          element={
            <ProtectedRoute>
              <Statistics />
            </ProtectedRoute>
          }
        />
      )} */}

        <Route
          path="/employers"
          element={
            <ProtectedRoute>
              <Employers />
            </ProtectedRoute>
          }
        />

        <Route
          path="/assistants"
          element={
            <ProtectedRoute>
              <Assistants />
            </ProtectedRoute>
          }
        />

        {/* Default redirect */}
        <Route path="/" element={<Navigate to="/statistics" replace />} />

        {/* 404 fallback */}
        <Route path="*" element={<Navigate to="/statistics" replace />} />
      </Routes>
    </>
  );
};
