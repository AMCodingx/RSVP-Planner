import { AuthProvider } from './services/AuthContext'
import { ThemeProvider } from './services/ThemeContext'
import { AppRouter } from './Router'

function App() {
  return (
    <div className="min-h-screen w-full bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white transition-colors">
      <ThemeProvider>
        <AuthProvider>
          <AppRouter />
        </AuthProvider>
      </ThemeProvider>
    </div>
  )
}

export default App
