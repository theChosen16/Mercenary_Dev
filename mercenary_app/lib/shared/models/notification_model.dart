import 'package:equatable/equatable.dart';

/// Modelo para representar una notificación
class AppNotification extends Equatable {
  final String id;
  final String userId;
  final String title;
  final String body;
  final NotificationType type;
  final NotificationPriority priority;
  final bool isRead;
  final DateTime createdAt;
  final DateTime? readAt;
  final Map<String, dynamic>? data;
  final String? imageUrl;
  final String? actionUrl;

  const AppNotification({
    required this.id,
    required this.userId,
    required this.title,
    required this.body,
    required this.type,
    this.priority = NotificationPriority.normal,
    this.isRead = false,
    required this.createdAt,
    this.readAt,
    this.data,
    this.imageUrl,
    this.actionUrl,
  });

  factory AppNotification.fromJson(Map<String, dynamic> json) {
    return AppNotification(
      id: json['id'] as String,
      userId: json['user_id'] as String,
      title: json['title'] as String,
      body: json['body'] as String,
      type: NotificationType.values.firstWhere(
        (e) => e.name == json['type'],
        orElse: () => NotificationType.general,
      ),
      priority: NotificationPriority.values.firstWhere(
        (e) => e.name == json['priority'],
        orElse: () => NotificationPriority.normal,
      ),
      isRead: json['is_read'] as bool? ?? false,
      createdAt: DateTime.parse(json['created_at'] as String),
      readAt: json['read_at'] != null
          ? DateTime.parse(json['read_at'] as String)
          : null,
      data: json['data'] as Map<String, dynamic>?,
      imageUrl: json['image_url'] as String?,
      actionUrl: json['action_url'] as String?,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'user_id': userId,
      'title': title,
      'body': body,
      'type': type.name,
      'priority': priority.name,
      'is_read': isRead,
      'created_at': createdAt.toIso8601String(),
      if (readAt != null) 'read_at': readAt!.toIso8601String(),
      if (data != null) 'data': data,
      if (imageUrl != null) 'image_url': imageUrl,
      if (actionUrl != null) 'action_url': actionUrl,
    };
  }

  AppNotification copyWith({
    String? id,
    String? userId,
    String? title,
    String? body,
    NotificationType? type,
    NotificationPriority? priority,
    bool? isRead,
    DateTime? createdAt,
    DateTime? readAt,
    Map<String, dynamic>? data,
    String? imageUrl,
    String? actionUrl,
  }) {
    return AppNotification(
      id: id ?? this.id,
      userId: userId ?? this.userId,
      title: title ?? this.title,
      body: body ?? this.body,
      type: type ?? this.type,
      priority: priority ?? this.priority,
      isRead: isRead ?? this.isRead,
      createdAt: createdAt ?? this.createdAt,
      readAt: readAt ?? this.readAt,
      data: data ?? this.data,
      imageUrl: imageUrl ?? this.imageUrl,
      actionUrl: actionUrl ?? this.actionUrl,
    );
  }

  @override
  List<Object?> get props => [
        id,
        userId,
        title,
        body,
        type,
        priority,
        isRead,
        createdAt,
        readAt,
        data,
        imageUrl,
        actionUrl,
      ];
}

/// Modelo para configuración de notificaciones del usuario
class NotificationSettings extends Equatable {
  final String userId;
  final bool pushNotificationsEnabled;
  final bool emailNotificationsEnabled;
  final bool smsNotificationsEnabled;
  final Map<NotificationType, bool> typeSettings;
  final Map<NotificationPriority, bool> prioritySettings;
  final TimeRange? quietHours;
  final List<String> mutedKeywords;
  final DateTime updatedAt;

  const NotificationSettings({
    required this.userId,
    this.pushNotificationsEnabled = true,
    this.emailNotificationsEnabled = true,
    this.smsNotificationsEnabled = false,
    required this.typeSettings,
    required this.prioritySettings,
    this.quietHours,
    this.mutedKeywords = const [],
    required this.updatedAt,
  });

