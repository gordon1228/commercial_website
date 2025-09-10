import { z } from 'zod'

// Vehicle validation schemas
export const vehicleSpecsSchema = z.object({
  fuel: z.string().optional(),
  capacity: z.string().optional(),
  weight: z.string().optional(),
  engine: z.string().optional(),
  horsepower: z.string().optional(),
  features: z.array(z.string()).optional(),
}).catchall(z.unknown()) // Allow additional properties

export const createVehicleSchema = z.object({
  name: z.string().min(1, 'Vehicle name is required').max(255),
  description: z.string().optional(),
  price: z.number().positive('Price must be positive'),
  categoryId: z.string().cuid('Invalid category ID'),
  year: z.number().int().min(1900).max(new Date().getFullYear() + 2),
  make: z.string().min(1, 'Make is required').max(255),
  fuelType: z.string().min(1, 'Fuel type is required').max(255),
  transmission: z.string().optional(),
  specs: vehicleSpecsSchema.optional(),
  images: z.array(z.string().url()).optional(),
  mobileImages: z.array(z.string().url()).optional(),
  status: z.enum(['AVAILABLE', 'SOLD', 'RESERVED']).optional(),
  featured: z.boolean().optional(),
})

export const updateVehicleSchema = createVehicleSchema.partial().extend({
  active: z.boolean().optional(),
})

export const vehicleQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
  category: z.string().optional(),
  status: z.string().optional(),
  search: z.string().optional(),
  priceMin: z.coerce.number().optional(),
  priceMax: z.coerce.number().optional(),
  fuelType: z.string().optional(),
  transmission: z.string().optional(),
  yearMin: z.coerce.number().int().optional(),
  yearMax: z.coerce.number().int().optional(),
  make: z.string().optional(),
  featured: z.enum(['true', 'false']).optional(),
  sortBy: z.enum(['name', 'price-low', 'price-high', 'newest', 'oldest', 'recent']).optional(),
})

// User validation schemas
export const userCreateSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  role: z.enum(['USER', 'ADMIN', 'MANAGER']).optional(),
})

export const userUpdateSchema = userCreateSchema.partial()

export const passwordChangeSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters'),
  confirmPassword: z.string().min(1, 'Password confirmation is required'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

// Inquiry validation schemas
export const inquiryCreateSchema = z.object({
  vehicleId: z.string().cuid().optional(),
  customerName: z.string().min(1, 'Name is required').max(255),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  message: z.string().min(1, 'Message is required'),
})

export const inquiryUpdateSchema = z.object({
  status: z.enum(['NEW', 'PENDING', 'RESOLVED', 'CLOSED']),
  notes: z.string().optional(),
})

// Category validation schemas
export const categoryCreateSchema = z.object({
  name: z.string().min(1, 'Category name is required').max(255),
  description: z.string().optional(),
  active: z.boolean().optional(),
})

export const categoryUpdateSchema = categoryCreateSchema.partial()

// Company info validation schemas
export const companyInfoSchema = z.object({
  companyName: z.string().min(1, 'Company name is required').max(255),
  companyDescription: z.string().min(1, 'Company description is required'),
  foundedYear: z.number().int().min(1800).max(new Date().getFullYear()).optional(),
  totalVehiclesSold: z.number().int().min(0).optional(),
  totalHappyCustomers: z.number().int().min(0).optional(),
  totalYearsExp: z.number().int().min(0).optional(),
  satisfactionRate: z.number().min(0).max(100).optional(),
  storyTitle: z.string().optional(),
  storyParagraph1: z.string().optional(),
  storyParagraph2: z.string().optional(),
  storyParagraph3: z.string().optional(),
  missionTitle: z.string().optional(),
  missionText: z.string().optional(),
  visionTitle: z.string().optional(),
  visionText: z.string().optional(),
})

// Contact info validation schemas
export const contactInfoSchema = z.object({
  salesPhone: z.string().min(1, 'Sales phone is required'),
  servicePhone: z.string().min(1, 'Service phone is required'),
  financePhone: z.string().optional(),
  salesEmail: z.string().email('Invalid sales email'),
  serviceEmail: z.string().email('Invalid service email'),
  supportEmail: z.string().email('Invalid support email'),
  address: z.string().min(1, 'Address is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  postcode: z.string().min(1, 'Postcode is required'),
  country: z.string().min(1, 'Country is required'),
  directions: z.string().optional(),
  mondayToFriday: z.string().optional(),
  saturday: z.string().optional(),
  sunday: z.string().optional(),
  siteName: z.string().optional(),
  emailNotifications: z.boolean().optional(),
  systemNotifications: z.boolean().optional(),
  maintenanceMode: z.boolean().optional(),
  facebookUrl: z.string().url().optional().or(z.literal('')),
  twitterUrl: z.string().url().optional().or(z.literal('')),
  instagramUrl: z.string().url().optional().or(z.literal('')),
  linkedinUrl: z.string().url().optional().or(z.literal('')),
  privacyPolicyUrl: z.string().url().optional().or(z.literal('')),
  termsOfServiceUrl: z.string().url().optional().or(z.literal('')),
})

// Homepage content validation
export const homepageContentSchema = z.object({
  heroTitle: z.string().min(1, 'Hero title is required'),
  heroSubtitle: z.string().min(1, 'Hero subtitle is required'),
  heroDescription: z.string().optional(),
  heroImage: z.string().url().optional(),
  heroMobileImage: z.string().url().optional(),
  comingSoonTitle: z.string().optional(),
  comingSoonDescription: z.string().optional(),
  comingSoonImage: z.string().url().optional(),
  comingSoonMobileImage: z.string().url().optional(),
  showComingSoon: z.boolean().optional(),
})

// File upload validation
export const fileUploadSchema = z.object({
  file: z.instanceof(File),
  category: z.enum(['vehicle', 'hero', 'coming-soon', 'company']).optional(),
})

// Generic list query parameters
export const listQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
  sort: z.string().optional(),
  order: z.enum(['asc', 'desc']).optional(),
  search: z.string().optional(),
})

// Export inferred types for use in components
export type CreateVehicleInput = z.infer<typeof createVehicleSchema>
export type UpdateVehicleInput = z.infer<typeof updateVehicleSchema>
export type VehicleQueryInput = z.infer<typeof vehicleQuerySchema>
export type CreateUserInput = z.infer<typeof userCreateSchema>
export type UpdateUserInput = z.infer<typeof userUpdateSchema>
export type PasswordChangeInput = z.infer<typeof passwordChangeSchema>
export type CreateInquiryInput = z.infer<typeof inquiryCreateSchema>
export type UpdateInquiryInput = z.infer<typeof inquiryUpdateSchema>
export type CreateCategoryInput = z.infer<typeof categoryCreateSchema>
export type UpdateCategoryInput = z.infer<typeof categoryUpdateSchema>
export type CompanyInfoInput = z.infer<typeof companyInfoSchema>
export type ContactInfoInput = z.infer<typeof contactInfoSchema>
export type HomepageContentInput = z.infer<typeof homepageContentSchema>
export type ListQueryInput = z.infer<typeof listQuerySchema>