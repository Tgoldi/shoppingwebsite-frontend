import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import PrivateRoute from './components/PrivateRoute';
import ErrorBoundary from './components/ErrorBoundary';
import LoadingSpinner from './components/LoadingSpinner';

const Home = lazy(() => import('./pages/Home'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const EditProfile = lazy(() => import('./pages/EditProfile'));
const FavoriteList = lazy(() => import('./pages/FavoriteList'));
const OrderProcess = lazy(() => import('./pages/OrderProcess'));
const OrderList = lazy(() => import('./pages/OrderList'));
const UserProfile = lazy(() => import('./pages/UserProfile'));
const Cart = lazy(() => import('./components/Cart'));
const OrderSummary = lazy(() => import('./pages/OrderSummary'));
const OrderHistory = lazy(() => import('./pages/OrderHistory'));
const OrderDetails = lazy(() => import('./pages/OrderDetails'));

function AppContent() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <Layout>
      <ErrorBoundary>
        <Suspense fallback={<LoadingSpinner />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={isAuthenticated ? <Navigate to="/" /> : <Login />} />
            <Route path="/register" element={isAuthenticated ? <Navigate to="/" /> : <Register />} />
            <Route path="/edit-profile" element={<EditProfile />} />
            <Route path="/favorites" element={<PrivateRoute><FavoriteList /></PrivateRoute>} />
            <Route path="/order-process/:id" element={<PrivateRoute><OrderProcess /></PrivateRoute>} />
            <Route path="/checkout/:id" element={<PrivateRoute><OrderSummary /></PrivateRoute>} />
            <Route path="/orders" element={<PrivateRoute><OrderList /></PrivateRoute>} />
            <Route path="/profile" element={<PrivateRoute><UserProfile /></PrivateRoute>} />
            <Route path="/cart" element={<PrivateRoute><Cart /></PrivateRoute>} />
            <Route path="/order-details/:orderId" element={<OrderDetails />} />
            <Route path="/order-history" element={<PrivateRoute><OrderHistory /></PrivateRoute>} /> 
            <Route path="*" element={<div>Page Not Found</div>} />
          </Routes>
        </Suspense>
      </ErrorBoundary>
    </Layout>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <CartProvider>
          <Router>
            <AppContent />
          </Router>
        </CartProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;