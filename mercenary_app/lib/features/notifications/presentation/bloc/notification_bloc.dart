import 'dart:async';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:equatable/equatable.dart';

import '../../data/services/notification_service.dart';
import '../../../../shared/models/notification_model.dart';

// Events
abstract class NotificationEvent extends Equatable {
  const NotificationEvent();

  @override
  List<Object?> get props => [];
}

class LoadNotifications extends NotificationEvent {
  final int page;
  final int limit;
  final bool? isRead;
  final NotificationType? type;
  final NotificationPriority? priority;

  const LoadNotifications({
    this.page = 1,
    this.limit = 20,
    this.isRead,
    this.type,
    this.priority,
  });

  @override
  List<Object?> get props => [page, limit, isRead, type, priority];
}

class LoadMoreNotifications extends NotificationEvent {
  final int page;
  final bool? isRead;
  final NotificationType? type;
  final NotificationPriority? priority;

  const LoadMoreNotifications({
    required this.page,
    this.isRead,
    this.type,
    this.priority,
  });

  @override
  List<Object?> get props => [page, isRead, type, priority];
}

class MarkNotificationAsRead extends NotificationEvent {
  final String notificationId;

  const MarkNotificationAsRead(this.notificationId);

  @override
  List<Object> get props => [notificationId];
}

class MarkAllNotificationsAsRead extends NotificationEvent {}

class DeleteNotification extends NotificationEvent {
  final String notificationId;

  const DeleteNotification(this.notificationId);

  @override
  List<Object> get props => [notificationId];
}

class SendNotification extends NotificationEvent {
  final String userId;
  final String title;
  final String body;
  final NotificationType type;
  final NotificationPriority priority;
  final Map<String, dynamic>? data;

  const SendNotification({
    required this.userId,
    required this.title,
    required this.body,
    required this.type,
    required this.priority,
    this.data,
  });

  @override
  List<Object?> get props => [userId, title, body, type, priority, data];
}

class LoadNotificationSettings extends NotificationEvent {}

class UpdateNotificationSettings extends NotificationEvent {
  final Map<String, dynamic> settings;

  const UpdateNotificationSettings(this.settings);

  @override
  List<Object> get props => [settings];
}

class RegisterDeviceToken extends NotificationEvent {
  final String token;
  final String platform;

  const RegisterDeviceToken({
    required this.token,
    required this.platform,
  });

  @override
  List<Object> get props => [token, platform];
}

class LoadDeviceTokens extends NotificationEvent {}

class RemoveDeviceToken extends NotificationEvent {
  final String tokenId;

  const RemoveDeviceToken(this.tokenId);

  @override
  List<Object> get props => [tokenId];
}

class LoadNotificationStats extends NotificationEvent {}

class SubscribeToTopic extends NotificationEvent {
  final String topic;

  const SubscribeToTopic(this.topic);

  @override
  List<Object> get props => [topic];
}

class UnsubscribeFromTopic extends NotificationEvent {
  final String topic;

  const UnsubscribeFromTopic(this.topic);

  @override
  List<Object> get props => [topic];
}

class LoadSubscribedTopics extends NotificationEvent {}

class ScheduleNotification extends NotificationEvent {
  final String title;
  final String body;
  final DateTime scheduledTime;
  final NotificationType type;
  final Map<String, dynamic>? data;

  const ScheduleNotification({
    required this.title,
    required this.body,
    required this.scheduledTime,
    required this.type,
    this.data,
  });

  @override
  List<Object?> get props => [title, body, scheduledTime, type, data];
}

class LoadScheduledNotifications extends NotificationEvent {}

class CancelScheduledNotification extends NotificationEvent {
  final String notificationId;

  const CancelScheduledNotification(this.notificationId);

  @override
  List<Object> get props => [notificationId];
}

class BlockSender extends NotificationEvent {
  final String senderId;

  const BlockSender(this.senderId);

  @override
  List<Object> get props => [senderId];
}

class UnblockSender extends NotificationEvent {
  final String senderId;

  const UnblockSender(this.senderId);

  @override
  List<Object> get props => [senderId];
}

class LoadBlockedSenders extends NotificationEvent {}

// States
abstract class NotificationState extends Equatable {
  const NotificationState();

  @override
  List<Object?> get props => [];
}

class NotificationInitial extends NotificationState {}

class NotificationLoading extends NotificationState {}

class NotificationsLoaded extends NotificationState {
  final List<AppNotification> notifications;
  final int currentPage;
  final bool hasMore;
  final int unreadCount;