  factory NotificationSettings.fromJson(Map<String, dynamic> json) {
    return NotificationSettings(
      userId: json['user_id'] as String,
      pushNotificationsEnabled: json['push_notifications_enabled'] as bool? ?? true,
      emailNotificationsEnabled: json['email_notifications_enabled'] as bool? ?? true,
      smsNotificationsEnabled: json['sms_notifications_enabled'] as bool? ?? false,
      typeSettings: Map<NotificationType, bool>.fromEntries(
        (json['type_settings'] as Map<String, dynamic>? ?? {}).entries.map(
          (e) => MapEntry(
            NotificationType.values.firstWhere(
              (type) => type.name == e.key,
              orElse: () => NotificationType.general,
            ),
            e.value as bool,
          ),
        ),
      ),
      prioritySettings: Map<NotificationPriority, bool>.fromEntries(
        (json['priority_settings'] as Map<String, dynamic>? ?? {}).entries.map(
          (e) => MapEntry(
            NotificationPriority.values.firstWhere(
              (priority) => priority.name == e.key,
              orElse: () => NotificationPriority.normal,
            ),
            e.value as bool,
          ),
        ),
      ),
      quietHours: json['quiet_hours'] != null
          ? TimeRange.fromJson(json['quiet_hours'] as Map<String, dynamic>)
          : null,
      mutedKeywords: (json['muted_keywords'] as List<dynamic>? ?? [])
          .map((e) => e as String)
          .toList(),
      updatedAt: DateTime.parse(json['updated_at'] as String),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'user_id': userId,
      'push_notifications_enabled': pushNotificationsEnabled,
      'email_notifications_enabled': emailNotificationsEnabled,
      'sms_notifications_enabled': smsNotificationsEnabled,
      'type_settings': Map<String, bool>.fromEntries(
        typeSettings.entries.map((e) => MapEntry(e.key.name, e.value)),
      ),
      'priority_settings': Map<String, bool>.fromEntries(
        prioritySettings.entries.map((e) => MapEntry(e.key.name, e.value)),
      ),
      if (quietHours != null) 'quiet_hours': quietHours!.toJson(),
      'muted_keywords': mutedKeywords,
      'updated_at': updatedAt.toIso8601String(),
    };
  }

  NotificationSettings copyWith({
    String? userId,
    bool? pushNotificationsEnabled,
    bool? emailNotificationsEnabled,
    bool? smsNotificationsEnabled,
    Map<NotificationType, bool>? typeSettings,
    Map<NotificationPriority, bool>? prioritySettings,
    TimeRange? quietHours,
    List<String>? mutedKeywords,
    DateTime? updatedAt,
  }) {
    return NotificationSettings(
      userId: userId ?? this.userId,
      pushNotificationsEnabled: pushNotificationsEnabled ?? this.pushNotificationsEnabled,
      emailNotificationsEnabled: emailNotificationsEnabled ?? this.emailNotificationsEnabled,
      smsNotificationsEnabled: smsNotificationsEnabled ?? this.smsNotificationsEnabled,
      typeSettings: typeSettings ?? this.typeSettings,
      prioritySettings: prioritySettings ?? this.prioritySettings,
      quietHours: quietHours ?? this.quietHours,
      mutedKeywords: mutedKeywords ?? this.mutedKeywords,
      updatedAt: updatedAt ?? this.updatedAt,
    );
  }

  @override
  List<Object?> get props => [
        userId,
        pushNotificationsEnabled,
        emailNotificationsEnabled,
        smsNotificationsEnabled,
        typeSettings,
        prioritySettings,
        quietHours,
        mutedKeywords,
        updatedAt,
      ];
}

/// Modelo para representar un rango de tiempo (horas silenciosas)
class TimeRange extends Equatable {
  final int startHour;
  final int startMinute;
  final int endHour;
  final int endMinute;

  const TimeRange({
    required this.startHour,
    required this.startMinute,
    required this.endHour,
    required this.endMinute,
  });

  factory TimeRange.fromJson(Map<String, dynamic> json) {
    return TimeRange(
      startHour: json['start_hour'] as int,
      startMinute: json['start_minute'] as int,
      endHour: json['end_hour'] as int,
      endMinute: json['end_minute'] as int,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'start_hour': startHour,
      'start_minute': startMinute,
      'end_hour': endHour,
      'end_minute': endMinute,
    };
  }

  String get formattedStart => 
      '${startHour.toString().padLeft(2, '0')}:${startMinute.toString().padLeft(2, '0')}';

  String get formattedEnd => 
      '${endHour.toString().padLeft(2, '0')}:${endMinute.toString().padLeft(2, '0')}';

  @override
  List<Object> get props => [startHour, startMinute, endHour, endMinute];
}

