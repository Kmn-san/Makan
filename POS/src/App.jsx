import React from 'react'
import { Navigate, Route, Routes } from 'react-router'
import POSLogin from './pages/POSLogin'
import ClockInOut from './pages/Clockinout'
import POSDashboard from './pages/POSDashboard'
import WaitingApproval from './pages/WaitingApproval'
import DeviceLogin from './pages/DeviceLogin'
import { AuthProvider, useAuth } from './context/AuthContext'
import AppLoading from './component/Loading'

function AppContent() {
  const { deviceStatus, staffStatus } = useAuth()

  // Boot-time device check still in flight — don't render any route yet,
  // or we'll flash the "register device" screen before the check resolves.
  if (deviceStatus === "checking") {
    return <AppLoading />
  }

  return (
    <Routes>
      {/* Device not registered yet -> must register with a restaurant code */}
      <Route
        path='/register-device'
        element={deviceStatus === "authenticated" ? <Navigate to="/auth" /> : <DeviceLogin />}
      />

      {/* Device registered but waiting on owner approval */}
      <Route
        path='/waiting-approval'
        element={deviceStatus === "pending" ? <WaitingApproval /> : <Navigate to="/register-device" />}
      />

      {/* Staff login — only reachable once the device itself is approved & active */}
      <Route
        path='/auth'
        element={
          deviceStatus !== "authenticated" ? (
            <Navigate to="/register-device" />
          ) : staffStatus === "authenticated" ? (
            <Navigate to="/" />
          ) : (
            <POSLogin />
          )
        }
      />

      {/* POS dashboard — requires both device AND staff authenticated */}
      <Route
        path='/'
        element={
          deviceStatus === "authenticated" && staffStatus === "authenticated"
            ? <POSDashboard />
            : <Navigate to="/auth" />
        }
      />

      {/* Clock in/out also requires a registered, active device */}
      <Route
        path='/clock-in-out'
        element={deviceStatus === "authenticated" ? <ClockInOut /> : <Navigate to="/register-device" />}
      />

      {/* Fallback */}
      <Route path='*' element={<Navigate to="/auth" />} />
    </Routes>
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