  const NotificationsLoaded({
    required this.notifications,
    required this.currentPage,
    required this.hasMore,
    required this.unreadCount,
  });

  NotificationsLoaded copyWith({
    List<AppNotification>? notifications,
    int? currentPage,
    bool? hasMore,
    int? unreadCount,
  }) {
    return NotificationsLoaded(
      notifications: notifications ?? this.notifications,
      currentPage: currentPage ?? this.currentPage,
      hasMore: hasMore ?? this.hasMore,
      unreadCount: unreadCount ?? this.unreadCount,
    );
  }

  @override
  List<Object> get props => [notifications, currentPage, hasMore, unreadCount];
}

class NotificationSettingsLoaded extends NotificationState {
  final Map<String, dynamic> settings;

  const NotificationSettingsLoaded(this.settings);

  @override
  List<Object> get props => [settings];
}

class DeviceTokensLoaded extends NotificationState {
  final List<Map<String, dynamic>> tokens;

  const DeviceTokensLoaded(this.tokens);

  @override
  List<Object> get props => [tokens];
}

class NotificationStatsLoaded extends NotificationState {
  final Map<String, dynamic> stats;

  const NotificationStatsLoaded(this.stats);

  @override
  List<Object> get props => [stats];
}

class SubscribedTopicsLoaded extends NotificationState {
  final List<String> topics;

  const SubscribedTopicsLoaded(this.topics);

  @override
  List<Object> get props => [topics];
}

class ScheduledNotificationsLoaded extends NotificationState {
  final List<Map<String, dynamic>> scheduledNotifications;

  const ScheduledNotificationsLoaded(this.scheduledNotifications);

  @override
  List<Object> get props => [scheduledNotifications];
}

class BlockedSendersLoaded extends NotificationState {
  final List<String> blockedSenders;

  const BlockedSendersLoaded(this.blockedSenders);

  @override
  List<Object> get props => [blockedSenders];
}

class NotificationSuccess extends NotificationState {
  final String message;

  const NotificationSuccess(this.message);

  @override
  List<Object> get props => [message];
}

class NotificationError extends NotificationState {
  final String error;

  const NotificationError(this.error);

  @override
  List<Object> get props => [error];
}

// BLoC
class NotificationBloc extends Bloc<NotificationEvent, NotificationState> {
  final NotificationService _notificationService;

  NotificationBloc(this._notificationService) : super(NotificationInitial()) {
    on<LoadNotifications>(_onLoadNotifications);
    on<LoadMoreNotifications>(_onLoadMoreNotifications);
    on<MarkNotificationAsRead>(_onMarkNotificationAsRead);
    on<MarkAllNotificationsAsRead>(_onMarkAllNotificationsAsRead);
    on<DeleteNotification>(_onDeleteNotification);
    on<SendNotification>(_onSendNotification);
    on<LoadNotificationSettings>(_onLoadNotificationSettings);
    on<UpdateNotificationSettings>(_onUpdateNotificationSettings);
    on<RegisterDeviceToken>(_onRegisterDeviceToken);
    on<LoadDeviceTokens>(_onLoadDeviceTokens);
    on<RemoveDeviceToken>(_onRemoveDeviceToken);
    on<LoadNotificationStats>(_onLoadNotificationStats);
    on<SubscribeToTopic>(_onSubscribeToTopic);
    on<UnsubscribeFromTopic>(_onUnsubscribeFromTopic);
    on<LoadSubscribedTopics>(_onLoadSubscribedTopics);
    on<ScheduleNotification>(_onScheduleNotification);
    on<LoadScheduledNotifications>(_onLoadScheduledNotifications);
    on<CancelScheduledNotification>(_onCancelScheduledNotification);
    on<BlockSender>(_onBlockSender);
    on<UnblockSender>(_onUnblockSender);
    on<LoadBlockedSenders>(_onLoadBlockedSenders);
  }

  Future<void> _onLoadNotifications(
    LoadNotifications event,
    Emitter<NotificationState> emit,
  ) async {
    try {
      emit(NotificationLoading());
      final notifications = await _notificationService.getUserNotifications(
        page: event.page,
        limit: event.limit,
        isRead: event.isRead,
        type: event.type,
        priority: event.priority,
      );
      emit(NotificationsLoaded(
        notifications: notifications,
        currentPage: event.page,
        hasMore: notifications.length == event.limit,
        unreadCount: notifications.where((n) => !n.isRead).length,
      ));
    } catch (e) {
      emit(NotificationError(e.toString()));
    }
  }

