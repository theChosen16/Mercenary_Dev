import 'dart:async';
import 'dart:convert';
import 'package:web_socket_channel/web_socket_channel.dart';
import 'package:web_socket_channel/status.dart' as status;

import '../../../../core/network/http_service.dart';
import '../../../../core/constants/app_constants.dart';
import '../../../../shared/models/chat_model.dart';
import '../../../../core/exceptions/app_exceptions.dart';

class ChatService {
  final HttpService _httpService;
  WebSocketChannel? _channel;
  StreamController<ChatMessage>? _messageController;
  StreamController<ChatConnectionStatus>? _statusController;
  
  String? _currentUserId;
  ChatConnectionStatus _connectionStatus = ChatConnectionStatus.disconnected;

  ChatService({required HttpService httpService}) : _httpService = httpService;

  /// Stream de mensajes entrantes
  Stream<ChatMessage> get messageStream => _messageController?.stream ?? const Stream.empty();

  /// Stream de estado de conexión
  Stream<ChatConnectionStatus> get connectionStatusStream => 
      _statusController?.stream ?? Stream.value(ChatConnectionStatus.disconnected);

  /// Estado actual de conexión
  ChatConnectionStatus get connectionStatus => _connectionStatus;

  /// Conectar al WebSocket del chat
  Future<void> connect(String userId) async {
    try {
      _currentUserId = userId;
      _updateConnectionStatus(ChatConnectionStatus.connecting);

      // Inicializar controllers si no existen
      _messageController ??= StreamController<ChatMessage>.broadcast();
      _statusController ??= StreamController<ChatConnectionStatus>.broadcast();

      // Obtener token de autenticación
      final token = await _httpService.getAuthToken();
      if (token == null) {
        throw AuthException('Token de autenticación no disponible');
      }

      // Conectar al WebSocket
      final wsUrl = '${AppConstants.baseUrl.replaceFirst('http', 'ws')}/ws/chat/$userId?token=$token';
      _channel = WebSocketChannel.connect(Uri.parse(wsUrl));

      // Escuchar mensajes
      _channel!.stream.listen(
        _handleWebSocketMessage,
        onError: _handleWebSocketError,
        onDone: _handleWebSocketClosed,
      );

      _updateConnectionStatus(ChatConnectionStatus.connected);
    } catch (e) {
      _updateConnectionStatus(ChatConnectionStatus.error);
      throw ChatException('Error al conectar al chat: $e');
    }
  }

  /// Desconectar del WebSocket
  Future<void> disconnect() async {
    await _channel?.sink.close(status.goingAway);
    _channel = null;
    _updateConnectionStatus(ChatConnectionStatus.disconnected);
  }

  /// Enviar mensaje
  Future<void> sendMessage({
    required String receiverId,
    required String content,
    MessageType type = MessageType.text,
    String? attachmentUrl,
  }) async {
    if (_connectionStatus != ChatConnectionStatus.connected) {
      throw ChatException('No hay conexión al chat');
    }

    final message = {
      'type': 'send_message',
      'data': {
        'receiver_id': receiverId,
        'content': content,
        'message_type': type.name,
        if (attachmentUrl != null) 'attachment_url': attachmentUrl,
      },
    };

    _channel?.sink.add(jsonEncode(message));
  }

  /// Marcar mensaje como leído
  Future<void> markAsRead(String messageId) async {
    if (_connectionStatus != ChatConnectionStatus.connected) {
      return;
    }

    final message = {
      'type': 'mark_read',
      'data': {'message_id': messageId},
    };

    _channel?.sink.add(jsonEncode(message));
  }

  /// Obtener conversaciones del usuario
  Future<List<ChatConversation>> getConversations() async {
    try {
      final response = await _httpService.get('/api/v1/chat/conversations');
      final List<dynamic> data = response.data as List<dynamic>;
      
      return data
          .map((json) => ChatConversation.fromJson(json as Map<String, dynamic>))
          .toList();
    } catch (e) {
      throw ChatException('Error al obtener conversaciones: $e');
    }
  }

  /// Obtener mensajes de una conversación
  Future<List<ChatMessage>> getMessages({
    required String conversationId,
    int page = 1,
    int limit = 50,
  }) async {
    try {
      final response = await _httpService.get(
        '/api/v1/chat/conversations/$conversationId/messages',
        queryParameters: {
          'page': page,
          'limit': limit,
        },
      );
      
      final List<dynamic> data = response.data as List<dynamic>;
      
      return data
          .map((json) => ChatMessage.fromJson(json as Map<String, dynamic>))
          .toList();
    } catch (e) {
      throw ChatException('Error al obtener mensajes: $e');
    }
  }

  /// Crear nueva conversación
  Future<ChatConversation> createConversation(String participantId) async {
    try {
      final response = await _httpService.post(
        '/api/v1/chat/conversations',
        data: {'participant_id': participantId},
      );
      
      return ChatConversation.fromJson(response.data as Map<String, dynamic>);
    } catch (e) {
      throw ChatException('Error al crear conversación: $e');
    }
  }

  /// Subir archivo para chat
  Future<String> uploadFile(String filePath) async {
    try {
      final response = await _httpService.uploadFile(
        '/api/v1/chat/upload',
        filePath,
      );
      
      return response.data['url'] as String;
    } catch (e) {
      throw ChatException('Error al subir archivo: $e');
    }
  }

  /// Manejar mensajes del WebSocket
  void _handleWebSocketMessage(dynamic data) {
    try {
      final Map<String, dynamic> json = jsonDecode(data as String);
      final String type = json['type'] as String;
      
      switch (type) {
        case 'new_message':
          final messageData = json['data'] as Map<String, dynamic>;
          final message = ChatMessage.fromJson(messageData);
          _messageController?.add(message);
          break;
        case 'message_read':
          // Manejar confirmación de lectura
          break;
        case 'user_typing':
          // Manejar indicador de escritura
          break;
        case 'error':
          final error = json['message'] as String;
          throw ChatException(error);
      }
    } catch (e) {
      _handleWebSocketError(e);
    }
  }

  /// Manejar errores del WebSocket
  void _handleWebSocketError(dynamic error) {
    _updateConnectionStatus(ChatConnectionStatus.error);
    // Intentar reconectar después de un delay
    Timer(const Duration(seconds: 5), () {
      if (_currentUserId != null) {
        connect(_currentUserId!);
      }
    });
  }

  /// Manejar cierre del WebSocket
  void _handleWebSocketClosed() {
    _updateConnectionStatus(ChatConnectionStatus.disconnected);
  }

  /// Actualizar estado de conexión
  void _updateConnectionStatus(ChatConnectionStatus status) {
    _connectionStatus = status;
    _statusController?.add(status);
  }

  /// Limpiar recursos
  void dispose() {
    disconnect();
    _messageController?.close();
    _statusController?.close();
    _messageController = null;
    _statusController = null;
  }
}

/// Excepción específica para errores de chat
class ChatException extends AppException {
  ChatException(String message) : super(message);
}
