import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { ProtectedRoute } from './routes/ProtectedRoute';
import { HomePage } from './pages/HomePage';
import { SearchPage } from './pages/SearchPage';
import { PropertyDetailsPage } from './pages/PropertyDetailsPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { FavouritesPage } from './pages/FavouritesPage';
import { ProfilePage } from './pages/ProfilePage';
import { OwnerDashboardPage } from './pages/OwnerDashboardPage';
import { OwnerListingsPage } from './pages/OwnerListingsPage';
import { OwnerListingFormPage } from './pages/OwnerListingFormPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { AdminListingsPage } from './pages/AdminListingsPage';
import { AdminReportsPage } from './pages/AdminReportsPage';

export const App: React.FC = () => {
  return (
    <div className="flex min-h-screen flex-col bg-white text-neutral-900">
      <Header />
      <main className="flex-1">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/stays" element={<SearchPage />} />
          <Route path="/stays/:slug" element={<PropertyDetailsPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Authenticated User Routes */}
          <Route
            path="/favourites"
            element={
              <ProtectedRoute>
                <FavouritesPage />
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

          {/* Property Owner Routes */}
          <Route
            path="/owner/dashboard"
            element={
              <ProtectedRoute allowedRoles={['owner', 'admin']}>
                <OwnerDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/owner/listings"
            element={
              <ProtectedRoute allowedRoles={['owner', 'admin']}>
                <OwnerListingsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/owner/listings/new"
            element={
              <ProtectedRoute allowedRoles={['owner', 'admin']}>
                <OwnerListingFormPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/owner/listings/:id/edit"
            element={
              <ProtectedRoute allowedRoles={['owner', 'admin']}>
                <OwnerListingFormPage />
              </ProtectedRoute>
            }
          />

          {/* Admin Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/listings"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminListingsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/reports"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminReportsPage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>
      <Footer />
    </div>
  );
};
