# 📚 Fallback Data Management Guide

## 🎯 Overview

This guide explains how to manage fallback data in your commercial website. Fallback data ensures your website always displays content, even when the database is unavailable or data is missing.

## 📋 Table of Contents
1. [Quick Start (Non-Technical Users)](#quick-start)
2. [Understanding the System](#understanding-the-system)  
3. [Content Management via Admin](#content-management)
4. [Developer Guide](#developer-guide)
5. [File Structure](#file-structure)
6. [Troubleshooting](#troubleshooting)

---

## 🚀 Quick Start (Non-Technical Users) {#quick-start}

### Step 1: Access Admin Interface
1. Open your browser and go to `http://localhost:3000/admin`
2. Log in with your admin credentials
3. Navigate to **"Fallback Data Management"** or go directly to `/admin/fallbacks`

### Step 2: Edit Content
1. **Choose a tab**: Homepage, About, Contact, Technology, Vehicles, Header, or Footer
2. **Edit the fields** you want to update
3. **Click "Save"** for each tab you modify
4. **Verify changes** by visiting the corresponding page on your website

### That's it! ✅ 
No coding required for content updates.

---

## 🏗️ Understanding the System {#understanding-the-system}

### How Fallback Data Works

```
Database → API Fallback → Static Fallback → Default Values
   ↓           ↓              ↓               ↓
[Best]    [Good]       [Acceptable]    [Last Resort]
```

1. **Database**: Primary source (editable via admin)
2. **API Fallback**: Hardcoded in API routes  
3. **Static Fallback**: Configured in files
4. **Default Values**: Built-in defaults

### Page Structure

| Page | Admin Tab | Database Table | Static Config |
|------|-----------|---------------|---------------|
| Homepage (`/`) | Homepage | `homepage_content` | `homepage` |
| About (`/about`) | About | `company_info` | `about` |
| Contact (`/contact`) | Contact | `contact_info` | `contact` |
| Technology (`/technology`) | Technology | `technology_content` | `technology` |
| Vehicles (`/vehicles`) | Vehicles | - | `vehicles` |
| Header Component | Header | `contact_info` | `header` |
| Footer Component | Footer | `contact_info` | `footer` |

---

## 🎛️ Content Management via Admin {#content-management}

### Accessing the Admin Interface

1. **URL**: `http://localhost:3000/admin/fallbacks`
2. **Login Required**: Admin or Manager role
3. **Mobile Friendly**: Responsive design

### Tab Descriptions

#### 🏠 Homepage Tab
- **Hero Title**: Main headline on homepage
- **Hero Subtitle**: Secondary headline  
- **Hero Description**: Main description text
- **Hero Buttons**: Text for primary/secondary buttons
- **Coming Soon Image**: Desktop and mobile images
- **Company Tagline**: Featured tagline text

#### 👥 About Tab  
- **Company Name**: Business name
- **Company Description 1**: First paragraph about company
- **Company Description 2**: Second paragraph about company
- **Company Stats**: Founded year, vehicles sold, customers, etc.
- **Our Story**: Three story paragraphs
- **Mission & Vision**: Mission and vision statements

#### 📞 Contact Tab
- **Phone Numbers**: Sales, service, and finance numbers
- **Email Addresses**: Different department emails
- **Address**: Complete business address
- **Business Hours**: Operating hours for each day
- **Social Media**: Facebook, Twitter, Instagram, LinkedIn URLs
- **Legal Links**: Privacy policy and terms of service

#### 🔬 Technology Tab
- **Hero Section**: Title, subtitle, background image
- **Feature Sections**: 4 technology feature descriptions
- **Section Content**: Titles and descriptions for each section

#### 🚗 Vehicles Tab
- **Page Content**: Title, description, hero text
- **Filter Settings**: Filter title and messages
- **Default Images**: Fallback vehicle images

#### 🧭 Header Tab
- **Company Name**: Displayed in header
- **Navigation**: Menu items and links

#### 📄 Footer Tab
- **Company Info**: Name and description
- **Contact Details**: Phone, email, address
- **Social Media**: Social platform links

### Editing Workflow

1. **Select Tab** → Choose the page/section to edit
2. **Modify Fields** → Update text, numbers, or URLs
3. **Save Changes** → Click "Save" button for that tab
4. **Verify** → Check the frontend to confirm changes
5. **Repeat** → Edit other tabs as needed

### Field Types

- **Text**: Single line text (titles, names)
- **Textarea**: Multi-line text (descriptions, paragraphs)
- **Number**: Numeric values (years, counts, percentages)
- **Email**: Email addresses with validation
- **URL**: Website links and social media URLs

---

## 👨‍💻 Developer Guide {#developer-guide}

### Adding New Fallback Fields

#### 1. Update Static Configuration
**File**: `src/config/page-fallbacks.ts`

```typescript
export const PAGE_FALLBACKS: PageFallbacksConfig = {
  about: {
    companyName: 'EVTL',
    companyDescription: 'First description...',
    companyDescription2: 'Second description...',
    companyDescription3: 'NEW FIELD HERE', // ← Add new field
    // ... other fields
  }
}
```

#### 2. Add to Admin Interface
**File**: `src/app/admin/fallbacks/page.tsx`

```typescript
const PAGE_CONFIGS = {
  about: {
    title: 'About Page Fallbacks',
    fields: [
      { key: 'companyName', label: 'Company Name', type: 'text' },
      { key: 'companyDescription', label: 'Company Description 1', type: 'textarea' },
      { key: 'companyDescription2', label: 'Company Description 2', type: 'textarea' },
      { key: 'companyDescription3', label: 'Company Description 3', type: 'textarea' }, // ← Add this
      // ... other fields
    ]
  }
}
```

#### 3. Update Database Schema (if needed)
**File**: `prisma/schema.prisma`

```prisma
model CompanyInfo {
  id                  String   @id @default(cuid())
  companyName         String   @default("EVTL")
  companyDescription  String   @default("...")
  companyDescription2 String   @default("...")
  companyDescription3 String   @default("NEW DEFAULT VALUE") // ← Add this
  // ... other fields
  @@map("company_info")
}
```

Then run:
```bash
npx prisma db push
npx prisma generate
```

#### 4. Update Page Component
**File**: `src/app/about/page.tsx` (example)

```typescript
// Add to interface
interface CompanyInfo {
  companyName: string
  companyDescription: string
  companyDescription2: string
  companyDescription3: string // ← Add this
  // ... other fields
}

// Use in JSX
{companyInfo.companyDescription3 && companyInfo.companyDescription3.trim() && (
  <p className="text-xl text-muted-foreground leading-relaxed">
    {companyInfo.companyDescription3}
  </p>
)}
```

#### 5. Update TypeScript Interfaces
**File**: `src/config/page-fallbacks.ts`

```typescript
export interface AboutFallbacks {
  companyName: string
  companyDescription: string
  companyDescription2: string
  companyDescription3: string // ← Add this
  // ... other fields
}
```

### Adding New Pages

#### 1. Add to Static Config
```typescript
// In src/config/page-fallbacks.ts
export const PAGE_FALLBACKS: PageFallbacksConfig = {
  // ... existing pages
  newpage: {
    title: 'New Page Title',
    description: 'New page description',
    // ... other fields
  }
}
```

#### 2. Add to Admin Interface
```typescript
// In src/app/admin/fallbacks/page.tsx
const PAGE_CONFIGS = {
  // ... existing pages
  newpage: {
    title: 'New Page Fallbacks',
    description: 'Manage fallback content for the new page',
    fields: [
      { key: 'title', label: 'Page Title', type: 'text' },
      { key: 'description', label: 'Page Description', type: 'textarea' },
      // ... other fields
    ]
  }
}
```

#### 3. Update API Handler
```typescript
// In src/app/api/page-fallbacks/[page]/route.ts
switch (page) {
  // ... existing cases
  case 'newpage':
    try {
      // Add database query if needed
      const newPageData = await prisma.newPageContent.findFirst()
      if (newPageData) {
        pageData = {
          title: newPageData.title,
          description: newPageData.description,
          // ... map database fields
        }
      }
    } catch (error) {
      console.error('Error fetching new page content:', error)
    }
    break
}
```

### Best Practices

#### 1. Conditional Rendering
Always check for empty values to prevent blank spaces:
```typescript
{data.field && data.field.trim() && (
  <p>{data.field}</p>
)}
```

#### 2. Fallback Chain
Implement proper fallback hierarchy:
```typescript
const displayValue = data.field || fallbackData.field || 'Default Value'
```

#### 3. Type Safety
Always define TypeScript interfaces:
```typescript
interface PageData {
  field1: string
  field2: string
  // ... define all fields
}
```

#### 4. Error Handling
Wrap API calls in try-catch blocks:
```typescript
try {
  const response = await fetch('/api/page-fallbacks/about')
  // ... handle response
} catch (error) {
  console.error('Error fetching fallbacks:', error)
  // Use static fallback
}
```

---

## 📁 File Structure {#file-structure}

```
src/
├── app/
│   ├── admin/
│   │   └── fallbacks/
│   │       └── page.tsx                 # Admin interface (7 tabs)
│   ├── api/
│   │   ├── homepage-content/
│   │   │   └── route.ts                 # Homepage API
│   │   ├── company-info/
│   │   │   └── route.ts                 # About/Company API
│   │   ├── contact-info/
│   │   │   └── route.ts                 # Contact API
│   │   ├── technology-content/
│   │   │   └── route.ts                 # Technology API
│   │   └── page-fallbacks/
│   │       └── [page]/
│   │           └── route.ts             # Unified fallback API
│   ├── about/
│   │   └── page.tsx                     # About page component
│   ├── contact/
│   │   └── page.tsx                     # Contact page component
│   ├── technology/
│   │   └── page.tsx                     # Technology page component
│   ├── vehicles/
│   │   └── page.tsx                     # Vehicles page component
│   └── page.tsx                         # Homepage component
├── config/
│   ├── page-fallbacks.ts                # Page-specific fallback data ⭐
│   └── fallbacks.ts                     # Legacy fallback data
├── types/
│   └── data-config.ts                   # TypeScript interfaces
└── prisma/
    └── schema.prisma                    # Database schema
```

### Key Files Explained

| File | Purpose | When to Edit |
|------|---------|--------------|
| `admin/fallbacks/page.tsx` | Admin interface with 7 tabs | Add new form fields |
| `config/page-fallbacks.ts` | Static fallback configuration | Add new fields/pages |
| `api/page-fallbacks/[page]/route.ts` | Unified API for all pages | Add new page logic |
| `prisma/schema.prisma` | Database structure | Add new database fields |
| Page components | Frontend display | Use new fallback data |

---

## 🔧 Troubleshooting {#troubleshooting}

### Common Issues

#### 1. "No Fallback Data Found" Error
**Cause**: Admin interface can't fetch fallback data
**Solution**: 
- Check if APIs are running (`npm run dev`)
- Verify database connection
- Check browser console for errors

#### 2. Changes Not Saving
**Cause**: API endpoints not responding
**Solution**:
- Check network tab in browser dev tools
- Verify API routes exist and are correct
- Check server logs for errors

#### 3. Empty/Blank Content
**Cause**: Missing conditional rendering
**Solution**:
```typescript
// Bad
<p>{data.field}</p>

// Good  
{data.field && data.field.trim() && (
  <p>{data.field}</p>
)}
```

#### 4. TypeScript Errors
**Cause**: Missing interface definitions
**Solution**:
- Update interfaces in `src/config/page-fallbacks.ts`
- Add new fields to existing interfaces
- Run `npm run build` to check for errors

#### 5. Database Errors
**Cause**: Schema changes not applied
**Solution**:
```bash
npx prisma db push
npx prisma generate
```

### Debug Steps

1. **Check Admin Interface**: Can you see and edit the forms?
2. **Check API Response**: Use browser dev tools → Network tab
3. **Check Frontend**: Are changes appearing on the website?
4. **Check Console**: Any JavaScript errors?
5. **Check Database**: Is data being saved correctly?

### Getting Help

1. **Check the build**: Run `npm run build` to see errors
2. **Check logs**: Look at server console output  
3. **Test locally**: Try changes in development first
4. **Backup data**: Always backup before making changes

---

## 📚 Additional Resources

### Commands Reference
```bash
# Development
npm run dev              # Start development server
npm run build           # Build for production  
npm run lint            # Check for code issues

# Database
npx prisma studio       # Open database viewer
npx prisma db push      # Apply schema changes
npx prisma generate     # Regenerate Prisma client

# Deployment  
npm run start           # Start production server
```

### Useful URLs
- **Admin Interface**: `http://localhost:3000/admin/fallbacks`
- **Database Viewer**: Run `npx prisma studio`
- **API Health**: `http://localhost:3000/api/health`

### File Editing Tips
- **VS Code**: Use the built-in TypeScript support
- **Search**: Use Ctrl+Shift+F to find text across all files
- **Auto-format**: Use Prettier extension for consistent formatting
- **Type checking**: Enable TypeScript strict mode for better error detection

---

## ✅ Quick Reference

### For Content Updates:
1. Go to `/admin/fallbacks`
2. Choose tab → Edit → Save
3. Done! ✨

### For New Fields:
1. Edit `config/page-fallbacks.ts`
2. Edit `admin/fallbacks/page.tsx` 
3. Edit page components
4. Test and deploy

### For New Pages:
1. Add to config files
2. Add to admin interface
3. Add to API handler
4. Create page component
5. Test thoroughly

---

*Last updated: $(date)*
*Version: 1.0*