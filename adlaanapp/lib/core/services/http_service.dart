import 'package:dio/dio.dart';
import 'package:dio_cookie_manager/dio_cookie_manager.dart';
import 'package:cookie_jar/cookie_jar.dart';
import 'package:get_storage/get_storage.dart';
import '../constants/app_constants.dart';

/// HTTP service for making API requests
/// Handles authentication, interceptors, and error handling
class HttpService {
  static HttpService? _instance;
  late Dio _dio;
  late CookieJar _cookieJar;
  final GetStorage _storage = GetStorage();

  HttpService._() {
    _initializeDio();
  }

  static HttpService get instance {
    _instance ??= HttpService._();
    return _instance!;
  }

  void _initializeDio() {
    // Initialize cookie jar for HTTP-only cookie support
    _cookieJar = CookieJar();

    _dio = Dio(
      BaseOptions(
        baseUrl: AppConstants.fullApiUrl,
        connectTimeout: AppConstants.connectionTimeout,
        receiveTimeout: AppConstants.receiveTimeout,
        sendTimeout: AppConstants.sendTimeout,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      ),
    );

    // Add cookie manager for HTTP-only authentication
    _dio.interceptors.add(CookieManager(_cookieJar));

    // Add request interceptor for authentication
    _dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: (options, handler) async {
          // For HTTP-only cookie authentication, we rely on cookies
          // Only add Authorization header if we have a stored token (for backwards compatibility)
          final token = _storage.read(AppConstants.accessTokenKey);
          if (token != null) {
            options.headers['Authorization'] = 'Bearer $token';
          }

          if (AppConstants.enableLogging) {
            print('📤 REQUEST: ${options.method} ${options.path}');
            print('📤 Headers: ${options.headers}');
            if (options.data != null) {
              print('📤 Data: ${options.data}');
            }
          }

          handler.next(options);
        },
        onResponse: (response, handler) {
          if (AppConstants.enableLogging) {
            print(
              '📥 RESPONSE: ${response.statusCode} ${response.requestOptions.path}',
            );
            print('📥 Data: ${response.data}');

            // Log cookie information if present
            final cookies = response.headers['set-cookie'];
            if (cookies != null) {
              print('🍪 Cookies set: $cookies');
            }
          }
          handler.next(response);
        },
        onError: (error, handler) async {
          if (AppConstants.enableLogging) {
            print(
              '❌ ERROR: ${error.response?.statusCode} ${error.requestOptions.path}',
            );
            print('❌ Message: ${error.message}');
            print('❌ Data: ${error.response?.data}');
          }

          // Handle token refresh on 401
          if (error.response?.statusCode == 401) {
            final refreshed = await _refreshToken();
            if (refreshed) {
              // Retry the original request
              final token = _storage.read(AppConstants.accessTokenKey);
              error.requestOptions.headers['Authorization'] = 'Bearer $token';
              final clonedRequest = await _dio.request(
                error.requestOptions.path,
                options: Options(
                  method: error.requestOptions.method,
                  headers: error.requestOptions.headers,
                ),
                data: error.requestOptions.data,
                queryParameters: error.requestOptions.queryParameters,
              );
              return handler.resolve(clonedRequest);
            } else {
              // Logout user if refresh fails
              _clearTokens();
            }
          }

          handler.next(error);
        },
      ),
    );
  }

  /// Refresh access token using refresh token
  Future<bool> _refreshToken() async {
    try {
      final refreshToken = _storage.read(AppConstants.refreshTokenKey);
      if (refreshToken == null) return false;

      final response = await _dio.post(
        '/auth/refresh',
        data: {'refreshToken': refreshToken},
        options: Options(
          headers: {'Authorization': null}, // Remove auth header for refresh
        ),
      );

      if (response.statusCode == 200) {
        final data = response.data;
        await _storage.write(AppConstants.accessTokenKey, data['accessToken']);
        await _storage.write(
          AppConstants.refreshTokenKey,
          data['refreshToken'],
        );
        return true;
      }
    } catch (e) {
      print('Token refresh failed: $e');
    }
    return false;
  }

  /// Clear stored tokens
  void _clearTokens() {
    _storage.remove(AppConstants.accessTokenKey);
    _storage.remove(AppConstants.refreshTokenKey);
    _storage.remove(AppConstants.userDataKey);
  }

  /// Generic GET request
  Future<Response<T>> get<T>(
    String path, {
    Map<String, dynamic>? queryParameters,
    Options? options,
  }) async {
    try {
      return await _dio.get<T>(
        path,
        queryParameters: queryParameters,
        options: options,
      );
    } on DioException catch (e) {
      throw _handleDioError(e);
    }
  }

  /// Generic POST request
  Future<Response<T>> post<T>(
    String path, {
    dynamic data,
    Map<String, dynamic>? queryParameters,
    Options? options,
  }) async {
    try {
      return await _dio.post<T>(
        path,
        data: data,
        queryParameters: queryParameters,
        options: options,
      );
    } on DioException catch (e) {
      throw _handleDioError(e);
    }
  }

  /// Generic PUT request
  Future<Response<T>> put<T>(
    String path, {
    dynamic data,
    Map<String, dynamic>? queryParameters,
    Options? options,
  }) async {
    try {
      return await _dio.put<T>(
        path,
        data: data,
        queryParameters: queryParameters,
        options: options,
      );
    } on DioException catch (e) {
      throw _handleDioError(e);
    }
  }

  /// Generic DELETE request
  Future<Response<T>> delete<T>(
    String path, {
    dynamic data,
    Map<String, dynamic>? queryParameters,
    Options? options,
  }) async {
    try {
      return await _dio.delete<T>(
        path,
        data: data,
        queryParameters: queryParameters,
        options: options,
      );
    } on DioException catch (e) {
      throw _handleDioError(e);
    }
  }

  /// Handle Dio errors and convert to custom exceptions
  Exception _handleDioError(DioException error) {
    switch (error.type) {
      case DioExceptionType.connectionTimeout:
      case DioExceptionType.sendTimeout:
      case DioExceptionType.receiveTimeout:
        return NetworkException(AppConstants.networkError);

      case DioExceptionType.connectionError:
        return NetworkException(AppConstants.networkError);

      case DioExceptionType.badResponse:
        final statusCode = error.response?.statusCode;
        final message =
            error.response?.data?['message'] ??
            error.response?.data?['error'] ??
            'Server error occurred';

        switch (statusCode) {
          case 400:
            return ValidationException(message);
          case 401:
            return AuthenticationException('Authentication failed');
          case 403:
            return AuthorizationException('Access denied');
          case 404:
            return NotFoundException('Resource not found');
          case 422:
            return ValidationException(message);
          case 500:
          default:
            return ServerException(message);
        }

      case DioExceptionType.cancel:
        return NetworkException('Request was cancelled');

      case DioExceptionType.unknown:
      default:
        return NetworkException(AppConstants.unknownError);
    }
  }

  /// Download file
  Future<Response> downloadFile(
    String url,
    String savePath, {
    ProgressCallback? onReceiveProgress,
    Map<String, dynamic>? queryParameters,
    Options? options,
  }) async {
    try {
      return await _dio.download(
        url,
        savePath,
        onReceiveProgress: onReceiveProgress,
        queryParameters: queryParameters,
        options: options,
      );
    } on DioException catch (e) {
      throw _handleDioError(e);
    }
  }

  /// Upload file
  Future<Response<T>> uploadFile<T>(
    String path,
    String filePath, {
    String fieldName = 'file',
    Map<String, dynamic>? data,
    ProgressCallback? onSendProgress,
    Options? options,
  }) async {
    try {
      final formData = FormData.fromMap({
        ...?data,
        fieldName: await MultipartFile.fromFile(filePath),
      });

      return await _dio.post<T>(
        path,
        data: formData,
        onSendProgress: onSendProgress,
        options: options,
      );
    } on DioException catch (e) {
      throw _handleDioError(e);
    }
  }

  /// Set authorization token
  void setAuthToken(String token) {
    _dio.options.headers['Authorization'] = 'Bearer $token';
  }

  /// Remove authorization token
  void removeAuthToken() {
    _dio.options.headers.remove('Authorization');
  }

  /// Clear all cookies (for logout)
  void clearCookies() {
    _cookieJar.deleteAll();
  }

  /// Get current auth token
  String? get authToken {
    final header = _dio.options.headers['Authorization'] as String?;
    return header?.replaceFirst('Bearer ', '');
  }
}

/// Custom exceptions for different error types
class NetworkException implements Exception {
  final String message;
  const NetworkException(this.message);

  @override
  String toString() => 'NetworkException: $message';
}

class ServerException implements Exception {
  final String message;
  const ServerException(this.message);

  @override
  String toString() => 'ServerException: $message';
}

class ValidationException implements Exception {
  final String message;
  const ValidationException(this.message);

  @override
  String toString() => 'ValidationException: $message';
}

class AuthenticationException implements Exception {
  final String message;
  const AuthenticationException(this.message);

  @override
  String toString() => 'AuthenticationException: $message';
}

class AuthorizationException implements Exception {
  final String message;
  const AuthorizationException(this.message);

  @override
  String toString() => 'AuthorizationException: $message';
}

class NotFoundException implements Exception {
  final String message;
  const NotFoundException(this.message);

  @override
  String toString() => 'NotFoundException: $message';
}
