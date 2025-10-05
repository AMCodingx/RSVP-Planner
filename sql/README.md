# Database Setup Instructions

This folder contains SQL scripts to set up the database schema for the Wedding RSVP Planner application.

## Files

1. **01_create_tables.sql** - Creates the main tables (groups, guests) with indexes
2. **02_rls_policies.sql** - Sets up Row Level Security policies
3. **03_sample_data.sql** - Inserts sample data for testing (optional)
4. **04_create_addresses_table.sql** - Creates the addresses table and links it to groups
5. **05_create_venues_table.sql** - Creates the venues table with multi-language support

## Setup Instructions

### In Supabase Dashboard:

1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Run the scripts in order:

   a. **First, run 01_create_tables.sql:**
   ```sql
   -- Copy and paste the contents of 01_create_tables.sql
   ```

   b. **Then, run 02_rls_policies.sql:**
   ```sql
   -- Copy and paste the contents of 02_rls_policies.sql
   ```

   c. **Then, run 04_create_addresses_table.sql:**
   ```sql
   -- Copy and paste the contents of 04_create_addresses_table.sql
   ```

   d. **Then, run 05_create_venues_table.sql:**
   ```sql
   -- Copy and paste the contents of 05_create_venues_table.sql
   ```

   e. **Optionally, run 03_sample_data.sql for testing:**
   ```sql
   -- Copy and paste the contents of 03_sample_data.sql
   ```

### Schema Overview

- **groups**: Stores invitation groups (families, couples, etc.)
- **guests**: Stores individual guest information linked to groups  
- **addresses**: Stores structured invitation addresses linked to groups
- **venues**: Stores wedding venue information with multi-language support

### Security

- Row Level Security (RLS) is enabled on all tables
- Simple policy: authenticated users can access all data
- In production, you may want to add user-specific policies

### Environment Variables

Make sure your `.env` file contains:
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY=your-anon-key
```