import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:intl/intl.dart';

import '../../../../core/theme/app_theme.dart';
import '../../../../shared/models/notification_model.dart';
import '../bloc/notification_bloc.dart';

class NotificationsScreen extends StatefulWidget {
  const NotificationsScreen({super.key});

  @override
  State<NotificationsScreen> createState() => _NotificationsScreenState();
}

class _NotificationsScreenState extends State<NotificationsScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;
  final ScrollController _scrollController = ScrollController();
  
  NotificationType? _selectedType;
  NotificationPriority? _selectedPriority;
  bool? _selectedReadStatus;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 3, vsync: this);
    _scrollController.addListener(_onScroll);
    _loadNotifications();
  }

  @override
  void dispose() {
    _tabController.dispose();
    _scrollController.dispose();
    super.dispose();
  }

  void _loadNotifications() {
    context.read<NotificationBloc>().add(
          LoadNotifications(
            page: 1,
            limit: 20,
            isRead: _selectedReadStatus,
            type: _selectedType,
            priority: _selectedPriority,
          ),
        );
  }

  void _onScroll() {
    if (_scrollController.position.pixels ==
        _scrollController.position.maxScrollExtent) {
      // Cargar más notificaciones
      final state = context.read<NotificationBloc>().state;
      if (state is NotificationsLoaded && state.hasMore) {
        context.read<NotificationBloc>().add(
              LoadMoreNotifications(
                page: state.currentPage + 1,
                isRead: _selectedReadStatus,
                type: _selectedType,
                priority: _selectedPriority,
              ),
            );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Notificaciones'),
        backgroundColor: AppTheme.primaryColor,
        foregroundColor: Colors.white,
        bottom: TabBar(
          controller: _tabController,
          indicatorColor: Colors.white,
          labelColor: Colors.white,
          unselectedLabelColor: Colors.white70,
          tabs: const [
            Tab(text: 'Todas'),
            Tab(text: 'No leídas'),
            Tab(text: 'Leídas'),
          ],
          onTap: (index) {
            setState(() {
              switch (index) {
                case 0:
                  _selectedReadStatus = null;
                  break;
                case 1:
                  _selectedReadStatus = false;
                  break;
                case 2:
                  _selectedReadStatus = true;
                  break;
              }
            });
            _loadNotifications();
          },
        ),
        actions: [
          IconButton(
            onPressed: _showFilterDialog,
            icon: const Icon(Icons.filter_list),
          ),
          PopupMenuButton<String>(
            onSelected: _handleMenuAction,
            itemBuilder: (context) => [
              const PopupMenuItem(
                value: 'mark_all_read',
                child: Text('Marcar todas como leídas'),
              ),
              const PopupMenuItem(
                value: 'delete_read',
                child: Text('Eliminar leídas'),
              ),
              const PopupMenuItem(
                value: 'settings',
                child: Text('Configuración'),
              ),
              const PopupMenuItem(
                value: 'refresh',
                child: Text('Actualizar'),
              ),
            ],
          ),
        ],
      ),
      body: BlocConsumer<NotificationBloc, NotificationState>(
        listener: (context, state) {
          if (state is NotificationError) {
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(
                content: Text(state.error),
                backgroundColor: Colors.red,
              ),
            );
          } else if (state is NotificationSuccess) {
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(
                content: Text(state.message),
                backgroundColor: Colors.green,
              ),
            );
          }
        },
        builder: (context, state) {
          if (state is NotificationLoading) {
            return const Center(
              child: CircularProgressIndicator(),
            );
          }

          if (state is NotificationsLoaded) {
            return _buildNotificationsList(state);
          }

          return const Center(
            child: Text('No hay notificaciones disponibles'),
          );
        },
      ),
    );
  }

  Widget _buildNotificationsList(NotificationsLoaded state) {
    if (state.notifications.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              Icons.notifications_none,
              size: 64,
              color: Colors.grey[400],
            ),
            const SizedBox(height: 16),
            Text(
              'No tienes notificaciones',
              style: TextStyle(
                fontSize: 18,
                color: Colors.grey[600],
              ),
            ),
            const SizedBox(height: 8),
            Text(
              _getEmptyStateMessage(),
              style: TextStyle(
                fontSize: 14,
                color: Colors.grey[500],
              ),
            ),
          ],
        ),
      );
    }

    return RefreshIndicator(
      onRefresh: () async {
        _loadNotifications();
      },
      child: ListView.builder(
        controller: _scrollController,
        padding: const EdgeInsets.all(8),
        itemCount: state.notifications.length + (state.hasMore ? 1 : 0),
        itemBuilder: (context, index) {
          if (index == state.notifications.length) {
            return const Center(
              child: Padding(
                padding: EdgeInsets.all(16),
                child: CircularProgressIndicator(),
              ),
            );
          }

          final notification = state.notifications[index];
          return _buildNotificationCard(notification);
        },
      ),
    );
  }

  Widget _buildNotificationCard(AppNotification notification) {
    return Card(
      margin: const EdgeInsets.symmetric(vertical: 4, horizontal: 8),
      child: InkWell(
        onTap: () => _handleNotificationTap(notification),
        child: Padding(
          padding: const EdgeInsets.all(12),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  CircleAvatar(
                    radius: 20,
                    backgroundColor: _getNotificationTypeColor(notification.type),
                    child: Icon(
                      _getNotificationTypeIcon(notification.type),
                      color: Colors.white,
                      size: 20,
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            Expanded(
                              child: Text(
                                notification.title,
                                style: TextStyle(
                                  fontSize: 16,
                                  fontWeight: notification.isRead
                                      ? FontWeight.normal
                                      : FontWeight.bold,
                                ),
                              ),
                            ),
                            if (!notification.isRead)
                              Container(
                                width: 8,
                                height: 8,
                                decoration: const BoxDecoration(
                                  color: AppTheme.primaryColor,
                                  shape: BoxShape.circle,
                                ),
                              ),
                          ],
                        ),
                        const SizedBox(height: 4),
                        Text(
                          notification.body,
                          style: TextStyle(
                            fontSize: 14,
                            color: Colors.grey[600],
                          ),
                          maxLines: 2,
                          overflow: TextOverflow.ellipsis,
                        ),
                        const SizedBox(height: 8),
                        Row(
                          children: [
                            _buildPriorityChip(notification.priority),
                            const SizedBox(width: 8),
                            _buildTypeChip(notification.type),
                            const Spacer(),
                            Text(
                              _formatDateTime(notification.createdAt),
                              style: TextStyle(
                                fontSize: 12,
                                color: Colors.grey[500],
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                  PopupMenuButton<String>(
                    onSelected: (value) => _handleNotificationAction(value, notification),
                    itemBuilder: (context) => [
                      if (!notification.isRead)
                        const PopupMenuItem(
                          value: 'mark_read',
                          child: Text('Marcar como leída'),
                        ),
                      const PopupMenuItem(
                        value: 'delete',
                        child: Text('Eliminar'),
                      ),
                      const PopupMenuItem(
                        value: 'report_spam',
                        child: Text('Reportar como spam'),
                      ),
                    ],
                  ),
                ],
              ),
              if (notification.imageUrl != null) ...[
                const SizedBox(height: 8),
                ClipRRect(
                  borderRadius: BorderRadius.circular(8),
                  child: Image.network(
                    notification.imageUrl!,
                    height: 150,
                    width: double.infinity,
                    fit: BoxFit.cover,
                    errorBuilder: (context, error, stackTrace) {
                      return Container(
                        height: 150,
                        color: Colors.grey[300],
                        child: const Icon(Icons.broken_image),
                      );
                    },
                  ),
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildPriorityChip(NotificationPriority priority) {
    Color color;
    String label;

    switch (priority) {
      case NotificationPriority.low:
        color = Colors.grey;
        label = 'Baja';
        break;
      case NotificationPriority.normal:
        color = Colors.blue;
        label = 'Normal';
        break;
      case NotificationPriority.high:
        color = Colors.orange;
        label = 'Alta';
        break;
      case NotificationPriority.urgent:
        color = Colors.red;
        label = 'Urgente';
        break;
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.1),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: color.withValues(alpha: 0.3)),
      ),
      child: Text(
        label,
        style: TextStyle(
          fontSize: 10,
          color: color,
          fontWeight: FontWeight.w500,
        ),
      ),
    );
  }

  Widget _buildTypeChip(NotificationType type) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
      decoration: BoxDecoration(
        color: Colors.grey.withValues(alpha: 0.1),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Text(
        _getNotificationTypeName(type),
        style: TextStyle(
          fontSize: 10,
          color: Colors.grey[600],
        ),
      ),
    );
  }

  Color _getNotificationTypeColor(NotificationType type) {
    switch (type) {
      case NotificationType.general:
        return Colors.blue;
      case NotificationType.announcement:
        return Colors.purple;
      case NotificationType.message:
        return Colors.green;
      case NotificationType.payment:
        return Colors.orange;
      case NotificationType.contract:
        return Colors.teal;
      case NotificationType.system:
        return Colors.grey;
      case NotificationType.marketing:
        return Colors.pink;
      case NotificationType.reminder:
        return Colors.amber;
      case NotificationType.security:
        return Colors.red;
    }
  }

  IconData _getNotificationTypeIcon(NotificationType type) {
    switch (type) {
      case NotificationType.general:
        return Icons.info;
      case NotificationType.announcement:
        return Icons.campaign;
      case NotificationType.message:
        return Icons.message;
      case NotificationType.payment:
        return Icons.payment;
      case NotificationType.contract:
        return Icons.description;
      case NotificationType.system:
        return Icons.settings;
      case NotificationType.marketing:
        return Icons.local_offer;
      case NotificationType.reminder:
        return Icons.alarm;
      case NotificationType.security:
        return Icons.security;
    }
  }

  String _getNotificationTypeName(NotificationType type) {
    switch (type) {
      case NotificationType.general:
        return 'General';
      case NotificationType.announcement:
        return 'Anuncio';
      case NotificationType.message:
        return 'Mensaje';
      case NotificationType.payment:
        return 'Pago';
      case NotificationType.contract:
        return 'Contrato';
      case NotificationType.system:
        return 'Sistema';
      case NotificationType.marketing:
        return 'Marketing';
      case NotificationType.reminder:
        return 'Recordatorio';
      case NotificationType.security:
        return 'Seguridad';
    }
  }

  String _formatDateTime(DateTime dateTime) {
    final now = DateTime.now();
    final difference = now.difference(dateTime);

    if (difference.inDays > 7) {
      return DateFormat('dd/MM/yyyy').format(dateTime);
    } else if (difference.inDays > 0) {
      return '${difference.inDays}d';
    } else if (difference.inHours > 0) {
      return '${difference.inHours}h';
    } else if (difference.inMinutes > 0) {
      return '${difference.inMinutes}m';
    } else {
      return 'Ahora';
    }
  }

  String _getEmptyStateMessage() {
    if (_selectedReadStatus == false) {
      return 'No tienes notificaciones sin leer';
    } else if (_selectedReadStatus == true) {
      return 'No tienes notificaciones leídas';
    } else {
      return 'Las notificaciones aparecerán aquí';
    }
  }

  void _handleNotificationTap(AppNotification notification) {
    if (!notification.isRead) {
      context.read<NotificationBloc>().add(
            MarkNotificationAsRead(notification.id),
          );
    }

    if (notification.actionUrl != null) {
      // Navegar a la URL de acción
      // Navigator.of(context).pushNamed(notification.actionUrl!);
    }

    // Mostrar detalles de la notificación
    _showNotificationDetails(notification);
  }

  void _handleNotificationAction(String action, AppNotification notification) {
    switch (action) {
      case 'mark_read':
        context.read<NotificationBloc>().add(
              MarkNotificationAsRead(notification.id),
            );
        break;
      case 'delete':
        _showDeleteConfirmationDialog(notification);
        break;
      case 'report_spam':
        // TODO: Implementar reporte de spam
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Funcionalidad de reporte en desarrollo')),
        );
        break;
    }
  }

  void _handleMenuAction(String action) {
    switch (action) {
      case 'mark_all_read':
        context.read<NotificationBloc>().add(MarkAllNotificationsAsRead());
        break;
      case 'delete_read':
        _showDeleteAllReadConfirmationDialog();
        break;
      case 'settings':
        Navigator.of(context).pushNamed('/notification-settings');
        break;
      case 'refresh':
        _loadNotifications();
        break;
    }
  }

  void _showFilterDialog() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Filtrar Notificaciones'),
        content: StatefulBuilder(
          builder: (context, setState) => Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              DropdownButtonFormField<NotificationType?>(
                value: _selectedType,
                decoration: const InputDecoration(labelText: 'Tipo'),
                items: [
                  const DropdownMenuItem(value: null, child: Text('Todos')),
                  ...NotificationType.values.map(
                    (type) => DropdownMenuItem(
                      value: type,
                      child: Text(_getNotificationTypeName(type)),
                    ),
                  ),
                ],
                onChanged: (value) => setState(() => _selectedType = value),
              ),
              const SizedBox(height: 16),
              DropdownButtonFormField<NotificationPriority?>(
                value: _selectedPriority,
                decoration: const InputDecoration(labelText: 'Prioridad'),
                items: [
                  const DropdownMenuItem(value: null, child: Text('Todas')),
                  ...NotificationPriority.values.map(
                    (priority) => DropdownMenuItem(
                      value: priority,
                      child: Text(priority.name.toUpperCase()),
                    ),
                  ),
                ],
                onChanged: (value) => setState(() => _selectedPriority = value),
              ),
            ],
          ),
        ),
        actions: [
          TextButton(
            onPressed: () {
              setState(() {
                _selectedType = null;
                _selectedPriority = null;
              });
              Navigator.of(context).pop();
              _loadNotifications();
            },
            child: const Text('Limpiar'),
          ),
          TextButton(
            onPressed: () => Navigator.of(context).pop(),
            child: const Text('Cancelar'),
          ),
          TextButton(
            onPressed: () {
              Navigator.of(context).pop();
              _loadNotifications();
            },
            child: const Text('Aplicar'),
          ),
        ],
      ),
    );
  }

  void _showNotificationDetails(AppNotification notification) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text(notification.title),
        content: SingleChildScrollView(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(notification.body),
              const SizedBox(height: 16),
              if (notification.imageUrl != null) ...[
                ClipRRect(
                  borderRadius: BorderRadius.circular(8),
                  child: Image.network(
                    notification.imageUrl!,
                    width: double.infinity,
                    fit: BoxFit.cover,
                  ),
                ),
                const SizedBox(height: 16),
              ],
              Row(
                children: [
                  _buildPriorityChip(notification.priority),
                  const SizedBox(width: 8),
                  _buildTypeChip(notification.type),
                ],
              ),
              const SizedBox(height: 8),
              Text(
                'Recibida: ${DateFormat('dd/MM/yyyy HH:mm').format(notification.createdAt)}',
                style: TextStyle(
                  fontSize: 12,
                  color: Colors.grey[600],
                ),
              ),
              if (notification.readAt != null)
                Text(
                  'Leída: ${DateFormat('dd/MM/yyyy HH:mm').format(notification.readAt!)}',
                  style: TextStyle(
                    fontSize: 12,
                    color: Colors.grey[600],
                  ),
                ),
            ],
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(),
            child: const Text('Cerrar'),
          ),
        ],
      ),
    );
  }

  void _showDeleteConfirmationDialog(AppNotification notification) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Eliminar Notificación'),
        content: const Text('¿Estás seguro de que quieres eliminar esta notificación?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(),
            child: const Text('Cancelar'),
          ),
          TextButton(
            onPressed: () {
              Navigator.of(context).pop();
              context.read<NotificationBloc>().add(
                    DeleteNotification(notification.id),
                  );
            },
            style: TextButton.styleFrom(foregroundColor: Colors.red),
            child: const Text('Eliminar'),
          ),
        ],
      ),
    );
  }

  void _showDeleteAllReadConfirmationDialog() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Eliminar Notificaciones Leídas'),
        content: const Text('¿Estás seguro de que quieres eliminar todas las notificaciones leídas?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(),
            child: const Text('Cancelar'),
          ),
          TextButton(
            onPressed: () {
              Navigator.of(context).pop();
              // TODO: Implementar DeleteAllReadNotifications en el BLoC
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('Funcionalidad en desarrollo')),
              );
            },
            style: TextButton.styleFrom(foregroundColor: Colors.red),
            child: const Text('Eliminar'),
          ),
        ],
      ),
    );
  }
}
