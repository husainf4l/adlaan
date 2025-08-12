import 'package:flutter/material.dart';

/// App colors inspired by Adlaan.com design
/// Features deep blues, elegant golds, and modern neutrals
class AppColors {
  AppColors._();

  // Primary Colors - Deep Blue Palette
  static const Color primary = Color(0xFF1E3A8A); // Deep blue
  static const Color primaryLight = Color(0xFF3B82F6); // Lighter blue
  static const Color primaryDark = Color(0xFF1E293B); // Darker blue

  // Secondary Colors - Gold/Amber Accent
  static const Color secondary = Color(0xFFD97706); // Warm amber
  static const Color secondaryLight = Color(0xFFFBBF24); // Light amber
  static const Color secondaryDark = Color(0xFF92400E); // Dark amber

  // Light Theme Colors
  static const Color background = Color(0xFFFAFAFB); // Off-white
  static const Color surface = Color(0xFFFFFFFF); // Pure white
  static const Color surfaceVariant = Color(0xFFF8FAFC); // Light gray

  // Dark Theme Colors - Matching Adlaan.com dark style
  static const Color darkBackground = Color(0xFF0A0E1A); // Very dark blue-black
  static const Color darkSurface = Color(0xFF1A1F2E); // Dark surface
  static const Color darkSurfaceVariant = Color(
    0xFF252B3D,
  ); // Lighter dark surface

  // Text Colors
  static const Color textPrimary = Color(0xFF0F172A); // Almost black
  static const Color textSecondary = Color(0xFF475569); // Medium gray
  static const Color textTertiary = Color(0xFF94A3B8); // Light gray
  static const Color textOnPrimary = Color(0xFFFFFFFF); // White

  // Dark Text Colors
  static const Color darkTextPrimary = Color(0xFFFFFFFF); // White
  static const Color darkTextSecondary = Color(0xFFCBD5E1); // Light gray
  static const Color darkTextTertiary = Color(0xFF94A3B8); // Medium gray

  // Status Colors
  static const Color success = Color(0xFF10B981); // Green
  static const Color warning = Color(0xFFF59E0B); // Orange
  static const Color error = Color(0xFFEF4444); // Red
  static const Color info = Color(0xFF3B82F6); // Blue

  // Border Colors
  static const Color border = Color(0xFFE2E8F0); // Light border
  static const Color borderFocus = Color(0xFF3B82F6); // Focus border
  static const Color borderError = Color(0xFFEF4444); // Error border

  // Shadow Colors
  static const Color shadow = Color(0x1A000000); // 10% black
  static const Color shadowMedium = Color(0x26000000); // 15% black
  static const Color shadowHeavy = Color(0x33000000); // 20% black

  // Gradient Colors
  static const LinearGradient primaryGradient = LinearGradient(
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
    colors: [Color(0xFF1E3A8A), Color(0xFF3B82F6)],
  );

  static const LinearGradient secondaryGradient = LinearGradient(
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
    colors: [Color(0xFFD97706), Color(0xFFFBBF24)],
  );

  // Input Field Colors
  static const Color inputFill = Color(0xFFF8FAFC);
  static const Color inputBorder = Color(0xFFE2E8F0);
  static const Color inputFocused = Color(0xFF3B82F6);
  static const Color inputError = Color(0xFFEF4444);

  // Dark Input Field Colors
  static const Color darkInputFill = Color(0xFF1E293B);
  static const Color darkInputBorder = Color(0xFF374151);
  static const Color darkInputFocused = Color(0xFF60A5FA);

  // Button Colors
  static const Color buttonPrimary = Color(0xFF1E3A8A);
  static const Color buttonSecondary = Color(0xFFF8FAFC);
  static const Color buttonDisabled = Color(0xFFE2E8F0);

  // Dark Button Colors
  static const Color darkButtonSecondary = Color(0xFF374151);
  static const Color darkButtonDisabled = Color(0xFF4B5563);

  // Loading and Shimmer
  static const Color shimmerBase = Color(0xFFE2E8F0);
  static const Color shimmerHighlight = Color(0xFFF1F5F9);
}
