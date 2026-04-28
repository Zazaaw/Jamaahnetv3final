import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Send, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';
import { getSupabaseClient } from '../utils/supabase/client';

export default function ChatScreen({ 
  chat, 
  session,
  onBack 
}: { 
  chat: any;
  session: any;
  onBack: () => void;
}) {
  // 1. MANTRA PERTAMA: Urutkan pesan berdasarkan waktu biar gak musuhan (kiri-kanan)
  const [messages, setMessages] = useState(() => {
    return [...(chat.messages || [])].sort((a: any, b: any) => 
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );
  });
  
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [otherUser, setOtherUser] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // MANTRA KEDUA: Bikin notif angka merah hilang di database (Anti NULL)
  useEffect(() => {
    const markMessagesAsRead = async () => {
      try {
        const supabase = getSupabaseClient();
        const { error } = await supabase
          .from('messages')
          .update({ is_read: true })
          .eq('chat_id', chat.id)
          .neq('sender_id', session.user.id); 
          // JURUS SAKTI: Kita gak peduli recipient_id NULL, pokoknya semua pesan 
          // yang BUKAN dikirim sama kita (neq sender_id), jadikan is_read = true!
          
        if (error) console.error("Gagal update read status:", error);
      } catch (error) {
        console.error('Gagal update is_read:', error);
      }
    };
    
    if (chat.id && session?.user?.id && messages.length > 0) {
      markMessagesAsRead();
    }
  }, [chat.id, session?.user?.id, messages.length]);

  // Ini bawaan aslimu, kubiarin aja
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
      const supabase = getSupabaseClient();
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', otherUserId)
        .single();
      
      if (error) {
        console.error('Error fetching profile from Supabase:', error);
        // Fallback: set basic user info from chat participant names
        const fallbackName = chat.participant_names?.[otherUserId] || 'User';
        setOtherUser({
          id: otherUserId,
          name: fallbackName,
          username: undefined
        });
      } else {
        console.log('Fetched profile:', profile);
        setOtherUser(profile);
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
      const supabase = getSupabaseClient();
      
      // 1. Kirim Pesan ke tabel Messages
      const { data: message, error } = await supabase
        .from('messages')
        .insert({
          chat_id: chat.id,
          sender_id: session.user.id,
          recipient_id: chat.participants.find((id: string) => id !== session.user.id),
          text: newMessage
        })
        .select()
        .single();

      if (error) throw error;

      // 2. INI OBAT TANGGAL NYANGKUT: Update waktu terakhir di tabel Chats!
      await supabase
        .from('chats')
        .update({ last_message_at: new Date().toISOString() })
        .eq('id', chat.id);

      setMessages([...messages, message]);
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30 dark:from-gray-950 dark:to-gray-900 flex flex-col">
      
      {/* 1. HEADER-NYA DIBIKIN FIXED BIAR LENGKET DI ATAS WAK! */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        // Tambahin fixed, top-0, left-0, right-0, z-50
        className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-700 dark:to-indigo-700 text-white p-4 sm:p-5 flex items-center gap-4 shadow-lg"
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

      {/* 2. MESSAGES-NYA DIKASIH PADDING-TOP (pt-24) BIAR GAK KETIMPA HEADER */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 pt-24 pb-28">
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
