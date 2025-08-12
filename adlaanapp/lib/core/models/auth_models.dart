import 'package:json_annotation/json_annotation.dart';

part 'auth_models.g.dart';

/// User model representing authenticated user data
@JsonSerializable()
class User {
  final String id;
  final String email;
  final String? phoneNumber;
  final String firstName;
  final String lastName;
  final String? avatar;
  final bool isEmailVerified;
  final bool isPhoneVerified;
  final DateTime createdAt;
  final DateTime updatedAt;
  final Company? company;

  const User({
    required this.id,
    required this.email,
    this.phoneNumber,
    required this.firstName,
    required this.lastName,
    this.avatar,
    required this.isEmailVerified,
    required this.isPhoneVerified,
    required this.createdAt,
    required this.updatedAt,
    this.company,
  });

  factory User.fromJson(Map<String, dynamic> json) => _$UserFromJson(json);
  Map<String, dynamic> toJson() => _$UserToJson(this);

  String get fullName => '$firstName $lastName';
  String get initials => '${firstName[0]}${lastName[0]}'.toUpperCase();
}

/// Company model for user's organization
@JsonSerializable()
class Company {
  final String id;
  final String name;
  final String? logo;
  final String? website;
  final String? address;
  final String? phone;
  final String? industry;
  final DateTime createdAt;

  const Company({
    required this.id,
    required this.name,
    this.logo,
    this.website,
    this.address,
    this.phone,
    this.industry,
    required this.createdAt,
  });

  factory Company.fromJson(Map<String, dynamic> json) =>
      _$CompanyFromJson(json);
  Map<String, dynamic> toJson() => _$CompanyToJson(this);
}

/// Subscription model for user's plan
@JsonSerializable()
class Subscription {
  final String id;
  final String planName;
  final String status;
  final DateTime startDate;
  final DateTime? endDate;
  final bool isActive;

  const Subscription({
    required this.id,
    required this.planName,
    required this.status,
    required this.startDate,
    this.endDate,
    required this.isActive,
  });

  factory Subscription.fromJson(Map<String, dynamic> json) =>
      _$SubscriptionFromJson(json);
  Map<String, dynamic> toJson() => _$SubscriptionToJson(this);
}

/// Login request model
@JsonSerializable()
class LoginRequest {
  final String email;
  final String password;

  const LoginRequest({required this.email, required this.password});

  factory LoginRequest.fromJson(Map<String, dynamic> json) =>
      _$LoginRequestFromJson(json);
  Map<String, dynamic> toJson() => _$LoginRequestToJson(this);
}

/// Login response model
@JsonSerializable()
class LoginResponse {
  final String message;
  final User? user;
  final bool? requiresOtp;

  const LoginResponse({required this.message, this.user, this.requiresOtp});

  factory LoginResponse.fromJson(Map<String, dynamic> json) =>
      _$LoginResponseFromJson(json);
  Map<String, dynamic> toJson() => _$LoginResponseToJson(this);
}

/// Register request model
@JsonSerializable()
class RegisterRequest {
  final String email;
  final String password;
  final String firstName;
  final String lastName;
  final String? phoneNumber;

  const RegisterRequest({
    required this.email,
    required this.password,
    required this.firstName,
    required this.lastName,
    this.phoneNumber,
  });

  factory RegisterRequest.fromJson(Map<String, dynamic> json) =>
      _$RegisterRequestFromJson(json);
  Map<String, dynamic> toJson() => _$RegisterRequestToJson(this);
}

/// Register response model
@JsonSerializable()
class RegisterResponse {
  final String message;
  final User user;

  const RegisterResponse({required this.message, required this.user});

  factory RegisterResponse.fromJson(Map<String, dynamic> json) =>
      _$RegisterResponseFromJson(json);
  Map<String, dynamic> toJson() => _$RegisterResponseToJson(this);
}

/// Complete signup request model
@JsonSerializable()
class CompleteSignupRequest {
  final String userId;
  final String companyName;
  final String? companyWebsite;
  final String? companyIndustry;
  final String? companyAddress;
  final String? companyPhone;

