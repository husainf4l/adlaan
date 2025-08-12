// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'auth_models.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

User _$UserFromJson(Map<String, dynamic> json) => User(
  id: json['id'] as String,
  email: json['email'] as String,
  phoneNumber: json['phoneNumber'] as String?,
  firstName: json['firstName'] as String,
  lastName: json['lastName'] as String,
  avatar: json['avatar'] as String?,
  isEmailVerified: json['isEmailVerified'] as bool,
  isPhoneVerified: json['isPhoneVerified'] as bool,
  createdAt: DateTime.parse(json['createdAt'] as String),
  updatedAt: DateTime.parse(json['updatedAt'] as String),
  company: json['company'] == null
      ? null
      : Company.fromJson(json['company'] as Map<String, dynamic>),
);

Map<String, dynamic> _$UserToJson(User instance) => <String, dynamic>{
  'id': instance.id,
  'email': instance.email,
  'phoneNumber': instance.phoneNumber,
  'firstName': instance.firstName,
  'lastName': instance.lastName,
  'avatar': instance.avatar,
  'isEmailVerified': instance.isEmailVerified,
  'isPhoneVerified': instance.isPhoneVerified,
  'createdAt': instance.createdAt.toIso8601String(),
  'updatedAt': instance.updatedAt.toIso8601String(),
  'company': instance.company,
};

Company _$CompanyFromJson(Map<String, dynamic> json) => Company(
  id: json['id'] as String,
  name: json['name'] as String,
  logo: json['logo'] as String?,
  website: json['website'] as String?,
  address: json['address'] as String?,
  phone: json['phone'] as String?,
  industry: json['industry'] as String?,
  createdAt: DateTime.parse(json['createdAt'] as String),
);

Map<String, dynamic> _$CompanyToJson(Company instance) => <String, dynamic>{
  'id': instance.id,
  'name': instance.name,
  'logo': instance.logo,
  'website': instance.website,
  'address': instance.address,
  'phone': instance.phone,
  'industry': instance.industry,
  'createdAt': instance.createdAt.toIso8601String(),
};

Subscription _$SubscriptionFromJson(Map<String, dynamic> json) => Subscription(
  id: json['id'] as String,
  planName: json['planName'] as String,
  status: json['status'] as String,
  startDate: DateTime.parse(json['startDate'] as String),
  endDate: json['endDate'] == null
      ? null
      : DateTime.parse(json['endDate'] as String),
  isActive: json['isActive'] as bool,
);

Map<String, dynamic> _$SubscriptionToJson(Subscription instance) =>
    <String, dynamic>{
      'id': instance.id,
      'planName': instance.planName,
      'status': instance.status,
      'startDate': instance.startDate.toIso8601String(),
      'endDate': instance.endDate?.toIso8601String(),
      'isActive': instance.isActive,
    };

LoginRequest _$LoginRequestFromJson(Map<String, dynamic> json) => LoginRequest(
  email: json['email'] as String,
  password: json['password'] as String,
);

Map<String, dynamic> _$LoginRequestToJson(LoginRequest instance) =>
    <String, dynamic>{'email': instance.email, 'password': instance.password};

LoginResponse _$LoginResponseFromJson(Map<String, dynamic> json) =>
    LoginResponse(
      message: json['message'] as String,
      user: json['user'] == null
          ? null
          : User.fromJson(json['user'] as Map<String, dynamic>),
      requiresOtp: json['requiresOtp'] as bool?,
    );

Map<String, dynamic> _$LoginResponseToJson(LoginResponse instance) =>
    <String, dynamic>{
      'message': instance.message,
      'user': instance.user,
      'requiresOtp': instance.requiresOtp,
    };

RegisterRequest _$RegisterRequestFromJson(Map<String, dynamic> json) =>
    RegisterRequest(
      email: json['email'] as String,
      password: json['password'] as String,
      firstName: json['firstName'] as String,
      lastName: json['lastName'] as String,
      phoneNumber: json['phoneNumber'] as String?,
    );

Map<String, dynamic> _$RegisterRequestToJson(RegisterRequest instance) =>
    <String, dynamic>{
      'email': instance.email,
      'password': instance.password,
      'firstName': instance.firstName,
      'lastName': instance.lastName,
      'phoneNumber': instance.phoneNumber,
    };

RegisterResponse _$RegisterResponseFromJson(Map<String, dynamic> json) =>
    RegisterResponse(
      message: json['message'] as String,
      user: User.fromJson(json['user'] as Map<String, dynamic>),
    );

Map<String, dynamic> _$RegisterResponseToJson(RegisterResponse instance) =>
    <String, dynamic>{'message': instance.message, 'user': instance.user};

