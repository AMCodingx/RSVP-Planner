import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { 
  Heart, 
  LayoutDashboard, 
  Users, 
  Menu, 
  X,
  ChevronLeft,
  ChevronRight,
  MapPin,
  LogOut,
  User,
  ChevronDown,
  ChevronUp
} from 'lucide-react'

interface SidebarProps {
  isCollapsed: boolean
  onToggleCollapse: () => void
  userEmail?: string
  onSignOut: () => void
}

export function Sidebar({ isCollapsed, onToggleCollapse, userEmail, onSignOut }: SidebarProps) {
  const location = useLocation()
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false)

  const navigation = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: LayoutDashboard,
      current: location.pathname === '/dashboard'
    },
    {
      name: 'Guests',
      href: '/guests',
      icon: Users,
      current: location.pathname === '/guests'
    },
    {
      name: 'Couples',
      href: '/couples',
      icon: User,
      current: location.pathname === '/couples'
    },
    {
      name: 'Venue',
      href: '/venue',
      icon: MapPin,
      current: location.pathname === '/venue'
    }
  ]

  const NavItem = ({ item }: { item: typeof navigation[0] }) => {
    const Icon = item.icon
    
    return (
      <Link
        to={item.href}
        onClick={() => setIsMobileOpen(false)}
        className={`
          group flex items-center text-sm font-medium rounded-xl transition-all duration-200
          ${isCollapsed ? 'justify-center p-3' : 'justify-start px-4 py-3'}
          ${item.current
            ? 'bg-rose-50 text-rose-700 dark:bg-rose-900/20 dark:text-rose-400 shadow-soft'
            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800/60 dark:hover:text-white hover:shadow-soft'
          }
        `}
      >
        <Icon className={`flex-shrink-0 h-5 w-5 ${isCollapsed ? '' : 'mr-3'}`} />
        {!isCollapsed && <span className="truncate">{item.name}</span>}
      </Link>
    )
  }

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          type="button"
          className="bg-white dark:bg-gray-900 p-3 rounded-xl shadow-soft border border-gray-200/60 dark:border-gray-700/60 hover:shadow-soft-md transition-all duration-200"
          onClick={() => setIsMobileOpen(true)}
        >
          <Menu className="h-6 w-6 text-gray-600 dark:text-gray-400" />
        </button>
      </div>

      {/* Mobile sidebar */}
      {isMobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsMobileOpen(false)} />
          <div className="relative flex flex-col w-80 bg-white dark:bg-gray-900 shadow-soft-lg">
            <div className="flex items-center justify-between p-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center shadow-soft">
                  <Heart className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900 dark:text-white text-balance">
                    Wedding RSVP
                  </h1>
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                    Planner
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsMobileOpen(false)}
                className="p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 hover:shadow-soft"
              >
                <X className="h-5 w-5 text-gray-500 dark:text-gray-400" />
              </button>
            </div>
            
            <nav className="flex-1 px-6 py-8 space-y-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setIsMobileOpen(false)}
                  className={`
                    group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200
                    ${item.current
                      ? 'bg-rose-50 text-rose-700 dark:bg-rose-900/20 dark:text-rose-400 shadow-soft'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800/60 dark:hover:text-white hover:shadow-soft'
                    }
                  `}
                >
                  <item.icon className="flex-shrink-0 h-5 w-5 mr-3" />
                  <span className="truncate">{item.name}</span>
                </Link>
              ))}
            </nav>
            
            {/* Mobile User Menu */}
            <div className="px-6 py-6">
              <div className="space-y-4">
                {/* User Info with Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                    className="w-full flex items-center space-x-3 p-4 bg-white dark:bg-gray-800/60 rounded-xl shadow-soft hover:bg-gray-50 dark:hover:bg-gray-800/80 transition-all duration-200"
                  >
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-gradient-to-br from-rose-500 to-pink-600 rounded-xl flex items-center justify-center shadow-soft">
                        <User className="h-5 w-5 text-white" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0 text-left">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                        Welcome back
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {userEmail || 'User'}
                      </p>
                    </div>
                    <div className="flex-shrink-0">
                      {isUserDropdownOpen ? (
                        <ChevronUp className="h-4 w-4 text-gray-400" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-gray-400" />
                      )}
                    </div>
                  </button>
                  
                  {/* Mobile dropdown content */}
                  {isUserDropdownOpen && (
                    <div className="mt-2 p-2 bg-white dark:bg-gray-800/80 rounded-xl shadow-soft border border-gray-200/60 dark:border-gray-700/60">
                      <div className="px-3 py-2 border-b border-gray-200/60 dark:border-gray-700/60 mb-2">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                          {userEmail || 'User'}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Wedding Planner
                        </p>
                      </div>
                      <button
                        onClick={onSignOut}
                        className="w-full flex items-center space-x-3 px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all duration-200"
                      >
                        <LogOut className="h-4 w-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <div className={`
        hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0 lg:z-40
        ${isCollapsed ? 'lg:w-16' : 'lg:w-72'}
        transition-all duration-300 ease-in-out
      `}>
        <div className="flex flex-col h-full bg-white dark:bg-gray-900 border-r border-gray-200/60 dark:border-gray-700/60 pr-2">
          {/* Logo section */}
          <div className={`
            flex items-center transition-all duration-300
            ${isCollapsed ? 'h-16 px-4 justify-center' : 'h-20 px-6 justify-between'}
          `}>
            {!isCollapsed ? (
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center shadow-soft">
                  <Heart className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900 dark:text-white text-balance">
                    Wedding RSVP
                  </h1>
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                    Planner
                  </p>
                </div>
              </div>
            ) : (
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center shadow-soft">
                <Heart className="h-6 w-6 text-white" />
              </div>
            )}
            
            {!isCollapsed && (
              <button
                onClick={onToggleCollapse}
                className="p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 hover:shadow-soft"
              >
                <ChevronLeft className="h-5 w-5 text-gray-500 dark:text-gray-400" />
              </button>
            )}
          </div>

          {/* Navigation */}
          <nav className={`flex-1 py-8 space-y-1 ${isCollapsed ? 'px-2' : 'px-4'}`}>
            {navigation.map((item) => (
              <NavItem key={item.name} item={item} />
            ))}
          </nav>

          {/* User Menu */}
          <div className={`${isCollapsed ? 'px-2 py-6' : 'px-4 py-6'}`}>
            {!isCollapsed ? (
              <div className="space-y-4">
                {/* User Info with Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                    className="w-full flex items-center space-x-3 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl shadow-soft hover:bg-gray-100 dark:hover:bg-gray-800/70 transition-all duration-200"
                  >
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-gradient-to-br from-rose-500 to-pink-600 rounded-xl flex items-center justify-center shadow-soft">
                        <User className="h-5 w-5 text-white" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0 text-left">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                        Welcome back
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {userEmail || 'User'}
                      </p>
                    </div>
                    <div className="flex-shrink-0">
                      {isUserDropdownOpen ? (
                        <ChevronUp className="h-4 w-4 text-gray-400" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-gray-400" />
                      )}
                    </div>
                  </button>
                  
                  {/* Dropdown content */}
                  {isUserDropdownOpen && (
                    <div className="mt-2 p-2 bg-white dark:bg-gray-800 rounded-xl shadow-soft-lg border border-gray-200/60 dark:border-gray-700/60">
                      <div className="px-3 py-2 border-b border-gray-200/60 dark:border-gray-700/60 mb-2">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                          {userEmail || 'User'}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Wedding Planner
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          
                          setIsUserDropdownOpen(false)
                        }}
                        className="w-full flex items-center space-x-3 px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-all duration-200"
                      >
                        
                        
                      </button>
                      <button
                        onClick={onSignOut}
                        className="w-full flex items-center space-x-3 px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all duration-200"
                      >
                        <LogOut className="h-4 w-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {/* User Avatar Collapsed with Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                    className="w-full flex justify-center"
                  >
                    <div className="w-10 h-10 bg-gradient-to-br from-rose-500 to-pink-600 rounded-xl flex items-center justify-center shadow-soft hover:shadow-soft-md transition-all duration-200">
                      <User className="h-5 w-5 text-white" />
                    </div>
                  </button>
                  
                  {/* Collapsed dropdown */}
                  {isUserDropdownOpen && (
                    <div className="absolute left-full ml-2 top-0 w-56 p-2 bg-white dark:bg-gray-800 rounded-xl shadow-soft-lg border border-gray-200/60 dark:border-gray-700/60 z-50">
                      <div className="px-3 py-2 border-b border-gray-200/60 dark:border-gray-700/60 mb-2">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                          {userEmail || 'User'}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Wedding Planner
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          
                          setIsUserDropdownOpen(false)
                        }}
                        className="w-full flex items-center space-x-3 px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-all duration-200"
                      >
                        
                        
                      </button>
                      <button
                        onClick={onSignOut}
                        className="w-full flex items-center space-x-3 px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all duration-200"
                      >
                        <LogOut className="h-4 w-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Collapse button for collapsed state */}
          {isCollapsed && (
            <div className="p-2 pb-6">
              <button
                onClick={onToggleCollapse}
                className="w-full p-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 flex justify-center hover:shadow-soft"
              >
                <ChevronRight className="h-5 w-5 text-gray-500 dark:text-gray-400" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Couple Management Modal */}
    </>
  )
}
