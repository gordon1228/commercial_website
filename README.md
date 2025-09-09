# Commercial Vehicle Platform

A modern, full-stack commercial vehicle showcase platform built with Next.js 14, TypeScript, and PostgreSQL. This platform enables businesses to display their fleet, manage inquiries, and provide detailed vehicle information to potential customers.

## 🚀 Features

### Public Features
- **Vehicle Showcase**: Browse and filter commercial vehicles by category
- **Detailed Vehicle Pages**: Comprehensive specifications, images, and pricing
- **Contact Forms**: Vehicle-specific inquiry forms with integrated contact management
- **Responsive Design**: Mobile-optimized interface using Tailwind CSS
- **Coming Soon Section**: Promotional content for upcoming vehicles
- **Company Information**: About, technology, and contact pages

### Admin Features
- **Dashboard**: Overview of inquiries, vehicles, and platform analytics
- **Vehicle Management**: Create, edit, and manage vehicle listings
- **Inquiry Management**: View and respond to customer inquiries
- **Content Management**: Update homepage content, company information
- **User Management**: Admin, manager, and user role management
- **Image Upload**: Secure file upload for vehicle images
- **Preview Mode**: Preview changes before publishing

## 🛠 Tech Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **Radix UI** - Accessible component primitives
- **Lucide React** - Modern icon library

### Backend
- **Next.js API Routes** - Server-side API endpoints
- **NextAuth.js** - Authentication and session management
- **Prisma ORM** - Type-safe database operations
- **PostgreSQL** - Robust relational database (Neon)
- **Vercel Blob Storage** - Cloud file storage for images

### Security & Validation
- **Zod** - Runtime type validation
- **bcryptjs** - Password hashing
- **Middleware** - Route protection and rate limiting
- **CSRF Protection** - Built-in security measures

## 📁 Project Structure

```
commercial_website/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── admin/             # Admin panel pages
│   │   ├── api/               # API routes
│   │   ├── about/             # About page
│   │   ├── contact/           # Contact page
│   │   ├── technology/        # Technology page
│   │   └── vehicles/          # Vehicle pages
│   ├── components/            # Reusable React components
│   │   └── ui/               # UI components (buttons, forms, etc.)
│   ├── lib/                  # Utility libraries
│   │   ├── auth.ts           # NextAuth configuration
│   │   ├── prisma.ts         # Prisma client
│   │   └── utils.ts          # Helper functions
│   ├── types/                # TypeScript type definitions
│   └── middleware.ts         # Next.js middleware
├── prisma/                   # Database schema and migrations
├── public/                   # Static assets
└── scripts/                  # Database and utility scripts
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- PostgreSQL database (Neon recommended)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd commercial_website
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   
   Create a `.env` file and update with your values:
   ```bash
   # Database - Using Neon PostgreSQL (Serverless)
   DATABASE_URL="postgresql://username:password@host:port/database"
   
   # NextAuth Configuration
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your-secret-key-here"
   
   # Application Settings
   NEXT_PUBLIC_APP_URL="http://localhost:3000"
   NODE_ENV="development"
   NEXT_TELEMETRY_DISABLED=1
   
   # File Upload Settings
   MAX_FILE_SIZE=10485760
   ALLOWED_FILE_TYPES="image/jpeg,image/png,image/webp"
   
   # Vercel Blob Storage (for file uploads)
   BLOB_READ_WRITE_TOKEN="your-vercel-blob-token-here"
   ```

4. **Database Setup**
   ```bash
   # Generate Prisma client
   npx prisma generate
   
   # Run migrations
   npx prisma db push
   
   # Seed the database
   npm run db:seed
   ```

5. **Start Development Server**
   ```bash
   npm run dev
   ```

   Visit [http://localhost:3000](http://localhost:3000) to see the application.

## 📊 Database Schema

The application uses PostgreSQL with the following main entities:

- **Users**: Admin accounts with role-based permissions
- **Categories**: Vehicle categories (trucks, buses, etc.)
- **Vehicles**: Vehicle listings with specifications and images
- **Inquiries**: Customer inquiries for specific vehicles
- **Content Tables**: Homepage, company info, and other content

## 🔐 Authentication & Authorization

### Roles
- **ADMIN**: Full system access
- **MANAGER**: Vehicle and inquiry management
- **USER**: Limited access to inquiries only

### Default Admin Account
```
Email: admin@elitefleet.com
Password: admin123
```
> **Important**: Change the default password in production!

## 🛠 Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server

# Database
npm run db:seed      # Seed database with sample data
npm run db:reset     # Reset and reseed database

# Code Quality
npm run lint         # Run ESLint
npm run typecheck    # Run TypeScript compiler check
```

