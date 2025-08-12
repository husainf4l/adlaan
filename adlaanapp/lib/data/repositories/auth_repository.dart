import 'dart:io';
import 'package:get_storage/get_storage.dart';
import '../../core/constants/app_constants.dart';
import '../../core/models/auth_models.dart';
import '../../core/services/http_service.dart';

/// Repository for authentication-related API calls
/// Handles all auth operations including login, register, OTP verification
class AuthRepository {
  final HttpService _httpService = HttpService.instance;
  final GetStorage _storage = GetStorage();

  /// Login with email and password
  Future<LoginResponse> login(LoginRequest request) async {
    try {
      final response = await _httpService.post(
        AppConstants.loginEndpoint,
        data: request.toJson(),
      );

      return LoginResponse.fromJson(response.data);
    } catch (e) {
      rethrow;
    }
  }

  /// Register new user
  Future<RegisterResponse> register(RegisterRequest request) async {
    try {
      final response = await _httpService.post(
        AppConstants.registerEndpoint,
        data: request.toJson(),
      );

      return RegisterResponse.fromJson(response.data);
    } catch (e) {
      rethrow;
    }
  }

  /// Complete signup with company information
  Future<CompleteSignupResponse> completeSignup(
    CompleteSignupRequest request,
  ) async {
    try {
      final response = await _httpService.post(
        AppConstants.signupCompleteEndpoint,
        data: request.toJson(),
      );

      return CompleteSignupResponse.fromJson(response.data);
    } catch (e) {
      rethrow;
    }
  }

  /// Verify OTP code
  Future<OtpVerificationResponse> verifyOtp(
    OtpVerificationRequest request,
  ) async {
    try {
      final response = await _httpService.post(
        AppConstants.verifyOtpEndpoint,
        data: request.toJson(),
      );

      return OtpVerificationResponse.fromJson(response.data);
    } catch (e) {
      rethrow;
    }
  }

  /// Resend OTP code
  Future<Map<String, dynamic>> resendOtp(ResendOtpRequest request) async {
    try {
      final response = await _httpService.post(
        AppConstants.resendOtpEndpoint,
        data: request.toJson(),
      );

      return response.data;
    } catch (e) {
      rethrow;
    }
  }

  /// Google Sign-In with ID token (Platform-specific)
  Future<GoogleAuthResponse> googleSignIn(GoogleTokenRequest request) async {
    try {
      // Use iOS-specific endpoint for iOS, general endpoint for other platforms
      String endpoint = AppConstants.googleAuthEndpoint;
      if (Platform.isIOS) {
        endpoint = AppConstants.googleAuthiOSEndpoint;
      }

      final response = await _httpService.post(
        endpoint,
        data: request.toJson(),
      );

      final authResponse = GoogleAuthResponse.fromJson(response.data);

      // The backend should set HTTP-only cookies for session management
      // No need to store tokens locally as they're handled via HTTP-only cookies

      return authResponse;
    } catch (e) {
      rethrow;
    }
  }

  /// Get user profile
  Future<User> getUserProfile() async {
    try {
      final response = await _httpService.get(AppConstants.profileEndpoint);

      // Assuming the API returns the user object directly
      // Adjust based on actual API response structure
      if (response.data is Map<String, dynamic>) {
        return User.fromJson(response.data);
      } else if (response.data['user'] != null) {
        return User.fromJson(response.data['user']);
      } else {
        throw Exception('Invalid user profile response');
      }
    } catch (e) {
      rethrow;
    }
  }

  /// Logout user
  Future<void> logout() async {
    try {
      await _httpService.post(AppConstants.logoutEndpoint);
    } catch (e) {
      // Continue with local logout even if API call fails
      print('Logout API call failed: $e');
    } finally {
      // Always clear local storage
      await clearUserData();
    }
  }

  /// Save user data to local storage
  Future<void> saveUserData(User user) async {
    await _storage.write(AppConstants.userDataKey, user.toJson());
  }

  /// Get user data from local storage
  User? getUserData() {
    final userData = _storage.read(AppConstants.userDataKey);
    if (userData != null) {
      return User.fromJson(userData);
    }
    return null;
  }

  /// Save authentication tokens
  Future<void> saveTokens(String accessToken, String refreshToken) async {
    await _storage.write(AppConstants.accessTokenKey, accessToken);
    await _storage.write(AppConstants.refreshTokenKey, refreshToken);
    _httpService.setAuthToken(accessToken);
  }

  /// Get access token
  String? getAccessToken() {
    return _storage.read(AppConstants.accessTokenKey);
  }

  /// Get refresh token
  String? getRefreshToken() {
    return _storage.read(AppConstants.refreshTokenKey);
  }

  /// Check if user is authenticated
  bool isAuthenticated() {
    final token = getAccessToken();
    final user = getUserData();
    return token != null && user != null;
  }

  /// Clear all user data and tokens
  Future<void> clearUserData() async {
    await _storage.remove(AppConstants.accessTokenKey);
    await _storage.remove(AppConstants.refreshTokenKey);
    await _storage.remove(AppConstants.userDataKey);
    _httpService.removeAuthToken();
  }

  /// Check if onboarding is completed
  bool isOnboardingCompleted() {
    return _storage.read(AppConstants.onboardingKey) ?? false;
  }

  /// Mark onboarding as completed
  Future<void> completeOnboarding() async {
    await _storage.write(AppConstants.onboardingKey, true);
  }

  /// Get saved language preference
  String getLanguage() {
    return _storage.read(AppConstants.languageKey) ??
        AppConstants.defaultLanguage;
  }

  /// Save language preference
  Future<void> saveLanguage(String languageCode) async {
    await _storage.write(AppConstants.languageKey, languageCode);
  }

  /// Get saved theme preference
  String? getThemeMode() {
    return _storage.read(AppConstants.themeKey);
  }

  /// Save theme preference
  Future<void> saveThemeMode(String themeMode) async {
    await _storage.write(AppConstants.themeKey, themeMode);
  }

  /// Initialize repository (call this when app starts)
  Future<void> initialize() async {
    await GetStorage.init();

    // Set auth token if available
    final token = getAccessToken();
    if (token != null) {
      _httpService.setAuthToken(token);
    }
  }

  /// Validate email format
  bool isValidEmail(String email) {
    return RegExp(AppConstants.emailPattern).hasMatch(email);
  }

  /// Validate phone format
  bool isValidPhone(String phone) {
    return RegExp(AppConstants.phonePattern).hasMatch(phone);
  }

  /// Validate name format
  bool isValidName(String name) {
    return name.length >= AppConstants.minNameLength &&
        name.length <= AppConstants.maxNameLength &&
        RegExp(AppConstants.namePattern).hasMatch(name);
  }

  /// Validate password strength
  bool isValidPassword(String password) {
    return password.length >= AppConstants.minPasswordLength &&
        password.length <= AppConstants.maxPasswordLength;
  }
}
