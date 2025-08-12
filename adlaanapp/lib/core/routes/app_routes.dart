import 'package:get/get.dart';
import '../../presentation/controllers/auth_controller.dart';
import '../../presentation/pages/auth/login_page.dart';
import '../../presentation/pages/auth/register_page.dart';
import '../../presentation/pages/auth/otp_verification_page.dart';
import '../../presentation/pages/home/home_page.dart';

/// App routes configuration using GetX
class AppRoutes {
  static const String initial = '/';
  static const String login = '/login';
  static const String register = '/register';
  static const String otpVerification = '/otp-verification';
  static const String home = '/home';
  static const String profile = '/profile';

  static List<GetPage> pages = [
    GetPage(
      name: initial,
      page: () => const LoginPage(),
      binding: AuthBinding(),
    ),
    GetPage(name: login, page: () => const LoginPage(), binding: AuthBinding()),
    GetPage(
      name: register,
      page: () => const RegisterPage(),
      binding: AuthBinding(),
    ),
    GetPage(
      name: otpVerification,
      page: () => const OtpVerificationPage(),
      binding: AuthBinding(),
    ),
    GetPage(name: home, page: () => const HomePage(), binding: AuthBinding()),
    // Add more routes as needed
  ];
}

/// Authentication binding for dependency injection
class AuthBinding extends Bindings {
  @override
  void dependencies() {
    Get.lazyPut<AuthController>(() => AuthController());
  }
}
