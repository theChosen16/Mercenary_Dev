import 'dart:async';

import '../../../../core/network/http_service.dart';
import '../../../../shared/models/notification_model.dart';
import '../../../../core/exceptions/app_exceptions.dart';

class NotificationService {
  final HttpService _httpService;

  NotificationService({required HttpService httpService}) : _httpService = httpService;

  /// Obtener notificaciones del usuario
  Future<List<AppNotification>> getUserNotifications({
    int page = 1,
    int limit = 20,
    bool? isRead,
    NotificationType? type,
    NotificationPriority? priority,
  }) async {
    try {
      final queryParams = <String, dynamic>{
        'page': page,
        'limit': limit,
      };

      if (isRead != null) {
        queryParams['is_read'] = isRead;
      }
      if (type != null) {
        queryParams['type'] = type.name;
      }
      if (priority != null) {
        queryParams['priority'] = priority.name;
      }

      final response = await _httpService.get(
        '/api/v1/notifications',
        queryParameters: queryParams,
      );

      final List<dynamic> data = response.data as List<dynamic>;
      return data
          .map((json) => AppNotification.fromJson(json as Map<String, dynamic>))
          .toList();
    } catch (e) {
      throw NotificationException('Error al obtener notificaciones: $e');
    }
  }

  /// Marcar notificación como leída
  Future<void> markAsRead(String notificationId) async {
    try {
      await _httpService.patch('/api/v1/notifications/$notificationId/read');
    } catch (e) {
      throw NotificationException('Error al marcar notificación como leída: $e');
    }
  }

  /// Marcar todas las notificaciones como leídas
  Future<void> markAllAsRead() async {
    try {
      await _httpService.patch('/api/v1/notifications/read-all');
    } catch (e) {
      throw NotificationException('Error al marcar todas las notificaciones como leídas: $e');
    }
  }

  /// Eliminar notificación
  Future<void> deleteNotification(String notificationId) async {
    try {
      await _httpService.delete('/api/v1/notifications/$notificationId');
    } catch (e) {
      throw NotificationException('Error al eliminar notificación: $e');
    }
  }

  /// Eliminar todas las notificaciones leídas
  Future<void> deleteAllRead() async {
    try {
      await _httpService.delete('/api/v1/notifications/read');
    } catch (e) {
      throw NotificationException('Error al eliminar notificaciones leídas: $e');
    }
  }

  /// Obtener configuración de notificaciones del usuario
  Future<NotificationSettings> getNotificationSettings() async {
    try {
      final response = await _httpService.get('/api/v1/notifications/settings');
      return NotificationSettings.fromJson(response.data as Map<String, dynamic>);
    } catch (e) {
      throw NotificationException('Error al obtener configuración de notificaciones: $e');
    }
  }

  /// Actualizar configuración de notificaciones
  Future<NotificationSettings> updateNotificationSettings(
    NotificationSettings settings,
  ) async {
    try {
      final response = await _httpService.put(
        '/api/v1/notifications/settings',
        data: settings.toJson(),
      );
      return NotificationSettings.fromJson(response.data as Map<String, dynamic>);
    } catch (e) {
      throw NotificationException('Error al actualizar configuración de notificaciones: $e');
    }
  }

  /// Registrar token de dispositivo para push notifications
  Future<DeviceToken> registerDeviceToken({
    required String token,
    required DevicePlatform platform,
    String? deviceId,
    String? appVersion,
  }) async {
    try {
      final response = await _httpService.post(
        '/api/v1/notifications/device-token',
        data: {
          'token': token,
          'platform': platform.name,
          if (deviceId != null) 'device_id': deviceId,
          if (appVersion != null) 'app_version': appVersion,
        },
      );
      return DeviceToken.fromJson(response.data as Map<String, dynamic>);
    } catch (e) {
      throw NotificationException('Error al registrar token de dispositivo: $e');
    }
  }

  /// Actualizar token de dispositivo
  Future<DeviceToken> updateDeviceToken({
    required String tokenId,
    required String newToken,
  }) async {
    try {
      final response = await _httpService.patch(
        '/api/v1/notifications/device-token/$tokenId',
        data: {'token': newToken},
      );
      return DeviceToken.fromJson(response.data as Map<String, dynamic>);
    } catch (e) {
      throw NotificationException('Error al actualizar token de dispositivo: $e');
    }
  }

  /// Desactivar token de dispositivo
  Future<void> deactivateDeviceToken(String tokenId) async {
    try {
      await _httpService.patch('/api/v1/notifications/device-token/$tokenId/deactivate');
    } catch (e) {
      throw NotificationException('Error al desactivar token de dispositivo: $e');
    }
  }

