import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

/// App typography system following modern design principles
/// Arabic support with Cairo font from Google Fonts
class AppTypography {
  AppTypography._();

  // Font weights
  static const FontWeight light = FontWeight.w300;
  static const FontWeight regular = FontWeight.w400;
  static const FontWeight medium = FontWeight.w500;
  static const FontWeight semiBold = FontWeight.w600;
  static const FontWeight bold = FontWeight.w700;
  static const FontWeight extraBold = FontWeight.w800;

  // Display styles (for large headers)
  static TextStyle displayLarge = GoogleFonts.cairo(
    fontSize: 40,
    fontWeight: bold,
    height: 1.1,
    letterSpacing: -0.5,
  );

  static TextStyle displayMedium = GoogleFonts.cairo(
    fontSize: 32,
    fontWeight: bold,
    height: 1.2,
    letterSpacing: -0.25,
  );

  static TextStyle displaySmall = GoogleFonts.cairo(
    fontSize: 28,
    fontWeight: semiBold,
    height: 1.2,
    letterSpacing: 0,
  );

  // Headline styles
  static TextStyle headlineLarge = GoogleFonts.cairo(
    fontSize: 24,
    fontWeight: semiBold,
    height: 1.3,
    letterSpacing: 0,
  );

  static TextStyle headlineMedium = GoogleFonts.cairo(
    fontSize: 20,
    fontWeight: semiBold,
    height: 1.3,
    letterSpacing: 0,
  );

  static TextStyle headlineSmall = GoogleFonts.cairo(
    fontSize: 18,
    fontWeight: medium,
    height: 1.4,
    letterSpacing: 0,
  );

  // Title styles
  static TextStyle titleLarge = GoogleFonts.cairo(
    fontSize: 16,
    fontWeight: semiBold,
    height: 1.4,
    letterSpacing: 0,
  );

  static TextStyle titleMedium = GoogleFonts.cairo(
    fontSize: 14,
    fontWeight: medium,
    height: 1.4,
    letterSpacing: 0.1,
  );

  static TextStyle titleSmall = GoogleFonts.cairo(
    fontSize: 12,
    fontWeight: medium,
    height: 1.4,
    letterSpacing: 0.1,
  );

  // Body styles
  static TextStyle bodyLarge = GoogleFonts.cairo(
    fontSize: 16,
    fontWeight: regular,
    height: 1.5,
    letterSpacing: 0,
  );

  static TextStyle bodyMedium = GoogleFonts.cairo(
    fontSize: 14,
    fontWeight: regular,
    height: 1.5,
    letterSpacing: 0,
  );

  static TextStyle bodySmall = GoogleFonts.cairo(
    fontSize: 12,
    fontWeight: regular,
    height: 1.4,
    letterSpacing: 0,
  );

  // Label styles (for buttons, chips, etc.)
  static TextStyle labelLarge = GoogleFonts.cairo(
    fontSize: 14,
    fontWeight: medium,
    height: 1.3,
    letterSpacing: 0.1,
  );

  static TextStyle labelMedium = GoogleFonts.cairo(
    fontSize: 12,
    fontWeight: medium,
    height: 1.3,
    letterSpacing: 0.5,
  );

  static TextStyle labelSmall = GoogleFonts.cairo(
    fontSize: 10,
    fontWeight: medium,
    height: 1.3,
    letterSpacing: 0.5,
  );

  // Special purpose styles
  static TextStyle caption = GoogleFonts.cairo(
    fontSize: 12,
    fontWeight: regular,
    height: 1.3,
    letterSpacing: 0.4,
  );

  static TextStyle overline = GoogleFonts.cairo(
    fontSize: 10,
    fontWeight: medium,
    height: 1.6,
    letterSpacing: 1.5,
  );

  // Form-specific styles
  static TextStyle inputLabel = GoogleFonts.cairo(
    fontSize: 14,
    fontWeight: medium,
    height: 1.4,
    letterSpacing: 0,
  );

  static TextStyle inputText = GoogleFonts.cairo(
    fontSize: 16,
    fontWeight: regular,
    height: 1.5,
    letterSpacing: 0,
  );

  static TextStyle inputHint = GoogleFonts.cairo(
    fontSize: 16,
    fontWeight: regular,
    height: 1.5,
    letterSpacing: 0,
  );

  static TextStyle inputError = GoogleFonts.cairo(
    fontSize: 12,
    fontWeight: regular,
    height: 1.3,
    letterSpacing: 0,
  );

  // Button styles
  static TextStyle buttonLarge = GoogleFonts.cairo(
    fontSize: 16,
    fontWeight: semiBold,
    height: 1.2,
    letterSpacing: 0.5,
  );

  static TextStyle buttonMedium = GoogleFonts.cairo(
    fontSize: 14,
    fontWeight: semiBold,
    height: 1.2,
    letterSpacing: 0.5,
  );

  static TextStyle buttonSmall = GoogleFonts.cairo(
    fontSize: 12,
    fontWeight: semiBold,
    height: 1.2,
    letterSpacing: 0.5,
  );
}
