import React, { useEffect, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import api from "@/services/api";

const RequireAuth: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const [onboardingCompleted, setOnboardingCompleted] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await api.get("/auth/me");
        setAuthenticated(true);
        setOnboardingCompleted(response.data.onboardingCompleted);
      } catch (error) {
        setAuthenticated(false);
        setOnboardingCompleted(false);
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  if (loading) return <div>Loading...</div>;

  // Si no está autenticado, redirige al login
  if (!authenticated) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // Si el usuario intenta acceder a /onboarding y ya completó el proceso, redirige al Dashboard
  if (location.pathname === "/onboarding" && onboardingCompleted) {
    return <Navigate to="/dashboard" replace />;
  }

  // Si el usuario está autenticado pero no ha completado el onboarding y trata de acceder a rutas
  // protegidas que no sean /onboarding, redirige a /onboarding
  if (!onboardingCompleted && location.pathname !== "/onboarding") {
    return <Navigate to="/onboarding" replace />;
  }

  // Si todo está en orden, muestra la ruta protegida
  return <Outlet />;
};

export default RequireAuth;
