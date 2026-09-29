import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from 'react-router-dom';

import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';

import { ProtectedRoute } from './components/ProtectedRoute';

import { LandingPage } from './pages/LandingPage';
import { AuthPage } from './pages/AuthPage';
import { DashboardPage } from './pages/DashboardPage';
import { CreateQRPage } from './pages/CreateQRPage';
import { QRDetailPage } from './pages/QRDetailPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { TemplatesPage } from './pages/TemplatesPage';
import { MyQRCodePage } from './pages/MyQRCodePage';

function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              {/* Public pages */}
              <Route
                path="/"
                element={<LandingPage />}
              />

              <Route
                path="/login"
                element={<AuthPage mode="login" />}
              />

              <Route
                path="/signup"
                element={<AuthPage mode="signup" />}
              />

              {/* Protected application */}
              <Route element={<ProtectedRoute />}>
                <Route
                  path="/dashboard"
                  element={<DashboardPage />}
                />

                <Route
                  path="/create"
                  element={<CreateQRPage />}
                />

                <Route
                  path="/qr/:id"
                  element={<QRDetailPage />}
                />

                <Route
                  path="/analytics"
                  element={<AnalyticsPage />}
                />

                <Route
                  path="/templates"
                  element={<TemplatesPage />}
                />

                <Route
                  path="/my-qr-codes"
                  element={<MyQRCodePage />}
                />
              </Route>

              {/* Unknown route */}
              <Route
                path="*"
                element={
                  <Navigate
                    to="/"
                    replace
                  />
                }
              />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}

export default App;