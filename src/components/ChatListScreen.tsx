import React, { useState, useEffect } from 'react';
import { ArrowLeft, MessageCircle, Loader2, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner@2.0.3';
import { projectId } from '../utils/supabase/info';
import { IslamicPattern } from './IslamicPattern';

interface Chat {
  id: string;
  participants: string[];
  product_id?: string;
  messages: any[];
  last_message_at: number;
}

interface UserProfile {
  id: string;
  name: string;
  username?: string;
  avatar_url?: string;
}

export default function ChatListScreen({ 
  session, 
  onBack,
  onSelectChat 
}: { 
  session: any;
  onBack: () => void;
  onSelectChat: (chat: Chat) => void;
}) {
  const [chats, setChats] = useState<Chat[]>([]);
  const [userProfiles, setUserProfiles] = useState<Record<string, UserProfile>>({});
  const [loading, setLoading] = useState(true);
  const [deletingChatId, setDeletingChatId] = useState<string | null>(null);

  useEffect(() => {
    fetchChats();
  }, []);

  const fetchChats = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-4319e602/api/chats`,
        {
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
          },
        }
      );
      const data = await response.json();
      setChats(data);

      // Fetch user profiles for all participants
      const userIds = new Set<string>();
      data.forEach((chat: Chat) => {
        chat.participants.forEach(id => {
          if (id !== session.user.id) {
            userIds.add(id);
          }
        });
      });

      const profiles: Record<string, UserProfile> = {};
      await Promise.all(
        Array.from(userIds).map(async (userId) => {
          try {
            const response = await fetch(
              `https://${projectId}.supabase.co/functions/v1/make-server-4319e602/api/users/${userId}`
            );
            if (response.ok) {
              const profile = await response.json();
              profiles[userId] = profile;
              console.log('Fetched profile for', userId, ':', profile);
            } else {
              console.error('Failed to fetch profile for', userId, '- Status:', response.status);
              try {
                const errorData = await response.json();
                console.error('Error details:', errorData);
              } catch {
                const errorText = await response.text();
                console.error('Error details (text):', errorText);
              }
            }
          } catch (error) {
            console.error('Error fetching user profile for', userId, ':', error);
          }
        })
      );
      console.log('All profiles:', profiles);
      setUserProfiles(profiles);
    } catch (error) {
      console.error('Error fetching chats:', error);
    } finally {
      setLoading(false);
    }
  };

  const getLastMessage = (chat: Chat) => {
    if (chat.messages.length === 0) return 'Belum ada pesan';
    const lastMsg = chat.messages[chat.messages.length - 1];
    return lastMsg.text;
  };

  const getOtherParticipant = (chat: Chat) => {
    const otherUserId = chat.participants.find(id => id !== session.user.id);
    if (!otherUserId) return { id: 'unknown', name: 'Unknown' };
    
    // Try to get from participant_names first (if available in chat object)
    if ((chat as any).participant_names && (chat as any).participant_names[otherUserId]) {
      return {
        id: otherUserId,
        name: (chat as any).participant_names[otherUserId],
        username: userProfiles[otherUserId]?.username
      };
    }
    
    // Otherwise use fetched profiles
    return userProfiles[otherUserId] || { id: otherUserId, name: 'User' };
  };

  const handleDeleteChat = async (chatId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!confirm('Hapus percakapan ini?')) return;
    
    setDeletingChatId(chatId);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-4319e602/api/chats/${chatId}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
          },
        }
      );

      if (response.ok) {
        toast.success('Percakapan berhasil dihapus');
        setChats(chats.filter(chat => chat.id !== chatId));
      } else {
        const error = await response.json();
        toast.error(error.error || 'Gagal menghapus percakapan');
      }
    } catch (error) {
      console.error('Error deleting chat:', error);
      toast.error('Gagal menghapus percakapan');
    } finally {
      setDeletingChatId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/20 to-indigo-50/20 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      {/* Background Pattern */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <IslamicPattern className="text-blue-600 dark:text-blue-400 opacity-[0.02]" />
      </div>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative bg-gradient-to-br from-blue-600 via-indigo-600 to-blue-700 dark:from-blue-700 dark:via-indigo-700 dark:to-blue-800 text-white p-6"
        style={{ borderBottomLeftRadius: '2rem', borderBottomRightRadius: '2rem' }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
        <IslamicPattern className="text-white opacity-10" />
        
        <div className="relative z-10">
          <button onClick={onBack} className="mb-4 p-2 hover:bg-white/20 rounded-xl transition-colors">
            <ArrowLeft className="w-6 h-6" />
          </button>
          
          <div className="flex items-center gap-4 mb-2">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center">
              <MessageCircle className="w-8 h-8" />
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold">Kotak Masuk</h1>
              <p className="text-white/80 text-sm">
                {chats.length} Percakapan
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Chats List */}
      <div className="relative z-10 p-6 pb-28">
        {loading ? (
          <div className="text-center py-12">
            <Loader2 className="w-12 h-12 text-blue-600 dark:text-blue-400 animate-spin mx-auto mb-3" />
            <p className="text-gray-500 dark:text-gray-400">Memuat pesan...</p>
          </div>
        ) : chats.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageCircle className="w-10 h-10 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Belum ada pesan
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Pesan Anda akan muncul di sini
            </p>
          </motion.div>
        ) : (
          <div className="space-y-3">
            {chats.map((chat, index) => {
              const otherUser = getOtherParticipant(chat);
              return (
                <motion.div
                  key={chat.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="relative group"
                >
                  <button
                    onClick={() => onSelectChat(chat)}
                    className="w-full bg-white dark:bg-gray-800/50 backdrop-blur-sm rounded-3xl p-5 shadow-lg border border-gray-100 dark:border-gray-700/50 text-left hover:shadow-xl transition-all"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden">
                        {otherUser.avatar_url ? (
                          <img 
                            src={otherUser.avatar_url} 
                            alt={otherUser.name} 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-white text-lg">
                            {otherUser.name.charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0 pr-12">
                        <div className="flex justify-between items-start gap-2 mb-1">
                          <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                            {otherUser.name}
                          </h3>
                          <span className="text-xs text-gray-500 dark:text-gray-400 flex-shrink-0">
                            {new Date(chat.last_message_at).toLocaleDateString('id-ID', {
                              day: 'numeric',
                              month: 'short',
                            })}
                          </span>
                        </div>
                        {otherUser.username && (
                          <p className="text-xs text-gray-500 dark:text-gray-500 mb-1">
                            @{otherUser.username}
                          </p>
                        )}
                        <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                          {getLastMessage(chat)}
                        </p>
                      </div>
                    </div>
                  </button>
                  
                  {/* Delete Button */}
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={(e) => handleDeleteChat(chat.id, e)}
                    disabled={deletingChatId === chat.id}
                    className="absolute top-5 right-5 p-2 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50"
                  >
                    {deletingChatId === chat.id ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Trash2 className="w-5 h-5" />
                    )}
                  </motion.button>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
