import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bell, X, Check, AlertCircle, UserCheck, Calendar, DollarSign, MessageSquare, FileText, UserPlus, CheckCheck } from 'lucide-react';
import { getUserNotifications, subscribeToNotifications, NotificationItem, markAllNotificationsAsRead } from '../utils/notificationService';
import { getSupabaseClient } from '../utils/supabase/client';
import { toast } from 'sonner@2.0.3';

interface NotificationDropdownProps {
  session: any;
  onNavigate?: (screen: string) => void;
}

export default function NotificationDropdown({ session, onNavigate }: NotificationDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [userRole, setUserRole] = useState('user');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
  if (session?.user?.id) {
    fetchUserRole();
    fetchNotifications();
    
    // Ambil hasil subscribe
    const subs = subscribeToNotifications(
      session.user.id,
      fetchNotifications
    );

    return () => {
      // PENGAMAN: Cek dulu apakah dia array atau bukan sebelum forEach
      if (Array.isArray(subs)) {
        subs.forEach(sub => sub?.unsubscribe?.());
      } else if (subs && typeof subs.unsubscribe === 'function') {
        subs.unsubscribe();
      }
    };
  }
}, [session?.user?.id]);

  const fetchUserRole = async () => {
    try {
      const supabase = getSupabaseClient();
      const { data } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single();
      
      if (data?.role) {
        setUserRole(data.role);
      }
    } catch (error) {
      console.error('Error fetching user role:', error);
    }
  };

  const fetchNotifications = async () => {
    if (!session?.user?.id) return;
    
    setLoading(true);
    try {
      const notifs = await getUserNotifications(session.user.id, userRole);
      setNotifications(notifs);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationClick = (notification: NotificationItem) => {
    // Handle navigation based on notification type
    if (notification.type === 'pending_user' || notification.type === 'pending_event' || 
        notification.type === 'pending_campaign') {
      onNavigate?.('admin-dashboard');
    } else if (notification.type === 'message' && notification.data?.chatId) {
      // Navigate to chat
      onNavigate?.('chat-list');
    } else if (notification.type === 'follow' && notification.data?.followerId) {
      // Navigate to follower's profile - you can implement this later
      onNavigate?.('home');
    }
    setIsOpen(false);
  };

  const handleMarkAllAsRead = async () => {
    if (!session?.user?.id) return;
    
    const success = await markAllNotificationsAsRead(session.user.id);
    if (success) {
      toast.success('Semua notifikasi ditandai sudah dibaca');
      fetchNotifications(); // Refresh to update read status
    } else {
      toast.error('Gagal menandai notifikasi');
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'message':
        return <MessageSquare className="w-4 h-4" />;
      case 'follow':
        return <UserPlus className="w-4 h-4" />;
      case 'post_approved':
        return <Check className="w-4 h-4" />;
      case 'post_rejected':
        return <AlertCircle className="w-4 h-4" />;
      case 'pending_user':
        return <UserCheck className="w-4 h-4" />;
      case 'pending_event':
        return <Calendar className="w-4 h-4" />;
      case 'pending_campaign':
        return <DollarSign className="w-4 h-4" />;
      default:
        return <Bell className="w-4 h-4" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'post_approved':
        return 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400';
      case 'post_rejected':
        return 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400';
      case 'pending_user':
      case 'pending_event':
      case 'pending_campaign':
        return 'bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400';
      case 'follow':
        return 'bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400';
      case 'message':
        return 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400';
      default:
        return 'bg-gray-50 text-gray-600 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="relative">
      {/* Bell Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2.5 rounded-2xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 hover:bg-white dark:hover:bg-gray-800 transition-all shadow-sm"
        whileTap={{ scale: 0.95 }}
      >
        <Bell className="w-5 h-5 text-gray-700 dark:text-gray-300" />
        
        {/* Unread Badge */}
        {unreadCount > 0 && (
          <motion.div
            className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow-lg min-w-[18px] text-center"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
          >
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </motion.div>
          </motion.div>
        )}
      </motion.button>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
            />

            {/* Dropdown Panel */}
            <motion.div
              className="absolute right-0 top-full mt-2 w-80 max-w-[calc(100vw-2rem)] bg-white dark:bg-gray-800 rounded-3xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 overflow-hidden z-50"
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
            >
              {/* Header */}
              <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-700">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">Notifikasi</h3>
                    {unreadCount > 0 && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        {unreadCount} belum dibaca
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                </div>
                
                {/* Mark All as Read Button */}
                {unreadCount > 0 && (
                  <motion.button
                    onClick={handleMarkAllAsRead}
                    className="w-full mt-2 px-3 py-2 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 rounded-xl text-xs font-semibold hover:bg-emerald-100 dark:hover:bg-emerald-900/30 transition-colors flex items-center justify-center gap-2"
                    whileTap={{ scale: 0.98 }}
                  >
                    <CheckCheck className="w-4 h-4" />
                    Tandai semua dibaca
                  </motion.button>
                )}
              </div>

              {/* Notifications List */}
              <div className="max-h-[400px] overflow-y-auto">
                {loading ? (
                  <div className="p-8 text-center">
                    <div className="w-8 h-8 border-4 border-gray-200 border-t-emerald-500 rounded-full animate-spin mx-auto" />
                    <p className="text-sm text-gray-500 mt-3">Memuat...</p>
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="p-8 text-center">
                    <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Bell className="w-7 h-7 text-gray-400" />
                    </div>
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                      Tidak ada notifikasi
                    </h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Notifikasi baru akan muncul di sini
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100 dark:divide-gray-700">
                    {notifications.map((notification) => (
                      <motion.button
                        key={notification.id}
                        onClick={() => handleNotificationClick(notification)}
                        className="w-full px-5 py-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors text-left"
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className="flex gap-3">
                          <div className={`shrink-0 w-10 h-10 rounded-2xl ${getNotificationColor(notification.type)} flex items-center justify-center`}>
                            {getNotificationIcon(notification.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-0.5">
                              {notification.title}
                            </h4>
                            <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
                              {notification.message}
                            </p>
                            <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1">
                              {new Date(notification.created_at).toLocaleDateString('id-ID', {
                                day: 'numeric',
                                month: 'short',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          </div>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}