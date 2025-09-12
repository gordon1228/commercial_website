# Database Schema Migration Guide

This guide provides step-by-step instructions for migrating your commercial vehicle platform database to the new optimized schema.

## 📋 Prerequisites

Before starting the migration, ensure you have:

- [ ] Database backup access (pg_dump available)
- [ ] PostgreSQL client (psql) installed
- [ ] Node.js and npm installed
- [ ] DATABASE_URL environment variable set
- [ ] Admin access to your database
- [ ] Maintenance window scheduled (recommended)

## 🎯 Migration Overview

The migration consists of two main phases:

### Phase 1: Non-Breaking Additions ✅ Safe
- Adds new columns to existing tables
- Creates new tables for enhanced functionality
- Adds new enum values
- Creates indexes for better performance
- **No downtime required**

### Phase 2: Data Migration ⚠️ Requires Testing
- Migrates JSON specs to normalized tables
- Splits customer names into first/last name fields
- Populates new analytics data
- Creates initial business metrics
- **May require brief downtime**

## 🚀 Quick Start

### Test Database Connection
```bash
npm run db:test-connection
```

### Full Migration (Recommended)
```bash
npm run db:migrate
```

### Phase-by-Phase Migration
```bash
# Run only Phase 1 (safe, no downtime)
npm run db:migrate:phase1

# Test your application, then run Phase 2
npm run db:migrate:phase2
```

### Migration Without Backup (Not Recommended)
```bash
npm run db:migrate:no-backup
```

## 📝 Detailed Migration Steps

### Step 1: Pre-Migration Checklist

1. **Verify Environment**
   ```bash
   echo $DATABASE_URL
   npm run db:test-connection
   ```

2. **Create Manual Backup** (Optional but recommended)
   ```bash
   npm run db:backup
   ```

3. **Review Current Schema**
   ```bash
   psql $DATABASE_URL -c "\dt"  # List tables
   psql $DATABASE_URL -c "\d+ vehicles"  # Describe vehicles table
   ```

### Step 2: Run Phase 1 Migration

```bash
npm run db:migrate:phase1
```

**What Phase 1 does:**
- ✅ Adds new user fields (`firstName`, `lastName`, `isActive`, `lastLogin`)
- ✅ Adds new vehicle fields (`model`, `shortDescription`, `originalPrice`, `vin`, `stockNumber`, `views`)
- ✅ Creates `vehicle_specs` table for normalized specifications
- ✅ Creates `vehicle_features` table for normalized features  
- ✅ Enhances inquiry management with priority, assignment, and history
- ✅ Adds analytics tables for business metrics
- ✅ Adds new content management fields
- ✅ Creates session management table

**Verification:**
```bash
psql $DATABASE_URL -c "SELECT COUNT(*) FROM vehicle_specs;"
psql $DATABASE_URL -c "SELECT COUNT(*) FROM vehicle_features;"
```

### Step 3: Test Application

After Phase 1, test your application:
- [ ] Admin login still works
- [ ] Vehicle listings display correctly
- [ ] Inquiry forms function properly
- [ ] Content management works

### Step 4: Run Phase 2 Migration

```bash
npm run db:migrate:phase2
```

**What Phase 2 does:**
- 🔄 Migrates JSON `specs` to normalized `vehicle_specs` table
- 🔄 Migrates array `features` to normalized `vehicle_features` table
- 🔄 Splits `customerName` into `firstName` and `lastName`
- 🔄 Creates initial analytics data
- 🔄 Populates filter options based on existing data
- 🔄 Creates business metrics for reporting

**Verification:**
```bash
psql $DATABASE_URL -c "SELECT COUNT(*) as migrated_specs FROM vehicle_specs;"
psql $DATABASE_URL -c "SELECT COUNT(*) as migrated_features FROM vehicle_features;"
psql $DATABASE_URL -c "SELECT COUNT(*) as split_names FROM inquiries WHERE \"firstName\" IS NOT NULL;"
```

### Step 5: Update Application Code

After successful migration, you can update your application to use the new schema features:

1. **Update Prisma Schema**
   ```bash
   # Replace current schema with optimized version
   cp prisma/schema-optimized.prisma prisma/schema.prisma
   npx prisma generate
   ```

