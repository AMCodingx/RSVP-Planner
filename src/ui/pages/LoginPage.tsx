import { Heart } from 'lucide-react'
import { LoginForm } from '../../components/login-form'

export function LoginPage() {
  return (
    <div className="min-h-screen w-full grid lg:grid-cols-2">
      {/* Left Side - Login Form */}
      <div className="flex flex-col gap-4 p-4 sm:p-6 md:p-8 lg:p-10 bg-white dark:bg-gray-900 w-full">
        {/* Brand Header */}
        <div className="flex justify-center gap-2 lg:justify-start mb-4 lg:mb-0">
          <a href="#" className="flex items-center gap-2 font-medium text-gray-900 dark:text-white">
            <div className="bg-rose-500 text-white flex w-6 h-6 items-center justify-center rounded-md">
              <Heart className="w-4 h-4" />
            </div>
            <span className="text-lg lg:text-xl">RSVP Planner</span>
          </a>
        </div>
        
        {/* Login Form Container */}
        <div className="flex flex-1 items-center justify-center w-full">
          <div className="w-full max-w-sm lg:max-w-md">
            <LoginForm />
          </div>
        </div>
      </div>

      {/* Right Side - Branding */}
      <div className="relative hidden lg:block w-full">
        <div className="absolute inset-0 bg-gradient-to-br from-rose-100 via-pink-50 to-rose-200 dark:from-rose-950 dark:via-rose-900 dark:to-rose-800">
          <div className="flex h-full items-center justify-center p-8 lg:p-12">
            <div className="w-full text-center">
              <div className="mb-8 flex justify-center">
                <div className="rounded-full bg-white/20 p-6 lg:p-8 backdrop-blur-sm">
                  <Heart className="w-12 h-12 lg:w-16 lg:h-16 text-rose-600 dark:text-rose-300" />
                </div>
              </div>
              <h2 className="mb-6 text-2xl lg:text-3xl font-bold text-rose-900 dark:text-rose-100">
                Plan Your Perfect Day
              </h2>
              <p className="text-base lg:text-lg text-rose-700 dark:text-rose-200 leading-relaxed">
                Manage your wedding guests, track RSVPs, and create magical moments with our comprehensive planning tool.
              </p>
              
              {/* Feature highlights */}
              <div className="mt-8 space-y-4">
                <div className="flex items-center justify-center space-x-3 text-rose-800 dark:text-rose-200">
                  <div className="w-2 h-2 bg-rose-500 rounded-full"></div>
                  <span className="text-sm lg:text-base">Beautiful QR Code Invitations</span>
                </div>
                <div className="flex items-center justify-center space-x-3 text-rose-800 dark:text-rose-200">
                  <div className="w-2 h-2 bg-rose-500 rounded-full"></div>
                  <span className="text-sm lg:text-base">Real-time RSVP Tracking</span>
                </div>
                <div className="flex items-center justify-center space-x-3 text-rose-800 dark:text-rose-200">
                  <div className="w-2 h-2 bg-rose-500 rounded-full"></div>
                  <span className="text-sm lg:text-base">Guest Management Made Easy</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}