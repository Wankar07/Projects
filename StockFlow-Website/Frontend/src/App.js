import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./routes/ProtectedRoute";
import RoleRoute from "./routes/RoleRoute";
import Layout from "./components/Layout";
import ErrorBoundary from "./components/ErrorBoundary";
import { Loading } from "./components/UI";

// Lazy load pages for dynamic code-splitting and small chunk sizes
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Products = lazy(() => import("./pages/Products"));
const Sales = lazy(() => import("./pages/Sales"));
const Inventory = lazy(() => import("./pages/Inventory"));
const Users = lazy(() => import("./pages/Users"));
const Reports = lazy(() => import("./pages/Reports"));
const AIInsights = lazy(() => import("./pages/AIInsights"));
const Settings = lazy(() => import("./pages/Settings"));
const RevenueTrendPage = lazy(() => import("./pages/RevenueTrendPage"));

const safePage = (Page) => (
  <ErrorBoundary>
    <Suspense fallback={<Loading />}>
      <Page />
    </Suspense>
  </ErrorBoundary>
);

export default function App() {
  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        <Route path="/login" element={safePage(Login)} />
        <Route path="/register" element={safePage(Register)} />
        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={safePage(Dashboard)} />
            <Route path="revenue-trend" element={safePage(RevenueTrendPage)} />
            <Route path="sales" element={safePage(Sales)} />

            {/* Open Routes accessible to all authorized users */}
            <Route path="products" element={safePage(Products)} />
            <Route path="inventory" element={safePage(Inventory)} />
            <Route path="reports" element={safePage(Reports)} />
            <Route path="users" element={safePage(Users)} />

            {/* Kept AIInsights protected under ADMIN/MANAGER if required */}
            <Route element={<RoleRoute allowed={["ADMIN", "MANAGER"]} />}>
              <Route path="insights" element={safePage(AIInsights)} />
            </Route>

            {/* Kept only Settings under strict ADMIN check */}
            <Route element={<RoleRoute allowed={["ADMIN"]} />}>
              <Route path="settings" element={safePage(Settings)} />
            </Route>
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Suspense>
  );
}
