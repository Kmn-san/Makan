import { Navigate, Route, Routes } from 'react-router';
import KitchenDashboard from "./page/KitchenDashboard";
import Login from "./page/Login";
import { AuthProvider, useAuth } from './context/AuthContext';

function AppContent() {
  const { isLogin } = useAuth();

  return (
    <>
      <Routes>
        <Route path="/auth" element={isLogin ? <Navigate to="/" /> : <Login />} />

        <Route path="/" element={isLogin ? <KitchenDashboard /> : <Navigate to="/auth" />} >

        </Route>

      </Routes>
    </>
  )
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}

export default App