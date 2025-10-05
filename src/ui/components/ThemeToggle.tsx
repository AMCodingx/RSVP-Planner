import { Moon, Sun, Monitor } from 'lucide-react'
import { useTheme } from '../../services/ThemeContext'
import type { Theme } from '../../lib/theme'

const themeIcons = {
  light: Sun,
  dark: Moon,
  system: Monitor,
}

const themeLabels = {
  light: 'Light',
  dark: 'Dark',
  system: 'System',
}

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  const cycleTheme = () => {
    const themes: Theme[] = ['light', 'dark', 'system']
    const currentIndex = themes.indexOf(theme)
    const nextIndex = (currentIndex + 1) % themes.length
    setTheme(themes[nextIndex])
  }

  const Icon = themeIcons[theme]

  return (
    <button
      onClick={cycleTheme}
      className="inline-flex items-center justify-center h-10 w-10 rounded-xl bg-white dark:bg-gray-800 border border-gray-200/60 dark:border-gray-700/60 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2 transition-all duration-200 shadow-soft hover:shadow-soft-md"
      title={`Current theme: ${themeLabels[theme]}. Click to cycle.`}
    >
      <Icon className="h-4 w-4 text-gray-600 dark:text-gray-300" />
      <span className="sr-only">Toggle theme</span>
    </button>
  )
}