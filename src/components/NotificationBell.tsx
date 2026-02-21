import React, { useState, useEffect } from 'react';
import { Bell, X, CheckCheck, Sparkles, CreditCard } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { projectId } from '../utils/supabase/info';

interface Notification {
  id: string;
  type: 'approval' | 'info' | 'success' | 'warning';
  title: string;
  message: string;
  memberId?: string;
  read: boolean;
  createdAt: string;
}

export default function NotificationBell({ session }: { session: any }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (session) {
      fetchNotifications();
      // Poll for new notifications every 30 seconds
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [session]);

  const fetchNotifications = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-4319e602/api/notifications`,
        {
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setNotifications(data);
        setUnreadCount(data.filter((n: Notification) => !n.read).length);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-4319e602/api/notifications/${notificationId}/read`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
          },
        }
      );

      if (response.ok) {
        fetchNotifications();
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-4319e602/api/notifications/read-all`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
          },
        }
      );

      if (response.ok) {
        fetchNotifications();
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'approval':
        return <CheckCheck className="w-5 h-5 text-emerald-600" />;
      case 'success':
        return <Sparkles className="w-5 h-5 text-purple-600" />;
      default:
        return <Bell className="w-5 h-5 text-blue-600" />;
    }
  };

  const getNotificationBg = (type: string) => {
    switch (type) {
      case 'approval':
        return 'from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20';
      case 'success':
        return 'from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20';
      default:
        return 'from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20';
    }
  };

  return (
    <>
      {/* Notification Bell Button */}
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={() => setShowNotifications(true)}
        className="relative p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
      >
        <Bell className="w-6 h-6 text-gray-700 dark:text-gray-300" />
        {unreadCount > 0 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center"
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </motion.div>
        )}
      </motion.button>

      {/* Notifications Panel */}
      <AnimatePresence>
        {showNotifications && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowNotifications(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            />

            {/* Panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed top-0 right-0 bottom-0 w-full max-w-md bg-white dark:bg-gray-900 z-50 shadow-2xl overflow-y-auto"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-6 text-white sticky top-0 z-10">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-2xl font-bold">Notifikasi</h2>
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setShowNotifications(false)}
                    className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center"
                  >
                    <X className="w-5 h-5" />
                  </motion.button>
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-white/90 text-sm hover:text-white underline"
                  >
                    Tandai semua sudah dibaca
                  </button>
                )}
              </div>

              {/* Notifications List */}
              <div className="p-4 space-y-3">
                {notifications.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-16"
                  >
                    <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Bell className="w-10 h-10 text-gray-400 dark:text-gray-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      Belum ada notifikasi
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Notifikasi Anda akan muncul di sini
                    </p>
                  </motion.div>
                ) : (
                  notifications.map((notification, index) => (
                    <motion.div
                      key={notification.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => !notification.read && markAsRead(notification.id)}
                      className={`bg-gradient-to-br ${getNotificationBg(notification.type)} rounded-2xl p-4 cursor-pointer hover:shadow-md transition-shadow ${
                        !notification.read ? 'border-2 border-purple-200 dark:border-purple-700' : ''
                      }`}
                    >
                      <div className="flex gap-3">
                        {/* Icon */}
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 bg-white dark:bg-gray-800 rounded-xl flex items-center justify-center shadow-sm">
                            {getNotificationIcon(notification.type)}
                          </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
                              {notification.title}
                            </h3>
                            {!notification.read && (
                              <div className="w-2 h-2 bg-purple-600 rounded-full flex-shrink-0 mt-1" />
                            )}
                          </div>
                          <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                            {notification.message}
                          </p>
                          
                          {/* Member ID Badge */}
                          {notification.memberId && (
                            <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-lg p-2 mb-2 border border-gray-200 dark:border-gray-700">
                              <div className="flex items-center gap-2">
                                <CreditCard className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                                <span className="text-xs text-gray-600 dark:text-gray-400">ID Member:</span>
                                <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                                  {notification.memberId}
                                </span>
                              </div>
                            </div>
                          )}

                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {new Date(notification.createdAt).toLocaleString('id-ID', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
