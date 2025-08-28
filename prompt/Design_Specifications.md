# UI/UX Design Specifications for Vehicle Platform

## Design System Setup Prompt

```
Create a comprehensive design system for the vehicle platform with Tesla-inspired aesthetics:

1. Configure TailwindCSS with custom theme:
   - Colors:
     * Primary: black (#000000)
     * Secondary: white (#FFFFFF)
     * Accent: red (#E82127) for CTAs
     * Gray scale: slate-50 to slate-950
     * Success: green-600
     * Warning: amber-500
     * Error: red-600
   - Typography:
     * Font: Inter for body, SF Pro Display for headings
     * Sizes: xs (12px) to 6xl (60px)
     * Line heights: tight (1.25) to relaxed (1.75)
   - Spacing: 0.25rem increments
   - Border radius: none, sm (2px), md (4px), full
   - Shadows: none, sm, md, lg, xl (subtle, not harsh)

2. Create base components in components/ui/:
   - Button variants: primary (black), secondary (white outline), ghost
   - Input fields with floating labels
   - Card component with hover lift effect
   - Modal with backdrop blur
   - Loading spinner and skeletons

3. Global styles:
   - Dark mode by default
   - Smooth transitions (150ms ease)
   - Focus states with red accent
   - Hover states with subtle transforms

4. Layout constants:
   - Max width: 1440px
   - Header height: 80px desktop, 60px mobile
   - Sidebar width: 280px
   - Grid gaps: 24px desktop, 16px mobile
```

## Homepage UI Design Prompt

```
Design the homepage with these specific UI elements:

1. Hero Section:
   - Full viewport height (100vh)
   - Video background with overlay (opacity: 0.3)
   - Centered content:
     * Headline: 64px bold, white
     * Subheading: 24px regular, gray-300
     * Two CTAs: "Explore Fleet" (white bg) and "Get Quote" (outline)
   - Scroll indicator animation at bottom

2. Vehicle Categories (3 columns):
   - Cards with 16:9 aspect ratio images
   - On hover: scale(1.02) and shadow-xl
   - Category name: 24px semibold
   - Vehicle count: 14px gray-400
   - Black overlay gradient from bottom

3. Featured Vehicles Carousel:
   - Large cards (400px x 500px)
   - Image takes 60% height
   - Price in red accent color
   - Key specs in icon + text format
   - Autoplay with pause on hover
   - Dots navigation with active state

4. Trust Section:
   - Logo grid: 6 columns, grayscale, opacity 0.6
   - Stats bar: 4 metrics with animated counters
   - Dark background (#0a0a0a)

5. Footer:
   - Multi-column layout
   - Newsletter with single-line input + button
   - Social icons with hover glow effect
   - Copyright in smaller, muted text
```

## Vehicle Listing Page UI

```
Design the vehicle listing page with advanced filtering:

1. Page Layout:
   - Fixed filter sidebar (280px) on desktop
   - Collapsible filter panel on mobile
   - Grid: 3 columns desktop, 2 tablet, 1 mobile
   - Infinite scroll with loader

2. Filter Sidebar Design:
   - Sticky position with scroll
   - Sections with collapse/expand
   - Price range: dual handle slider with values
   - Checkboxes: custom design with red accent
   - Active filters: tags with X to remove
   - "Clear all" link at top

3. Vehicle Cards:
   - Image container: 16:10 aspect ratio
   - Image zoom on hover (scale 1.1)
   - Quick view icon on image hover
   - Title: 18px semibold, truncate
   - Price: 24px bold with red accent
   - Specs: icon grid (fuel, seats, capacity)
   - Compare checkbox in corner
   - Save heart icon (outline/filled)

4. Top Bar:
   - Results count on left
   - View toggle: grid/list icons
   - Sort dropdown with custom styling
   - Compare bar slides up when items selected

5. Loading States:
   - Skeleton cards while loading
   - Smooth fade-in animation
   - Preserve scroll position
```

## Vehicle Detail Page UI

```
Create an immersive vehicle detail page:

1. Image Gallery:
   - Main image: 70% viewport height
   - Thumbnails: horizontal scroll, 80px squares
   - Fullscreen icon in corner
   - Image counter (e.g., 1/12)
   - Smooth crossfade transitions
   - Pinch to zoom on mobile

2. Info Layout (2 columns desktop):
   Left Column:
   - Vehicle name: 40px bold
   - Category tag with icon
   - Price: 48px with financing link
   - Key highlights: icon + text list
   - CTA buttons: full width, stacked

   Right Column:
   - Tabs: Overview, Specs, Features, Documents
   - Smooth height animation on tab change
   - Specs in grouped tables
   - Features in checkmark grid

3. Sticky Action Bar (mobile):
   - Fixed bottom position
   - Price on left
   - "Get Quote" button on right
   - Slide up on scroll down

4. Related Vehicles:
   - Horizontal scroll on mobile
   - 4 columns on desktop
   - "View All" link at section end
```