CompleteSignupRequest _$CompleteSignupRequestFromJson(
  Map<String, dynamic> json,
) => CompleteSignupRequest(
  userId: json['userId'] as String,
  companyName: json['companyName'] as String,
  companyWebsite: json['companyWebsite'] as String?,
  companyIndustry: json['companyIndustry'] as String?,
  companyAddress: json['companyAddress'] as String?,
  companyPhone: json['companyPhone'] as String?,
);

Map<String, dynamic> _$CompleteSignupRequestToJson(
  CompleteSignupRequest instance,
) => <String, dynamic>{
  'userId': instance.userId,
  'companyName': instance.companyName,
  'companyWebsite': instance.companyWebsite,
  'companyIndustry': instance.companyIndustry,
  'companyAddress': instance.companyAddress,
  'companyPhone': instance.companyPhone,
};

CompleteSignupResponse _$CompleteSignupResponseFromJson(
  Map<String, dynamic> json,
) => CompleteSignupResponse(
  message: json['message'] as String,
  user: User.fromJson(json['user'] as Map<String, dynamic>),
  company: Company.fromJson(json['company'] as Map<String, dynamic>),
  subscription: Subscription.fromJson(
    json['subscription'] as Map<String, dynamic>,
  ),
);

Map<String, dynamic> _$CompleteSignupResponseToJson(
  CompleteSignupResponse instance,
) => <String, dynamic>{
  'message': instance.message,
  'user': instance.user,
  'company': instance.company,
  'subscription': instance.subscription,
};

OtpVerificationRequest _$OtpVerificationRequestFromJson(
  Map<String, dynamic> json,
) => OtpVerificationRequest(
  phoneNumber: json['phoneNumber'] as String,
  otpCode: json['otpCode'] as String,
  type: json['type'] as String,
);

Map<String, dynamic> _$OtpVerificationRequestToJson(
  OtpVerificationRequest instance,
) => <String, dynamic>{
  'phoneNumber': instance.phoneNumber,
  'otpCode': instance.otpCode,
  'type': instance.type,
};

OtpVerificationResponse _$OtpVerificationResponseFromJson(
  Map<String, dynamic> json,
) => OtpVerificationResponse(
  message: json['message'] as String,
  user: User.fromJson(json['user'] as Map<String, dynamic>),
);

Map<String, dynamic> _$OtpVerificationResponseToJson(
  OtpVerificationResponse instance,
) => <String, dynamic>{'message': instance.message, 'user': instance.user};

ResendOtpRequest _$ResendOtpRequestFromJson(Map<String, dynamic> json) =>
    ResendOtpRequest(
      phoneNumber: json['phoneNumber'] as String,
      type: json['type'] as String,
    );

Map<String, dynamic> _$ResendOtpRequestToJson(ResendOtpRequest instance) =>
    <String, dynamic>{
      'phoneNumber': instance.phoneNumber,
      'type': instance.type,
    };

GoogleTokenRequest _$GoogleTokenRequestFromJson(Map<String, dynamic> json) =>
    GoogleTokenRequest(
      token: json['token'] as String,
      clientId: json['clientId'] as String?,
    );

Map<String, dynamic> _$GoogleTokenRequestToJson(GoogleTokenRequest instance) =>
    <String, dynamic>{'token': instance.token, 'clientId': instance.clientId};

GoogleAuthResponse _$GoogleAuthResponseFromJson(Map<String, dynamic> json) =>
    GoogleAuthResponse(
      message: json['message'] as String,
      user: User.fromJson(json['user'] as Map<String, dynamic>),
    );

Map<String, dynamic> _$GoogleAuthResponseToJson(GoogleAuthResponse instance) =>
    <String, dynamic>{'message': instance.message, 'user': instance.user};

ApiResponse<T> _$ApiResponseFromJson<T>(
  Map<String, dynamic> json,
  T Function(Object? json) fromJsonT,
) => ApiResponse<T>(
  success: json['success'] as bool,
  message: json['message'] as String,
  data: _$nullableGenericFromJson(json['data'], fromJsonT),
  error: json['error'] as String?,
);

Map<String, dynamic> _$ApiResponseToJson<T>(
  ApiResponse<T> instance,
  Object? Function(T value) toJsonT,
) => <String, dynamic>{
  'success': instance.success,
  'message': instance.message,
  'data': _$nullableGenericToJson(instance.data, toJsonT),
  'error': instance.error,
};

T? _$nullableGenericFromJson<T>(
  Object? input,
  T Function(Object? json) fromJson,
) => input == null ? null : fromJson(input);

Object? _$nullableGenericToJson<T>(
  T? input,
  Object? Function(T value) toJson,
) => input == null ? null : toJson(input);
