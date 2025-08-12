import 'package:flutter/material.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_typography.dart';

/// Custom text field with Adlaan design system
class AdlaanTextField extends StatefulWidget {
  final String label;
  final String? hint;
  final String? errorText;
  final TextEditingController? controller;
  final TextInputType keyboardType;
  final bool obscureText;
  final bool enabled;
  final Widget? prefixIcon;
  final Widget? suffixIcon;
  final Function(String)? onChanged;
  final Function(String)? onSubmitted;
  final Function()? onTap;
  final int maxLines;
  final int? maxLength;
  final TextInputAction? textInputAction;
  final FocusNode? focusNode;
  final bool autofocus;
  final String? Function(String?)? validator;

  const AdlaanTextField({
    super.key,
    required this.label,
    this.hint,
    this.errorText,
    this.controller,
    this.keyboardType = TextInputType.text,
    this.obscureText = false,
    this.enabled = true,
    this.prefixIcon,
    this.suffixIcon,
    this.onChanged,
    this.onSubmitted,
    this.onTap,
    this.maxLines = 1,
    this.maxLength,
    this.textInputAction,
    this.focusNode,
    this.autofocus = false,
    this.validator,
  });

  @override
  State<AdlaanTextField> createState() => _AdlaanTextFieldState();
}

class _AdlaanTextFieldState extends State<AdlaanTextField> {
  late FocusNode _focusNode;
  bool _isFocused = false;

  @override
  void initState() {
    super.initState();
    _focusNode = widget.focusNode ?? FocusNode();
    _focusNode.addListener(_onFocusChange);
  }

  @override
  void dispose() {
    if (widget.focusNode == null) {
      _focusNode.dispose();
    }
    super.dispose();
  }

  void _onFocusChange() {
    setState(() {
      _isFocused = _focusNode.hasFocus;
    });
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          widget.label,
          style: AppTypography.inputLabel.copyWith(
            color: widget.errorText != null
                ? AppColors.error
                : _isFocused
                ? colorScheme.primary
                : colorScheme.onSurface.withOpacity(0.6),
          ),
        ),
        const SizedBox(height: 8),
        TextFormField(
          controller: widget.controller,
          focusNode: _focusNode,
          keyboardType: widget.keyboardType,
          obscureText: widget.obscureText,
          enabled: widget.enabled,
          maxLines: widget.maxLines,
          maxLength: widget.maxLength,
          textInputAction: widget.textInputAction,
          autofocus: widget.autofocus,
          validator: widget.validator,
          onChanged: widget.onChanged,
          onFieldSubmitted: widget.onSubmitted,
          onTap: widget.onTap,
          style: AppTypography.inputText.copyWith(
            color: widget.enabled
                ? colorScheme.onSurface
                : colorScheme.onSurface.withOpacity(0.5),
          ),
          decoration: InputDecoration(
            hintText: widget.hint,
            hintStyle: AppTypography.inputHint.copyWith(
              color: colorScheme.onSurface.withOpacity(0.4),
            ),
            prefixIcon: widget.prefixIcon,
            suffixIcon: widget.suffixIcon,
            errorText: widget.errorText,
            // Use theme's input decoration instead of hardcoded colors
          ),
        ),
      ],
    );
  }
}

/// Custom button with Adlaan design system
class AdlaanButton extends StatelessWidget {
  final String text;
  final VoidCallback? onPressed;
  final bool isLoading;
  final bool isDisabled;
  final AdlaanButtonType type;
  final AdlaanButtonSize size;
  final Widget? icon;
  final double? width;

