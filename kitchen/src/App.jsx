import { Navigate, Route, Routes } from 'react-router';
import KitchenDashboard from "./page/KitchenDashboard";
import Login from "./page/Login";
import { AuthProvider, useAuth } from './context/AuthContext';
import WaitingApproval from './page/WaitingApproval';

function AppContent() {
  const { authStatus } = useAuth();

  return (
    <Routes>
      <Route
        path="/auth"
        element={authStatus === "authenticated" ? <Navigate to="/" /> : <Login />}
      />

      <Route
        path="/"
        element={authStatus === "authenticated" ? <KitchenDashboard /> : <Navigate to="/auth" />}
      />

      <Route
        path="/waiting-approval"
        element={authStatus === "pending" ? <WaitingApproval /> : <Navigate to="/auth" />}
      />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;