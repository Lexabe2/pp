import React from 'react';
import { Navigate } from 'react-router-dom';

export default function ProtectedRoute({ token, children }) {
  // Если токена нет, редирект на авторизацию
  if (!token) {
    return <Navigate to="/" replace />;
  }
  return children;
}