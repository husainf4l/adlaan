import 'package:google_sign_in/google_sign_in.dart';
import 'package:flutter/foundation.dart';

/// Google Sign-In service for handling Google authentication
/// Provides methods to sign in, sign out, and get Google tokens
class GoogleSignInService {
  static GoogleSignInService? _instance;
  late GoogleSignIn _googleSignIn;

  GoogleSignInService._() {
    _initializeGoogleSignIn();
  }

  static GoogleSignInService get instance {
    _instance ??= GoogleSignInService._();
    return _instance!;
  }

  void _initializeGoogleSignIn() {
    _googleSignIn = GoogleSignIn(
      clientId:
          '535659420325-dhlhc6edvd5lohb7r4lqk65legi28uef.apps.googleusercontent.com',
      scopes: ['email', 'profile', 'openid'],
    );
  }

  /// Check if user is currently signed in
  bool get isSignedIn => _googleSignIn.currentUser != null;

  /// Get current signed-in user
  GoogleSignInAccount? get currentUser => _googleSignIn.currentUser;

  /// Sign in with Google and return Google access token
  Future<GoogleSignInResult> signIn() async {
    try {
      if (kDebugMode) {
        print('🔐 Starting Google Sign-In...');
      }

      // Attempt to sign in
      final GoogleSignInAccount? account = await _googleSignIn.signIn();

      if (account == null) {
        if (kDebugMode) {
          print('❌ Google Sign-In cancelled by user');
        }
        return GoogleSignInResult(
          success: false,
          error: 'Sign-in cancelled by user',
        );
      }

      // Get authentication details
      final GoogleSignInAuthentication auth = await account.authentication;

      if (auth.accessToken == null || auth.idToken == null) {
        if (kDebugMode) {
          print('❌ Failed to get Google tokens');
        }
        return GoogleSignInResult(
          success: false,
          error: 'Failed to get authentication tokens',
        );
      }

      if (kDebugMode) {
        print('✅ Google Sign-In successful');
        print('📧 Email: ${account.email}');
        print('👤 Name: ${account.displayName}');
        print('🔑 Access Token: ${auth.accessToken?.substring(0, 20)}...');
        print('🆔 ID Token: ${auth.idToken?.substring(0, 20)}...');
      }

      return GoogleSignInResult(
        success: true,
        account: account,
        accessToken: auth.accessToken!,
        idToken: auth.idToken!,
      );
    } catch (error) {
      if (kDebugMode) {
        print('❌ Google Sign-In error: $error');
      }
      return GoogleSignInResult(success: false, error: error.toString());
    }
  }

  /// Sign out from Google
  Future<void> signOut() async {
    try {
      await _googleSignIn.signOut();
      if (kDebugMode) {
        print('👋 Google Sign-Out successful');
      }
    } catch (error) {
      if (kDebugMode) {
        print('❌ Google Sign-Out error: $error');
      }
      rethrow;
    }
  }

  /// Disconnect from Google (revoke access)
  Future<void> disconnect() async {
    try {
      await _googleSignIn.disconnect();
      if (kDebugMode) {
        print('🔌 Google disconnect successful');
      }
    } catch (error) {
      if (kDebugMode) {
        print('❌ Google disconnect error: $error');
      }
      rethrow;
    }
  }

  /// Get fresh tokens for current user
  Future<GoogleSignInResult> refreshTokens() async {
    try {
      final currentUser = _googleSignIn.currentUser;
      if (currentUser == null) {
        return GoogleSignInResult(
          success: false,
          error: 'No user currently signed in',
        );
      }

      final GoogleSignInAuthentication auth = await currentUser.authentication;

      if (auth.accessToken == null || auth.idToken == null) {
        return GoogleSignInResult(
          success: false,
          error: 'Failed to refresh tokens',
        );
      }

      return GoogleSignInResult(
        success: true,
        account: currentUser,
        accessToken: auth.accessToken!,
        idToken: auth.idToken!,
      );
    } catch (error) {
      return GoogleSignInResult(success: false, error: error.toString());
    }
  }
}

/// Result class for Google Sign-In operations
class GoogleSignInResult {
  final bool success;
  final GoogleSignInAccount? account;
  final String? accessToken;
  final String? idToken;
  final String? error;

  GoogleSignInResult({
    required this.success,
    this.account,
    this.accessToken,
    this.idToken,
    this.error,
  });

  /// User's email from Google account
  String? get email => account?.email;

  /// User's display name from Google account
  String? get displayName => account?.displayName;

  /// User's photo URL from Google account
  String? get photoUrl => account?.photoUrl;

  /// User's ID from Google account
  String? get id => account?.id;
}
