class AppConstants {
  // API Configuration
  static const String baseUrl = 'http://localhost:8000';
  static const String apiVersion = '/api/v1';
  static const String apiBaseUrl = '$baseUrl$apiVersion';

  // Endpoints
  static const String authEndpoint = '/auth';
  static const String usersEndpoint = '/users';
  static const String announcementsEndpoint = '/announcements';
  static const String categoriesEndpoint = '/categories';
  static const String contractsEndpoint = '/contracts';

  // Storage Keys
  static const String accessTokenKey = 'access_token';
  static const String refreshTokenKey = 'refresh_token';
  static const String userDataKey = 'user_data';
  static const String isLoggedInKey = 'is_logged_in';

  // App Configuration
  static const String appName = 'Mercenary';
  static const String appVersion = '1.0.0';

  // UI Constants
  static const double defaultPadding = 16.0;
  static const double smallPadding = 8.0;
  static const double largePadding = 24.0;
  static const double borderRadius = 12.0;
  static const double buttonHeight = 48.0;

  // Animation Durations
  static const Duration shortAnimation = Duration(milliseconds: 200);
  static const Duration mediumAnimation = Duration(milliseconds: 300);
  static const Duration longAnimation = Duration(milliseconds: 500);

  // Validation
  static const int minPasswordLength = 8;
  static const int maxPasswordLength = 50;
  static const int maxEmailLength = 100;
  static const int maxNameLength = 50;

  // Pagination
  static const int defaultPageSize = 20;
  static const int maxPageSize = 100;
}

class ApiEndpoints {
  // Auth endpoints
  static const String login = '${AppConstants.authEndpoint}/login';
  static const String register = '${AppConstants.authEndpoint}/register';
  static const String refreshToken = '${AppConstants.authEndpoint}/refresh';
  static const String validateToken = '${AppConstants.authEndpoint}/validate';
  static const String logout = '${AppConstants.authEndpoint}/logout';
  static const String changePassword =
      '${AppConstants.authEndpoint}/change-password';

  // User endpoints
  static const String userProfile = '${AppConstants.usersEndpoint}/me';
  static const String currentUser = '${AppConstants.usersEndpoint}/me';
  static const String updateProfile = '${AppConstants.usersEndpoint}/me';
  static const String userById = AppConstants.usersEndpoint;

  // Announcement endpoints
  static const String announcements = AppConstants.announcementsEndpoint;
  static const String myAnnouncements =
      '${AppConstants.announcementsEndpoint}/my';
  static const String createAnnouncement = AppConstants.announcementsEndpoint;

  // Category endpoints
  static const String categories = AppConstants.categoriesEndpoint;

  // Contract endpoints
  static const String contracts = AppConstants.contractsEndpoint;
  static const String myContracts = '${AppConstants.contractsEndpoint}/my';
}

enum UserType { oferente, mercenario }

enum AnnouncementStatus { draft, published, inProgress, completed, cancelled }

enum ContractStatus { pending, active, completed, cancelled, disputed }
