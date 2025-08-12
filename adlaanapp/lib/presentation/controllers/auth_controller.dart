import 'package:get/get.dart';
import '../../core/constants/app_constants.dart';
import '../../core/models/auth_models.dart';
import '../../core/services/http_service.dart';
import '../../core/services/google_sign_in_service.dart';
import '../../data/repositories/auth_repository.dart';

/// Authentication controller using GetX
/// Manages authentication state and operations
class AuthController extends GetxController {
  final AuthRepository _authRepository = AuthRepository();
  final GoogleSignInService _googleSignInService = GoogleSignInService.instance;

  // Observable state variables
  final Rx<AuthState> authState = AuthState.initial.obs;
  final Rx<User?> currentUser = Rx<User?>(null);
  final RxBool isLoading = false.obs;
  final RxString errorMessage = ''.obs;
  final RxBool otpRequired = false.obs;
  final RxString otpPhoneNumber = ''.obs;

  // Form validation flags
  final RxBool isLoginFormValid = false.obs;
  final RxBool isRegisterFormValid = false.obs;
  final RxBool isPasswordVisible = false.obs;
  final RxBool isConfirmPasswordVisible = false.obs;

  @override
  void onInit() {
    super.onInit();
    _initializeAuth();
  }

  /// Initialize authentication state
  Future<void> _initializeAuth() async {
    try {
      await _authRepository.initialize();

      if (_authRepository.isAuthenticated()) {
        final user = _authRepository.getUserData();
        if (user != null) {
          currentUser.value = user;
          authState.value = AuthState.authenticated;
          Get.offAllNamed('/home');
        } else {
          authState.value = AuthState.unauthenticated;
        }
      } else {
        authState.value = AuthState.unauthenticated;
      }
    } catch (e) {
      authState.value = AuthState.unauthenticated;
      _handleError(e);
    }
  }

  /// Login with email and password
  Future<void> login(String email, String password) async {
    try {
      _setLoading(true);
      _clearError();

      final request = LoginRequest(email: email, password: password);
      final response = await _authRepository.login(request);

      if (response.requiresOtp == true) {
        otpRequired.value = true;
        otpPhoneNumber.value = email; // Assuming email is used for OTP
        authState.value = AuthState.otpRequired;
        Get.snackbar(
          'OTP Required',
          'Please verify the OTP sent to your phone',
          snackPosition: SnackPosition.TOP,
        );
      } else if (response.user != null) {
        await _handleSuccessfulAuth(response.user!);
        Get.offAllNamed('/home');
        Get.snackbar(
          'Success',
          AppConstants.loginSuccess,
          snackPosition: SnackPosition.TOP,
        );
      }
    } catch (e) {
      _handleError(e);
    } finally {
      _setLoading(false);
    }
  }

  /// Register new user
  Future<void> register(
    String email,
    String password,
    String firstName,
    String lastName, {
    String? phoneNumber,
  }) async {
    try {
      _setLoading(true);
      _clearError();

      final request = RegisterRequest(
        email: email,
        password: password,
        firstName: firstName,
        lastName: lastName,
        phoneNumber: phoneNumber,
      );

      final response = await _authRepository.register(request);
      await _handleSuccessfulAuth(response.user);

      Get.offAllNamed('/home');
      Get.snackbar(
        'Success',
        AppConstants.registerSuccess,
        snackPosition: SnackPosition.TOP,
      );
    } catch (e) {
      _handleError(e);
    } finally {
      _setLoading(false);
    }
  }

  /// Complete signup with company information
  Future<void> completeSignup({
    required String userId,
    required String companyName,
    String? companyWebsite,
    String? companyIndustry,
    String? companyAddress,
    String? companyPhone,
  }) async {
    try {
      _setLoading(true);
      _clearError();

      final request = CompleteSignupRequest(
        userId: userId,
        companyName: companyName,
        companyWebsite: companyWebsite,
        companyIndustry: companyIndustry,
        companyAddress: companyAddress,
        companyPhone: companyPhone,
      );

      final response = await _authRepository.completeSignup(request);
      await _handleSuccessfulAuth(response.user);

      Get.snackbar(
        'Success',
        'Company setup completed successfully!',
        snackPosition: SnackPosition.TOP,
      );
    } catch (e) {
      _handleError(e);
    } finally {
      _setLoading(false);
    }
  }

  /// Verify OTP code
  Future<void> verifyOtp(String otpCode, {String? phoneNumber}) async {
    try {
      _setLoading(true);
      _clearError();

      final request = OtpVerificationRequest(
        phoneNumber: phoneNumber ?? otpPhoneNumber.value,
        otpCode: otpCode,
        type: 'LOGIN',
      );

      final response = await _authRepository.verifyOtp(request);
      await _handleSuccessfulAuth(response.user);

      otpRequired.value = false;
      otpPhoneNumber.value = '';

      Get.offAllNamed('/home');
      Get.snackbar(
        'Success',
        AppConstants.otpVerifiedSuccess,
        snackPosition: SnackPosition.TOP,
      );
    } catch (e) {
      _handleError(e);
    } finally {
      _setLoading(false);
    }
  }

