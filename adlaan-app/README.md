# Adlaan App

A modern Angular application with Apple-inspired design, authentication, and dashboard features.

## Features

- 🔐 **Authentication Flow**: Login/logout with JWT token support
- 🏠 **Dashboard**: Clean dashboard with sidebar navigation
- 🎨 **Apple-Style Design**: Modern UI inspired by Apple's design language
- 📱 **Responsive**: Works on desktop and mobile devices
- 🔒 **Route Guards**: Protected routes with authentication
- 🎯 **Standalone Components**: Modern Angular architecture
- 🌐 **HTTP Interceptors**: Automatic token handling

## Demo Credentials

For testing the application, use these demo credentials:

- **Email**: `admin@adlaan.com`
- **Password**: `password`

## Color Scheme

The application uses a sophisticated color palette inspired by Harvey.ai:

- Primary: Linear gradient from `#667eea` to `#764ba2`
- Background: `#f8fafc` (light gray)
- Text: `#1e293b` (dark slate)
- Secondary text: `#64748b` (slate)
- Cards: White with glassmorphism effects

## Project Structure

```
src/
├── app/
│   ├── core/
│   │   ├── guards/          # Route guards
│   │   ├── interceptors/    # HTTP interceptors
│   │   └── services/        # Core services
│   ├── features/
│   │   ├── auth/
│   │   │   └── login/       # Login component
│   │   └── dashboard/
│   │       ├── dashboard-layout/  # Dashboard layout with sidebar
│   │       └── dashboard/         # Main dashboard content
│   ├── app.config.ts        # App configuration
│   ├── app.routes.ts        # Route configuration
│   └── app.ts              # Root component
├── environments/           # Environment configurations
└── styles.css             # Global styles
```

## Getting Started

1. Install dependencies:

```bash
npm install
```

2. Start the development server:

```bash
npm start
```

3. Open your browser and navigate to `http://localhost:4200`

4. Use the demo credentials to log in

## Authentication Flow

1. **Unauthenticated users** are automatically redirected to `/login`
2. **Successful login** redirects to `/dashboard`
3. **JWT tokens** are stored in localStorage (HTTP-only cookies in production)
4. **Route guards** protect dashboard routes
5. **HTTP interceptor** automatically adds tokens to requests

## Dashboard Features

- **Sidebar Navigation**: Clean navigation with icons and sections
- **Statistics Cards**: Overview of key metrics with trend indicators
- **Charts Section**: Mock analytics visualization
- **Activity Feed**: Recent activity timeline
- **Projects Grid**: Project cards with progress tracking
- **User Profile**: User menu with logout functionality

## Production Considerations

For production deployment:

1. Replace mock authentication with real backend API
2. Implement HTTP-only cookies instead of localStorage for tokens
3. Add proper error handling and loading states
4. Configure environment variables for API endpoints
5. Implement refresh token logic
6. Add proper chart libraries (Chart.js, D3.js, etc.)

## Backend Integration

The app is configured to work with a backend at `localhost:4200` (configurable in `environments/`).

Expected API endpoints:

- `POST /api/auth/login` - User authentication
- `GET /api/auth/me` - Get current user profile
- Additional endpoints for dashboard data

## Development

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 20.1.4.

### Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.

### Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory.
