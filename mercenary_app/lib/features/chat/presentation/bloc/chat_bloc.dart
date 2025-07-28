import 'dart:async';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:equatable/equatable.dart';

import '../../data/services/chat_service.dart';
import '../../../../shared/models/chat_model.dart';

// Events
abstract class ChatEvent extends Equatable {
  const ChatEvent();

  @override
  List<Object?> get props => [];
}

class ChatConnectRequested extends ChatEvent {
  final String userId;

  const ChatConnectRequested(this.userId);

  @override
  List<Object> get props => [userId];
}

class ChatDisconnectRequested extends ChatEvent {}

class ChatMessageSent extends ChatEvent {
  final String receiverId;
  final String content;
  final MessageType type;
  final String? attachmentUrl;

  const ChatMessageSent({
    required this.receiverId,
    required this.content,
    this.type = MessageType.text,
    this.attachmentUrl,
  });

  @override
  List<Object?> get props => [receiverId, content, type, attachmentUrl];
}

class ChatMessageReceived extends ChatEvent {
  final ChatMessage message;

  const ChatMessageReceived(this.message);

  @override
  List<Object> get props => [message];
}

class ChatMessageMarkedAsRead extends ChatEvent {
  final String messageId;

  const ChatMessageMarkedAsRead(this.messageId);

  @override
  List<Object> get props => [messageId];
}

class ChatConversationsLoaded extends ChatEvent {}

class ChatMessagesLoaded extends ChatEvent {
  final String conversationId;
  final int page;

  const ChatMessagesLoaded({
    required this.conversationId,
    this.page = 1,
  });

  @override
  List<Object> get props => [conversationId, page];
}

class ChatConversationCreated extends ChatEvent {
  final String participantId;

  const ChatConversationCreated(this.participantId);

  @override
  List<Object> get props => [participantId];
}

class ChatConnectionStatusChanged extends ChatEvent {
  final ChatConnectionStatus status;

  const ChatConnectionStatusChanged(this.status);

  @override
  List<Object> get props => [status];
}

// States
abstract class ChatState extends Equatable {
  const ChatState();

  @override
  List<Object?> get props => [];
}

class ChatInitial extends ChatState {}

class ChatLoading extends ChatState {}

class ChatConnected extends ChatState {
  final ChatConnectionStatus connectionStatus;
  final List<ChatConversation> conversations;
  final Map<String, List<ChatMessage>> messages;
  final String? activeConversationId;

  const ChatConnected({
    required this.connectionStatus,
    this.conversations = const [],
    this.messages = const {},
    this.activeConversationId,
  });

  ChatConnected copyWith({
    ChatConnectionStatus? connectionStatus,
    List<ChatConversation>? conversations,
    Map<String, List<ChatMessage>>? messages,
    String? activeConversationId,
  }) {
    return ChatConnected(
      connectionStatus: connectionStatus ?? this.connectionStatus,
      conversations: conversations ?? this.conversations,
      messages: messages ?? this.messages,
      activeConversationId: activeConversationId ?? this.activeConversationId,
    );
  }

  @override
  List<Object?> get props => [
        connectionStatus,
        conversations,
        messages,
        activeConversationId,
      ];
}

class ChatError extends ChatState {
  final String message;

  const ChatError(this.message);

  @override
  List<Object> get props => [message];
}

// BLoC
class ChatBloc extends Bloc<ChatEvent, ChatState> {
  final ChatService _chatService;
  StreamSubscription<ChatMessage>? _messageSubscription;
  StreamSubscription<ChatConnectionStatus>? _statusSubscription;

  ChatBloc({required ChatService chatService})
      : _chatService = chatService,
        super(ChatInitial()) {
    on<ChatConnectRequested>(_onConnectRequested);
    on<ChatDisconnectRequested>(_onDisconnectRequested);
    on<ChatMessageSent>(_onMessageSent);
    on<ChatMessageReceived>(_onMessageReceived);
    on<ChatMessageMarkedAsRead>(_onMessageMarkedAsRead);
    on<ChatConversationsLoaded>(_onConversationsLoaded);
    on<ChatMessagesLoaded>(_onMessagesLoaded);
    on<ChatConversationCreated>(_onConversationCreated);
    on<ChatConnectionStatusChanged>(_onConnectionStatusChanged);
  }

  Future<void> _onConnectRequested(
    ChatConnectRequested event,
    Emitter<ChatState> emit,
  ) async {
    try {
      emit(ChatLoading());

      await _chatService.connect(event.userId);

      // Suscribirse a mensajes entrantes
      _messageSubscription = _chatService.messageStream.listen(
        (message) => add(ChatMessageReceived(message)),
      );

      // Suscribirse a cambios de estado de conexión
      _statusSubscription = _chatService.connectionStatusStream.listen(
        (status) => add(ChatConnectionStatusChanged(status)),
      );

      // Cargar conversaciones existentes
      final conversations = await _chatService.getConversations();

      emit(ChatConnected(
        connectionStatus: _chatService.connectionStatus,
        conversations: conversations,
      ));
    } catch (e) {
      emit(ChatError('Error al conectar al chat: $e'));
    }
  }