  /// Resend OTP code
  Future<void> resendOtp({String? phoneNumber}) async {
    try {
      _setLoading(true);
      _clearError();

      final request = ResendOtpRequest(
        phoneNumber: phoneNumber ?? otpPhoneNumber.value,
        type: 'LOGIN',
      );

      await _authRepository.resendOtp(request);

      Get.snackbar(
        'Success',
        AppConstants.otpSentSuccess,
        snackPosition: SnackPosition.TOP,
      );
    } catch (e) {
      _handleError(e);
    } finally {
      _setLoading(false);
    }
  }

  /// Google Sign-In
  Future<void> signInWithGoogle() async {
    try {
      _setLoading(true);
      _clearError();

      // Use our Google Sign-In service
      final result = await _googleSignInService.signIn();

      if (!result.success) {
        if (result.error != null && result.error!.contains('cancelled')) {
          // User cancelled, don't show error
          return;
        }
        throw Exception(result.error ?? 'Google Sign-In failed');
      }

      // Send Google ID token to backend
      // For iOS, we include the client ID; for other platforms, it's optional
      final request = GoogleTokenRequest(
        token: result.idToken!,
        clientId:
            '535659420325-dhlhc6edvd5lohb7r4lqk65legi28uef.apps.googleusercontent.com',
      );

      final response = await _authRepository.googleSignIn(request);

      await _handleSuccessfulAuth(response.user);

      Get.offAllNamed('/home');
      Get.snackbar(
        'Success',
        'Google Sign-In successful!',
        snackPosition: SnackPosition.TOP,
      );
    } catch (e) {
      _handleError(e);
    } finally {
      _setLoading(false);
    }
  }

  /// Logout user
  Future<void> logout() async {
    try {
      _setLoading(true);

      await _authRepository.logout();
      await _googleSignInService.signOut();

      currentUser.value = null;
      authState.value = AuthState.unauthenticated;
      otpRequired.value = false;
      otpPhoneNumber.value = '';
      _clearError();

      Get.offAllNamed('/login');
      Get.snackbar(
        'Success',
        AppConstants.logoutSuccess,
        snackPosition: SnackPosition.TOP,
      );
    } catch (e) {
      _handleError(e);
    } finally {
      _setLoading(false);
    }
  }

  /// Handle successful authentication
  Future<void> _handleSuccessfulAuth(User user) async {
    currentUser.value = user;
    await _authRepository.saveUserData(user);
    authState.value = AuthState.authenticated;
  }

  /// Set loading state
  void _setLoading(bool loading) {
    isLoading.value = loading;
    if (loading) {
      authState.value = AuthState.loading;
    }
  }

  /// Clear error message
  void _clearError() {
    errorMessage.value = '';
    if (authState.value == AuthState.error) {
      authState.value = AuthState.initial;
    }
  }

  /// Handle errors
  void _handleError(dynamic error) {
    String message = AppConstants.unknownError;

    if (error is NetworkException) {
      message = error.message;
    } else if (error is ValidationException) {
      message = error.message;
    } else if (error is AuthenticationException) {
      message = error.message;
    } else if (error is ServerException) {
      message = error.message;
    } else if (error is Exception) {
      message = error.toString();
    } else {
      message = error.toString();
    }

    errorMessage.value = message;
    authState.value = AuthState.error;

    Get.snackbar(
      'Error',
      message,
      snackPosition: SnackPosition.TOP,
      backgroundColor: Get.theme.colorScheme.error,
      colorText: Get.theme.colorScheme.onError,
    );
  }

  /// Toggle password visibility
  void togglePasswordVisibility() {
    isPasswordVisible.value = !isPasswordVisible.value;
  }

  /// Toggle confirm password visibility
  void toggleConfirmPasswordVisibility() {
    isConfirmPasswordVisible.value = !isConfirmPasswordVisible.value;
  }

  /// Validate login form
  void validateLoginForm(String email, String password) {
    isLoginFormValid.value =
        _authRepository.isValidEmail(email) &&
        _authRepository.isValidPassword(password);
  }

  /// Validate register form
  void validateRegisterForm(
    String email,
    String password,
    String firstName,
    String lastName,
  ) {
    isRegisterFormValid.value =
        _authRepository.isValidEmail(email) &&
        _authRepository.isValidPassword(password) &&
        _authRepository.isValidName(firstName) &&
        _authRepository.isValidName(lastName);
  }

  /// Check if user is authenticated
  bool get isAuthenticated => authState.value == AuthState.authenticated;

  /// Check if user needs to complete onboarding
  bool get needsOnboarding => !_authRepository.isOnboardingCompleted();

  /// Complete onboarding
  Future<void> completeOnboarding() async {
    await _authRepository.completeOnboarding();
  }

  /// Refresh user profile
  Future<void> refreshProfile() async {
    try {
      if (!isAuthenticated) return;

      final user = await _authRepository.getUserProfile();
      currentUser.value = user;
      await _authRepository.saveUserData(user);
    } catch (e) {
      _handleError(e);
    }
  }
}
