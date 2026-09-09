import React from 'react'
import POSLogin from './pages/Entrance'
import ClockInOut from './pages/Clockinout'
import { Navigate, Route, Routes } from 'react-router'
import { StaffAuthProvider, useStaffAuth } from './context/AuthContext';
import POSDashboard from './pages/POSDashboard';

function AppContent() {
  const { authStatus } = useStaffAuth();
  return (
    <Routes>
      <Route
        path='/auth'
        element={authStatus === "authenticated" ? <Navigate to="/" /> :
          <POSLogin />
        }
      />

      <Route
        path='/'
        element={authStatus === "authenticated" ? <POSDashboard /> :
          <Navigate to="/auth" />
        }
      />

      <Route
        path='/clock-in-out'
        element={<ClockInOut />}
      />
    </Routes>
  )
}

function App() {
  return (
    <StaffAuthProvider>
      <AppContent />
    </StaffAuthProvider>
  )
}

export default App