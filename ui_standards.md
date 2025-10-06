# UI Standards & Design Guidelines

## Design Philosophy
Modern, professional, user-friendly, and minimalistic dashboard design following industry best practices.

## Typography Rules

### Font Sizes
- **Page Titles (H1)**: `text-xl` (20px) - Use sparingly, only for main page headers
- **Section Headings (H2)**: `text-sm` to `text-base` (14-16px)
- **Card Titles**: `text-sm` (14px)
- **Large Numbers/Stats**: `text-2xl` to `text-3xl` (24-30px) - Keep numbers readable but not overwhelming
- **Body Text**: `text-sm` (14px)
- **Small Text/Labels**: `text-xs` (12px)
- **Icon Sizes**: `h-4 w-4` to `h-5 w-5` for most cases, `h-3 w-3` to `h-3.5 w-3.5` for nested elements

### Font Weights
- **Bold headings**: `font-semibold` (600)
- **Stats/numbers**: `font-bold` (700)
- **Body text**: `font-medium` (500)
- **Labels**: `font-medium` (500)

## Spacing & Layout

### Padding
- **Page containers**: `p-6` (24px)
- **Cards**: `p-5` (20px) for standard cards, `p-4` (16px) for nested cards
- **Small elements**: `p-2` to `p-3` (8-12px)
- **Buttons**: `px-4 py-2` (standard), `px-6 py-3` (primary actions)

### Margins & Gaps
- **Section spacing**: `space-y-6` (24px) between major sections
- **Grid gaps**: `gap-4` (16px) for card grids
- **Element gaps**: `gap-2` to `gap-3` (8-12px) for inline elements
- **Header bottom margin**: `mb-6` (24px)

### Grid Layouts
- Use responsive grids: `grid-cols-1 lg:grid-cols-3` for 3-column layouts
- Maintain consistent column counts across sections when possible

## Visual Elements

### Border Radius
- **Cards**: `rounded-xl` (12px) for main cards
- **Buttons**: `rounded-lg` (8px) for standard buttons
- **Small elements**: `rounded-md` (6px)
- **Icons/badges**: `rounded-lg` for icon containers

### Shadows
- **Default cards**: `shadow-sm` - subtle, professional
- **Hover states**: `hover:shadow-md` - slight elevation on interaction
- **No heavy shadows**: Avoid `shadow-xl`, `shadow-2xl` for cleaner look

### Borders
- **Card borders**: `border border-gray-100 dark:border-gray-700` - subtle separation
- **Focus states**: `focus:ring-2 focus:ring-rose-500`
- **Dividers**: Use borders sparingly, prefer whitespace

### Colors
- **Primary accent**: Rose (500-600 range)
- **Success**: Green (500 range)
- **Warning**: Amber (500 range)
- **Error**: Red (500 range)
- **Info**: Blue (500 range)
- **Background**: White/Gray-50 (light), Gray-800 (dark)
- **Text**: Gray-900 (light), White (dark)
- **Muted text**: Gray-500-600 (light), Gray-400 (dark)

## Component Patterns

### Stat Cards
```
- Compact horizontal layout
- Icon + label on left/top
- Number on right or below
- Small divider for additional info
- Use text-2xl for numbers (not text-5xl)
```

### Headers
```
- Small icon (h-5 w-5) in colored background
- Title (text-xl) with subtitle (text-xs)
- Minimal spacing
- No excessive decorative elements
```

### Buttons
```
- Primary: bg-rose-500 with hover:bg-rose-600
- Secondary: bg-gray-100/bg-gray-700 with appropriate hover
- Icon buttons: p-2 with rounded-lg
- Consistent padding: px-4 py-2
```

### Tables
```
- Clean header with font-medium text-xs uppercase
- Adequate row padding (py-4 to py-6)
- Subtle hover states
- Clear visual hierarchy
```

### Empty States
```
- Centered content
- Moderate icon size (h-10 w-10 to h-12 w-12)
- Clear messaging
- Call-to-action buttons
```