## Admin Dashboard UI

```
Design a clean, functional admin dashboard:

1. Layout Structure:
   - Fixed sidebar: 280px, dark gray (#1a1a1a)
   - Top bar: white bg, 64px height
   - Main content: gray-50 background
   - Padding: 32px desktop, 16px mobile

2. Sidebar Design:
   - Logo at top with divider
   - Nav items: icon + text, 14px
   - Active state: red accent border-left
   - Hover: background gray-800
   - User section at bottom with avatar

3. Dashboard Widgets:
   - Stats cards: white bg, subtle shadow
   - Large number: 32px bold
   - Change indicator: green/red with arrow
   - Mini chart sparkline
   - Grid layout: 4 columns

4. Data Tables:
   - White background with rounded corners
   - Header: gray-100 bg, sticky
   - Rows: hover state gray-50
   - Actions: icon buttons (edit, delete)
   - Pagination: bottom right
   - Bulk actions: checkbox + top bar

5. Forms:
   - White cards with sections
   - Field labels: 12px uppercase, gray-600
   - Input focus: red accent border
   - Error states: red text below field
   - Submit button: red accent, full width mobile

6. Modals:
   - Centered with backdrop blur
   - Max width: 600px
   - Close X in corner
   - Action buttons: right-aligned
```

## Interaction & Animation Specs

```
Implement these specific interactions:

1. Micro-animations:
   - Buttons: scale(0.98) on click
   - Cards: translateY(-4px) on hover
   - Links: underline slide-in from left
   - Icons: rotate on hover (settings, refresh)
   - Numbers: count up animation on scroll

2. Page Transitions:
   - Fade between pages: 300ms
   - Slide-in sidebar: 400ms ease-out
   - Modal fade and scale: 200ms
   - Tab content: slide and fade
   - Image gallery: crossfade 500ms

3. Scroll Effects:
   - Header: backdrop-blur on scroll
   - Parallax hero images (subtle, 0.5 speed)
   - Fade-in elements on viewport enter
   - Progress bar for long pages

4. Loading States:
   - Skeleton pulse animation
   - Spinner: red accent, 48px
   - Progress bars for uploads
   - Success checkmark animation

5. Interactive Feedback:
   - Toast notifications: slide from top-right
   - Form validation: real-time with debounce
   - Tooltips: fade in with 8px offset
   - Dropdowns: slide down animation
```

## Mobile-Specific UI

```
Optimize for mobile devices:

1. Navigation:
   - Hamburger menu: animated to X
   - Full-screen overlay menu
   - Bottom tab bar for main sections
   - Swipe gestures for image gallery

2. Touch Optimizations:
   - Minimum tap target: 44px
   - Swipe to delete in lists
   - Pull to refresh on listings
   - Long press for quick actions

3. Responsive Adjustments:
   - Stack columns vertically
   - Horizontal scroll for tabs
   - Collapsible sections with + / -
   - Fixed CTAs at bottom

4. Performance:
   - Lazy load images
   - Virtualized lists for long content
   - Reduced motion option
   - Optimized font loading
```

## Component Library Setup

```
Create a Storybook or component preview page at /design-system:

1. Component Showcase:
   - All button variants and states
   - Form elements with validation states
   - Card variations
   - Modal examples
   - Alert/notification types

2. Color Palette:
   - Color swatches with hex codes
   - Usage guidelines
   - Accessibility contrast ratios

3. Typography:
   - Heading hierarchy
   - Body text variations
   - Link styles
   - Font weight examples

4. Spacing & Layout:
   - Grid system demo
   - Spacing scale visualization
   - Container widths
   - Breakpoint indicators

5. Icons:
   - Icon library grid
   - Usage examples
   - Size variations
   - Lucide React icons
```

## Accessibility Requirements

```
Ensure WCAG 2.1 AA compliance:

1. Color Contrast:
   - Text: minimum 4.5:1 ratio
   - Large text: minimum 3:1 ratio
   - Focus indicators: visible, 3:1 ratio
   - Error messages: not just color

2. Keyboard Navigation:
   - Tab order: logical flow
   - Skip to main content link
   - Escape key: close modals
   - Arrow keys: navigate menus

3. Screen Readers:
   - ARIA labels on buttons/links
   - Alt text on images
   - Form labels associated
   - Live regions for updates

4. Responsive:
   - Zoom to 200% without horizontal scroll
   - Touch targets: minimum 44px
   - Text resizable
   - Orientation support
```