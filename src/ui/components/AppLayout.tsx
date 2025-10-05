import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Sidebar } from '../components/Sidebar'
import { useAuth } from '../../services/AuthContext'

export function AppLayout() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const { getClaims, signOut } = useAuth()
  const claims = getClaims()

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed)
  }

  const handleSignOut = () => {
    signOut()
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <Sidebar 
        isCollapsed={isSidebarCollapsed} 
        onToggleCollapse={toggleSidebar} 
        userEmail={claims?.email}
        onSignOut={handleSignOut}
      />
      
      {/* Main content area */}
      <div className={`
        transition-all duration-300 ease-in-out min-h-screen
        ${isSidebarCollapsed ? 'lg:ml-16' : 'lg:ml-72'}
      `}>
        
        {/* Page content with sidebar padding */}
        <main className="min-h-screen pr-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}