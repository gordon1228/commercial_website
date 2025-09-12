# Database Schema Documentation

## Overview
This document lists all tables and their columns from the current Neon PostgreSQL database based on the Prisma schema.

**Database**: PostgreSQL (Neon)  
**Generated on**: 2025-09-12  
**Total Tables**: 13

---

## Tables

### 1. **users**
| Column | Type | Constraints | Default |
|--------|------|-------------|---------|
| id | String | PRIMARY KEY | cuid() |
| email | String | UNIQUE | |
| password | String | | |
| role | Role | | USER |
| createdAt | DateTime | | now() |
| updatedAt | DateTime | | updatedAt |

**Indexes**: 
- Unique index on `email`

**Relations**:
- One-to-many with `inquiries`
- One-to-many with `sessions`

---

### 2. **sessions**
| Column | Type | Constraints | Default |
|--------|------|-------------|---------|
| id | String | PRIMARY KEY | cuid() |
| userId | String | FOREIGN KEY → users.id | |
| sessionId | String | UNIQUE | |
| userAgent | String | NULLABLE | |
| ipAddress | String | NULLABLE | |
| expiresAt | DateTime | | |
| createdAt | DateTime | | now() |
| updatedAt | DateTime | | updatedAt |

**Indexes**: 
- Unique index on `sessionId`

**Relations**:
- Many-to-one with `users` (CASCADE DELETE)

---

### 3. **categories**
| Column | Type | Constraints | Default |
|--------|------|-------------|---------|
| id | String | PRIMARY KEY | cuid() |
| name | String | | |
| slug | String | UNIQUE | |
| description | String | NULLABLE | |
| image | String | NULLABLE | |
| active | Boolean | | true |
| createdAt | DateTime | | now() |
| updatedAt | DateTime | | updatedAt |

**Indexes**: 
- Unique index on `slug`
- Index on `active` (idx_categories_active)

**Relations**:
- One-to-many with `vehicles`

---

### 4. **vehicles**
| Column | Type | Constraints | Default |
|--------|------|-------------|---------|
| id | String | PRIMARY KEY | cuid() |
| name | String | | |
| slug | String | UNIQUE | |
| description | String | NULLABLE | |
| price | Float | | |
| images | String[] | | |
| specs | Json | NULLABLE | |
| status | Status | | AVAILABLE |
| featured | Boolean | | false |
| active | Boolean | | true |
| categoryId | String | FOREIGN KEY → categories.id | |
| createdAt | DateTime | | now() |
| updatedAt | DateTime | | updatedAt |
| year | Int | NULLABLE | 2024 |
| make | String | NULLABLE | "Isuzu" |
| fuelType | String | NULLABLE | "Electric" |
| transmission | String | NULLABLE | |
| mobileImages | String[] | | [] |

**Indexes**: 
- Unique index on `slug`
- Index on `active` (idx_vehicles_active)
- Index on `categoryId` (idx_vehicles_category_id)
- Index on `featured` (idx_vehicles_featured)
- Index on `status` (idx_vehicles_status)
- Index on `status, active` (idx_vehicles_status_active)

**Relations**:
- Many-to-one with `categories`
- One-to-many with `inquiries`

---

### 5. **inquiries**
| Column | Type | Constraints | Default |
|--------|------|-------------|---------|
| id | String | PRIMARY KEY | cuid() |
| vehicleId | String | FOREIGN KEY → vehicles.id, NULLABLE | |
| userId | String | FOREIGN KEY → users.id, NULLABLE | |
| customerName | String | | |
| email | String | | |
| phone | String | NULLABLE | |
| message | String | | |
| notes | String | NULLABLE | |
| status | InquiryStatus | | NEW |
| createdAt | DateTime | | now() |
| updatedAt | DateTime | | updatedAt |

**Indexes**: 
- Index on `status` (idx_inquiries_status)
- Index on `vehicleId` (idx_inquiries_vehicle_id)

**Relations**:
- Many-to-one with `users`
- Many-to-one with `vehicles`

---

