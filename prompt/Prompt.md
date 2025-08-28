# Claude Code Prompts for Commercial Vehicle Platform

## Initial Setup Prompt (Start with this)

```
Create a Next.js 14 commercial vehicle platform with TypeScript and TailwindCSS.

Project structure:
- Frontend: Next.js 14 (App Router) + TypeScript + TailwindCSS + ShadCN/UI
- Backend: API routes in Next.js
- Database: PostgreSQL with Prisma ORM
- Auth: NextAuth.js with credentials provider

Initialize the project with:
1. Next.js 14 with App Router, TypeScript, TailwindCSS
2. Install: shadcn/ui, prisma, @prisma/client, next-auth, framer-motion
3. Setup Prisma with PostgreSQL connection
4. Create basic folder structure:
   - app/(public) for public pages
   - app/(admin) for admin dashboard  
   - app/api for API routes
   - components/ui for reusable components
   - lib/ for utilities

Create these initial files:
- .env.example with DATABASE_URL, NEXTAUTH_SECRET, NEXTAUTH_URL
- prisma/schema.prisma with Vehicle, User, and Inquiry models
- Basic layout with header/footer components
- Homepage with hero section and vehicle grid placeholder

Make it Tesla-inspired: dark theme, minimal design, premium feel.
```

## Phase 1: Database & Auth Setup

```
Set up the database models and authentication:

1. Update Prisma schema with:
   - Vehicle model (id, name, slug, category, price, images[], specs, status)
   - User model (id, email, password, role: ADMIN|STAFF)
   - Inquiry model (id, vehicleId, customerInfo, message, status)
   - Category model (id, name, slug)

2. Implement NextAuth.js:
   - Credentials provider with email/password
   - JWT strategy
   - Role-based middleware for /admin routes
   - Login page at /admin/login

3. Create seed script with:
   - Admin user (admin@example.com / password123)
   - 10 sample vehicles
   - 3 categories (Trucks, Vans, Buses)

4. API routes:
   - POST /api/auth/[...nextauth]
   - GET /api/vehicles (public, with pagination)
   - GET /api/vehicles/[slug] (public)

Test auth is working and protect /admin routes.
```

## Phase 2: Public Vehicle Pages

```
Build the public-facing vehicle pages with Tesla-inspired design:

1. Vehicle Listing Page (/vehicles):
   - Grid layout with vehicle cards
   - Each card: image, name, price, key specs
   - Category filter (tabs or sidebar)
   - Price range filter
   - Sort by: price, name, newest
   - Pagination or infinite scroll
   - Smooth hover animations

2. Vehicle Detail Page (/vehicles/[slug]):
   - Hero image gallery (main image + thumbnails)
   - Specs table (clean, organized)
   - Inquiry form (name, email, phone, message)
   - Related vehicles section

3. Homepage improvements:
   - Hero with video/image background
   - Featured vehicles carousel
   - Category cards with hover effects
   - Call-to-action sections

Use Framer Motion for smooth page transitions and micro-animations.
Dark theme with high contrast like Tesla.com.
```

## Phase 3: Admin Dashboard Core

```
Create the admin dashboard with CRUD operations:

1. Admin Layout (/admin):
   - Sidebar navigation
   - Dashboard home with stats cards
   - User profile dropdown
   - Responsive mobile menu

2. Vehicle Management (/admin/vehicles):
   - Table view with search and filters
   - Add/Edit vehicle form:
     * Upload multiple images
     * Rich text editor for description
     * Dynamic specs fields
   - Delete with confirmation
   - Bulk actions (delete, status change)

3. Inquiry Management (/admin/inquiries):
   - List view with status badges
   - Mark as read/responded
   - Reply via email integration
   - Export to CSV

4. API routes:
   - CRUD for vehicles (POST, PUT, DELETE)
   - GET/PUT for inquiries
   - Upload endpoint for images

Use ShadCN/UI components for forms, tables, and modals.
Clean, professional admin interface.
```

## Phase 4: Advanced Features

```
Add advanced features to complete the platform:

1. Vehicle Comparison:
   - Compare up to 3 vehicles side-by-side
   - Sticky header with vehicle names
   - Highlight differences
   - Share comparison link

2. Search & Filters:
   - Full-text search with suggestions
   - Advanced filters (year, fuel type, capacity)
   - Save filter preferences
   - URL state management

3. Content Management:
   - Editable homepage sections
   - Footer links management
   - SEO meta tags per page
   - Dynamic FAQ section

4. Performance & SEO:
   - Image optimization with next/image
   - Static generation for vehicle pages
   - Sitemap generation
   - OpenGraph tags
   - Loading skeletons

5. Email notifications:
   - Inquiry confirmation emails
   - Admin notification on new inquiry
   - Email templates
```

## Phase 5: Polish & Deploy

```
Final polish and deployment preparation:

1. UI/UX Polish:
   - Loading states and skeletons
   - Error boundaries and 404 pages
   - Form validation with proper error messages
   - Toast notifications for actions
   - Mobile responsive testing

2. Security:
   - Input sanitization
   - Rate limiting on API routes
   - CORS configuration
   - Environment variable validation

3. Testing & Documentation:
   - Basic unit tests for critical functions
   - API route testing
   - Update README with:
     * Setup instructions
     * Environment variables
     * Database setup
     * Deployment guide

4. Deployment prep:
   - Optimize build size
   - Set up Vercel deployment config
   - Database migration strategy
   - Seed production data script

Make sure everything follows Tesla's design: clean, minimal, dark, premium.
```

## Quick Feature Additions (Use as needed)

### Add 360° Vehicle View
```
Add a 360-degree vehicle view feature:
- Use react-360-view or similar library
- Add 360 images field to Vehicle model
- Display on vehicle detail page
- Smooth rotation with touch/mouse support
```

### Add Finance Calculator
```
Create a financing calculator:
- Loan amount, down payment, interest rate, term
- Monthly payment calculation
- Amortization schedule
- Save and email quote functionality
- Integrate into vehicle detail page
```

### Add Live Chat
```
Implement customer support chat:
- Use Tawk.to or Crisp free tier
- Add to public pages (bottom right)
- Admin notifications for new chats
- Offline message collection
```

### Add Analytics Dashboard
```
Add analytics to admin dashboard:
- Vehicle view tracking
- Popular vehicles chart
- Inquiry conversion rate
- Traffic sources
- Use Recharts for visualizations
```

## Tips for Claude Code

1. **Run prompts sequentially** - Complete each phase before moving to the next
2. **Test frequently** - After each phase, test the functionality
3. **Commit often** - Save your progress after each successful phase
4. **If stuck**, use specific fix prompts like:
   - "Fix the TypeScript error in [file]"
   - "The vehicle grid is not responsive, fix it"
   - "Add error handling to the vehicle API route"

5. **For specific features**, be direct:
   - "Make the header sticky with backdrop blur"
   - "Add skeleton loading to vehicle cards"
   - "Implement image zoom on vehicle detail page"

## Environment Variables Template

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/vehicle_platform"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"

# Cloudinary (optional for image hosting)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=""
CLOUDINARY_API_KEY=""
CLOUDINARY_API_SECRET=""

# Email (optional)
EMAIL_SERVER=""
EMAIL_FROM=""

# Public URL
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```