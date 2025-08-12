# Adlaan Flutter App - Authentication System

A modern Flutter application with GetX state management, featuring a complete authentication system inspired by Adlaan.com design.

## Features

### 🎨 Design System

- **Adlaan-inspired theme** with deep blues, elegant golds, and modern neutrals
- **Custom typography** supporting Arabic and English fonts
- **Responsive components** following Material Design 3 principles
- **Consistent spacing** and border radius throughout the app

### 🔐 Authentication Features

- **Email/Password Login** with form validation
- **User Registration** with company information
- **OTP Verification** for enhanced security
- **Google Sign-In** integration
- **Automatic token refresh** and session management
- **Secure storage** using GetStorage

### 🏗️ Architecture

#### State Management

- **GetX** for reactive state management
- **Repository pattern** for data layer separation
- **Dependency injection** with GetX bindings

#### Project Structure

```
lib/
├── core/
│   ├── constants/         # App constants and configurations
│   ├── models/           # Data models with JSON serialization
│   ├── routes/           # App routing configuration
│   ├── services/         # HTTP service and utilities
│   └── theme/            # Theme colors, typography, and styles
├── data/
│   └── repositories/     # Data repositories for API calls
└── presentation/
    ├── controllers/      # GetX controllers for business logic
    ├── pages/           # UI pages (Login, Register, OTP, Home)
    └── widgets/         # Reusable custom widgets
```

## Backend Integration

The app is configured to work with the Adlaan backend API at `https://adlaan.com/api` with endpoints:

- `POST /auth/login` - Email/password authentication
- `POST /auth/register` - User registration
- `POST /auth/signup-complete` - Complete user onboarding
- `POST /auth/verify-otp` - OTP verification
- `POST /auth/resend-otp` - Resend OTP code
- `POST /auth/google/token` - Google Sign-In
- `GET /auth/profile` - Get user profile
- `POST /auth/logout` - Logout user

## Setup and Installation

### Prerequisites

- Flutter SDK (latest stable version)
- Dart SDK
- Android Studio / VS Code

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   flutter pub get
   ```
3. Generate JSON serialization code:
   ```bash
   dart run build_runner build
   ```
4. Run the app:
   ```bash
   flutter run
   ```

## Key Features

### Performance Optimizations

- **Lazy loading** of controllers with GetX
- **Reactive updates** only when necessary
- **Automatic token refresh** to prevent authentication failures
- **Efficient rebuilds** using GetX reactive programming

### Security Features

- **Secure token storage** using GetStorage
- **Input validation** for all forms
- **Request encryption** and timeout configurations

---

Built with ❤️ using Flutter and GetX for high-performance, scalable mobile applications.
