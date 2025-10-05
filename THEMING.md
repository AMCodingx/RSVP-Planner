# Theme Configuration

This project uses a centralized theming system built on top of shadcn/ui and Tailwind CSS.

## Features

- **Light/Dark/System Theme Support**: Users can choose between light, dark, or system preference
- **CSS Variables**: All colors use CSS variables for easy customization
- **Persistent Theme**: Theme preference is saved to localStorage
- **Seamless Transitions**: Smooth color transitions when switching themes
- **shadcn/ui Integration**: All components use the centralized theme system

## Usage

### Theme Provider

The `ThemeProvider` wraps the entire application and provides theme context:

```tsx
import { ThemeProvider } from './services/ThemeContext'

function App() {
  return (
    <ThemeProvider>
      {/* Your app components */}
    </ThemeProvider>
  )
}
```

### Using Theme in Components

```tsx
import { useTheme } from '../services/ThemeContext'

function MyComponent() {
  const { theme, effectiveTheme, setTheme, toggleTheme } = useTheme()
  
  return (
    <div className="bg-background text-foreground">
      Current theme: {theme}
      Effective theme: {effectiveTheme}
    </div>
  )
}
```

### Theme Toggle Component

Use the `ThemeToggle` component to allow users to switch themes:

```tsx
import { ThemeToggle } from './ui/components/ThemeToggle'

function Header() {
  return (
    <header>
      <ThemeToggle />
    </header>
  )
}
```

## Styling Guidelines

1. **Use Theme Variables**: Always use CSS variables for colors (`bg-background`, `text-foreground`, etc.)
2. **shadcn/ui Components**: Prefer shadcn/ui components over custom styles
3. **Consistent Spacing**: Use Tailwind's spacing utilities consistently
4. **No Custom CSS**: Avoid custom CSS files; use Tailwind utilities and CSS variables

## Available Theme Variables

### Core Colors
- `background` / `foreground`
- `card` / `card-foreground`
- `popover` / `popover-foreground`
- `primary` / `primary-foreground`
- `secondary` / `secondary-foreground`
- `muted` / `muted-foreground`
- `accent` / `accent-foreground`
- `destructive` / `destructive-foreground`

### Border & Input
- `border`
- `input`
- `ring`

### Border Radius
- `radius` (0.5rem by default)

## Customization

To customize the theme, edit the CSS variables in `src/index.css`:

```css
:root {
  --primary: 222.2 47.4% 11.2%;
  --primary-foreground: 210 40% 98%;
  /* ... other variables */
}

.dark {
  --primary: 210 40% 98%;
  --primary-foreground: 222.2 47.4% 11.2%;
  /* ... other variables */
}
```

Colors are defined in HSL format without the `hsl()` wrapper to work with Tailwind's opacity modifiers.