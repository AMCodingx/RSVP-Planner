import { Heart, LogOut, Menu, X } from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '../services/AuthContext'
import { ThemeToggle } from '../ui/components/ThemeToggle'

export function TopNav() {
  const { getClaims, signOut } = useAuth()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  
  const claims = getClaims()

  const handleSignOut = () => {
    signOut()
  }

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  return (
    <nav className="bg-white dark:bg-gray-900/95 backdrop-blur-sm sticky top-0 z-30 shadow-soft">
      <div className="w-full px-6">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center shadow-soft">
              <Heart className="h-6 w-6 text-white" />
            </div>
            <div className="flex flex-col">
              <h1 className="text-lg font-bold text-gray-900 dark:text-white leading-tight text-balance">
                Wedding RSVP
              </h1>
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400 leading-tight">
                Planner
              </span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {/* User Info */}
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                  Welcome back
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[200px]">
                  {claims?.email}
                </p>
              </div>
              
              {/* Theme Toggle */}
              <ThemeToggle />
              
              {/* Sign Out Button */}
              <button
                onClick={handleSignOut}
                className="inline-flex items-center px-4 py-2.5 text-sm font-medium rounded-xl text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-800/60 transition-all duration-200 hover:shadow-soft"
                title="Sign out"
              >
                <LogOut className="h-4 w-4" />
                <span className="ml-2 hidden lg:block">Sign Out</span>
              </button>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={toggleMobileMenu}
              className="inline-flex items-center justify-center p-3 rounded-xl text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800/60 transition-all duration-200 hover:shadow-soft"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              {isMobileMenuOpen ? (
                <X className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden">
          <div className="px-6 py-6 space-y-4 bg-gray-50 dark:bg-gray-800/50 backdrop-blur-sm">
            {/* User Info Mobile */}
            <div className="flex items-center space-x-4 p-4 bg-white dark:bg-gray-800/60 rounded-xl shadow-soft">
              <div className="w-10 h-10 bg-gradient-to-br from-rose-500 to-pink-600 rounded-xl flex items-center justify-center shadow-soft">
                <Heart className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                  Welcome back
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {claims?.email}
                </p>
              </div>
            </div>
            
            {/* Mobile Actions */}
            <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800/60 rounded-xl shadow-soft">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Theme</span>
              <ThemeToggle />
            </div>
            
            <button
              onClick={handleSignOut}
              className="w-full flex items-center px-4 py-3 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all duration-200 hover:shadow-soft"
            >
              <LogOut className="h-4 w-4 mr-3" />
              Sign Out
            </button>
          </div>
        </div>
      )}
    </nav>
  )
}