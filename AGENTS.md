# AGENTS.md

## Project Overview
Wedding RSVP Planning Application - A comprehensive guest management system for planning your wedding with automated RSVP tracking through QR codes.

## Features
- Login screen for wedding planners
- Guest management and tracking
- QR code generation for guests
- Automated RSVP status updates
- Real-time guest status monitoring

## Tech Stack
- **Frontend**: React with TypeScript
- **UI Components**: shadcn/ui
- **Backend/Database**: Supabase
- **Build Tool**: Vite
- **Styling**: Tailwind CSS

## Development Rules

### Code Quality Standards
- **Clean Code**: No comments in code - use descriptive naming instead
- **Naming**: All variables, functions, and classes must be self-documenting
- **Principles**: Follow SOLID, DRY, and KISS principles strictly
- **Database Schema**: No `updated_at` columns - keep it simple with only `created_at` for timestamps

### Architecture Pattern
Follow the three-layer architecture pattern:
```
Storage → Service → UI
```

#### Layer Responsibilities
1. **Storage Layer** 
   - Contains DTOs (Data Transfer Objects)
   - Direct interaction with Supabase
   - Raw data management

2. **Service Layer**
   - Maps DTOs to Models
   - Business logic implementation
   - Data transformation and validation

3. **UI Layer**
   - Contains Models for frontend use
   - React components and user interactions
   - Presentation logic only

### Supabase Integration
- Use centralized `client.ts` for all Supabase interactions
- All database operations must go through the storage layer
- Environment variables for configuration

### File Structure Guidelines
```
src/
├── storage/
│   ├── client.ts
│   ├── dto/
│   └── repositories/
├── services/
│   ├── mappers/
│   └── business-logic/
├── ui/
│   ├── models/
│   ├── components/
│   └── pages/
```

## Environment Configuration
Create `.env` file with:
```
VITE_SUPABASE_URL=https://egqavhucbygironwnhvn.supabase.co
VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY=sb_publishable_2aheSbxDH6AZZsaQJmccTA_LqZmwoL3
```

## Development Workflow
1. Design database schema in Supabase
2. Create DTOs for data structures
3. Implement repository pattern for data access
4. Build service layer with mappers
5. Create UI models and components
6. Implement user interface

## Key Features to Implement
- [ ] Authentication system
- [ ] Guest management CRUD operations
- [ ] QR code generation per guest
- [ ] RSVP tracking and status updates
- [ ] Dashboard for wedding planners
- [ ] Guest response analytics

## Success Criteria
- Seamless guest management experience
- Automated RSVP process via QR codes
- Real-time status updates
- Clean, maintainable codebase
- Responsive design for all devices