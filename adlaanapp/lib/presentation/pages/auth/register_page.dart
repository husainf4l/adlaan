import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../../../core/constants/app_assets.dart';
import '../../../core/constants/app_constants.dart';
import '../../../core/constants/app_strings.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_typography.dart';
import '../../controllers/auth_controller.dart';
import '../../widgets/custom_widgets.dart';

class RegisterPage extends StatefulWidget {
  const RegisterPage({super.key});

  @override
  State<RegisterPage> createState() => _RegisterPageState();
}

class _RegisterPageState extends State<RegisterPage> {
  final AuthController _authController = Get.find<AuthController>();
  final _formKey = GlobalKey<FormState>();
  final _firstNameController = TextEditingController();
  final _lastNameController = TextEditingController();
  final _emailController = TextEditingController();
  final _phoneController = TextEditingController();
  final _passwordController = TextEditingController();
  final _confirmPasswordController = TextEditingController();

  bool _acceptTerms = false;

  @override
  void dispose() {
    _firstNameController.dispose();
    _lastNameController.dispose();
    _emailController.dispose();
    _phoneController.dispose();
    _passwordController.dispose();
    _confirmPasswordController.dispose();
    super.dispose();
  }

  void _handleRegister() {
    if (_formKey.currentState!.validate() && _acceptTerms) {
      _authController.register(
        _emailController.text.trim(),
        _passwordController.text,
        _firstNameController.text.trim(),
        _lastNameController.text.trim(),
        phoneNumber: _phoneController.text.trim().isNotEmpty
            ? _phoneController.text.trim()
            : null,
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
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(AppIcons.arrowBack),
          onPressed: () => Get.back(),
        ),
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          child: Padding(
            padding: const EdgeInsets.all(AppConstants.largePadding),
            child: Form(
              key: _formKey,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const SizedBox(height: 20),

                  // Header
                  _buildHeader(),

                  const SizedBox(height: 32),

                  // Registration Form
                  _buildRegistrationForm(),

                  const SizedBox(height: 24),

                  // Terms and Conditions
                  _buildTermsAcceptance(),

                  const SizedBox(height: 32),

                  // Register Button
                  _buildRegisterButton(),

                  const SizedBox(height: 24),

                  // Divider
                  _buildDivider(),

                  const SizedBox(height: 24),

                  // Social Sign In
                  _buildSocialSignIn(),

                  const SizedBox(height: 32),

                  // Sign In Link
                  _buildSignInLink(),

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
          margin: const EdgeInsets.only(bottom: 24),
          child: ClipRRect(
            borderRadius: BorderRadius.circular(12),
            child: Image.asset(AppAssets.adlaanDarkLogo, fit: BoxFit.contain),
          ),
        ),

        Text(
          AppStrings.createAccount,
          style: AppTypography.displaySmall.copyWith(
            color: colorScheme.onBackground,
          ),
        ),

        const SizedBox(height: 8),

        Text(
          AppStrings.createAccountDescription,
          style: AppTypography.bodyLarge.copyWith(
            color: colorScheme.onBackground.withOpacity(0.7),
          ),
        ),
      ],
    );
  }

