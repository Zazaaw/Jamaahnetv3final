import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Send, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';
import { projectId } from '../utils/supabase/info';

export default function ChatScreen({ 
  chat, 
  session,
  onBack 
}: { 
  chat: any;
  session: any;
  onBack: () => void;
}) {
  const [messages, setMessages] = useState(chat.messages || []);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [otherUser, setOtherUser] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    fetchOtherUserProfile();
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchOtherUserProfile = async () => {
    const otherUserId = chat.participants.find((id: string) => id !== session.user.id);
    if (!otherUserId) {
      console.log('No other user ID found in chat participants');
      return;
    }

    console.log('Fetching profile for user:', otherUserId);

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-4319e602/api/users/${otherUserId}`
      );
      
      console.log('Profile fetch response status:', response.status);
      
      if (response.ok) {
        const profile = await response.json();
        console.log('Fetched profile:', profile);
        setOtherUser(profile);
      } else {
        console.error('Failed to fetch profile - Status:', response.status);
        try {
          const errorData = await response.json();
          console.error('Error details:', errorData);
        } catch {
          const errorText = await response.text();
          console.error('Error details (text):', errorText);
        }
        // Fallback: set basic user info from chat participant names
        const fallbackName = chat.participant_names?.[otherUserId] || 'User';
        setOtherUser({
          id: otherUserId,
          name: fallbackName,
          username: undefined
        });
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      // Fallback: set basic user info
      setOtherUser({
        id: otherUserId,
        name: 'User',
        username: undefined
      });
    }
  };

  const getOtherParticipantName = () => {
    const otherUserId = chat.participants.find((id: string) => id !== session.user.id);
    
    // Try to get from participant_names first
    if (chat.participant_names && chat.participant_names[otherUserId]) {
      return chat.participant_names[otherUserId];
    }
    
    // Otherwise use fetched profile
    if (otherUser?.name) {
      return otherUser.name;
    }
    
    // Fallback
    return 'User';
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    setLoading(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-4319e602/api/chats/${chat.id}/messages`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            text: newMessage,
          }),
        }
      );

      if (response.ok) {
        const message = await response.json();
        setMessages([...messages, message]);
        setNewMessage('');
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30 dark:from-gray-950 dark:to-gray-900 flex flex-col">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-700 dark:to-indigo-700 text-white p-5 flex items-center gap-4 shadow-lg"
      >
        <button onClick={onBack} className="p-2 hover:bg-white/20 rounded-xl transition-colors">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center overflow-hidden">
          {otherUser?.avatar_url ? (
            <img 
              src={otherUser.avatar_url} 
              alt={getOtherParticipantName()} 
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-lg font-semibold">
              {getOtherParticipantName().charAt(0).toUpperCase()}
            </span>
          )}
        </div>
        <div className="flex-1">
          <h1 className="font-bold">{getOtherParticipantName()}</h1>
          {otherUser?.username && (
            <p className="text-xs text-white/70">@{otherUser.username}</p>
          )}
        </div>
      </motion.div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 pb-28">
        {messages.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
              <Send className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
            <p className="text-gray-500 dark:text-gray-400">
              Belum ada pesan. Mulai percakapan!
            </p>
          </div>
        ) : (
          messages.map((message: any, index: number) => {
            const isOwnMessage = message.sender_id === session.user.id;
            return (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.02 }}
                className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[75%] rounded-3xl px-5 py-3 shadow-md ${
                    isOwnMessage
                      ? 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-br-md'
                      : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-white rounded-bl-md border border-gray-100 dark:border-gray-700'
                  }`}
                >
                  <p className="text-sm leading-relaxed">{message.text}</p>
                  <p
                    className={`text-xs mt-1.5 ${
                      isOwnMessage ? 'text-white/70' : 'text-gray-500 dark:text-gray-400'
                    }`}
                  >
                    {new Date(message.created_at).toLocaleTimeString('id-ID', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </motion.div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-t border-gray-200 dark:border-gray-700 p-4 safe-area-bottom">
        <form onSubmit={handleSendMessage} className="flex gap-3 max-w-4xl mx-auto">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Tulis pesan..."
            className="flex-1 px-5 py-3 border border-gray-300 dark:border-gray-600 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 dark:text-white"
            disabled={loading}
          />
          <motion.button
            type="submit"
            disabled={loading || !newMessage.trim()}
            whileTap={{ scale: 0.95 }}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-full hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </motion.button>
        </form>
      </div>
    </div>
  );
}