  /// Obtener tokens de dispositivo del usuario
  Future<List<DeviceToken>> getUserDeviceTokens() async {
    try {
      final response = await _httpService.get('/api/v1/notifications/device-tokens');
      final List<dynamic> data = response.data as List<dynamic>;
      return data
          .map((json) => DeviceToken.fromJson(json as Map<String, dynamic>))
          .toList();
    } catch (e) {
      throw NotificationException('Error al obtener tokens de dispositivo: $e');
    }
  }

  /// Enviar notificación de prueba
  Future<void> sendTestNotification({
    required String title,
    required String body,
    NotificationType type = NotificationType.general,
    NotificationPriority priority = NotificationPriority.normal,
    Map<String, dynamic>? data,
  }) async {
    try {
      await _httpService.post(
        '/api/v1/notifications/test',
        data: {
          'title': title,
          'body': body,
          'type': type.name,
          'priority': priority.name,
          if (data != null) 'data': data,
        },
      );
    } catch (e) {
      throw NotificationException('Error al enviar notificación de prueba: $e');
    }
  }

  /// Obtener estadísticas de notificaciones
  Future<NotificationStats> getNotificationStats() async {
    try {
      final response = await _httpService.get('/api/v1/notifications/stats');
      return NotificationStats.fromJson(response.data as Map<String, dynamic>);
    } catch (e) {
      throw NotificationException('Error al obtener estadísticas de notificaciones: $e');
    }
  }

  /// Suscribirse a un tópico de notificaciones
  Future<void> subscribeToTopic(String topic) async {
    try {
      await _httpService.post(
        '/api/v1/notifications/topics/subscribe',
        data: {'topic': topic},
      );
    } catch (e) {
      throw NotificationException('Error al suscribirse al tópico: $e');
    }
  }

  /// Desuscribirse de un tópico de notificaciones
  Future<void> unsubscribeFromTopic(String topic) async {
    try {
      await _httpService.post(
        '/api/v1/notifications/topics/unsubscribe',
        data: {'topic': topic},
      );
    } catch (e) {
      throw NotificationException('Error al desuscribirse del tópico: $e');
    }
  }

  /// Obtener tópicos suscritos
  Future<List<String>> getSubscribedTopics() async {
    try {
      final response = await _httpService.get('/api/v1/notifications/topics');
      final List<dynamic> data = response.data as List<dynamic>;
      return data.map((topic) => topic as String).toList();
    } catch (e) {
      throw NotificationException('Error al obtener tópicos suscritos: $e');
    }
  }

  /// Programar notificación
  Future<void> scheduleNotification({
    required String title,
    required String body,
    required DateTime scheduledFor,
    NotificationType type = NotificationType.general,
    NotificationPriority priority = NotificationPriority.normal,
    Map<String, dynamic>? data,
  }) async {
    try {
      await _httpService.post(
        '/api/v1/notifications/schedule',
        data: {
          'title': title,
          'body': body,
          'scheduled_for': scheduledFor.toIso8601String(),
          'type': type.name,
          'priority': priority.name,
          if (data != null) 'data': data,
        },
      );
    } catch (e) {
      throw NotificationException('Error al programar notificación: $e');
    }
  }

  /// Cancelar notificación programada
  Future<void> cancelScheduledNotification(String notificationId) async {
    try {
      await _httpService.delete('/api/v1/notifications/schedule/$notificationId');
    } catch (e) {
      throw NotificationException('Error al cancelar notificación programada: $e');
    }
  }

  /// Obtener notificaciones programadas
  Future<List<AppNotification>> getScheduledNotifications() async {
    try {
      final response = await _httpService.get('/api/v1/notifications/scheduled');
      final List<dynamic> data = response.data as List<dynamic>;
      return data
          .map((json) => AppNotification.fromJson(json as Map<String, dynamic>))
          .toList();
    } catch (e) {
      throw NotificationException('Error al obtener notificaciones programadas: $e');
    }
  }

  /// Reportar notificación como spam
  Future<void> reportAsSpam(String notificationId) async {
    try {
      await _httpService.post('/api/v1/notifications/$notificationId/spam');
    } catch (e) {
      throw NotificationException('Error al reportar notificación como spam: $e');
    }
  }

  /// Bloquear remitente de notificación
  Future<void> blockSender(String senderId) async {
    try {
      await _httpService.post(
        '/api/v1/notifications/block-sender',
        data: {'sender_id': senderId},
      );
    } catch (e) {
      throw NotificationException('Error al bloquear remitente: $e');
    }
  }

