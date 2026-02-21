import React, { useState, useEffect } from 'react';
import { Calendar, DollarSign, Store, ChevronRight, Bell, Sparkles, TrendingUp, MessageCircle, ShoppingBag, Heart, Users, Plus, Bookmark, Repeat2, Share2, MoreVertical, Edit, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { getSupabaseClient } from '../utils/supabase/client';
import { IslamicPattern, MosqueIcon } from './IslamicPattern';
import DynamicIslamicHeader from './DynamicIslamicHeader';
import NotificationBell from './NotificationBell';

interface Announcement {
  id: string;
  title: string;
  content: string;
  image: string;
  created_at: number;
}

interface Article {
  id: string;
  title: string;
  excerpt: string;
  author: string;
  created_at: number;
  image?: string;
  content?: string;
}

interface Notification {
  type: 'product' | 'donation' | 'chat';
  count: number;
  message: string;
}

interface TimelinePost {
  id: string;
  user_id: string;
  user_name: string;
  profiles?: {
    name: string;
    avatar_url: string;
  };
  title: string;
  content: string;
  image?: string;
  created_at: number;
  likes?: string[];
  comments?: any[];
}

export default function HomeScreen({ 
  session,
  onNavigate 
}: { 
  session: any;
  onNavigate?: (screen: string, data?: any) => void;
}) {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [timeline, setTimeline] = useState<TimelinePost[]>([]);

  useEffect(() => {
    fetchAnnouncements();
    fetchArticles();
    fetchTimeline();
    if (session) {
      fetchNotifications();
    }
  }, [session]);

  useEffect(() => {
    if (announcements.length > 0) {
      const timer = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % announcements.length);
      }, 5000);
      return () => clearInterval(timer);
    }
  }, [announcements.length]);

  const fetchAnnouncements = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-4319e602/api/announcements`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );
      const data = await response.json();
      setAnnouncements(data);
    } catch (error) {
      console.error('Error fetching announcements:', error);
    }
  };

  const fetchArticles = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-4319e602/api/articles`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );
      const data = await response.json();
      setArticles(data.slice(0, 3));
    } catch (error) {
      console.error('Error fetching articles:', error);
    }
  };

  const fetchTimeline = async () => {
    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase
        .from('timeline_posts')
        .select('*, profiles(name, avatar_url)')
        .eq('status', 'published')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching timeline:', error);
        return;
      }
      
      if (data) {
        setTimeline(data);
      }
    } catch (error) {
      console.error('Error fetching timeline:', error);
    }
  };

  const fetchNotifications = async () => {
    if (!session) return;

    try {
      const notifs: Notification[] = [];

      // Check for new products (C2C)
      const productsResponse = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-4319e602/api/marketplace/c2c`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );
      const products = await productsResponse.json();
      const newProducts = products.filter((p: any) => 
        Date.now() - p.created_at < 24 * 60 * 60 * 1000 // 24 hours
      );
      
      if (newProducts.length > 0) {
        notifs.push({
          type: 'product',
          count: newProducts.length,
          message: `${newProducts.length} produk baru di Pasar Jamaah`
        });
      }

      // Check for new donation campaigns
      const campaignsResponse = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-4319e602/api/donations/campaigns`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );
      const campaigns = await campaignsResponse.json();
      const newCampaigns = campaigns.filter((c: any) => 
        Date.now() - c.created_at < 24 * 60 * 60 * 1000 // 24 hours
      );
      
      if (newCampaigns.length > 0) {
        notifs.push({
          type: 'donation',
          count: newCampaigns.length,
          message: `${newCampaigns.length} kampanye donasi baru`
        });
      }

      // Check for unread chats
      const chatsResponse = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-4319e602/api/chats`,
        {
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
          },
        }
      );
      const chats = await chatsResponse.json();
      const unreadChats = chats.filter((chat: any) => {
        const lastMessage = chat.messages[chat.messages.length - 1];
        return lastMessage && lastMessage.sender_id !== session.user.id;
      });
      
      if (unreadChats.length > 0) {
        notifs.push({
          type: 'chat',
          count: unreadChats.length,
          message: `${unreadChats.length} pesan baru`
        });
      }

      setNotifications(notifs);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const prayerTimes = [
    { name: 'Subuh', time: '04:45', active: false },
    { name: 'Dzuhur', time: '12:00', active: false },
    { name: 'Ashar', time: '15:15', active: true },
    { name: 'Maghrib', time: '18:05', active: false },
    { name: 'Isya', time: '19:20', active: false },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-emerald-50/30 to-teal-50/30 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      {/* Decorative Islamic Pattern Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <IslamicPattern className="text-emerald-600 dark:text-emerald-400 opacity-[0.03]" />
      </div>

      {/* Dynamic Islamic Header */}
      <DynamicIslamicHeader 
        notifications={notifications}
        showNotifications={showNotifications}
        onToggleNotifications={() => setShowNotifications(!showNotifications)}
      />

      {/* Notifications Dropdown */}
      <div className="relative">
        <AnimatePresence>
          {showNotifications && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-2 right-6 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-4 w-80 max-w-[calc(100vw-3rem)] z-20 border border-gray-200 dark:border-gray-700"
            >
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Notifikasi
              </h3>
              
              {notifications.length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                  Tidak ada notifikasi baru
                </p>
              ) : (
                <div className="space-y-2">
                  {notifications.map((notif, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="p-3 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-xl border border-emerald-200 dark:border-emerald-700/50"
                    >
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg ${
                          notif.type === 'product' ? 'bg-purple-500' :
                          notif.type === 'donation' ? 'bg-pink-500' :
                          'bg-blue-500'
                        }`}>
                          {notif.type === 'product' ? <ShoppingBag className="w-4 h-4 text-white" /> :
                           notif.type === 'donation' ? <Heart className="w-4 h-4 text-white" /> :
                           <MessageCircle className="w-4 h-4 text-white" />}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {notif.message}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Baru saja
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="relative z-10 p-6 space-y-6">
        {/* Announcement Carousel - Modern Card Style */}
        {announcements.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="relative"
          >
            <div className="overflow-hidden rounded-3xl shadow-2xl">
              <div
                className="flex transition-transform duration-700 ease-out"
                style={{ transform: `translateX(-${currentSlide * 100}%)` }}
              >
                {announcements.map((announcement) => (
                  <div key={announcement.id} className="min-w-full">
                    <div className="relative h-56 group">
                      <img
                        src={announcement.image}
                        alt={announcement.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 p-6">
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="space-y-2"
                        >
                          <div className="inline-block px-3 py-1 bg-emerald-500 rounded-full text-xs font-semibold mb-2">
                            Pengumuman
                          </div>
                          <h3 className="text-xl font-bold text-white mb-2">{announcement.title}</h3>
                          <p className="text-sm text-gray-200 line-clamp-2">{announcement.content}</p>
                        </motion.div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Modern Carousel Indicators */}
            <div className="flex justify-center gap-2 mt-4">
              {announcements.map((_, index) => (
                <motion.button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  whileTap={{ scale: 0.9 }}
                  className={`rounded-full transition-all ${
                    index === currentSlide 
                      ? 'bg-emerald-600 dark:bg-emerald-400 w-8 h-2' 
                      : 'bg-gray-300 dark:bg-gray-600 w-2 h-2'
                  }`}
                />
              ))}
            </div>
          </motion.div>
        )}

        {/* Quick Access Grid - Floating Style */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="grid grid-cols-3 gap-4"
        >
          <QuickAccessButton
            icon={Calendar}
            label="Kegiatan"
            color="from-blue-500 to-blue-600"
            delay={0.1}
            onClick={() => onNavigate?.('calendar')}
          />
          <QuickAccessButton
            icon={Store}
            label="Pasar"
            color="from-orange-500 to-orange-600"
            delay={0.2}
            onClick={() => onNavigate?.('marketplace')}
          />
          <QuickAccessButton
            icon={DollarSign}
            label="Donasi"
            color="from-emerald-500 to-emerald-600"
            delay={0.3}
            onClick={() => onNavigate?.('donation')}
          />
        </motion.div>

        {/* Latest Articles - Modern Card Design */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-xl font-bold dark:text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                Artikel Terbaru
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Baca kajian dan informasi terkini</p>
            </div>
            <motion.button 
              whileTap={{ scale: 0.95 }}
              onClick={() => onNavigate?.('all-articles')}
              className="text-emerald-600 dark:text-emerald-400 text-sm font-semibold flex items-center gap-1 px-4 py-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-full"
            >
              Semua
              <ChevronRight className="w-4 h-4" />
            </motion.button>
          </div>
          
          <div className="space-y-3">
            {articles.map((article, index) => (
              <motion.div
                key={article.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 + index * 0.1 }}
                onClick={() => onNavigate?.('article-detail', article)}
                className="card-hover bg-white dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl p-5 shadow-lg border border-gray-100 dark:border-gray-700/50 cursor-pointer group"
              >
                <div className="flex gap-4">
                  {article.image ? (
                    <div className="flex-shrink-0 w-20 h-20 rounded-2xl overflow-hidden group-hover:scale-110 transition-transform">
                      <img 
                        src={article.image} 
                        alt={article.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="flex-shrink-0 w-20 h-20 bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/30 dark:to-teal-900/30 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                      <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                        {String(index + 1).padStart(2, '0')}
                      </span>
                    </div>
                  )}
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                      {article.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-3 line-clamp-2">
                      {article.excerpt}
                    </p>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-gray-500 dark:text-gray-400 flex items-center gap-1">
                        <div className="w-6 h-6 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center">
                          <span className="text-[10px]">👤</span>
                        </div>
                        {article.author}
                      </span>
                      <span className="text-gray-400 dark:text-gray-500">
                        {new Date(article.created_at).toLocaleDateString('id-ID', { 
                          day: 'numeric',
                          month: 'short'
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Timeline Kegiatan Jamaah - Twitter Style Thread */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="space-y-4"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg">
                <Users className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Timeline Kegiatan</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">Aktivitas jamaah terkini</p>
              </div>
            </div>
            {session && (
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => onNavigate?.('create-timeline')}
                className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-xl flex items-center gap-2 shadow-lg"
              >
                <Plus className="w-4 h-4" />
                <span className="text-sm">Posting</span>
              </motion.button>
            )}
          </div>

          {timeline.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.8 }}
              className="bg-white dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl p-12 text-center shadow-lg border border-gray-100 dark:border-gray-700/50"
            >
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-gray-400 dark:text-gray-500" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Belum ada postingan
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                Jadilah yang pertama berbagi kegiatan ibadah
              </p>
              {session && (
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => onNavigate?.('create-timeline')}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-xl inline-flex items-center gap-2 shadow-lg"
                >
                  <Plus className="w-5 h-5" />
                  <span>Buat Postingan Pertama</span>
                </motion.button>
              )}
            </motion.div>
          ) : (
            <div className="space-y-3">
              {timeline.map((post, index) => (
                <TwitterStylePost
                  key={post.id}
                  post={post}
                  session={session}
                  onNavigate={onNavigate}
                  onRefresh={fetchTimeline}
                  delay={0.8 + index * 0.05}
                />
              ))}
            </div>
          )}
        </motion.div>

        {/* Bottom Spacing for Tab Bar */}
        <div className="h-20" />
      </div>

      {/* Floating Action Button - Fixed di pojok kanan bawah */}
      {session && (
        <motion.button
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 1, type: "spring", stiffness: 200 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => onNavigate?.('create-timeline')}
          className="fixed bottom-24 right-6 z-40 bg-gradient-to-br from-purple-500 via-pink-500 to-rose-500 text-white w-16 h-16 rounded-2xl shadow-2xl flex items-center justify-center group hover:shadow-purple-500/50 transition-all overflow-hidden"
        >
          {/* Glow effect on hover */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          
          <Plus className="w-7 h-7 relative z-10 group-hover:rotate-90 transition-transform duration-300" />
        </motion.button>
      )}
    </div>
  );
}

// Twitter-style Post Component
function TwitterStylePost({
  post,
  session,
  onNavigate,
  onRefresh,
  delay,
}: {
  post: any;
  session: any;
  onNavigate?: (screen: string, data?: any) => void;
  onRefresh: () => void;
  delay: number;
}) {
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [likes, setLikes] = useState<string[]>(post.likes || []);
  const [isLiked, setIsLiked] = useState(false);
  const [comments, setComments] = useState<any[]>(post.comments || []);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAdminMenu, setShowAdminMenu] = useState(false);

  useEffect(() => {
    // Update state when post changes
    setLikes(post.likes || []);
    setComments(post.comments || []);
    
    // Check if liked
    if (session) {
      setIsLiked((post.likes || []).includes(session.user.id));
      fetchUserRole();
    }
    
    // Fetch bookmark status from API
    if (session) {
      fetchBookmarkStatus();
    }
  }, [post.id, post.likes, post.comments, session]);

  const fetchUserRole = async () => {
    if (!session) return;
    
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-4319e602/api/profile`,
        {
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
          },
        }
      );
      
      if (response.ok) {
        const profile = await response.json();
        setIsAdmin(profile.role === 'Admin');
      }
    } catch (error) {
      console.error('Error fetching user role:', error);
    }
  };

  const fetchBookmarkStatus = async () => {
    if (!session) return;
    
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-4319e602/api/timeline/bookmarks/list`,
        {
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
          },
        }
      );
      
      if (response.ok) {
        const bookmarkedPosts = await response.json();
        const isBookmarked = bookmarkedPosts.some((p: any) => p.id === post.id);
        setIsBookmarked(isBookmarked);
      }
    } catch (error) {
      console.error('Error fetching bookmark status:', error);
    }
  };

  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!session) return;

    // Optimistic update
    const newIsLiked = !isLiked;
    const newLikes = newIsLiked 
      ? [...likes, session.user.id]
      : likes.filter(id => id !== session.user.id);
    
    setIsLiked(newIsLiked);
    setLikes(newLikes);

    try {
      const supabase = getSupabaseClient();
      const { error } = await supabase
        .from('timeline_posts')
        .update({ likes: newLikes })
        .eq('id', post.id);

      if (error) {
        // Revert on error
        console.error('Error toggling like:', error);
        setIsLiked(!newIsLiked);
        setLikes(likes);
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      // Revert on error
      setIsLiked(!newIsLiked);
      setLikes(likes);
    }
  };

  const handleBookmark = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!session) return;

    // Optimistic update
    const newIsBookmarked = !isBookmarked;
    setIsBookmarked(newIsBookmarked);

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-4319e602/api/timeline/${post.id}/bookmark`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setIsBookmarked(data.isBookmarked);
      } else {
        // Revert on error
        setIsBookmarked(!newIsBookmarked);
      }
    } catch (error) {
      console.error('Error toggling bookmark:', error);
      // Revert on error
      setIsBookmarked(!newIsBookmarked);
    }
  };

  const handleDeletePost = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!session) return;

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-4319e602/api/timeline/${post.id}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
          },
        }
      );

      if (response.ok) {
        onRefresh();
      } else {
        console.error('Failed to delete post:', await response.text());
      }
    } catch (error) {
      console.error('Error deleting post:', error);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      onClick={() => onNavigate?.('timeline-detail', post)}
      className="bg-white dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700/50 p-5 hover:shadow-xl dark:hover:bg-gray-800/70 transition-all cursor-pointer group overflow-hidden"
    >
      <div className="flex gap-3">
        {/* Avatar */}
        <div className="flex-shrink-0">
          {post.profiles?.avatar_url ? (
            <img 
              src={post.profiles.avatar_url} 
              alt={post.profiles.name} 
              className="w-12 h-12 rounded-full object-cover border border-gray-200 dark:border-gray-700"
            />
          ) : (
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold">
                {(post.profiles?.name || post.user_name || '?')[0].toUpperCase()}
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center gap-2 mb-1">
            <span className="font-bold text-gray-900 dark:text-white hover:underline">
              {post.profiles?.name || post.user_name || 'Unknown User'}
            </span>
            <span className="text-gray-500 dark:text-gray-400 text-sm">
              · {new Date(post.created_at).toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'short',
              })}
            </span>
          </div>

          {/* Title & Content */}
          <div className="mb-3">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
              {post.title}
            </h3>
            <p className="text-gray-700 dark:text-gray-300 text-sm whitespace-pre-wrap">
              {post.content}
            </p>
          </div>

          {/* Image */}
          {post.image && (
            <div className="mb-3 rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700">
              <img
                src={post.image}
                alt={post.title}
                className="w-full max-h-96 object-cover"
              />
            </div>
          )}

          {/* Actions - Twitter Style */}
          <div className="flex items-center justify-between max-w-md mt-2">
            {/* Comment */}
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={(e) => {
                e.stopPropagation();
                onNavigate?.('timeline-detail', post);
              }}
              className="flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors group/btn"
            >
              <div className="p-2 rounded-full group-hover/btn:bg-blue-50 dark:group-hover/btn:bg-blue-900/20 transition-colors">
                <MessageCircle className="w-5 h-5" />
              </div>
              <span className="text-sm">{comments.length || 0}</span>
            </motion.button>

            {/* Retweet (disabled for now) */}
            <motion.button
              whileTap={{ scale: 0.9 }}
              className="flex items-center gap-2 text-gray-400 dark:text-gray-500 cursor-not-allowed"
            >
              <div className="p-2 rounded-full transition-colors">
                <Repeat2 className="w-5 h-5" />
              </div>
              <span className="text-sm">0</span>
            </motion.button>

            {/* Like */}
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={handleLike}
              className={`flex items-center gap-2 transition-colors group/btn ${
                isLiked
                  ? 'text-pink-500 dark:text-pink-400'
                  : 'text-gray-500 dark:text-gray-400 hover:text-pink-500 dark:hover:text-pink-400'
              }`}
            >
              <div className="p-2 rounded-full group-hover/btn:bg-pink-50 dark:group-hover/btn:bg-pink-900/20 transition-colors">
                <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
              </div>
              <span className="text-sm">{likes.length}</span>
            </motion.button>

            {/* Bookmark */}
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={handleBookmark}
              className={`flex items-center gap-2 transition-colors group/btn ${
                isBookmarked
                  ? 'text-emerald-500 dark:text-emerald-400'
                  : 'text-gray-500 dark:text-gray-400 hover:text-emerald-500 dark:hover:text-emerald-400'
              }`}
            >
              <div className="p-2 rounded-full group-hover/btn:bg-emerald-50 dark:group-hover/btn:bg-emerald-900/20 transition-colors">
                <Bookmark className={`w-5 h-5 ${isBookmarked ? 'fill-current' : ''}`} />
              </div>
            </motion.button>

            {/* Share (disabled for now) */}
            <motion.button
              whileTap={{ scale: 0.9 }}
              className="flex items-center gap-2 text-gray-400 dark:text-gray-500 cursor-not-allowed"
            >
              <div className="p-2 rounded-full transition-colors">
                <Share2 className="w-5 h-5" />
              </div>
            </motion.button>
          </div>
        </div>

        {/* Admin 3-Dots Menu - Only visible for Admin */}
        {isAdmin && (
          <div className="relative flex-shrink-0 ml-2">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={(e) => {
                e.stopPropagation();
                setShowAdminMenu(!showAdminMenu);
              }}
              className="p-2 text-gray-400 hover:text-amber-500 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-xl transition-colors"
            >
              <MoreVertical className="w-5 h-5" />
            </motion.button>

            {/* Admin Dropdown Menu */}
            <AnimatePresence>
              {showAdminMenu && (
                <>
                  {/* Backdrop to close menu */}
                  <div 
                    className="fixed inset-0 z-30" 
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowAdminMenu(false);
                    }}
                  />
                  
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                    transition={{ duration: 0.15 }}
                    className="absolute top-10 right-0 bg-white dark:bg-gray-800 rounded-xl shadow-2xl py-2 w-40 z-40 border border-gray-200 dark:border-gray-700"
                  >
                    <motion.button
                      whileTap={{ scale: 0.97 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowAdminMenu(false);
                        onNavigate?.('timeline-detail', { ...post, _editMode: true });
                      }}
                      className="w-full px-4 py-2 flex items-center gap-3 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                      <span className="text-sm font-semibold">Edit</span>
                    </motion.button>
                    
                    <motion.button
                      whileTap={{ scale: 0.97 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm('Yakin ingin menghapus postingan ini?')) {
                          handleDeletePost(e);
                        }
                        setShowAdminMenu(false);
                      }}
                      className="w-full px-4 py-2 flex items-center gap-3 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span className="text-sm font-semibold">Hapus</span>
                    </motion.button>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </motion.div>
  );
}

function QuickAccessButton({
  icon: Icon,
  label,
  color,
  delay,
  onClick,
}: {
  icon: React.ElementType;
  label: string;
  color: string;
  delay: number;
  onClick?: () => void;
}) {
  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, type: "spring", stiffness: 200 }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className="group flex flex-col items-center gap-3 p-5 bg-white dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700/50 card-hover"
    >
      <div className={`bg-gradient-to-br ${color} w-14 h-14 rounded-2xl flex items-center justify-center shadow-xl group-hover:shadow-2xl transition-all group-hover:rotate-6`}>
        <Icon className="w-7 h-7 text-white" />
      </div>
      <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 text-center">
        {label}
      </span>
    </motion.button>
  );
}