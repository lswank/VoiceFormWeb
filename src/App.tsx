import { Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from './layouts/AppLayout';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import { FormBuilder } from './pages/FormBuilder';
import { FormDetails } from './pages/FormDetails';
import { Forms } from './pages/Forms';
import { RespondentInterface } from './pages/RespondentInterface';
import { PhoneLogin } from './pages/PhoneLogin';
import { ForgotPassword } from './pages/ForgotPassword';
import { Profile } from './pages/Profile';
import { Settings } from './pages/Settings';
import { Billing } from './pages/Billing';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';

// Initialize Stripe with test key
const stripePromise = loadStripe('pk_test_51O8qcXKTYtqPO0Uh6Hn5JbqI3pBBUWJqhxkZWxYUwFXVKNGaAHgHQVZHDHoGMOVqJwRGBP5gKEiPZGPR7lXUNkQV00CpzGRKEt');

function AppRoutes() {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      {/* Public routes */}
      <Route
        path="/login"
        element={
          isAuthenticated ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <Login />
          )
        }
      />
      <Route
        path="/login/phone"
        element={
          isAuthenticated ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <PhoneLogin />
          )
        }
      />
      <Route
        path="/forgot-password"
        element={
          isAuthenticated ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <ForgotPassword />
          )
        }
      />
      <Route
        path="/register"
        element={
          isAuthenticated ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <Register />
          )
        }
      />
      <Route path="/respond/:id" element={<RespondentInterface />} />
      
      {/* Protected routes */}
      <Route
        path="/*"
        element={
          isAuthenticated ? (
            <AppLayout>
              <Routes>
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="forms" element={<Forms />} />
                <Route path="forms/new" element={<FormBuilder />} />
                <Route path="forms/:id" element={<FormDetails />} />
                <Route path="profile" element={<Profile />} />
                <Route path="settings" element={<Settings />} />
                <Route path="billing" element={<Billing />} />
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </AppLayout>
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <Elements stripe={stripePromise}>
        <AppRoutes />
      </Elements>
    </AuthProvider>
  );
}

export default App;