  /// Desbloquear remitente
  Future<void> unblockSender(String senderId) async {
    try {
      await _httpService.delete('/api/v1/notifications/block-sender/$senderId');
    } catch (e) {
      throw NotificationException('Error al desbloquear remitente: $e');
    }
  }

  /// Obtener remitentes bloqueados
  Future<List<String>> getBlockedSenders() async {
    try {
      final response = await _httpService.get('/api/v1/notifications/blocked-senders');
      final List<dynamic> data = response.data as List<dynamic>;
      return data.map((sender) => sender as String).toList();
    } catch (e) {
      throw NotificationException('Error al obtener remitentes bloqueados: $e');
    }
  }

  /// Exportar notificaciones
  Future<Map<String, dynamic>> exportNotifications({
    DateTime? startDate,
    DateTime? endDate,
    List<NotificationType>? types,
  }) async {
    try {
      final queryParams = <String, dynamic>{};
      
      if (startDate != null) {
        queryParams['start_date'] = startDate.toIso8601String();
      }
      if (endDate != null) {
        queryParams['end_date'] = endDate.toIso8601String();
      }
      if (types != null && types.isNotEmpty) {
        queryParams['types'] = types.map((t) => t.name).join(',');
      }

      final response = await _httpService.get(
        '/api/v1/notifications/export',
        queryParameters: queryParams,
      );
      
      return response.data as Map<String, dynamic>;
    } catch (e) {
      throw NotificationException('Error al exportar notificaciones: $e');
    }
  }

  /// Obtener plantillas de notificación
  Future<List<Map<String, dynamic>>> getNotificationTemplates() async {
    try {
      final response = await _httpService.get('/api/v1/notifications/templates');
      final List<dynamic> data = response.data as List<dynamic>;
      return data.map((template) => template as Map<String, dynamic>).toList();
    } catch (e) {
      throw NotificationException('Error al obtener plantillas de notificación: $e');
    }
  }

  /// Crear plantilla de notificación personalizada
  Future<Map<String, dynamic>> createNotificationTemplate({
    required String name,
    required String title,
    required String body,
    NotificationType type = NotificationType.general,
    NotificationPriority priority = NotificationPriority.normal,
    Map<String, dynamic>? variables,
  }) async {
    try {
      final response = await _httpService.post(
        '/api/v1/notifications/templates',
        data: {
          'name': name,
          'title': title,
          'body': body,
          'type': type.name,
          'priority': priority.name,
          if (variables != null) 'variables': variables,
        },
      );
      return response.data as Map<String, dynamic>;
    } catch (e) {
      throw NotificationException('Error al crear plantilla de notificación: $e');
    }
  }

  /// Actualizar preferencias de delivery
  Future<void> updateDeliveryPreferences({
    bool? instantDelivery,
    bool? batchDelivery,
    int? batchIntervalMinutes,
    bool? respectQuietHours,
  }) async {
    try {
      final data = <String, dynamic>{};
      
      if (instantDelivery != null) {
        data['instant_delivery'] = instantDelivery;
      }
      if (batchDelivery != null) {
        data['batch_delivery'] = batchDelivery;
      }
      if (batchIntervalMinutes != null) {
        data['batch_interval_minutes'] = batchIntervalMinutes;
      }
      if (respectQuietHours != null) {
        data['respect_quiet_hours'] = respectQuietHours;
      }

      await _httpService.patch(
        '/api/v1/notifications/delivery-preferences',
        data: data,
      );
    } catch (e) {
      throw NotificationException('Error al actualizar preferencias de entrega: $e');
    }
  }

  /// Verificar permisos de notificación
  Future<Map<String, bool>> checkNotificationPermissions() async {
    try {
      final response = await _httpService.get('/api/v1/notifications/permissions');
      return Map<String, bool>.from(response.data as Map<String, dynamic>);
    } catch (e) {
      throw NotificationException('Error al verificar permisos de notificación: $e');
    }
  }

  /// Stream para notificaciones en tiempo real
  Stream<AppNotification> get notificationStream {
    // En una implementación real, esto sería un WebSocket o Server-Sent Events
    return Stream.periodic(
      const Duration(seconds: 30),
      (_) => null,
    ).asyncMap((_) async {
      try {
        final notifications = await getUserNotifications(limit: 1);
        return notifications.isNotEmpty ? notifications.first : null;
      } catch (e) {
        return null;
      }
    }).where((notification) => notification != null).cast<AppNotification>();
  }
}

/// Excepción específica para errores de notificaciones
class NotificationException extends AppException {
  NotificationException(super.message);
}