/// Modelo para token de dispositivo FCM
class DeviceToken extends Equatable {
  final String id;
  final String userId;
  final String token;
  final DevicePlatform platform;
  final String? deviceId;
  final String? appVersion;
  final bool isActive;
  final DateTime createdAt;
  final DateTime lastUsedAt;

  const DeviceToken({
    required this.id,
    required this.userId,
    required this.token,
    required this.platform,
    this.deviceId,
    this.appVersion,
    this.isActive = true,
    required this.createdAt,
    required this.lastUsedAt,
  });

  factory DeviceToken.fromJson(Map<String, dynamic> json) {
    return DeviceToken(
      id: json['id'] as String,
      userId: json['user_id'] as String,
      token: json['token'] as String,
      platform: DevicePlatform.values.firstWhere(
        (e) => e.name == json['platform'],
        orElse: () => DevicePlatform.android,
      ),
      deviceId: json['device_id'] as String?,
      appVersion: json['app_version'] as String?,
      isActive: json['is_active'] as bool? ?? true,
      createdAt: DateTime.parse(json['created_at'] as String),
      lastUsedAt: DateTime.parse(json['last_used_at'] as String),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'user_id': userId,
      'token': token,
      'platform': platform.name,
      if (deviceId != null) 'device_id': deviceId,
      if (appVersion != null) 'app_version': appVersion,
      'is_active': isActive,
      'created_at': createdAt.toIso8601String(),
      'last_used_at': lastUsedAt.toIso8601String(),
    };
  }

  @override
  List<Object?> get props => [
        id,
        userId,
        token,
        platform,
        deviceId,
        appVersion,
        isActive,
        createdAt,
        lastUsedAt,
      ];
}

/// Tipos de notificación
enum NotificationType {
  general,
  announcement,
  message,
  payment,
  contract,
  system,
  marketing,
  reminder,
  security,
}

/// Prioridades de notificación
enum NotificationPriority {
  low,
  normal,
  high,
  urgent,
}

/// Plataformas de dispositivo
enum DevicePlatform {
  android,
  ios,
  web,
}

/// Estados de entrega de notificación
enum DeliveryStatus {
  pending,
  sent,
  delivered,
  failed,
  clicked,
}

/// Modelo para estadísticas de notificaciones
class NotificationStats extends Equatable {
  final String userId;
  final int totalNotifications;
  final int unreadNotifications;
  final int readNotifications;
  final Map<NotificationType, int> typeStats;
  final Map<NotificationPriority, int> priorityStats;
  final DateTime lastCalculated;

  const NotificationStats({
    required this.userId,
    required this.totalNotifications,
    required this.unreadNotifications,
    required this.readNotifications,
    required this.typeStats,
    required this.priorityStats,
    required this.lastCalculated,
  });

  factory NotificationStats.fromJson(Map<String, dynamic> json) {
    return NotificationStats(
      userId: json['user_id'] as String,
      totalNotifications: json['total_notifications'] as int,
      unreadNotifications: json['unread_notifications'] as int,
      readNotifications: json['read_notifications'] as int,
      typeStats: Map<NotificationType, int>.fromEntries(
        (json['type_stats'] as Map<String, dynamic>? ?? {}).entries.map(
          (e) => MapEntry(
            NotificationType.values.firstWhere(
              (type) => type.name == e.key,
              orElse: () => NotificationType.general,
            ),
            e.value as int,
          ),
        ),
      ),
      priorityStats: Map<NotificationPriority, int>.fromEntries(
        (json['priority_stats'] as Map<String, dynamic>? ?? {}).entries.map(
          (e) => MapEntry(
            NotificationPriority.values.firstWhere(
              (priority) => priority.name == e.key,
              orElse: () => NotificationPriority.normal,
            ),
            e.value as int,
          ),
        ),
      ),
      lastCalculated: DateTime.parse(json['last_calculated'] as String),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'user_id': userId,
      'total_notifications': totalNotifications,
      'unread_notifications': unreadNotifications,
      'read_notifications': readNotifications,
      'type_stats': Map<String, int>.fromEntries(
        typeStats.entries.map((e) => MapEntry(e.key.name, e.value)),
      ),
      'priority_stats': Map<String, int>.fromEntries(
        priorityStats.entries.map((e) => MapEntry(e.key.name, e.value)),
      ),
      'last_calculated': lastCalculated.toIso8601String(),
    };
  }

  @override
  List<Object> get props => [
        userId,
        totalNotifications,
        unreadNotifications,
        readNotifications,
        typeStats,
        priorityStats,
        lastCalculated,
      ];
}