2. **Update TypeScript Types**
   - Import new Prisma types
   - Update API route handlers
   - Modify admin interface components

## 🔧 Advanced Usage

### Custom Migration Options

```bash
# Skip database backup (not recommended for production)
node scripts/run-migration.js --skip-backup

# Skip post-migration verification
node scripts/run-migration.js --skip-verification

# Run specific phase only
node scripts/run-migration.js --phase=1
node scripts/run-migration.js --phase=2

# Get help and see all options
node scripts/run-migration.js --help
```

### Manual SQL Execution

If you prefer to run SQL files manually:

```bash
# Phase 1
psql $DATABASE_URL -f migrations/phase1_non_breaking_additions.sql

# Phase 2
psql $DATABASE_URL -f migrations/phase2_data_migration.sql
```

## 📊 Expected Results

After successful migration, you should see:

| Table | Description | Expected Count |
|-------|-------------|----------------|
| `vehicle_specs` | Normalized vehicle specifications | 50-200+ records |
| `vehicle_features` | Normalized vehicle features | 100-500+ records |
| `vehicle_analytics` | Vehicle view tracking | 100+ records |
| `inquiry_history` | Audit trail for inquiries | 0+ records |
| `business_metrics` | Daily/weekly metrics | 30+ records |
| `filter_options` | Dynamic filter options | 10-20 records |

## 🆘 Troubleshooting

### Common Issues

**Error: "column does not exist"**
- Ensure Phase 1 completed successfully
- Check that all new columns were added

**Error: "relation does not exist"**  
- Verify new tables were created in Phase 1
- Check foreign key constraints

**Migration hangs or times out**
- Large datasets may take time
- Consider running phases separately
- Check database locks: `SELECT * FROM pg_stat_activity;`

**Prisma generation fails**
- Ensure migration completed successfully
- Try: `npx prisma db pull && npx prisma generate`

### Emergency Rollback

If migration fails, you can restore from backup:

```bash
# Find your backup file
ls -la backups/

# Restore database
psql $DATABASE_URL < backups/backup_YYYY-MM-DD_HH-MM-SS.sql

# Regenerate Prisma client
npx prisma db pull && npx prisma generate
```

Or use the rollback command:
```bash
node scripts/run-migration.js --rollback=backups/backup_YYYY-MM-DD_HH-MM-SS.sql
```

## 📈 Performance Impact

**Expected improvements:**
- 🚀 40-60% faster vehicle specification queries
- 📊 Real-time analytics tracking capability
- 🔍 Advanced filtering with indexed searches
- 👥 Better inquiry management with assignment tracking
- 📱 Enhanced content management flexibility

**Database size:**
- Expect 20-30% increase in database size due to:
  - Normalized data structures
  - Analytics tracking tables
  - Audit trail capabilities

## ⚡ Post-Migration Tasks

1. **Update Application Code**
   - Modify API routes to use new relationships
   - Update admin interfaces for new fields
   - Implement analytics tracking

2. **Performance Optimization**
   - Run `ANALYZE` on all tables (done automatically)
   - Monitor query performance
   - Adjust indexes if needed

3. **Feature Activation**
   - Enable analytics tracking in vehicle views
   - Set up inquiry assignment workflows
   - Configure business metrics collection

4. **Monitoring**
   - Monitor database performance
   - Track query execution times
   - Watch for any application errors

## 🔄 Schema Evolution

The new schema supports future enhancements:
- Multi-language content support
- Advanced user roles and permissions
- Customer relationship management
- Detailed business intelligence
- API rate limiting and tracking

## 📞 Support

If you encounter issues during migration:

1. **Check logs** in the migration output
2. **Verify backups** are available
3. **Test rollback** in non-production environment first
4. **Document any custom modifications** you've made

---

## 🎉 Migration Complete!

Once migration is successful, you'll have:

✅ **Normalized database structure**  
✅ **Enhanced analytics capabilities**  
✅ **Better inquiry management**  
✅ **Improved performance**  
✅ **Future-proof architecture**  

Your commercial vehicle platform is now ready for advanced features and better scalability!