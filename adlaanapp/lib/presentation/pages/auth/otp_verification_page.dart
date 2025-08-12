import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:pin_code_fields/pin_code_fields.dart';
import '../../../core/constants/app_constants.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_typography.dart';
import '../../controllers/auth_controller.dart';
import '../../widgets/custom_widgets.dart';

class OtpVerificationPage extends StatefulWidget {
  const OtpVerificationPage({super.key});

  @override
  State<OtpVerificationPage> createState() => _OtpVerificationPageState();
}

class _OtpVerificationPageState extends State<OtpVerificationPage> {
  final AuthController _authController = Get.find<AuthController>();
  final _otpController = TextEditingController();

  String _currentOtp = '';
  int _resendCountdown = 30;
  bool _canResend = false;

  @override
  void initState() {
    super.initState();
    _startResendCountdown();
  }

  @override
  void dispose() {
    _otpController.dispose();
    super.dispose();
  }

  void _startResendCountdown() {
    setState(() {
      _canResend = false;
      _resendCountdown = 30;
    });

    Future.doWhile(() async {
      await Future.delayed(const Duration(seconds: 1));
      if (mounted) {
        setState(() {
          _resendCountdown--;
        });
        return _resendCountdown > 0;
      }
      return false;
    }).then((_) {
      if (mounted) {
        setState(() {
          _canResend = true;
        });
      }
    });
  }

  void _handleVerifyOtp() {
    if (_currentOtp.length == AppConstants.otpLength) {
      _authController.verifyOtp(_currentOtp);
    }
  }

  void _handleResendOtp() {
    if (_canResend) {
      _authController.resendOtp();
      _startResendCountdown();
      _otpController.clear();
      setState(() {
        _currentOtp = '';
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => Get.back(),
        ),
      ),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(AppConstants.largePadding),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const SizedBox(height: 20),

              // Header
              _buildHeader(),

              const SizedBox(height: 48),

              // OTP Input
              _buildOtpInput(),

              const SizedBox(height: 32),

              // Verify Button
              _buildVerifyButton(),

              const SizedBox(height: 24),

              // Resend Section
              _buildResendSection(),

              const Spacer(),

              // Help Section
              _buildHelpSection(),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildHeader() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Verify Your Phone',
          style: AppTypography.displaySmall.copyWith(
            color: AppColors.textPrimary,
          ),
        ),

        const SizedBox(height: 12),

        Obx(
          () => Text(
            'We sent a verification code to\n${_authController.otpPhoneNumber.value}',
            style: AppTypography.bodyLarge.copyWith(
              color: AppColors.textSecondary,
            ),
          ),
        ),

        const SizedBox(height: 8),

        TextButton(
          onPressed: () {
            // Navigate back to edit phone number
            Get.back();
          },
          child: Text(
            'Wrong number?',
            style: AppTypography.bodyMedium.copyWith(
              color: AppColors.primary,
              fontWeight: FontWeight.w500,
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildOtpInput() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Enter Verification Code',
          style: AppTypography.inputLabel.copyWith(
            color: AppColors.textSecondary,
          ),
        ),

        const SizedBox(height: 12),

        PinCodeTextField(
          appContext: context,
          length: AppConstants.otpLength,
          controller: _otpController,
          animationType: AnimationType.fade,
          animationDuration: const Duration(milliseconds: 300),
          enableActiveFill: true,
          keyboardType: TextInputType.number,
          textStyle: AppTypography.headlineMedium.copyWith(
            color: AppColors.textPrimary,
          ),
          pinTheme: PinTheme(
            shape: PinCodeFieldShape.box,
            borderRadius: BorderRadius.circular(8),
            fieldHeight: 56,
            fieldWidth: 48,
            borderWidth: 1,
            activeBorderWidth: 2,
            selectedBorderWidth: 2,
            inactiveFillColor: AppColors.inputFill,
            activeFillColor: AppColors.inputFill,
            selectedFillColor: AppColors.inputFill,
            inactiveColor: AppColors.inputBorder,
            activeColor: AppColors.inputFocused,
            selectedColor: AppColors.inputFocused,
            errorBorderColor: AppColors.inputError,
          ),
          onChanged: (value) {
            setState(() {
              _currentOtp = value;
            });
          },
          onCompleted: (value) {
            _handleVerifyOtp();
          },
        ),
      ],
    );
  }

  Widget _buildVerifyButton() {
    return Obx(
      () => AdlaanButton(
        text: 'Verify Code',
        onPressed: _currentOtp.length == AppConstants.otpLength
            ? _handleVerifyOtp
            : null,
        isLoading: _authController.isLoading.value,
        width: double.infinity,
        size: AdlaanButtonSize.large,
      ),
    );
  }

  Widget _buildResendSection() {
    return Center(
      child: Column(
        children: [
          Text(
            "Didn't receive the code?",
            style: AppTypography.bodyMedium.copyWith(
              color: AppColors.textSecondary,
            ),
          ),

          const SizedBox(height: 8),

          if (_canResend)
            TextButton(
              onPressed: _handleResendOtp,
              child: Text(
                'Resend Code',
                style: AppTypography.bodyMedium.copyWith(
                  color: AppColors.primary,
                  fontWeight: FontWeight.w600,
                ),
              ),
            )
          else
            Text(
              'Resend in ${_resendCountdown}s',
              style: AppTypography.bodyMedium.copyWith(
                color: AppColors.textTertiary,
              ),
            ),
        ],
      ),
    );
  }

  Widget _buildHelpSection() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.surfaceVariant,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.border),
      ),
      child: Column(
        children: [
          Icon(Icons.help_outline, size: 24, color: AppColors.textSecondary),

          const SizedBox(height: 8),

          Text(
            'Having trouble?',
            style: AppTypography.titleMedium.copyWith(
              color: AppColors.textPrimary,
            ),
          ),

          const SizedBox(height: 4),

          Text(
            'Make sure you have a stable internet connection and check your messages for the verification code.',
            style: AppTypography.bodySmall.copyWith(
              color: AppColors.textSecondary,
            ),
            textAlign: TextAlign.center,
          ),

          const SizedBox(height: 12),

          TextButton(
            onPressed: () {
              // Navigate to support or contact
            },
            child: Text(
              'Contact Support',
              style: AppTypography.bodyMedium.copyWith(
                color: AppColors.primary,
                fontWeight: FontWeight.w500,
              ),
            ),
          ),
        ],
      ),
    );
  }
}
