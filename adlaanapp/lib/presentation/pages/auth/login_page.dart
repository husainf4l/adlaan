import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../../../core/constants/app_assets.dart';
import '../../../core/constants/app_constants.dart';
import '../../../core/constants/app_strings.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_typography.dart';
import '../../controllers/auth_controller.dart';
import '../../widgets/custom_widgets.dart';

class LoginPage extends StatefulWidget {
  const LoginPage({super.key});

  @override
  State<LoginPage> createState() => _LoginPageState();
}

class _LoginPageState extends State<LoginPage> {
  final AuthController _authController = Get.find<AuthController>();
  final _formKey = GlobalKey<FormState>();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();

  bool _rememberMe = false;

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  void _handleLogin() {
    if (_formKey.currentState!.validate()) {
      _authController.login(
        _emailController.text.trim(),
        _passwordController.text,
      );
    }
  }

  void _handleGoogleSignIn() {
    _authController.signInWithGoogle();
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;

    return Scaffold(
      backgroundColor: colorScheme.background,
      body: SafeArea(
        child: SingleChildScrollView(
          child: Padding(
            padding: const EdgeInsets.all(AppConstants.largePadding),
            child: Form(
              key: _formKey,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const SizedBox(height: 40),

                  // Logo and Welcome Section
                  _buildHeader(),

                  const SizedBox(height: 48),

                  // Login Form
                  _buildLoginForm(),

                  const SizedBox(height: 24),

                  // Remember Me and Forgot Password
                  _buildRememberAndForgot(),

                  const SizedBox(height: 32),

                  // Login Button
                  _buildLoginButton(),

                  const SizedBox(height: 24),

                  // Divider
                  _buildDivider(),

                  const SizedBox(height: 24),

                  // Social Sign In
                  _buildSocialSignIn(),

                  const SizedBox(height: 32),

                  // Sign Up Link
                  _buildSignUpLink(),

                  const SizedBox(height: 24),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildHeader() {
    final colorScheme = Theme.of(context).colorScheme;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Logo
        Container(
          width: 120,
          height: 60,
          child: ClipRRect(
            borderRadius: BorderRadius.circular(12),
            child: Image.asset(AppAssets.adlaanDarkLogo, fit: BoxFit.contain),
          ),
        ),

        const SizedBox(height: 24),

        // Welcome Text
        Text(
          'Welcome back',
          style: AppTypography.displaySmall.copyWith(
            color: colorScheme.onBackground,
          ),
        ),

        const SizedBox(height: 8),

        Text(
          'Sign in to your account to continue building with justice and precision',
          style: AppTypography.bodyLarge.copyWith(
            color: colorScheme.onBackground.withOpacity(0.7),
          ),
        ),
      ],
    );
  }

  Widget _buildLoginForm() {
    return Column(
      children: [
        // Email Field
        AdlaanTextField(
          label: 'Email Address',
          hint: 'Enter your email address',
          controller: _emailController,
          keyboardType: TextInputType.emailAddress,
          textInputAction: TextInputAction.next,
          prefixIcon: const Icon(AppIcons.email, color: AppColors.textTertiary),
          validator: (value) {
            if (value == null || value.isEmpty) {
              return 'Please enter your email address';
            }
            if (!GetUtils.isEmail(value)) {
              return 'Please enter a valid email address';
            }
            return null;
          },
          onChanged: (_) => _validateForm(),
        ),

        const SizedBox(height: 20),

        // Password Field
        Obx(
          () => AdlaanTextField(
            label: 'Password',
            hint: 'Enter your password',
            controller: _passwordController,
            obscureText: !_authController.isPasswordVisible.value,
            textInputAction: TextInputAction.done,
            prefixIcon: const Icon(
              AppIcons.lock,
              color: AppColors.textTertiary,
            ),
            suffixIcon: IconButton(
              icon: Icon(
                _authController.isPasswordVisible.value
                    ? AppIcons.visibilityOff
                    : AppIcons.visibility,
                color: AppColors.textTertiary,
              ),
              onPressed: _authController.togglePasswordVisibility,
            ),
            validator: (value) {
              if (value == null || value.isEmpty) {
                return 'Please enter your password';
              }
              if (value.length < AppConstants.minPasswordLength) {
                return 'Password must be at least ${AppConstants.minPasswordLength} characters';
              }
              return null;
            },
            onChanged: (_) => _validateForm(),
            onSubmitted: (_) => _handleLogin(),
          ),
        ),
      ],
    );
  }

  Widget _buildRememberAndForgot() {
    final colorScheme = Theme.of(context).colorScheme;

    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        // Remember Me
        Row(
          children: [
            SizedBox(
              width: 20,
              height: 20,
              child: Checkbox(
                value: _rememberMe,
                onChanged: (value) {
                  setState(() {
                    _rememberMe = value ?? false;
                  });
                },
                activeColor: colorScheme.primary,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(4),
                ),
              ),
            ),
            const SizedBox(width: 8),
            Text(
              'Remember me',
              style: AppTypography.bodyMedium.copyWith(
                color: colorScheme.onBackground.withOpacity(0.7),
              ),
            ),
          ],
        ),

        // Forgot Password
        TextButton(
          onPressed: () {
            // Navigate to forgot password
          },
          child: Text(
            'Forgot password?',
            style: AppTypography.bodyMedium.copyWith(
              color: colorScheme.primary,
              fontWeight: FontWeight.w500,
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildLoginButton() {
    return Obx(
      () => AdlaanButton(
        text: 'Sign In',
        onPressed: _authController.isLoginFormValid.value ? _handleLogin : null,
        isLoading: _authController.isLoading.value,
        width: double.infinity,
        size: AdlaanButtonSize.large,
      ),
    );
  }

  Widget _buildDivider() {
    final colorScheme = Theme.of(context).colorScheme;

    return Row(
      children: [
        Expanded(child: Divider(color: colorScheme.outline, thickness: 1)),
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16),
          child: Text(
            'or continue with',
            style: AppTypography.bodySmall.copyWith(
              color: colorScheme.onBackground.withOpacity(0.5),
            ),
          ),
        ),
        Expanded(child: Divider(color: colorScheme.outline, thickness: 1)),
      ],
    );
  }

  Widget _buildSocialSignIn() {
    return Obx(
      () => SocialSignInButton(
        text: 'Continue with Google',
        icon: const Icon(AppIcons.google, size: 20),
        onPressed: _handleGoogleSignIn,
        isLoading: _authController.isLoading.value,
      ),
    );
  }

  Widget _buildSignUpLink() {
    final colorScheme = Theme.of(context).colorScheme;

    return Center(
      child: Row(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Text(
            "Don't have an account? ",
            style: AppTypography.bodyMedium.copyWith(
              color: colorScheme.onBackground.withOpacity(0.7),
            ),
          ),
          TextButton(
            onPressed: () {
              Get.toNamed('/register');
            },
            child: Text(
              'Sign up',
              style: AppTypography.bodyMedium.copyWith(
                color: colorScheme.primary,
                fontWeight: FontWeight.w600,
              ),
            ),
          ),
        ],
      ),
    );
  }

  void _validateForm() {
    _authController.validateLoginForm(
      _emailController.text.trim(),
      _passwordController.text,
    );
  }
}
