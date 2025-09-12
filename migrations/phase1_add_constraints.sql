-- ============================================================================
-- PHASE 1C: ADD FOREIGN KEYS AND INDEXES (Prisma Compatible)
-- ============================================================================

-- Add foreign keys for vehicle_specs
ALTER TABLE "vehicle_specs" ADD CONSTRAINT "vehicle_specs_vehicleId_fkey" 
FOREIGN KEY ("vehicleId") REFERENCES "vehicles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Add foreign keys for vehicle_features  
ALTER TABLE "vehicle_features" ADD CONSTRAINT "vehicle_features_vehicleId_fkey" 
FOREIGN KEY ("vehicleId") REFERENCES "vehicles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Add foreign keys for inquiry_history
ALTER TABLE "inquiry_history" ADD CONSTRAINT "inquiry_history_inquiryId_fkey" 
FOREIGN KEY ("inquiryId") REFERENCES "inquiries"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "inquiry_history" ADD CONSTRAINT "inquiry_history_userId_fkey" 
FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Add foreign keys for vehicle_analytics
ALTER TABLE "vehicle_analytics" ADD CONSTRAINT "vehicle_analytics_vehicleId_fkey" 
FOREIGN KEY ("vehicleId") REFERENCES "vehicles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Add foreign keys for sessions
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_userId_fkey" 
FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Add foreign key for inquiry assignment
ALTER TABLE inquiries ADD CONSTRAINT "inquiries_assignedTo_fkey" 
FOREIGN KEY ("assignedTo") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Create indexes for better performance
CREATE INDEX "idx_users_role_active" ON users("role", "isActive");
CREATE INDEX "idx_vehicles_make_fueltype" ON vehicles("make", "fuelType");
CREATE INDEX "idx_categories_active_order" ON categories("active", "displayOrder");
CREATE INDEX "idx_vehicle_specs_vehicle_category" ON "vehicle_specs"("vehicleId", "category");
CREATE INDEX "idx_vehicle_specs_name_value" ON "vehicle_specs"("name", "value");
CREATE INDEX "idx_vehicle_features_vehicleId" ON "vehicle_features"("vehicleId");
CREATE INDEX "idx_vehicle_features_name" ON "vehicle_features"("name");
CREATE INDEX "idx_inquiries_status_priority" ON inquiries("status", "priority");
CREATE INDEX "idx_inquiries_assigned" ON inquiries("assignedTo");
CREATE INDEX "idx_inquiries_email" ON inquiries("email");
CREATE INDEX "idx_inquiry_history_inquiryId" ON "inquiry_history"("inquiryId");
CREATE INDEX "idx_inquiry_history_created" ON "inquiry_history"("createdAt");
CREATE INDEX "idx_vehicle_analytics_vehicle_event" ON "vehicle_analytics"("vehicleId", "eventType");
CREATE INDEX "idx_vehicle_analytics_created" ON "vehicle_analytics"("createdAt");
CREATE INDEX "idx_business_metrics_type_date" ON "business_metrics"("metricType", "date");
CREATE INDEX "idx_business_metrics_date" ON "business_metrics"("date");
CREATE INDEX "idx_sessions_sessionId" ON "sessions"("sessionId");
CREATE INDEX "idx_sessions_userId" ON "sessions"("userId");
CREATE INDEX "idx_filter_options_type_active_order" ON "filter_options"("type", "active", "order");