  Widget _buildRegistrationForm() {
    return Column(
      children: [
        // Name Fields Row
        Row(
          children: [
            Expanded(
              child: AdlaanTextField(
                label: AppStrings.firstName,
                hint: AppStrings.enterFirstName,
                controller: _firstNameController,
                textInputAction: TextInputAction.next,
                prefixIcon: const Icon(
                  AppIcons.person,
                  color: AppColors.textTertiary,
                ),
                validator: (value) {
                  if (value == null || value.isEmpty) {
                    return AppStrings.required;
                  }
                  if (value.length < AppConstants.minNameLength) {
                    return AppStrings.tooShort;
                  }
                  return null;
                },
                onChanged: (_) => _validateForm(),
              ),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: AdlaanTextField(
                label: AppStrings.lastName,
                hint: AppStrings.enterLastName,
                controller: _lastNameController,
                textInputAction: TextInputAction.next,
                prefixIcon: const Icon(
                  AppIcons.person,
                  color: AppColors.textTertiary,
                ),
                validator: (value) {
                  if (value == null || value.isEmpty) {
                    return AppStrings.required;
                  }
                  if (value.length < AppConstants.minNameLength) {
                    return AppStrings.tooShort;
                  }
                  return null;
                },
                onChanged: (_) => _validateForm(),
              ),
            ),
          ],
        ),

        const SizedBox(height: 20),

        // Email Field
        AdlaanTextField(
          label: AppStrings.emailAddress,
          hint: AppStrings.enterEmailAddress,
          controller: _emailController,
          keyboardType: TextInputType.emailAddress,
          textInputAction: TextInputAction.next,
          prefixIcon: const Icon(AppIcons.email, color: AppColors.textTertiary),
          validator: (value) {
            if (value == null || value.isEmpty) {
              return AppStrings.pleaseEnterEmail;
            }
            if (!GetUtils.isEmail(value)) {
              return AppStrings.pleaseEnterValidEmail;
            }
            return null;
          },
          onChanged: (_) => _validateForm(),
        ),

        const SizedBox(height: 20),

        // Phone Field (Optional)
        AdlaanTextField(
          label: AppStrings.phoneNumber,
          hint: AppStrings.enterPhoneNumber,
          controller: _phoneController,
          keyboardType: TextInputType.phone,
          textInputAction: TextInputAction.next,
          prefixIcon: const Icon(AppIcons.phone, color: AppColors.textTertiary),
          validator: (value) {
            if (value != null &&
                value.isNotEmpty &&
                !GetUtils.isPhoneNumber(value)) {
              return AppStrings.pleaseEnterValidPhone;
            }
            return null;
          },
        ),

        const SizedBox(height: 20),

        // Password Field
        Obx(
          () => AdlaanTextField(
            label: AppStrings.password,
            hint: AppStrings.createStrongPassword,
            controller: _passwordController,
            obscureText: !_authController.isPasswordVisible.value,
            textInputAction: TextInputAction.next,
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
                return AppStrings.pleaseEnterPassword;
              }
              if (value.length < AppConstants.minPasswordLength) {
                return AppStrings.passwordTooShort.replaceAll(
                  '{length}',
                  AppConstants.minPasswordLength.toString(),
                );
              }
              return null;
            },
            onChanged: (_) => _validateForm(),
          ),
        ),

        const SizedBox(height: 20),

        // Confirm Password Field
        Obx(
          () => AdlaanTextField(
            label: AppStrings.confirmPassword,
            hint: AppStrings.confirmYourPassword,
            controller: _confirmPasswordController,
            obscureText: !_authController.isConfirmPasswordVisible.value,
            textInputAction: TextInputAction.done,
            prefixIcon: const Icon(
              AppIcons.lock,
              color: AppColors.textTertiary,
            ),
            suffixIcon: IconButton(
              icon: Icon(
                _authController.isConfirmPasswordVisible.value
                    ? AppIcons.visibilityOff
                    : AppIcons.visibility,
                color: AppColors.textTertiary,
              ),
              onPressed: _authController.toggleConfirmPasswordVisibility,
            ),
            validator: (value) {
              if (value == null || value.isEmpty) {
                return AppStrings.pleaseConfirmPassword;
              }
              if (value != _passwordController.text) {
                return AppStrings.passwordsDoNotMatch;
              }
              return null;
            },
            onChanged: (_) => _validateForm(),
            onSubmitted: (_) => _handleRegister(),
          ),
        ),
      ],
    );
  }

  Widget _buildTermsAcceptance() {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        SizedBox(
          width: 20,
          height: 20,
          child: Checkbox(
            value: _acceptTerms,
            onChanged: (value) {
              setState(() {
                _acceptTerms = value ?? false;
              });
            },
            activeColor: AppColors.primary,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(4),
            ),
          ),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text.rich(
                TextSpan(
                  text: AppStrings.iAgreeToThe,
                  style: AppTypography.bodyMedium.copyWith(
                    color: AppColors.textSecondary,
                  ),
                  children: [
                    TextSpan(
                      text: AppStrings.termsOfService,
                      style: AppTypography.bodyMedium.copyWith(
                        color: AppColors.primary,
                        fontWeight: FontWeight.w500,
                        decoration: TextDecoration.underline,
                      ),
                    ),
                    TextSpan(text: AppStrings.and),
                    TextSpan(
                      text: AppStrings.privacyPolicy,
                      style: AppTypography.bodyMedium.copyWith(
                        color: AppColors.primary,
                        fontWeight: FontWeight.w500,
                        decoration: TextDecoration.underline,
                      ),
                    ),
                  ],
                ),
              ),
              if (!_acceptTerms) ...[
                const SizedBox(height: 4),
                Text(
                  AppStrings.pleaseAcceptTerms,
                  style: AppTypography.inputError.copyWith(
                    color: AppColors.error,
                  ),
                ),
              ],
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildRegisterButton() {
    return Obx(
      () => AdlaanButton(
        text: AppStrings.createAccountButton,
        onPressed: (_authController.isRegisterFormValid.value && _acceptTerms)
            ? _handleRegister
            : null,
        isLoading: _authController.isLoading.value,
        width: double.infinity,
        size: AdlaanButtonSize.large,
      ),
    );
  }

  Widget _buildDivider() {
    return Row(
      children: [
        const Expanded(child: Divider(color: AppColors.border, thickness: 1)),
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16),
          child: Text(
            AppStrings.orContinueWith,
            style: AppTypography.bodySmall.copyWith(
              color: AppColors.textTertiary,
            ),
          ),
        ),
        const Expanded(child: Divider(color: AppColors.border, thickness: 1)),
      ],
    );
  }

  Widget _buildSocialSignIn() {
    return Obx(
      () => SocialSignInButton(
        text: AppStrings.continueWithGoogle,
        icon: const Icon(AppIcons.google, size: 20),
        onPressed: _handleGoogleSignIn,
        isLoading: _authController.isLoading.value,
      ),
    );
  }

  Widget _buildSignInLink() {
    return Center(
      child: Row(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Text(
            AppStrings.alreadyHaveAccount,
            style: AppTypography.bodyMedium.copyWith(
              color: AppColors.textSecondary,
            ),
          ),
          TextButton(
            onPressed: () {
              Get.back();
            },
            child: Text(
              AppStrings.signIn,
              style: AppTypography.bodyMedium.copyWith(
                color: AppColors.primary,
                fontWeight: FontWeight.w600,
              ),
            ),
          ),
        ],
      ),
    );
  }

  void _validateForm() {
    _authController.validateRegisterForm(
      _emailController.text.trim(),
      _passwordController.text,
      _firstNameController.text.trim(),
      _lastNameController.text.trim(),
    );
  }
}