## Interaction Design

### Transitions
- Use `transition-all duration-300` for most interactions
- Keep animations subtle and professional
- Avoid excessive duration values (>500ms)

### Hover States
- Slight shadow increase for cards
- Color changes for buttons
- Background tint for interactive elements
- Keep changes subtle

### Focus States
- Clear focus rings (`focus:ring-2`)
- Maintain accessibility
- Use primary color for focus indicators

## Accessibility

### Contrast
- Ensure adequate contrast ratios
- Test both light and dark modes
- Use semantic color names

### Labels
- Clear, descriptive labels for all inputs
- Use uppercase with tracking for emphasis
- Keep label text concise

### Interactive Elements
- Adequate touch targets (min 44x44px)
- Clear hover/focus states
- Keyboard navigation support

## Dark Mode

### Implementation
- Always provide dark mode variants
- Use appropriate opacity for dark backgrounds
- Maintain readability in both modes
- Test contrast in dark mode

### Color Adjustments
- Lighten text colors in dark mode
- Darken backgrounds appropriately
- Reduce opacity of borders and dividers
- Adjust colored backgrounds (e.g., `bg-rose-900/20` instead of `bg-rose-50`)

## What to Avoid

❌ **DON'T:**
- Use text-5xl or text-4xl for numbers (too large)
- Use shadow-xl or shadow-2xl (too heavy)
- Use rounded-3xl or rounded-2xl excessively (too rounded)
- Add unnecessary blur effects or gradients
- Use excessive padding (p-8, p-10, etc.)
- Create overly large gaps between elements (gap-8+)
- Make icons too large (h-8+, except for empty states)
- Use font-black or font-extrabold excessively

✅ **DO:**
- Keep font sizes moderate and readable
- Use subtle shadows for depth
- Maintain consistent spacing throughout
- Prioritize content over decoration
- Create clear visual hierarchy
- Use whitespace effectively
- Keep designs clean and minimal
- Test responsiveness at all breakpoints

## Performance

### Optimization
- Minimize excessive DOM elements
- Use CSS classes efficiently
- Avoid unnecessary wrapper divs
- Keep component tree shallow

### Loading States
- Show appropriate loading indicators
- Maintain layout during loading
- Provide clear feedback
- Use skeleton screens when appropriate

## Responsive Design

### Mobile-First Approach
- Design for mobile screens first, then scale up
- Use Tailwind's responsive prefixes: `sm:`, `md:`, `lg:`, `xl:`
- Test on multiple screen sizes

### Breakpoints
- **Mobile**: Default (< 640px)
- **Tablet**: `sm:` (≥ 640px)
- **Desktop**: `md:` (≥ 768px)
- **Large Desktop**: `lg:` (≥ 1024px)
- **Extra Large**: `xl:` (≥ 1280px)

### Mobile Patterns
- **Tables**: Convert to cards on mobile using `md:hidden` and `hidden md:block`
- **Navigation**: Stack vertically on mobile, horizontal on desktop
- **Grid Columns**: `grid-cols-1 md:grid-cols-2 lg:grid-cols-4`
- **Spacing**: Reduce padding/margins on mobile (`p-3 sm:p-4`)
- **Font Sizes**: Slightly smaller on mobile (`text-xl sm:text-2xl`)
- **Buttons**: Full width on mobile if needed

### Card View (Mobile)
```
- Clean card layout with proper spacing
- Icon + content in vertical or horizontal layout
- Action buttons at the top-right or bottom
- Collapsible sections for grouped content
- Use `rounded-lg` for cards
- Adequate touch targets (44x44px minimum)
```

### Pagination (Mobile)
```
- Show only current page, first, last, and adjacent pages on mobile
- Use `hidden sm:inline-flex` to hide middle page numbers
- Stack pagination info vertically on mobile
- Ensure touch targets are large enough
```

### Touch-Friendly
- Minimum touch target: 44x44px
- Adequate spacing between interactive elements
- Clear visual feedback on tap
- Avoid hover-only interactions
