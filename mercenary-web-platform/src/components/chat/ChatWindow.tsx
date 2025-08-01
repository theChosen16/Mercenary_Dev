import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { socketManager } from '@/lib/socket';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  message: string;
  timestamp: string;
  roomId: string;
}

interface ChatWindowProps {
  roomId: string;
  recipientId: string;
  recipientName: string;
  onClose: () => void;
}

export function ChatWindow({ roomId, recipientId, recipientName, onClose }: ChatWindowProps) {
  const { data: session } = useSession();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [recipientTyping, setRecipientTyping] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const loadMessageHistory = useCallback(async () => {
    try {
      const response = await fetch(`/api/v1/messages/${roomId}`);
      if (response.ok) {
        const data = await response.json();
        setMessages(data.messages || []);
      }
    } catch (error) {
      console.error('Error loading message history:', error);
    }
  }, [roomId]);

  useEffect(() => {
    if (!session?.user?.id) return;

    // Connect socket and join room
    socketManager.connect(session.user.id);
    socketManager.joinRoom(roomId);
    setIsConnected(socketManager.isSocketConnected() ?? false);

    // Load message history
    loadMessageHistory();

    // Socket event listeners
    socketManager.onMessage((messageData: Message) => {
      setMessages(prev => [...prev, messageData]);
    });

    socketManager.onTyping(({ userId, roomId: msgRoomId, isTyping }) => {
      if (userId !== session.user.id && msgRoomId === roomId) {
        setRecipientTyping(isTyping);
      }
    });

    return () => {
      socketManager.leaveRoom(roomId);
    };
  }, [session?.user?.id, roomId, loadMessageHistory]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !session?.user?.id) return;

    const messageData = {
      roomId,
      message: newMessage.trim(),
      recipientId,
      senderId: session.user.id,
      senderName: session.user.name || 'Usuario',
      timestamp: new Date().toISOString()
    };

    // Send via socket
    socketManager.sendMessage(roomId, newMessage.trim(), recipientId);

    // Save to database
    try {
      await fetch('/api/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(messageData)
      });
    } catch (error) {
      console.error('Error saving message:', error);
    }

    setNewMessage('');
    handleStopTyping();
  };

  const handleTyping = (value: string) => {
    setNewMessage(value);

    if (!isTyping) {
      setIsTyping(true);
      socketManager.emitTyping(roomId, true);
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout
    typingTimeoutRef.current = setTimeout(() => {
      handleStopTyping();
    }, 1000);
  };

  const handleStopTyping = () => {
    if (isTyping) {
      setIsTyping(false);
      socketManager.emitTyping(roomId, false);
    }
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="fixed bottom-4 right-4 w-80 h-96 bg-white border border-gray-300 rounded-lg shadow-lg flex flex-col z-50">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-gray-200 bg-blue-600 text-white rounded-t-lg">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-sm font-medium">
            {recipientName.charAt(0).toUpperCase()}
          </div>
          <div>
            <h3 className="font-medium text-sm">{recipientName}</h3>
            <div className="flex items-center gap-1 text-xs">
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-gray-400'}`} />
              {isConnected ? 'En línea' : 'Desconectado'}
            </div>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="text-white hover:bg-blue-700 p-1"
        >
          ✕
        </Button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.senderId === session?.user?.id ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs px-3 py-2 rounded-lg text-sm ${
                message.senderId === session?.user?.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              <p>{message.message}</p>
              <p className={`text-xs mt-1 ${
                message.senderId === session?.user?.id ? 'text-blue-100' : 'text-gray-500'
              }`}>
                {formatTime(message.timestamp)}
              </p>
            </div>
          </div>
        ))}
        
        {recipientTyping && (
          <div className="flex justify-start">
            <div className="bg-gray-100 text-gray-800 px-3 py-2 rounded-lg text-sm">
              <div className="flex items-center gap-1">
                <span>{recipientName} está escribiendo</span>
                <div className="flex gap-1">
                  <div className="w-1 h-1 bg-gray-500 rounded-full animate-bounce" />
                  <div className="w-1 h-1 bg-gray-500 rounded-full animate-bounce [animation-delay:0.1s]" />
                  <div className="w-1 h-1 bg-gray-500 rounded-full animate-bounce [animation-delay:0.2s]" />
                </div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-3 border-t border-gray-200">
        <div className="flex gap-2">
          <Input
            value={newMessage}
            onChange={(e) => handleTyping(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Escribe un mensaje..."
            className="flex-1 text-sm"
            disabled={!isConnected}
          />
          <Button
            onClick={handleSendMessage}
            disabled={!newMessage.trim() || !isConnected}
            size="sm"
            className="px-3"
          >
            📤
          </Button>
        </div>
        {!isConnected && (
          <p className="text-xs text-red-500 mt-1">Reconectando...</p>
        )}
      </div>
    </div>
  );
}
