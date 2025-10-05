import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ProtectedRoute } from './ui/components/ProtectedRoute'
import { LoginPage } from './ui/pages/LoginPage'
import { DashboardPage } from './ui/pages/DashboardPage'
import { GuestsPage } from './ui/pages/GuestsPage'
import { VenuePage } from './ui/pages/VenuePage'
import { VenueEditPage } from './ui/pages/VenueEditPage'
import { GuestRSVPPage } from './ui/pages/GuestRSVPPage'
import { CoupleManagementPage } from './ui/pages/CoupleManagementPage'
import { AppLayout } from './ui/components/AppLayout'

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/rsvp/:token" element={<GuestRSVPPage />} />
        <Route 
          path="/" 
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="guests" element={<GuestsPage />} />
          <Route path="couples" element={<CoupleManagementPage />} />
          <Route path="venue" element={<VenuePage />} />
          <Route path="venue-edit" element={<VenueEditPage />} />
          <Route index element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}