import { useState } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../services/AuthContext'
import { Heart } from 'lucide-react'

export function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  
  const { user, signIn, signUp } = useAuth()
  const location = useLocation()
  
  const from = location.state?.from?.pathname || '/dashboard'

  if (user) {
    return <Navigate to={from} replace />
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      if (isSignUp) {
        await signUp(email, password)
        setError('Check your email for the confirmation link!')
      } else {
        await signIn(email, password)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full card max-w-md mx-auto">
      <div className="card-header space-y-2">
        <div className="flex items-center justify-center mb-6">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center shadow-soft">
            <Heart className="h-7 w-7 text-white" />
          </div>
        </div>
        <h2 className="text-2xl lg:text-3xl font-bold text-center text-gray-900 dark:text-white text-balance">
          {isSignUp ? 'Create Account' : 'Welcome back'}
        </h2>
        <p className="text-center text-gray-600 dark:text-gray-400 text-sm lg:text-base text-balance">
          {isSignUp 
            ? 'Create your wedding planner account to get started'
            : 'Sign in to your wedding planner account'
          }
        </p>
      </div>
      <div className="card-content">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-semibold text-gray-900 dark:text-white">
              Email address
            </label>
            <input
              id="email"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="input"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-semibold text-gray-900 dark:text-white">
              Password
            </label>
            <input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="input"
            />
          </div>
          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200/60 dark:border-red-800/60 rounded-xl">
              <p className="text-sm text-red-700 dark:text-red-400 font-medium">
                {error}
              </p>
            </div>
          )}
          <button
            type="submit"
            disabled={isLoading}
            className="btn btn-primary w-full py-3 text-base font-semibold"
          >
            {isLoading ? 'Loading...' : isSignUp ? 'Create Account' : 'Sign in'}
          </button>
        </form>
      </div>
      <div className="card-footer">
        <div className="text-center">
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-sm text-gray-600 dark:text-gray-400 hover:text-rose-600 dark:hover:text-rose-400 font-medium transition-colors"
          >
            {isSignUp 
              ? 'Already have an account? Sign in' 
              : "Don't have an account? Sign up"
            }
          </button>
        </div>
      </div>
    </div>
  )
}