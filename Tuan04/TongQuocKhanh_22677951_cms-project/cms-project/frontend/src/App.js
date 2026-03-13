import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './store/AuthContext';

import LoginPage      from './pages/LoginPage';
import AdminLayout    from './components/admin/AdminLayout';
import DashboardPage  from './pages/DashboardPage';
import PostsPage      from './pages/PostsPage';
import PostEditorPage from './pages/PostEditorPage';
import MediaPage      from './pages/MediaPage';
import UsersPage      from './pages/UsersPage';

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div style={{ padding:'3rem', textAlign:'center' }}>Loading...</div>;
  return user ? children : <Navigate to="/login" replace />;
}

function AdminRoute({ children }) {
  const { user } = useAuth();
  return user?.role === 'admin' ? children : <Navigate to="/admin" replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/admin" element={
            <PrivateRoute><AdminLayout /></PrivateRoute>
          }>
            <Route index         element={<DashboardPage />} />
            <Route path="posts"  element={<PostsPage />} />
            <Route path="posts/new"       element={<PostEditorPage />} />
            <Route path="posts/:id/edit"  element={<PostEditorPage />} />
            <Route path="media"  element={<MediaPage />} />
            <Route path="users"  element={
              <AdminRoute><UsersPage /></AdminRoute>
            } />
          </Route>
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