## 🚀 Deployment

### Vercel (Recommended)

1. **Connect to Vercel**
   - Import your repository to Vercel
   - Vercel will auto-detect Next.js configuration

2. **Set up Vercel Blob Storage**
   - Go to Vercel Dashboard → Storage tab
   - Create a new Blob store
   - Connect it to your project
   - This automatically adds `BLOB_READ_WRITE_TOKEN` to your environment

3. **Environment Variables**
   Set the following in Vercel dashboard:
   ```
   DATABASE_URL=your_neon_database_url
   NEXTAUTH_URL=https://your-custom-domain.vercel.app
   NEXTAUTH_SECRET=your_production_secret_key
   NEXT_PUBLIC_APP_URL=https://your-custom-domain.vercel.app
   NODE_ENV=production
   NEXT_TELEMETRY_DISABLED=1
   MAX_FILE_SIZE=10485760
   ALLOWED_FILE_TYPES="image/jpeg,image/png,image/webp"
   ```

4. **Database Setup**
   - Ensure your Neon PostgreSQL database is accessible
   - Database migrations run automatically during build: `prisma db push`
   - Seed data is applied via build script

5. **Custom Domain (Optional)**
   - Add your custom domain in Vercel dashboard
   - Update `NEXTAUTH_URL` to match your custom domain

### Other Platforms

The application can be deployed to any platform supporting Node.js:
- Railway
- Heroku
- DigitalOcean App Platform
- AWS Amplify

## 🧪 API Documentation

### Public Endpoints
- `GET /api/vehicles` - List all vehicles
- `GET /api/vehicles/slug/[slug]` - Get vehicle by slug
- `GET /api/categories` - List categories
- `GET /api/homepage-content` - Get homepage content
- `GET /api/company-info` - Get company information
- `GET /api/contact-info` - Get contact information
- `GET /api/technology-content` - Get technology page content
- `GET /api/technology-features` - Get technology features
- `POST /api/inquiries/vehicle` - Submit vehicle inquiry

### Admin Endpoints (Authenticated)
- `GET /api/admin/dashboard/stats` - Dashboard statistics
- `POST /api/vehicles` - Create vehicle
- `PUT /api/vehicles/[id]` - Update vehicle
- `DELETE /api/vehicles/[id]` - Delete vehicle
- `GET /api/inquiries` - List inquiries
- `POST /api/upload` - Upload images to Vercel Blob Storage

## 🎨 Customization

### Styling
- Tailwind configuration: `tailwind.config.js`
- Global styles: `src/app/globals.css`
- Component styles: Inline Tailwind classes

### Content
- Homepage content: Admin panel → Homepage
- Company information: Admin panel → Settings
- Vehicle categories: Admin panel → Categories

### Images
- Upload via admin panel
- Stored in Vercel Blob Storage (cloud-based)
- Automatic CDN delivery and optimization
- Public URLs for fast global access

## 🔒 Security Features

- **Authentication**: NextAuth.js with JWT tokens
- **Authorization**: Role-based access control
- **Rate Limiting**: Built-in API rate limiting
- **Input Validation**: Zod schema validation
- **CSRF Protection**: Built-in CSRF tokens
- **Secure Headers**: Security middleware
- **File Upload Validation**: Type and size restrictions

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support, please contact:
- Email: support@elitefleet.com
- Documentation: [Project Wiki](link-to-wiki)
- Issues: [GitHub Issues](link-to-issues)

## ⚠️ Important Notes

### Production Checklist
- [ ] Change default admin password (`admin@elitefleet.com` / `admin123`)
- [ ] Set up Vercel Blob Storage for file uploads
- [ ] Configure custom domain and update `NEXTAUTH_URL`
- [ ] Set production-ready `NEXTAUTH_SECRET`
- [ ] Verify all environment variables in Vercel dashboard

### Known Issues & Solutions
- **File uploads fail in production**: Ensure Vercel Blob Storage is set up
- **Login redirects to wrong URL**: Update `NEXTAUTH_URL` to match your domain
- **Different images for logged-in users**: Check API middleware public routes

## 📈 Roadmap

- [ ] Email notifications for inquiries
- [ ] Multi-language support
- [ ] Advanced filtering and search
- [ ] PDF brochure generation
- [ ] Integration with CRM systems
- [ ] Mobile app development

---

Built with ❤️ using Next.js and modern web technologies.