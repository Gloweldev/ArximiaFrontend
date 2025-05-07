// src/App.tsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./components/auth/Login";
import Register from "./components/auth/Register";
import ForgotPassword from "./components/auth/ForgotPassword";
import Onboarding from "./components/onboarding/Onboarding";
import RequireAuth from "./components/auth/RequireAuth";
import { Catalog } from "./components/catalog/Catalog";
import { ClubProvider } from "./context/ClubContext";
import Dashboard from "./components/dashboard/Dashboard"; // Se importa el Dashboard
import { DashboardLayout } from "./components/layout/DashboardLayout";
import Inventory from "./components/inventory/Inventory";
import Sales from "./components/sales/Sales";
import Expenses from "./components/expenses/Expenses";
import Account from './components/account/Account';
import Clubs from "./components/clubs/Clubs";
import Clients from "./components/clients/Clients";
import Employees from './components/employees/Employees'
import Reports from "./components/reports/Reports";
import { PricingPage } from './pages/Pricing';
import { LandingPage } from './pages/Landing';

export default function App() {
  return (
    <ClubProvider>
      <Router>
        <Routes>
          {/* Rutas públicas */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/pricing" element={<PricingPage />} />
          <Route path="/landing" element={<LandingPage />} />

          {/* Rutas protegidas */}
          <Route element={<RequireAuth />}>
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="/dashboard" element={<DashboardLayout><Dashboard /></DashboardLayout>} />
            <Route path="/catalog" element={<DashboardLayout><Catalog /></DashboardLayout>} />
            <Route path="/inventory" element={<DashboardLayout><Inventory /></DashboardLayout>} />
            <Route path="/sales" element={<DashboardLayout><Sales /></DashboardLayout>} />
            <Route path="/expenses" element={<DashboardLayout><Expenses /></DashboardLayout>} />
            <Route path="/account" element={<DashboardLayout><Account /></DashboardLayout>} />
            <Route path="/clubs" element={<DashboardLayout><Clubs/></DashboardLayout>} />
            <Route path="/clients" element={<DashboardLayout><Clients/></DashboardLayout>} />
            <Route path="/employees" element={<DashboardLayout><Employees/></DashboardLayout>} />
            <Route path="/reports" element={<DashboardLayout><Reports/></DashboardLayout>} />

          </Route>
        </Routes>
      </Router>
    </ClubProvider>
  );
}