  const AdlaanButton({
    super.key,
    required this.text,
    this.onPressed,
    this.isLoading = false,
    this.isDisabled = false,
    this.type = AdlaanButtonType.primary,
    this.size = AdlaanButtonSize.medium,
    this.icon,
    this.width,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;
    final isEnabled = onPressed != null && !isDisabled && !isLoading;

    return SizedBox(
      width: width,
      height: _getHeight(),
      child: ElevatedButton(
        onPressed: isEnabled ? onPressed : null,
        style: _getButtonStyle(colorScheme),
        child: isLoading
            ? SizedBox(
                width: 20,
                height: 20,
                child: CircularProgressIndicator(
                  strokeWidth: 2,
                  valueColor: AlwaysStoppedAnimation<Color>(
                    type == AdlaanButtonType.primary
                        ? colorScheme.onPrimary
                        : colorScheme.primary,
                  ),
                ),
              )
            : icon != null
            ? Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  icon!,
                  const SizedBox(width: 8),
                  Text(text, style: _getTextStyle()),
                ],
              )
            : Text(text, style: _getTextStyle()),
      ),
    );
  }

  ButtonStyle _getButtonStyle(ColorScheme colorScheme) {
    switch (type) {
      case AdlaanButtonType.primary:
        return ElevatedButton.styleFrom(
          backgroundColor: colorScheme.primary,
          foregroundColor: colorScheme.onPrimary,
          elevation: 0,
          shadowColor: Colors.transparent,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
        );
      case AdlaanButtonType.secondary:
        return ElevatedButton.styleFrom(
          backgroundColor: colorScheme.surface,
          foregroundColor: colorScheme.primary,
          elevation: 0,
          shadowColor: Colors.transparent,
          side: BorderSide(color: colorScheme.outline),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
        );
      case AdlaanButtonType.outline:
        return ElevatedButton.styleFrom(
          backgroundColor: Colors.transparent,
          foregroundColor: colorScheme.primary,
          elevation: 0,
          shadowColor: Colors.transparent,
          side: BorderSide(color: colorScheme.primary),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
        );
      case AdlaanButtonType.text:
        return ElevatedButton.styleFrom(
          backgroundColor: Colors.transparent,
          foregroundColor: colorScheme.primary,
          elevation: 0,
          shadowColor: Colors.transparent,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
        );
    }
  }

  double _getHeight() {
    switch (size) {
      case AdlaanButtonSize.small:
        return 40;
      case AdlaanButtonSize.medium:
        return 48;
      case AdlaanButtonSize.large:
        return 56;
    }
  }

  TextStyle _getTextStyle() {
    switch (size) {
      case AdlaanButtonSize.small:
        return AppTypography.buttonSmall;
      case AdlaanButtonSize.medium:
        return AppTypography.buttonMedium;
      case AdlaanButtonSize.large:
        return AppTypography.buttonLarge;
    }
  }
}

/// Button types
enum AdlaanButtonType { primary, secondary, outline, text }

/// Button sizes
enum AdlaanButtonSize { small, medium, large }

/// Custom loading widget
class AdlaanLoadingWidget extends StatelessWidget {
  final String? message;
  final double size;

  const AdlaanLoadingWidget({super.key, this.message, this.size = 24});

  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        SizedBox(
          width: size,
          height: size,
          child: const CircularProgressIndicator(
            strokeWidth: 2,
            valueColor: AlwaysStoppedAnimation<Color>(AppColors.primary),
          ),
        ),
        if (message != null) ...[
          const SizedBox(height: 16),
          Text(
            message!,
            style: AppTypography.bodyMedium.copyWith(
              color: AppColors.textSecondary,
            ),
            textAlign: TextAlign.center,
          ),
        ],
      ],
    );
  }
}

/// Custom social sign-in button
class SocialSignInButton extends StatelessWidget {
  final String text;
  final Widget icon;
  final VoidCallback? onPressed;
  final bool isLoading;

  const SocialSignInButton({
    super.key,
    required this.text,
    required this.icon,
    this.onPressed,
    this.isLoading = false,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;

    return SizedBox(
      width: double.infinity,
      height: 48,
      child: ElevatedButton(
        onPressed: isLoading ? null : onPressed,
        style: ElevatedButton.styleFrom(
          backgroundColor: colorScheme.surface,
          foregroundColor: colorScheme.onSurface,
          elevation: 0,
          shadowColor: Colors.transparent,
          side: BorderSide(color: colorScheme.outline),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
        ),
        child: isLoading
            ? SizedBox(
                width: 20,
                height: 20,
                child: CircularProgressIndicator(
                  strokeWidth: 2,
                  valueColor: AlwaysStoppedAnimation<Color>(
                    colorScheme.primary,
                  ),
                ),
              )
            : Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  icon,
                  const SizedBox(width: 12),
                  Text(
                    text,
                    style: AppTypography.buttonMedium.copyWith(
                      color: colorScheme.onSurface,
                    ),
                  ),
                ],
              ),
      ),
    );
  }
}