  Future<void> _onDisconnectRequested(
    ChatDisconnectRequested event,
    Emitter<ChatState> emit,
  ) async {
    await _messageSubscription?.cancel();
    await _statusSubscription?.cancel();
    await _chatService.disconnect();
    emit(ChatInitial());
  }

  Future<void> _onMessageSent(
    ChatMessageSent event,
    Emitter<ChatState> emit,
  ) async {
    try {
      await _chatService.sendMessage(
        receiverId: event.receiverId,
        content: event.content,
        type: event.type,
        attachmentUrl: event.attachmentUrl,
      );
    } catch (e) {
      emit(ChatError('Error al enviar mensaje: $e'));
    }
  }

  void _onMessageReceived(
    ChatMessageReceived event,
    Emitter<ChatState> emit,
  ) {
    if (state is ChatConnected) {
      final currentState = state as ChatConnected;
      final conversationId = _getConversationId(
        event.message.senderId,
        event.message.receiverId,
      );

      // Actualizar mensajes
      final updatedMessages = Map<String, List<ChatMessage>>.from(currentState.messages);
      final currentMessages = updatedMessages[conversationId] ?? [];
      updatedMessages[conversationId] = [...currentMessages, event.message];

      // Actualizar conversaciones
      final updatedConversations = currentState.conversations.map((conv) {
        if (conv.id == conversationId) {
          return conv.copyWith(
            lastMessage: event.message,
            unreadCount: conv.unreadCount + 1,
            lastActivity: event.message.timestamp,
          );
        }
        return conv;
      }).toList();

      emit(currentState.copyWith(
        messages: updatedMessages,
        conversations: updatedConversations,
      ));
    }
  }

  Future<void> _onMessageMarkedAsRead(
    ChatMessageMarkedAsRead event,
    Emitter<ChatState> emit,
  ) async {
    try {
      await _chatService.markAsRead(event.messageId);
    } catch (e) {
      emit(ChatError('Error al marcar mensaje como leído: $e'));
    }
  }

  Future<void> _onConversationsLoaded(
    ChatConversationsLoaded event,
    Emitter<ChatState> emit,
  ) async {
    try {
      if (state is ChatConnected) {
        final currentState = state as ChatConnected;
        final conversations = await _chatService.getConversations();

        emit(currentState.copyWith(conversations: conversations));
      }
    } catch (e) {
      emit(ChatError('Error al cargar conversaciones: $e'));
    }
  }

  Future<void> _onMessagesLoaded(
    ChatMessagesLoaded event,
    Emitter<ChatState> emit,
  ) async {
    try {
      if (state is ChatConnected) {
        final currentState = state as ChatConnected;
        final messages = await _chatService.getMessages(
          conversationId: event.conversationId,
          page: event.page,
        );

        final updatedMessages = Map<String, List<ChatMessage>>.from(currentState.messages);
        
        if (event.page == 1) {
          // Primera página, reemplazar mensajes
          updatedMessages[event.conversationId] = messages;
        } else {
          // Páginas adicionales, agregar al inicio
          final existingMessages = updatedMessages[event.conversationId] ?? [];
          updatedMessages[event.conversationId] = [...messages, ...existingMessages];
        }

        emit(currentState.copyWith(
          messages: updatedMessages,
          activeConversationId: event.conversationId,
        ));
      }
    } catch (e) {
      emit(ChatError('Error al cargar mensajes: $e'));
    }
  }

  Future<void> _onConversationCreated(
    ChatConversationCreated event,
    Emitter<ChatState> emit,
  ) async {
    try {
      if (state is ChatConnected) {
        final currentState = state as ChatConnected;
        final conversation = await _chatService.createConversation(event.participantId);

        final updatedConversations = [...currentState.conversations, conversation];

        emit(currentState.copyWith(
          conversations: updatedConversations,
          activeConversationId: conversation.id,
        ));
      }
    } catch (e) {
      emit(ChatError('Error al crear conversación: $e'));
    }
  }

  void _onConnectionStatusChanged(
    ChatConnectionStatusChanged event,
    Emitter<ChatState> emit,
  ) {
    if (state is ChatConnected) {
      final currentState = state as ChatConnected;
      emit(currentState.copyWith(connectionStatus: event.status));
    }
  }

  /// Generar ID de conversación basado en los participantes
  String _getConversationId(String userId1, String userId2) {
    final participants = [userId1, userId2]..sort();
    return participants.join('_');
  }

  @override
  Future<void> close() {
    _messageSubscription?.cancel();
    _statusSubscription?.cancel();
    _chatService.dispose();
    return super.close();
  }
}
