/// App constants for configuration and settings
class AppConstants {
  AppConstants._();

  // API Configuration
  static const String baseUrl = 'https://adlaan.com/api';
  static const String apiVersion = 'v1';
  static const String fullApiUrl = '$baseUrl';

  // Auth Endpoints
  static const String loginEndpoint = '/auth/login';
  static const String registerEndpoint = '/auth/register';
  static const String signupCompleteEndpoint = '/auth/signup-complete';
  static const String verifyOtpEndpoint = '/auth/verify-otp';
  static const String resendOtpEndpoint = '/auth/resend-otp';
  static const String googleAuthEndpoint = '/auth/google/token';
  static const String googleAuthiOSEndpoint = '/auth/google/ios/token';
  static const String logoutEndpoint = '/auth/logout';
  static const String profileEndpoint = '/auth/profile';

  // Storage Keys
  static const String accessTokenKey = 'access_token';
  static const String refreshTokenKey = 'refresh_token';
  static const String userDataKey = 'user_data';
  static const String onboardingKey = 'onboarding_completed';
  static const String languageKey = 'language';
  static const String themeKey = 'theme_mode';

  // App Settings
  static const Duration connectionTimeout = Duration(seconds: 30);
  static const Duration receiveTimeout = Duration(seconds: 30);
  static const Duration sendTimeout = Duration(seconds: 30);

  // OTP Settings
  static const int otpLength = 6;
  static const Duration otpTimeout = Duration(minutes: 5);
  static const Duration resendDelay = Duration(seconds: 30);

  // Validation
  static const int minPasswordLength = 8;
  static const int maxPasswordLength = 128;
  static const int minNameLength = 2;
  static const int maxNameLength = 50;

  // UI Constants
  static const double defaultPadding = 16.0;
  static const double largePadding = 24.0;
  static const double smallPadding = 8.0;
  static const double defaultRadius = 12.0;
  static const double largeRadius = 16.0;
  static const double smallRadius = 8.0;

  // Animation Durations
  static const Duration shortAnimation = Duration(milliseconds: 200);
  static const Duration mediumAnimation = Duration(milliseconds: 300);
  static const Duration longAnimation = Duration(milliseconds: 500);

  // Error Messages
  static const String networkError =
      'Network connection error. Please check your internet connection.';
  static const String serverError =
      'Server error occurred. Please try again later.';
  static const String unknownError =
      'An unexpected error occurred. Please try again.';
  static const String validationError =
      'Please check your input and try again.';

  // Success Messages
  static const String loginSuccess = 'Login successful!';
  static const String registerSuccess = 'Registration successful!';
  static const String otpSentSuccess = 'OTP sent successfully!';
  static const String otpVerifiedSuccess = 'OTP verified successfully!';
  static const String logoutSuccess = 'Logout successful!';

  // Regex Patterns
  static const String emailPattern =
      r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$';
  static const String phonePattern = r'^\+?[1-9]\d{1,14}$';
  static const String namePattern = r'^[a-zA-Z\u0600-\u06FF\s]+$';

  // Supported Languages
  static const List<String> supportedLanguages = ['en', 'ar'];
  static const String defaultLanguage = 'en';

  // Google Sign-In
  static const String googleClientId = 'YOUR_GOOGLE_CLIENT_ID';

  // Debug Settings
  static const bool enableLogging = true;
  static const bool enableCrashlytics = false;
  static const bool enableAnalytics = false;
}
