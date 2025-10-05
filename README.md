# 💍 Wedding RSVP Planner

> A modern, comprehensive wedding guest management system with automated RSVP tracking through QR codes

[![Live Demo](https://img.shields.io/badge/demo-live-success)](https://madera-wedding-rsvp.netlify.app)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19.x-61dafb)](https://reactjs.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Backend-green)](https://supabase.com/)

## 📋 Overview

Wedding RSVP Planner is a full-featured application designed to streamline wedding guest management for engaged couples. It combines traditional guest list management with modern QR code technology to automate the RSVP process, making wedding planning easier and more organized.

### Key Features

- 🔐 **Couple Authentication System** - Shared access for both partners
- 👥 **Advanced Guest Management** - Group-based organization with detailed tracking
- 📍 **Address Management** - Centralized address system with PostNL export support
- 📱 **QR Code Generation** - Automated RSVP tracking via personalized QR codes
- 📊 **Real-time Dashboard** - Live statistics and attendance tracking
- 🏛️ **Venue Management** - Track multiple wedding venues and events
- 📑 **Excel Export** - Export guest lists and addresses for mailings
- 🎨 **Dark/Light Mode** - Customizable theme with elegant design

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- Supabase account ([sign up free](https://supabase.com))
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/AMCodingx/RSVP-Planner.git
   cd RSVP-Planner
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env` file in the root directory:
   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY=your_supabase_anon_key
   ```

4. **Set up the database**
   
   Run the SQL scripts in order from the `sql/` directory in your Supabase SQL editor:
   ```
   01_create_tables.sql
   02_rls_policies.sql
   03_sample_data.sql (optional)
   04_create_addresses_table.sql
   05_create_venues_table.sql
   06_create_couples_table.sql
   07_couples_rls_policies.sql
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to `http://localhost:5173`

## 🏗️ Architecture

This project follows a clean **three-layer architecture** pattern:

```
┌─────────────────────────────────────────┐
│           UI Layer (React)              │
│  Components, Pages, Models              │
└────────────────┬────────────────────────┘
                 │
┌────────────────▼────────────────────────┐
│         Service Layer                   │
│  Business Logic, Mappers                │
└────────────────┬────────────────────────┘
                 │
┌────────────────▼────────────────────────┐
│        Storage Layer                    │
│  DTOs, Repositories, Supabase Client    │
└─────────────────────────────────────────┘
```

### Layer Responsibilities

- **UI Layer**: React components, user interactions, presentation logic
- **Service Layer**: Business logic, DTO ↔ Model mapping, data transformation
- **Storage Layer**: Direct database interactions, raw data management

## 🛠️ Tech Stack

### Frontend
- **React 19** - UI library
- **TypeScript** - Type-safe development
- **Tailwind CSS 4** - Utility-first styling
- **Vite** - Fast build tool and dev server
- **React Router** - Client-side routing
- **Lucide React** - Beautiful icon set

### Backend & Database
- **Supabase** - PostgreSQL database with realtime capabilities
- **Row Level Security (RLS)** - Database-level security policies
- **Supabase Auth** - Authentication and authorization

### Additional Libraries
- **QRCode** - QR code generation for RSVP tracking
- **XLSX** - Excel export functionality
- **shadcn/ui** - Re-usable component patterns

### Deployment
- **Netlify** - Hosting and serverless functions
- **Netlify Functions** - Background tasks (keep-alive)

## 📁 Project Structure

```
rsvp-planner/
├── src/
│   ├── ui/
│   │   ├── components/       # React components
│   │   ├── models/           # Frontend data models
│   │   └── pages/            # Page components
│   ├── services/
│   │   ├── business-logic/   # Service layer
│   │   └── mappers/          # DTO to Model mappers
│   ├── storage/
│   │   ├── dto/              # Data Transfer Objects
│   │   ├── repositories/     # Database access layer
│   │   └── client.ts         # Supabase client
│   ├── components/           # Shared UI components
│   ├── lib/                  # Utility functions
│   └── App.tsx               # Main application
├── netlify/
│   └── functions/            # Serverless functions
├── sql/                      # Database schema & migrations
├── migrations/               # Schema migration files
└── public/                   # Static assets
```

## 🎯 Core Features

### 1. Guest Management
- **Group-based Organization**: Organize guests by invitation groups (families, couples, individuals)
- **Comprehensive Filtering**: Search by name, filter by status, age category, or inviter
- **Batch Operations**: Edit multiple guests, manage groups efficiently
- **Address Integration**: Centralized address management per group

### 2. RSVP Tracking
- **QR Code System**: Generate unique QR codes for each guest
- **Automated Updates**: Guests scan codes to update RSVP status
- **Status Tracking**: Pending, Confirmed, Declined, Tentative
- **Real-time Sync**: Instant updates across all devices

### 3. Dashboard & Analytics
- **Live Statistics**: Total guests, confirmed, declined, pending
- **Demographics Widget**: Age distribution (adults, children, toddlers)
- **Attendance Tracking**: Venue-specific attendance counts
- **RSVP Progress**: Visual progress indicators

### 4. Address Management
- **Centralized Addresses**: One address per invitation group
- **PostNL Integration**: Export addresses in PostNL format
- **Print Functionality**: Print labels and envelopes
- **Validation**: Country constraints and format validation

### 5. Venue Management
- **Multiple Venues**: Track different wedding events (ceremony, reception, etc.)
- **Capacity Planning**: Monitor attendance per venue
- **Guest Assignment**: Assign guests to specific venues

## 🔒 Security

- **Row Level Security (RLS)**: Database-level access control
- **Authentication**: Secure login with Supabase Auth
- **Environment Variables**: Sensitive data stored securely
- **Client-side Validation**: Input sanitization and validation
- **HTTPS**: Encrypted data transmission

## 📝 Development Guidelines

### Code Quality Standards
- ✅ **No comments** - Use self-documenting code with descriptive names
- ✅ **SOLID principles** - Clean, maintainable architecture
- ✅ **DRY & KISS** - Don't Repeat Yourself, Keep It Simple
- ✅ **TypeScript strict mode** - Full type safety

### Database Conventions
- Use `created_at` for timestamps (no `updated_at` columns)
- Follow RLS policies for all tables
- Use meaningful constraint names

## 🚢 Deployment

### Deploy to Netlify

1. **Connect to Netlify**
   - Go to [Netlify](https://app.netlify.com)
   - Click "Add new site" → "Import an existing project"
   - Connect your GitHub repository

2. **Configure Build Settings**
   Netlify automatically detects `netlify.toml`:
   ```toml
   [build]
     command = "npm run build"
     publish = "dist"
     functions = "netlify/functions"
   ```

3. **Set Environment Variables**
   In Netlify dashboard → Site settings → Environment variables:
   ```
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY=your_supabase_key
   ```

4. **Deploy**
   Push to your repository and Netlify will automatically build and deploy

## 📚 Documentation

- **[USER_STORIES.md](USER_STORIES.md)** - Detailed user stories and implementation status
- **[DATABASE_SCHEMA.md](DATABASE_SCHEMA.md)** - Database structure and relationships
- **[AGENTS.md](AGENTS.md)** - Development guidelines and architecture
- **[ADDRESS_INTEGRATION_SUMMARY.md](ADDRESS_INTEGRATION_SUMMARY.md)** - Address system details
- **[THEMING.md](THEMING.md)** - Theme customization guide

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is private and proprietary. All rights reserved.

## 👨‍💻 Author

**AMCodingx**
- GitHub: [@AMCodingx](https://github.com/AMCodingx)

## 🙏 Acknowledgments

- Built with React, TypeScript, and Supabase
- UI components inspired by shadcn/ui
- Icons by Lucide
- Deployed on Netlify

---

Made with ❤️ for couples planning their special day

## 📞 Support

For support, please open an issue in the GitHub repository or contact the maintainer.

## 🗺️ Roadmap

### Upcoming Features
- [ ] Email invitations with QR codes
- [ ] SMS reminders for RSVPs
- [ ] Dietary restrictions tracking
- [ ] Seating chart planner
- [ ] Gift registry integration
- [ ] Photo sharing gallery
- [ ] Multi-language support

---

## 🔧 Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
