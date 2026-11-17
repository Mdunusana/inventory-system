import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import AuthProvider from "./auth/AuthProvider";
import RequireAuth from "./auth/RequireAuth";
import RequireAdmin from "./auth/RequireAdmin";

import Layout from "./components/Layout";

import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import ComingSoonPage from "./pages/ComingSoonPage";
import AccessDeniedPage from "./pages/AccessDeniedPage";
import NotFoundPage from "./pages/NotFoundPage";

import ProductsPage from "./pages/ProductsPage";
import ProductFormPage from "./pages/ProductFormPage";
import CategoriesPage from "./pages/CategoriesPage";
import StockPage from "./pages/StockPage";
import NewSalePage from "./pages/NewSalePage";
import SalesHistoryPage from "./pages/SalesHistoryPage";
import ReportsPage from "./pages/ReportsPage";

export default function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Routes>

                    <Route
                        path="/login"
                        element={<LoginPage />}
                    />

                    <Route
                        path="/access-denied"
                        element={<AccessDeniedPage />}
                    />

                    <Route element={<RequireAuth />}>
                        <Route element={<Layout />}>

                            <Route
                                path="/"
                                element={<DashboardPage />}
                            />

                            <Route
                                path="/products"
                                element={<ProductsPage />}
                            />

                            <Route
                                path="/stock"
                                element={<StockPage />}
                            />

                            <Route
                                path="/sales/new"
                                element={<NewSalePage />}
                            />

                            <Route element={<RequireAdmin />}>

                                <Route
                                    path="/products/new"
                                    element={<ProductFormPage />}
                                />

                                <Route
                                    path="/products/:id/edit"
                                    element={<ProductFormPage />}
                                />

                                <Route
                                    path="/categories"
                                    element={<CategoriesPage />}
                                />

                                <Route
                                    path="/sales"
                                    element={<SalesHistoryPage />}
                                />

                                <Route
                                    path="/reports"
                                    element={<ReportsPage />}
                                />

                                <Route
                                    path="/users"
                                    element={<ComingSoonPage />}
                                />

                            </Route>
                        </Route>
                    </Route>

                    <Route
                        path=""
                        element={<Navigate to="/" replace />}
                    />

                    <Route
                        path="*"
                        element={<NotFoundPage />}
                    />

                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}