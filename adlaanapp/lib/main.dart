import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:get_storage/get_storage.dart';
import 'core/routes/app_routes.dart';
import 'core/theme/app_theme.dart';
import 'data/repositories/auth_repository.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // Initialize GetStorage
  await GetStorage.init();

  // Initialize AuthRepository
  final authRepository = AuthRepository();
  await authRepository.initialize();

  runApp(const AdlaanApp());
}

class AdlaanApp extends StatelessWidget {
  const AdlaanApp({super.key});

  @override
  Widget build(BuildContext context) {
    return GetMaterialApp(
      title: 'Adlaan',
      debugShowCheckedModeBanner: false,

      // Theme configuration - Dark theme like Adlaan.com
      theme: AppTheme.lightTheme,
      darkTheme: AppTheme.darkTheme,
      themeMode: ThemeMode.dark, // Always use dark theme like Adlaan.com
      // Routing configuration
      initialRoute: AppRoutes.initial,
      getPages: AppRoutes.pages,

      // Default transitions
      defaultTransition: Transition.cupertino,
      transitionDuration: const Duration(milliseconds: 300),

      // Locale configuration for Arabic support with RTL
      locale: const Locale('ar', 'SA'), // Arabic (Saudi Arabia)
      fallbackLocale: const Locale('ar', 'SA'),

      // Global bindings
      initialBinding: InitialBinding(),
    );
  }
}

/// Initial binding for global dependencies
class InitialBinding extends Bindings {
  @override
  void dependencies() {
    // Initialize global controllers/services here if needed
    // Repository is already initialized in main()
  }
}
