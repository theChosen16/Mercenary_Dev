import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import '../../../../core/theme/app_theme.dart';
import '../../../../shared/models/notification_model.dart';
import '../bloc/notification_bloc.dart';

class NotificationSettingsScreen extends StatefulWidget {
  const NotificationSettingsScreen({super.key});

  @override
  State<NotificationSettingsScreen> createState() => _NotificationSettingsScreenState();
}

class _NotificationSettingsScreenState extends State<NotificationSettingsScreen> {
  NotificationSettings? _currentSettings;
  TimeOfDay? _quietHoursStart;
  TimeOfDay? _quietHoursEnd;
  final TextEditingController _keywordController = TextEditingController();

  @override
  void initState() {
    super.initState();
    context.read<NotificationBloc>().add(LoadNotificationSettings());
  }

  @override
  void dispose() {
    _keywordController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Configuración de Notificaciones'),
        backgroundColor: AppTheme.primaryColor,
        foregroundColor: Colors.white,
        actions: [
          TextButton(
            onPressed: _saveSettings,
            child: const Text(
              'Guardar',
              style: TextStyle(color: Colors.white),
            ),
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
          } else if (state is NotificationSettingsLoaded) {
            setState(() {
              _currentSettings = NotificationSettings.fromJson(state.settings);
              final quietHours = state.settings['quietHours'] as Map<String, dynamic>?;
              if (quietHours != null) {
                _quietHoursStart = TimeOfDay(
                  hour: quietHours['startHour'] as int,
                  minute: quietHours['startMinute'] as int,
                );
                _quietHoursEnd = TimeOfDay(
                  hour: quietHours['endHour'] as int,
                  minute: quietHours['endMinute'] as int,
                );
              }
            });
          }
        },
        builder: (context, state) {
          if (state is NotificationLoading) {
            return const Center(
              child: CircularProgressIndicator(),
            );
          }

          if (_currentSettings == null) {
            return const Center(
              child: Text('No se pudo cargar la configuración'),
            );
          }

          return SingleChildScrollView(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                _buildGeneralSettings(),
                const SizedBox(height: 24),
                _buildNotificationTypeSettings(),
                const SizedBox(height: 24),
                _buildPrioritySettings(),
                const SizedBox(height: 24),
                _buildQuietHoursSettings(),
                const SizedBox(height: 24),
                _buildMutedKeywordsSettings(),
                const SizedBox(height: 24),
                _buildAdvancedSettings(),
              ],
            ),
          );
        },
      ),
    );
  }

  Widget _buildGeneralSettings() {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Configuración General',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 16),
            SwitchListTile(
              title: const Text('Notificaciones Push'),
              subtitle: const Text('Recibir notificaciones en tu dispositivo'),
              value: _currentSettings!.pushNotificationsEnabled,
              onChanged: (value) {
                setState(() {
                  _currentSettings = _currentSettings!.copyWith(
                    pushNotificationsEnabled: value,
                  );
                });
              },
              activeColor: AppTheme.primaryColor,
            ),
            SwitchListTile(
              title: const Text('Notificaciones por Email'),
              subtitle: const Text('Recibir notificaciones en tu correo electrónico'),
              value: _currentSettings!.emailNotificationsEnabled,
              onChanged: (value) {
                setState(() {
                  _currentSettings = _currentSettings!.copyWith(
                    emailNotificationsEnabled: value,
                  );
                });
              },
              activeColor: AppTheme.primaryColor,
            ),
            SwitchListTile(
              title: const Text('Notificaciones SMS'),
              subtitle: const Text('Recibir notificaciones por mensaje de texto'),
              value: _currentSettings!.smsNotificationsEnabled,
              onChanged: (value) {
                setState(() {
                  _currentSettings = _currentSettings!.copyWith(
                    smsNotificationsEnabled: value,
                  );
                });
              },
              activeColor: AppTheme.primaryColor,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildNotificationTypeSettings() {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Tipos de Notificación',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 16),
            ...NotificationType.values.map((type) {
              final isEnabled = _currentSettings!.typeSettings[type] ?? true;
              return SwitchListTile(
                title: Text(_getNotificationTypeName(type)),
                subtitle: Text(_getNotificationTypeDescription(type)),
                value: isEnabled,
                onChanged: (value) {
                  setState(() {
                    final updatedTypeSettings = Map<NotificationType, bool>.from(
                      _currentSettings!.typeSettings,
                    );
                    updatedTypeSettings[type] = value;
                    _currentSettings = _currentSettings!.copyWith(
                      typeSettings: updatedTypeSettings,
                    );
                  });
                },
                activeColor: AppTheme.primaryColor,
              );
            }),
          ],
        ),
      ),
    );
  }

  Widget _buildPrioritySettings() {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Prioridades de Notificación',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 16),
            ...NotificationPriority.values.map((priority) {
              final isEnabled = _currentSettings!.prioritySettings[priority] ?? true;
              return SwitchListTile(
                title: Text(_getPriorityName(priority)),
                subtitle: Text(_getPriorityDescription(priority)),
                value: isEnabled,
                onChanged: (value) {
                  setState(() {
                    final updatedPrioritySettings = Map<NotificationPriority, bool>.from(
                      _currentSettings!.prioritySettings,
                    );
                    updatedPrioritySettings[priority] = value;
                    _currentSettings = _currentSettings!.copyWith(
                      prioritySettings: updatedPrioritySettings,
                    );
                  });
                },
                activeColor: AppTheme.primaryColor,
              );
            }),
          ],
        ),
      ),
    );
  }

  Widget _buildQuietHoursSettings() {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Horas Silenciosas',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 8),
            const Text(
              'No recibir notificaciones durante estas horas',
              style: TextStyle(color: Colors.grey),
            ),
            const SizedBox(height: 16),
            Row(
              children: [
                Expanded(
                  child: ListTile(
                    title: const Text('Hora de inicio'),
                    subtitle: Text(
                      _quietHoursStart?.format(context) ?? 'No configurada',
                    ),
                    trailing: const Icon(Icons.access_time),
                    onTap: () => _selectTime(true),
                  ),
                ),
                Expanded(
                  child: ListTile(
                    title: const Text('Hora de fin'),
                    subtitle: Text(
                      _quietHoursEnd?.format(context) ?? 'No configurada',
                    ),
                    trailing: const Icon(Icons.access_time),
                    onTap: () => _selectTime(false),
                  ),
                ),
              ],
            ),
            if (_quietHoursStart != null && _quietHoursEnd != null)
              Padding(
                padding: const EdgeInsets.only(top: 8),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.end,
                  children: [
                    TextButton(
                      onPressed: () {
                        setState(() {
                          _quietHoursStart = null;
                          _quietHoursEnd = null;
                        });
                      },
                      child: const Text('Limpiar'),
                    ),
                  ],
                ),
              ),
          ],
        ),
      ),
    );
  }

  Widget _buildMutedKeywordsSettings() {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Palabras Clave Silenciadas',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 8),
            const Text(
              'No recibir notificaciones que contengan estas palabras',
              style: TextStyle(color: Colors.grey),
            ),
            const SizedBox(height: 16),
            Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: _keywordController,
                    decoration: const InputDecoration(
                      labelText: 'Agregar palabra clave',
                      hintText: 'Ej: promoción, oferta',
                    ),
                  ),
                ),
                const SizedBox(width: 8),
                ElevatedButton(
                  onPressed: _addMutedKeyword,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppTheme.primaryColor,
                    foregroundColor: Colors.white,
                  ),
                  child: const Text('Agregar'),
                ),
              ],
            ),
            const SizedBox(height: 16),
            if (_currentSettings!.mutedKeywords.isNotEmpty) ...[
              const Text(
                'Palabras silenciadas:',
                style: TextStyle(fontWeight: FontWeight.w500),
              ),
              const SizedBox(height: 8),
              Wrap(
                spacing: 8,
                runSpacing: 4,
                children: _currentSettings!.mutedKeywords.map((keyword) {
                  return Chip(
                    label: Text(keyword),
                    deleteIcon: const Icon(Icons.close, size: 18),
                    onDeleted: () => _removeMutedKeyword(keyword),
                    backgroundColor: Colors.grey[200],
                  );
                }).toList(),
              ),
            ],
          ],
        ),
      ),
    );
  }

  Widget _buildAdvancedSettings() {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Configuración Avanzada',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 16),
            ListTile(
              title: const Text('Enviar Notificación de Prueba'),
              subtitle: const Text('Probar la configuración actual'),
              trailing: const Icon(Icons.send),
              onTap: _sendTestNotification,
            ),
            ListTile(
              title: const Text('Estadísticas de Notificaciones'),
              subtitle: const Text('Ver estadísticas detalladas'),
              trailing: const Icon(Icons.analytics),
              onTap: () => Navigator.of(context).pushNamed('/notification-stats'),
            ),
            ListTile(
              title: const Text('Gestionar Dispositivos'),
              subtitle: const Text('Ver y gestionar tokens de dispositivo'),
              trailing: const Icon(Icons.devices),
              onTap: () => Navigator.of(context).pushNamed('/device-tokens'),
            ),
            ListTile(
              title: const Text('Remitentes Bloqueados'),
              subtitle: const Text('Gestionar remitentes bloqueados'),
              trailing: const Icon(Icons.block),
              onTap: () => Navigator.of(context).pushNamed('/blocked-senders'),
            ),
            ListTile(
              title: const Text('Exportar Notificaciones'),
              subtitle: const Text('Descargar historial de notificaciones'),
              trailing: const Icon(Icons.download),
              onTap: _exportNotifications,
            ),
          ],
        ),
      ),
    );
  }

  Future<void> _selectTime(bool isStart) async {
    final TimeOfDay? picked = await showTimePicker(
      context: context,
      initialTime: isStart
          ? (_quietHoursStart ?? const TimeOfDay(hour: 22, minute: 0))
          : (_quietHoursEnd ?? const TimeOfDay(hour: 8, minute: 0)),
    );

    if (picked != null) {
      setState(() {
        if (isStart) {
          _quietHoursStart = picked;
        } else {
          _quietHoursEnd = picked;
        }
      });
    }
  }

  void _addMutedKeyword() {
    final keyword = _keywordController.text.trim();
    if (keyword.isNotEmpty && !_currentSettings!.mutedKeywords.contains(keyword)) {
      setState(() {
        _currentSettings = _currentSettings!.copyWith(
          mutedKeywords: [..._currentSettings!.mutedKeywords, keyword],
        );
      });
      _keywordController.clear();
    }
  }

  void _removeMutedKeyword(String keyword) {
    setState(() {
      final updatedKeywords = _currentSettings!.mutedKeywords
          .where((k) => k != keyword)
          .toList();
      _currentSettings = _currentSettings!.copyWith(
        mutedKeywords: updatedKeywords,
      );
    });
  }

  void _saveSettings() {
    if (_currentSettings == null) return;

    TimeRange? quietHours;
    if (_quietHoursStart != null && _quietHoursEnd != null) {
      quietHours = TimeRange(
        startHour: _quietHoursStart!.hour,
        startMinute: _quietHoursStart!.minute,
        endHour: _quietHoursEnd!.hour,
        endMinute: _quietHoursEnd!.minute,
      );
    }

    final updatedSettings = _currentSettings!.copyWith(
      quietHours: quietHours,
      updatedAt: DateTime.now(),
    );

    context.read<NotificationBloc>().add(
          UpdateNotificationSettings(updatedSettings.toJson()),
        );
  }

  void _sendTestNotification() {
    context.read<NotificationBloc>().add(
          const SendNotification(
            userId: 'current_user', // TODO: Obtener ID del usuario actual
            title: 'Notificación de Prueba',
            body: 'Esta es una notificación de prueba para verificar tu configuración.',
            type: NotificationType.general,
            priority: NotificationPriority.normal,
          ),
        );
  }

  void _exportNotifications() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Exportar Notificaciones'),
        content: const Text(
          'Se generará un archivo con tu historial de notificaciones. '
          'Esto puede tomar unos momentos.',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(),
            child: const Text('Cancelar'),
          ),
          TextButton(
            onPressed: () {
              Navigator.of(context).pop();
              // Aquí se implementaría la lógica de exportación
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(
                  content: Text('Exportación iniciada. Te notificaremos cuando esté lista.'),
                ),
              );
            },
            child: const Text('Exportar'),
          ),
        ],
      ),
    );
  }

  String _getNotificationTypeName(NotificationType type) {
    switch (type) {
      case NotificationType.general:
        return 'General';
      case NotificationType.announcement:
        return 'Anuncios';
      case NotificationType.message:
        return 'Mensajes';
      case NotificationType.payment:
        return 'Pagos';
      case NotificationType.contract:
        return 'Contratos';
      case NotificationType.system:
        return 'Sistema';
      case NotificationType.marketing:
        return 'Marketing';
      case NotificationType.reminder:
        return 'Recordatorios';
      case NotificationType.security:
        return 'Seguridad';
    }
  }

  String _getNotificationTypeDescription(NotificationType type) {
    switch (type) {
      case NotificationType.general:
        return 'Notificaciones generales de la aplicación';
      case NotificationType.announcement:
        return 'Nuevos anuncios y publicaciones';
      case NotificationType.message:
        return 'Mensajes y chat';
      case NotificationType.payment:
        return 'Transacciones y pagos';
      case NotificationType.contract:
        return 'Contratos y acuerdos';
      case NotificationType.system:
        return 'Actualizaciones del sistema';
      case NotificationType.marketing:
        return 'Promociones y ofertas';
      case NotificationType.reminder:
        return 'Recordatorios y fechas importantes';
      case NotificationType.security:
        return 'Alertas de seguridad';
    }
  }

  String _getPriorityName(NotificationPriority priority) {
    switch (priority) {
      case NotificationPriority.low:
        return 'Baja Prioridad';
      case NotificationPriority.normal:
        return 'Prioridad Normal';
      case NotificationPriority.high:
        return 'Alta Prioridad';
      case NotificationPriority.urgent:
        return 'Urgente';
    }
  }

  String _getPriorityDescription(NotificationPriority priority) {
    switch (priority) {
      case NotificationPriority.low:
        return 'Notificaciones no críticas';
      case NotificationPriority.normal:
        return 'Notificaciones estándar';
      case NotificationPriority.high:
        return 'Notificaciones importantes';
      case NotificationPriority.urgent:
        return 'Notificaciones críticas y urgentes';
    }
  }
}