### 6. **homepage_content**
| Column | Type | Constraints | Default |
|--------|------|-------------|---------|
| id | String | PRIMARY KEY | cuid() |
| heroTitle | String | | "Premium Commercial" |
| heroSubtitle | String | | "Vehicles" |
| heroDescription | String | | "Discover elite fleet solutions..." |
| heroButtonPrimary | String | | "Explore Fleet" |
| heroButtonSecondary | String | | "Get Quote" |
| happyClients | Int | | 25 |
| yearsExperience | Int | | 10 |
| satisfactionRate | Int | | 95 |
| partnersTitle | String | | "Trusted by Industry Leaders" |
| partnersDescription | String | | "We partner with the world's..." |
| feature1Title | String | | "Quality Guarantee" |
| feature1Description | String | | "Every vehicle undergoes..." |
| feature2Title | String | | "Fast Delivery" |
| feature2Description | String | | "Quick processing and delivery..." |
| feature3Title | String | | "24/7 Support" |
| feature3Description | String | | "Round-the-clock customer..." |
| comingSoonImage | String | | "/images/comming soon.jpg" |
| comingSoonImageAlt | String | | "Coming Soon" |
| createdAt | DateTime | | now() |
| updatedAt | DateTime | | updatedAt |
| showComingSoonSection | Boolean | NULLABLE | true |
| showHeroSection | Boolean | NULLABLE | true |
| showVehicleCategories | Boolean | NULLABLE | true |
| showFeaturedVehicles | Boolean | NULLABLE | true |
| showTrustSection | Boolean | NULLABLE | true |
| comingSoonImageMobile | String | NULLABLE | "/images/comming-soon-mobile.jpg" |

**Indexes**: 
- Index on `updatedAt` (idx_homepage_content_updated_at)

---

### 7. **company_info**
| Column | Type | Constraints | Default |
|--------|------|-------------|---------|
| id | String | PRIMARY KEY | cuid() |
| companyName | String | | "EVTL" |
| companyDescription | String | | "For over 25 years..." |
| foundedYear | Int | | 1998 |
| totalVehiclesSold | Int | | 2500 |
| totalHappyCustomers | Int | | 850 |
| totalYearsExp | Int | | 25 |
| satisfactionRate | Int | | 98 |
| storyTitle | String | | "Our Story" |
| storyParagraph1 | String | | "Founded in 1998..." |
| storyParagraph2 | String | | "Over the years..." |
| storyParagraph3 | String | | "Today, we continue..." |
| missionTitle | String | | "Our Mission" |
| missionText | String | | "To empower businesses..." |
| visionTitle | String | | "Our Vision" |
| visionText | String | | "To be the leading..." |
| createdAt | DateTime | | now() |
| updatedAt | DateTime | | now(), updatedAt |
| companyDescription2 | String | | "We specialize in providing..." |

---

### 8. **company_values**
| Column | Type | Constraints | Default |
|--------|------|-------------|---------|
| id | String | PRIMARY KEY | cuid() |
| title | String | | |
| description | String | | |
| iconName | String | | |
| order | Int | | 0 |
| active | Boolean | | true |
| createdAt | DateTime | | now() |
| updatedAt | DateTime | | now(), updatedAt |

**Indexes**: 
- Index on `order, active` (idx_company_values_order_active)

---

### 9. **certifications**
| Column | Type | Constraints | Default |
|--------|------|-------------|---------|
| id | String | PRIMARY KEY | cuid() |
| name | String | | |
| order | Int | | 0 |
| active | Boolean | | true |
| createdAt | DateTime | | now() |
| updatedAt | DateTime | | now(), updatedAt |

**Indexes**: 
- Index on `order, active` (idx_certifications_order_active)

---