  Future<void> _onLoadMoreNotifications(
    LoadMoreNotifications event,
    Emitter<NotificationState> emit,
  ) async {
    try {
      if (state is NotificationsLoaded) {
        final currentState = state as NotificationsLoaded;
        final newNotifications = await _notificationService.getUserNotifications(
          page: event.page,
          isRead: event.isRead,
          type: event.type,
          priority: event.priority,
        );
        
        emit(currentState.copyWith(
          notifications: [...currentState.notifications, ...newNotifications],
          currentPage: event.page,
          hasMore: newNotifications.length == 20,
        ));
      }
    } catch (e) {
      emit(NotificationError(e.toString()));
    }
  }

  Future<void> _onMarkNotificationAsRead(
    MarkNotificationAsRead event,
    Emitter<NotificationState> emit,
  ) async {
    try {
      await _notificationService.markAsRead(event.notificationId);
      if (state is NotificationsLoaded) {
        final currentState = state as NotificationsLoaded;
        final updatedNotifications = currentState.notifications.map((notification) {
          if (notification.id == event.notificationId) {
            return notification.copyWith(isRead: true);
          }
          return notification;
        }).toList();
        
        emit(currentState.copyWith(
          notifications: updatedNotifications,
          unreadCount: currentState.unreadCount - 1,
        ));
      }
    } catch (e) {
      emit(NotificationError(e.toString()));
    }
  }

  Future<void> _onMarkAllNotificationsAsRead(
    MarkAllNotificationsAsRead event,
    Emitter<NotificationState> emit,
  ) async {
    try {
      await _notificationService.markAllAsRead();
      if (state is NotificationsLoaded) {
        final currentState = state as NotificationsLoaded;
        final updatedNotifications = currentState.notifications.map((notification) {
          return notification.copyWith(isRead: true);
        }).toList();
        
        emit(currentState.copyWith(
          notifications: updatedNotifications,
          unreadCount: 0,
        ));
      }
    } catch (e) {
      emit(NotificationError(e.toString()));
    }
  }

  Future<void> _onDeleteNotification(
    DeleteNotification event,
    Emitter<NotificationState> emit,
  ) async {
    try {
      await _notificationService.deleteNotification(event.notificationId);
      if (state is NotificationsLoaded) {
        final currentState = state as NotificationsLoaded;
        final updatedNotifications = currentState.notifications
            .where((notification) => notification.id != event.notificationId)
            .toList();
        
        emit(currentState.copyWith(notifications: updatedNotifications));
      }
    } catch (e) {
      emit(NotificationError(e.toString()));
    }
  }

  Future<void> _onSendNotification(
    SendNotification event,
    Emitter<NotificationState> emit,
  ) async {
    try {
      await _notificationService.sendTestNotification(
        title: event.title,
        body: event.body,
        type: event.type,
        priority: event.priority,
        data: event.data,
      );
      emit(NotificationSuccess('Notificación enviada exitosamente'));
    } catch (e) {
      emit(NotificationError(e.toString()));
    }
  }

  Future<void> _onLoadNotificationSettings(
    LoadNotificationSettings event,
    Emitter<NotificationState> emit,
  ) async {
    try {
      emit(NotificationLoading());
      final settings = await _notificationService.getNotificationSettings();
      emit(NotificationSettingsLoaded(settings.toJson()));
    } catch (e) {
      emit(NotificationError(e.toString()));
    }
  }

  Future<void> _onUpdateNotificationSettings(
    UpdateNotificationSettings event,
    Emitter<NotificationState> emit,
  ) async {
    try {
      final settings = NotificationSettings.fromJson(event.settings);
      await _notificationService.updateNotificationSettings(settings);
      emit(NotificationSuccess('Configuración actualizada'));
    } catch (e) {
      emit(NotificationError(e.toString()));
    }
  }

  Future<void> _onRegisterDeviceToken(
    RegisterDeviceToken event,
    Emitter<NotificationState> emit,
  ) async {
    try {
      final platform = DevicePlatform.values.firstWhere(
        (p) => p.name.toLowerCase() == event.platform.toLowerCase(),
        orElse: () => DevicePlatform.android,
      );
      await _notificationService.registerDeviceToken(
        token: event.token,
        platform: platform,
      );
      emit(NotificationSuccess('Token registrado exitosamente'));
    } catch (e) {
      emit(NotificationError(e.toString()));
    }
  }