  const CompleteSignupRequest({
    required this.userId,
    required this.companyName,
    this.companyWebsite,
    this.companyIndustry,
    this.companyAddress,
    this.companyPhone,
  });

  factory CompleteSignupRequest.fromJson(Map<String, dynamic> json) =>
      _$CompleteSignupRequestFromJson(json);
  Map<String, dynamic> toJson() => _$CompleteSignupRequestToJson(this);
}

/// Complete signup response model
@JsonSerializable()
class CompleteSignupResponse {
  final String message;
  final User user;
  final Company company;
  final Subscription subscription;

  const CompleteSignupResponse({
    required this.message,
    required this.user,
    required this.company,
    required this.subscription,
  });

  factory CompleteSignupResponse.fromJson(Map<String, dynamic> json) =>
      _$CompleteSignupResponseFromJson(json);
  Map<String, dynamic> toJson() => _$CompleteSignupResponseToJson(this);
}

/// OTP verification request model
@JsonSerializable()
class OtpVerificationRequest {
  final String phoneNumber;
  final String otpCode;
  final String type;

  const OtpVerificationRequest({
    required this.phoneNumber,
    required this.otpCode,
    required this.type,
  });

  factory OtpVerificationRequest.fromJson(Map<String, dynamic> json) =>
      _$OtpVerificationRequestFromJson(json);
  Map<String, dynamic> toJson() => _$OtpVerificationRequestToJson(this);
}

/// OTP verification response model
@JsonSerializable()
class OtpVerificationResponse {
  final String message;
  final User user;

  const OtpVerificationResponse({required this.message, required this.user});

  factory OtpVerificationResponse.fromJson(Map<String, dynamic> json) =>
      _$OtpVerificationResponseFromJson(json);
  Map<String, dynamic> toJson() => _$OtpVerificationResponseToJson(this);
}

/// Resend OTP request model
@JsonSerializable()
class ResendOtpRequest {
  final String phoneNumber;
  final String type;

  const ResendOtpRequest({required this.phoneNumber, required this.type});

  factory ResendOtpRequest.fromJson(Map<String, dynamic> json) =>
      _$ResendOtpRequestFromJson(json);
  Map<String, dynamic> toJson() => _$ResendOtpRequestToJson(this);
}

/// Google token request model
@JsonSerializable()
class GoogleTokenRequest {
  final String token;
  final String? clientId;

  const GoogleTokenRequest({required this.token, this.clientId});

  factory GoogleTokenRequest.fromJson(Map<String, dynamic> json) =>
      _$GoogleTokenRequestFromJson(json);
  Map<String, dynamic> toJson() => _$GoogleTokenRequestToJson(this);
}

/// Google auth response model
@JsonSerializable()
class GoogleAuthResponse {
  final String message;
  final User user;

  const GoogleAuthResponse({required this.message, required this.user});

  factory GoogleAuthResponse.fromJson(Map<String, dynamic> json) =>
      _$GoogleAuthResponseFromJson(json);
  Map<String, dynamic> toJson() => _$GoogleAuthResponseToJson(this);
}

/// Generic API response model
@JsonSerializable(genericArgumentFactories: true)
class ApiResponse<T> {
  final bool success;
  final String message;
  final T? data;
  final String? error;

  const ApiResponse({
    required this.success,
    required this.message,
    this.data,
    this.error,
  });

  factory ApiResponse.fromJson(
    Map<String, dynamic> json,
    T Function(Object? json) fromJsonT,
  ) => _$ApiResponseFromJson(json, fromJsonT);
  Map<String, dynamic> toJson(Object Function(T value) toJsonT) =>
      _$ApiResponseToJson(this, toJsonT);
}

/// OTP type enumeration
enum OtpType {
  @JsonValue('LOGIN')
  login,
  @JsonValue('REGISTRATION')
  registration,
  @JsonValue('PASSWORD_RESET')
  passwordReset,
}

/// Authentication state enumeration
enum AuthState {
  initial,
  loading,
  authenticated,
  unauthenticated,
  otpRequired,
  error,
}