### 10. **contact_info**
| Column | Type | Constraints | Default |
|--------|------|-------------|---------|
| id | String | PRIMARY KEY | cuid() |
| salesPhone | String | | "+1 (555) 123-4567" |
| servicePhone | String | | "+1 (555) 123-4568" |
| financePhone | String | | "+1 (555) 123-4569" |
| salesEmail | String | | "sales@evtl.com" |
| serviceEmail | String | | "service@evtl.com" |
| supportEmail | String | | "support@evtl.com" |
| address | String | | "123 Business Avenue" |
| city | String | | "Commercial District, NY 10001" |
| directions | String | | "Near Metro Station" |
| mondayToFriday | String | | "8:00 AM - 6:00 PM" |
| saturday | String | | "9:00 AM - 4:00 PM" |
| sunday | String | | "Closed" |
| createdAt | DateTime | | now() |
| updatedAt | DateTime | | now(), updatedAt |
| siteName | String | NULLABLE | "EVTL" |
| emailNotifications | Boolean | NULLABLE | true |
| systemNotifications | Boolean | NULLABLE | true |
| maintenanceMode | Boolean | NULLABLE | false |
| state | String | NULLABLE, VARCHAR(255) | "NY" |
| postcode | String | NULLABLE, VARCHAR(255) | "10001" |
| country | String | NULLABLE, VARCHAR(255) | "United States" |
| companyDescription | String | NULLABLE | "EVTL Sdn. Bhd. is a..." |
| facebookUrl | String | NULLABLE, VARCHAR(255) | "" |
| twitterUrl | String | NULLABLE, VARCHAR(255) | "" |
| instagramUrl | String | NULLABLE, VARCHAR(255) | "" |
| linkedinUrl | String | NULLABLE, VARCHAR(255) | "" |
| privacyPolicyUrl | String | NULLABLE, VARCHAR(255) | "/privacy" |
| termsOfServiceUrl | String | NULLABLE, VARCHAR(255) | "/terms" |

---

### 11. **technology_content**
| Column | Type | Constraints | Default |
|--------|------|-------------|---------|
| id | String | PRIMARY KEY | cuid() |
| heroTitle | String | | "Next-Generation Electric Truck Technology" |
| heroSubtitle | String | | "Advanced electric vehicle technology..." |
| heroBackgroundImage | String | | "/uploads/Technology_background.png" |
| heroBackgroundImageAlt | String | | "Electric Truck Technology Background" |
| section1Title | String | | "Advanced Battery Technology" |
| section1Description | String | | "Our cutting-edge battery systems..." |
| section2Title | String | | "Smart Fleet Management" |
| section2Description | String | | "Integrated IoT solutions..." |
| section3Title | String | | "Rapid Charging Infrastructure" |
| section3Description | String | | "Fast-charging capabilities..." |
| section4Title | String | | "Sustainable Manufacturing" |
| section4Description | String | | "Eco-friendly production processes..." |
| createdAt | DateTime | | now() |
| updatedAt | DateTime | | updatedAt |

---

### 12. **technology_features**
| Column | Type | Constraints | Default |
|--------|------|-------------|---------|
| id | String | PRIMARY KEY | cuid() |
| title | String | | |
| description | String | | |
| iconName | String | | "Zap" |
| order | Int | | 0 |
| active | Boolean | | true |
| createdAt | DateTime | | now() |
| updatedAt | DateTime | | updatedAt |

**Indexes**: 
- Index on `order, active` (idx_technology_features_order_active)

---

### 13. **filter_options**
| Column | Type | Constraints | Default |
|--------|------|-------------|---------|
| id | String | PRIMARY KEY | dbgenerated |
| type | String | | |
| value | String | | |
| label | String | | |
| order | Int | | 0 |
| active | Boolean | | true |
| created_at | DateTime | | now() |
| updated_at | DateTime | | now(), updatedAt |

**Indexes**: 
- Unique index on `type, value` (unique_type_value)
- Index on `type, active, order` (idx_filter_options_type_active_order)

---

## Enums

### Role
- `ADMIN`
- `MANAGER`
- `USER`

### Status
- `AVAILABLE`
- `SOLD`
- `RESERVED`

### InquiryStatus
- `NEW`
- `CONTACTED`
- `RESOLVED`
- `CLOSED`

---

## Summary Statistics

- **Total Tables**: 13
- **Total Columns**: 157
- **Tables with Indexes**: 10
- **Tables with Relations**: 5
- **Enums Defined**: 3

## Key Features

- **User Management**: Authentication, sessions, roles
- **Content Management**: Homepage, company info, technology content
- **Vehicle Catalog**: Categories, vehicles with specs and images
- **Customer Relations**: Inquiries, contact information
- **Configuration**: Filter options, certifications, company values