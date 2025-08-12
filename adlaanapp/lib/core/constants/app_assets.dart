import 'package:flutter/material.dart';

/// App asset paths for images, icons, and other resources
class AppAssets {
  AppAssets._();

  // Adlaan Logo Images
  static const String adlaanLogo = 'assets/images/adlaan_logo.svg';
  static const String adlaanLogoSmall = 'assets/images/adlaan_logo_small.svg';
  static const String adlaanIcon = 'assets/icons/adlaan_icon.svg';
  static const String adlaanDarkLogo = 'assets/images/adlaan-darklogo.png';

  // Images
  static const String logoPath = 'assets/images/logo.png';
  static const String logoWhitePath = 'assets/images/logo_white.png';
  static const String splashBackgroundPath =
      'assets/images/splash_background.png';
  static const String onboardingPath = 'assets/images/onboarding.png';
  static const String authBackgroundPath = 'assets/images/auth_background.png';
  static const String successPath = 'assets/images/success.png';
  static const String errorPath = 'assets/images/error.png';

  // Icons
  static const String googleIconPath = 'assets/icons/google.svg';
  static const String appleIconPath = 'assets/icons/apple.svg';
  static const String phoneIconPath = 'assets/icons/phone.svg';
  static const String emailIconPath = 'assets/icons/email.svg';
  static const String lockIconPath = 'assets/icons/lock.svg';
  static const String userIconPath = 'assets/icons/user.svg';
  static const String eyeIconPath = 'assets/icons/eye.svg';
  static const String eyeOffIconPath = 'assets/icons/eye_off.svg';

  // Lottie Animations
  static const String loadingAnimationPath = 'assets/animations/loading.json';
  static const String successAnimationPath = 'assets/animations/success.json';
  static const String errorAnimationPath = 'assets/animations/error.json';
  static const String otpAnimationPath = 'assets/animations/otp.json';
}

/// Material Icons used throughout the app
class AppIcons {
  AppIcons._();

  // Auth Icons
  static const IconData email = Icons.email_outlined;
  static const IconData emailFilled = Icons.email;
  static const IconData phone = Icons.phone_outlined;
  static const IconData phoneFilled = Icons.phone;
  static const IconData lock = Icons.lock_outline;
  static const IconData lockFilled = Icons.lock;
  static const IconData person = Icons.person_outline;
  static const IconData personFilled = Icons.person;
  static const IconData visibility = Icons.visibility_outlined;
  static const IconData visibilityOff = Icons.visibility_off_outlined;

  // Navigation Icons
  static const IconData arrowBack = Icons.arrow_back;
  static const IconData arrowForward = Icons.arrow_forward;
  static const IconData close = Icons.close;
  static const IconData check = Icons.check;
  static const IconData done = Icons.done;

  // Status Icons
  static const IconData success = Icons.check_circle_outline;
  static const IconData error = Icons.error_outline;
  static const IconData warning = Icons.warning_amber;
  static const IconData info = Icons.info_outline;

  // Social Icons
  static const IconData google = Icons.g_mobiledata;
  static const IconData apple = Icons.apple;

  // General Icons
  static const IconData home = Icons.home_outlined;
  static const IconData homeFilled = Icons.home;
  static const IconData settings = Icons.settings_outlined;
  static const IconData settingsFilled = Icons.settings;
  static const IconData profile = Icons.account_circle_outlined;
  static const IconData profileFilled = Icons.account_circle;
  static const IconData logout = Icons.logout;
  static const IconData refresh = Icons.refresh;
  static const IconData search = Icons.search;
  static const IconData filter = Icons.filter_list;
  static const IconData sort = Icons.sort;
  static const IconData more = Icons.more_vert;
  static const IconData add = Icons.add;
  static const IconData edit = Icons.edit_outlined;
  static const IconData delete = Icons.delete_outline;

  // Communication Icons
  static const IconData call = Icons.call;
  static const IconData chat = Icons.chat_bubble_outline;
  static const IconData notification = Icons.notifications_outlined;
  static const IconData notificationFilled = Icons.notifications;

  // Document Icons
  static const IconData document = Icons.description_outlined;
  static const IconData documentFilled = Icons.description;
  static const IconData download = Icons.download;
  static const IconData upload = Icons.upload;
  static const IconData share = Icons.share;

  // Language and Accessibility
  static const IconData language = Icons.language;
  static const IconData translate = Icons.translate;
  static const IconData darkMode = Icons.dark_mode;
  static const IconData lightMode = Icons.light_mode;
}
