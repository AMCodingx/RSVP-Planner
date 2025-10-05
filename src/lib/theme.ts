export type Theme = 'light' | 'dark' | 'system'

export const themes = {
  light: 'light',
  dark: 'dark',
  system: 'system',
} as const

export const getSystemTheme = (): 'light' | 'dark' => {
  if (typeof window === 'undefined') return 'light'
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export const applyTheme = (theme: Theme) => {
  const root = document.documentElement
  
  if (theme === 'system') {
    const systemTheme = getSystemTheme()
    root.classList.remove('light', 'dark')
    root.classList.add(systemTheme)
    return systemTheme
  }
  
  root.classList.remove('light', 'dark')
  root.classList.add(theme)
  return theme
}

export const getStoredTheme = (): Theme => {
  if (typeof window === 'undefined') return 'system'
  return (localStorage.getItem('theme') as Theme) || 'system'
}

export const setStoredTheme = (theme: Theme) => {
  if (typeof window === 'undefined') return
  localStorage.setItem('theme', theme)
}