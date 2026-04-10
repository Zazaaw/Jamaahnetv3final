import React, { useState, useEffect } from 'react';
import { Calendar, DollarSign, Store, Bell, MessageCircle, ShoppingBag, Heart, Users, Plus, Bookmark, Repeat2, Share2, MoreVertical, Info, Headset } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { getSupabaseClient } from '../utils/supabase/client';
import { IslamicPattern, MosqueIcon } from './IslamicPattern';
import DynamicIslamicHeader from './DynamicIslamicHeader';
import NotificationBell from './NotificationBell';
import { toast } from 'sonner@2.0.3';

interface Announcement {
  id: string;
  title: string;
  content: string;
  image: string;
  created_at: number;
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
  is_approved?: boolean;
  status?: string;
  rejection_reason?: string;
}

export default function HomeScreen({ 
  session,
  onNavigate 
}: { 
  session: any;
  onNavigate?: (screen: string, data?: any) => void;
}) {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [timeline, setTimeline] = useState<TimelinePost[]>([]);

  useEffect(() => {
    fetchAnnouncements();
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

  const fetchTimeline = async () => {
    try {
      const supabase = getSupabaseClient();
      
      // Build query with .or() for approval filter
      let query = supabase
        .from('timeline_posts')
        .select('*, profiles(name, avatar_url)')
        .order('created_at', { ascending: false });
      
      // If user is logged in, fetch approved posts OR user's own pending posts
      // If not logged in, only fetch approved posts
      if (session?.user?.id) {
        query = query.or(`is_approved.eq.true,and(is_approved.eq.false,user_id.eq.${session.user.id})`);
      } else {
        query = query.eq('is_approved', true);
      }

      const { data, error } = await query;

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
      const supabase = getSupabaseClient();
      const notifs: Notification[] = [];
      
      // Kita ambil data 24 jam terakhir
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

      // 1. Cek Produk Baru di Pasar
      const { count: productCount } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', oneDayAgo);
      
      if (productCount && productCount > 0) {
        notifs.push({
          type: 'product',
          count: productCount,
          message: `${productCount} produk baru di Pasar Jamaah`
        });
      }

      // 2. Cek Kampanye Donasi Baru
      const { count: campaignCount } = await supabase
        .from('donation_campaigns')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', oneDayAgo);
        
      if (campaignCount && campaignCount > 0) {
        notifs.push({
          type: 'donation',
          count: campaignCount,
          message: `${campaignCount} kampanye donasi baru`
        });
      }

      // 3. Cek Pesan Chat Baru
      const { data: userChats } = await supabase
        .from('chats')
        .select('id')
        .contains('participants', [session.user.id]);
        
      if (userChats && userChats.length > 0) {
        const chatIds = userChats.map(c => c.id);
        const { count: messageCount } = await supabase
          .from('messages')
          .select('*', { count: 'exact', head: true })
          .in('chat_id', chatIds)
          .neq('sender_id', session.user.id)
          .gte('created_at', oneDayAgo);
          
        if (messageCount && messageCount > 0) {
          notifs.push({
            type: 'chat',
            count: messageCount,
            message: `${messageCount} pesan chat baru masuk`
          });
        }
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
        session={session}
        onNavigate={onNavigate}
      />

      {/* Old Notifications Dropdown - REMOVED, now using NotificationDropdown in header */}
      {/* <div className="relative">
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
      </div> */}

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

        {/* Quick Access Menu - Minimalist Modern Style */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mx-4 md:mx-0 flex flex-col gap-5 bg-white dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl p-5 border border-gray-100 dark:border-gray-700/50 shadow-sm"
        >
          {/* TOP ROW: 3 Core Features (Gojek Style: Round Icon + Text) */}
          <div className="flex justify-around items-start">
            {/* Kegiatan */}
            <button onClick={() => onNavigate?.('calendar')} className="flex flex-col items-center gap-2 group">
              <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-500 group-hover:bg-blue-500 group-hover:text-white transition-all shadow-sm">
                <Calendar className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-bold text-gray-700 dark:text-gray-300">Kegiatan</span>
            </button>
            
            {/* Pasar */}
            <button onClick={() => onNavigate?.('marketplace')} className="flex flex-col items-center gap-2 group">
              <div className="w-12 h-12 rounded-full bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center text-orange-500 group-hover:bg-orange-500 group-hover:text-white transition-all shadow-sm">
                <Store className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-bold text-gray-700 dark:text-gray-300">Pasar</span>
            </button>
            
            {/* Donasi */}
            <button onClick={() => onNavigate?.('donation')} className="flex flex-col items-center gap-2 group">
              <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center text-emerald-500 group-hover:bg-emerald-500 group-hover:text-white transition-all shadow-sm">
                <DollarSign className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-bold text-gray-700 dark:text-gray-300">Donasi</span>
            </button>
          </div>

          {/* BOTTOM ROW: 2 Info Buttons (Pill Style) */}
          <div className="flex justify-center gap-3 pt-4 border-t border-gray-100 dark:border-gray-700/50">
            <button 
              onClick={() => onNavigate?.('about')}
              className="flex items-center gap-2 px-4 py-2 bg-teal-50 dark:bg-teal-900/20 rounded-full border border-teal-100 dark:border-teal-800 hover:bg-teal-100 dark:hover:bg-teal-900/40 transition-colors flex-1 justify-center"
            >
              <Info className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
              <span className="text-[11px] font-bold text-teal-700 dark:text-teal-300">Tentang Jamaah</span>
            </button>

            <button 
              onClick={() => onNavigate?.('contact')}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-full border border-emerald-100 dark:border-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-colors flex-1 justify-center"
            >
              <Headset className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300">Hubungi Kami</span>
            </button>
          </div>
        </motion.div>

        {/* Timeline Kegiatan Jamaah - Twitter Style Thread */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="space-y-4"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Timeline Kegiatan</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">Aktivitas jamaah terkini</p>
            </div>
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
      const supabase = getSupabaseClient();
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single();
        
      if (!error && data) {
        setIsAdmin(data.role === 'Admin');
      }
    } catch (error) {
      console.error('Error fetching user role:', error);
    }
  };

  const fetchBookmarkStatus = async () => {
    if (!session) return;
    // TODO: Implement Supabase bookmarks list check
    setIsBookmarked(false);
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
    
    // TODO: Implement Supabase bookmarks
    toast.success(newIsBookmarked ? 'Post disimpan!' : 'Post dihapus dari simpanan');
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const text = `Lihat postingan dari ${post.profiles?.name || post.user_name} di Jamaah.net!\n\n${post.title || ''}\n${post.content}`;
    
    try {
      if (navigator.share && window.isSecureContext) {
        await navigator.share({ title: post.title || 'Jamaah.net Post', text: text, url: window.location.href });
      } else {
        throw new Error('Share API not supported');
      }
    } catch (error: any) { 
      // Fallback if Share is blocked (e.g., in iframes/Figma preview) or unsupported
      try {
        await navigator.clipboard.writeText(text);
        toast.success('Link & teks berhasil disalin ke clipboard!');
      } catch (clipboardError) {
        toast.error('Gagal menyalin teks. Fitur diblokir oleh browser.');
      }
    }
  };

  const handleDeletePost = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!session) return;

    try {
      const supabase = getSupabaseClient();
      const { error } = await supabase.from('timeline_posts').delete().eq('id', post.id);

      if (error) throw error;
      
      toast.success('Post berhasil dihapus');
      onRefresh();
    } catch (error) {
      console.error('Error deleting post:', error);
      toast.error('Gagal menghapus post');
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
        <div 
          className="flex-shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
          onClick={(e) => {
            e.stopPropagation();
            onNavigate?.('other-profile', { userId: post.user_id });
          }}
        >
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
            <span 
              className="font-bold text-gray-900 dark:text-white hover:underline cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                onNavigate?.('other-profile', { userId: post.user_id });
              }}
            >
              {post.profiles?.name || post.user_name || 'Unknown User'}
            </span>
            <span className="text-gray-500 dark:text-gray-400 text-sm">
              · {new Date(post.created_at).toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'short',
              })}
            </span>
          </div>

          {/* Status Badge */}
          {!post.is_approved && (
            <div className={`mb-3 inline-block px-3 py-2 rounded-xl border text-xs font-bold ${post.status === 'rejected' ? 'bg-red-50 border-red-200 text-red-600' : 'bg-orange-50 border-orange-200 text-orange-600'}`}>
              {post.status === 'rejected' ? '❌ Postingan Ditolak / Di-Take Down' : '⏳ Menunggu Persetujuan Admin'}
            </div>
          )}

          {/* Rejection Reason Box */}
          {post.status === 'rejected' && post.rejection_reason && (
            <div className="mb-4 p-3 bg-red-50/50 border border-red-200 rounded-xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-red-500"></div>
              <p className="text-[10px] font-bold text-red-800 uppercase tracking-wider mb-1 pl-2">Alasan Admin:</p>
              <p className="text-sm font-medium text-red-700 pl-2 leading-relaxed">{post.rejection_reason}</p>
            </div>
          )}

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
          <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100 dark:border-gray-700/50">
            {/* Left Side: Just icons for clicking */}
            <div className="flex items-center gap-1">
              {/* Comment */}
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={(e) => {
                  e.stopPropagation();
                  onNavigate?.('timeline-detail', post);
                }}
                className="flex items-center text-gray-500 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors group/btn"
              >
                <div className="p-2 rounded-full group-hover/btn:bg-blue-50 dark:group-hover/btn:bg-blue-900/20 transition-colors">
                  <MessageCircle className="w-5 h-5" />
                </div>
              </motion.button>

              {/* Retweet (disabled for now) */}
              <motion.button
                whileTap={{ scale: 0.9 }}
                className="hidden flex items-center text-gray-400 dark:text-gray-500 cursor-not-allowed"
              >
                <div className="p-2 rounded-full transition-colors">
                  <Repeat2 className="w-5 h-5" />
                </div>
              </motion.button>

              {/* Like */}
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={handleLike}
                className={`flex items-center transition-colors group/btn ${
                  isLiked
                    ? 'text-pink-500 dark:text-pink-400'
                    : 'text-gray-500 dark:text-gray-400 hover:text-pink-500 dark:hover:text-pink-400'
                }`}
              >
                <div className="p-2 rounded-full group-hover/btn:bg-pink-50 dark:group-hover/btn:bg-pink-900/20 transition-colors">
                  <Heart className={`w-[22px] h-[22px] ${isLiked ? 'fill-current' : ''}`} />
                </div>
              </motion.button>

              {/* Bookmark */}
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={handleBookmark}
                className={`hidden flex items-center transition-colors group/btn ${
                  isBookmarked
                    ? 'text-emerald-500 dark:text-emerald-400'
                    : 'text-gray-500 dark:text-gray-400 hover:text-emerald-500 dark:hover:text-emerald-400'
                }`}
              >
                <div className="p-2 rounded-full group-hover/btn:bg-emerald-50 dark:group-hover/btn:bg-emerald-900/20 transition-colors">
                  <Bookmark className={`w-5 h-5 ${isBookmarked ? 'fill-current' : ''}`} />
                </div>
              </motion.button>

              {/* Share */}
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={handleShare}
                className="flex items-center text-gray-500 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors group/btn"
              >
                <div className="p-2 rounded-full group-hover/btn:bg-blue-50 dark:group-hover/btn:bg-blue-900/20 transition-colors">
                  <Share2 className="w-5 h-5" />
                </div>
              </motion.button>
            </div>

            {/* Right Side: Interaction status text (Point 19) */}
            <div className="text-sm text-gray-500 dark:text-gray-400">
              <span className="font-semibold text-gray-700 dark:text-gray-200">{likes.length} Likes</span> · <span className="font-semibold text-gray-700 dark:text-gray-200">{comments.length} Comments</span>
            </div>
          </div>
        </div>

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