  Future<void> _onLoadDeviceTokens(
    LoadDeviceTokens event,
    Emitter<NotificationState> emit,
  ) async {
    try {
      emit(NotificationLoading());
      final tokens = await _notificationService.getUserDeviceTokens();
      final tokenMaps = tokens.map((token) => token.toJson()).toList();
      emit(DeviceTokensLoaded(tokenMaps));
    } catch (e) {
      emit(NotificationError(e.toString()));
    }
  }

  Future<void> _onRemoveDeviceToken(
    RemoveDeviceToken event,
    Emitter<NotificationState> emit,
  ) async {
    try {
      await _notificationService.deactivateDeviceToken(event.tokenId);
      emit(NotificationSuccess('Token eliminado'));
    } catch (e) {
      emit(NotificationError(e.toString()));
    }
  }

  Future<void> _onLoadNotificationStats(
    LoadNotificationStats event,
    Emitter<NotificationState> emit,
  ) async {
    try {
      emit(NotificationLoading());
      final stats = await _notificationService.getNotificationStats();
      emit(NotificationStatsLoaded(stats.toJson()));
    } catch (e) {
      emit(NotificationError(e.toString()));
    }
  }

  Future<void> _onSubscribeToTopic(
    SubscribeToTopic event,
    Emitter<NotificationState> emit,
  ) async {
    try {
      await _notificationService.subscribeToTopic(event.topic);
      emit(NotificationSuccess('Suscrito al tema ${event.topic}'));
    } catch (e) {
      emit(NotificationError(e.toString()));
    }
  }

  Future<void> _onUnsubscribeFromTopic(
    UnsubscribeFromTopic event,
    Emitter<NotificationState> emit,
  ) async {
    try {
      await _notificationService.unsubscribeFromTopic(event.topic);
      emit(NotificationSuccess('Desuscrito del tema ${event.topic}'));
    } catch (e) {
      emit(NotificationError(e.toString()));
    }
  }

  Future<void> _onLoadSubscribedTopics(
    LoadSubscribedTopics event,
    Emitter<NotificationState> emit,
  ) async {
    try {
      emit(NotificationLoading());
      final topics = await _notificationService.getSubscribedTopics();
      emit(SubscribedTopicsLoaded(topics));
    } catch (e) {
      emit(NotificationError(e.toString()));
    }
  }

  Future<void> _onScheduleNotification(
    ScheduleNotification event,
    Emitter<NotificationState> emit,
  ) async {
    try {
      await _notificationService.scheduleNotification(
        title: event.title,
        body: event.body,
        scheduledFor: event.scheduledTime,
        type: event.type,
        data: event.data,
      );
      emit(NotificationSuccess('Notificación programada'));
    } catch (e) {
      emit(NotificationError(e.toString()));
    }
  }

  Future<void> _onLoadScheduledNotifications(
    LoadScheduledNotifications event,
    Emitter<NotificationState> emit,
  ) async {
    try {
      emit(NotificationLoading());
      final scheduled = await _notificationService.getScheduledNotifications();
      final scheduledMaps = scheduled.map((notification) => notification.toJson()).toList();
      emit(ScheduledNotificationsLoaded(scheduledMaps));
    } catch (e) {
      emit(NotificationError(e.toString()));
    }
  }

  Future<void> _onCancelScheduledNotification(
    CancelScheduledNotification event,
    Emitter<NotificationState> emit,
  ) async {
    try {
      await _notificationService.cancelScheduledNotification(event.notificationId);
      emit(NotificationSuccess('Notificación cancelada'));
    } catch (e) {
      emit(NotificationError(e.toString()));
    }
  }

  Future<void> _onBlockSender(
    BlockSender event,
    Emitter<NotificationState> emit,
  ) async {
    try {
      await _notificationService.blockSender(event.senderId);
      emit(NotificationSuccess('Remitente bloqueado'));
    } catch (e) {
      emit(NotificationError(e.toString()));
    }
  }

  Future<void> _onUnblockSender(
    UnblockSender event,
    Emitter<NotificationState> emit,
  ) async {
    try {
      await _notificationService.unblockSender(event.senderId);
      emit(NotificationSuccess('Remitente desbloqueado'));
    } catch (e) {
      emit(NotificationError(e.toString()));
    }
  }

  Future<void> _onLoadBlockedSenders(
    LoadBlockedSenders event,
    Emitter<NotificationState> emit,
  ) async {
    try {
      emit(NotificationLoading());
      final blocked = await _notificationService.getBlockedSenders();
      emit(BlockedSendersLoaded(blocked));
    } catch (e) {
      emit(NotificationError(e.toString()));
    }
  }
}
