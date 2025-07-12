# Cognitive Copilot Web Application

## Overview

This is a full-stack web application built with React frontend and Express backend, designed to serve as a profile management system for a desktop application integration. The app allows users to create accounts, manage profiles, handle subscriptions, and provides API endpoints for desktop app authentication.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query (React Query) for server state management
- **UI Components**: Radix UI primitives with shadcn/ui component library
- **Styling**: Tailwind CSS with CSS variables for theming
- **Forms**: React Hook Form with Zod validation

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Runtime**: Node.js with ES modules
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: JWT tokens with bcrypt for password hashing
- **Payment Processing**: Stripe integration for subscription management
- **Development**: Hot reloading with Vite middleware in development

## Key Components

### Authentication System
- JWT-based authentication with secure token storage
- Password hashing using bcryptjs
- Session management with database storage
- API token system for desktop app integration

### Database Schema
- **Users**: Profile information, authentication, and Stripe integration
- **Subscriptions**: Stripe subscription management with plan tracking
- **Sessions**: User activity tracking
- **API Tokens**: Desktop app authentication tokens

### Payment Integration
- Stripe integration for subscription billing
- Multiple plan support (Pro, Enterprise)
- Subscription lifecycle management
- Webhook handling for payment events

### Desktop App Integration
- API endpoints for profile synchronization
- Token-based authentication for desktop app
- File download system for token handoff
- Resume upload and management

## Data Flow

1. **User Registration/Login**: Frontend forms → Backend validation → JWT token generation → Local storage
2. **Profile Management**: Dashboard forms → API calls → Database updates → UI refresh
3. **Subscription Flow**: Stripe Elements → Payment processing → Database updates → Status display
4. **Desktop Integration**: Web token generation → File download → Desktop app authentication → API access

## External Dependencies

### Frontend Dependencies
- React ecosystem (React, React DOM, React Router alternative)
- UI libraries (Radix UI, Lucide React icons)
- Form handling (React Hook Form, Hookform Resolvers)
- Data fetching (TanStack Query)
- Payment processing (Stripe React components)
- Styling (Tailwind CSS, Class Variance Authority)

### Backend Dependencies
- Express.js framework
- Database (Drizzle ORM, Neon serverless PostgreSQL)
- Authentication (bcryptjs, jsonwebtoken)
- Payment processing (Stripe SDK)
- Development tools (tsx, esbuild)

### Development Tools
- TypeScript for type safety
- Vite for development server and build process
- Tailwind CSS for styling
- PostCSS for CSS processing
- ESLint/Prettier for code quality (implied by project structure)

## Deployment Strategy

### Build Process
- **Frontend**: Vite builds React app to `dist/public`
- **Backend**: esbuild bundles Express server to `dist/index.js`
- **Database**: Drizzle migrations stored in `migrations/` folder

### Environment Configuration
- Database connection via `DATABASE_URL`
- JWT secret via `JWT_SECRET`
- Stripe keys via `STRIPE_SECRET_KEY` and `VITE_STRIPE_PUBLIC_KEY`

### Production Setup
- Single deployment with Express serving both API and static files
- PostgreSQL database (configured for Neon serverless)
- Environment variables for sensitive configuration
- Built-in error handling and logging middleware

The application is designed to be deployed as a single service that handles both the web interface and API endpoints, with the frontend built as static assets served by the Express server in production.