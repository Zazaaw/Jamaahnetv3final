import React, { useState, useEffect } from 'react';
import { User, MessageSquare, Grid, Heart, MessageCircle, Award, CreditCard, Users, ShoppingBag, Repeat2, Bookmark, Share2, MoreVertical, Trash2, ArrowLeft, UserPlus } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { getSupabaseClient } from '../utils/supabase/client';
import { projectId } from '../utils/supabase/info';
import { IslamicPattern, MosqueIcon } from './IslamicPattern';
import { toast } from 'sonner@2.0.3';

interface Profile {
  id: string;
  email: string;
  name: string;
  role: string;
  member_since: string;
  wallet_balance: number;
  mosque?: string;
  avatar_url?: string;
  bio?: string;
  member_id?: string;
}

export default function PublicProfileScreen({ 
  session, 
  user,
  onNavigate,
  onStartChat,
  onBack
}: { 
  session: any;
  user: any;
  onNavigate: (screen: string, data?: any) => void;
  onStartChat: (userId: string) => void;
  onBack?: () => void;
}) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [showMemberCardModal, setShowMemberCardModal] = useState(false);
  const [userPosts, setUserPosts] = useState<any[]>([]);
  const [userProducts, setUserProducts] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'posts' | 'market' | 'media'>('posts');
  const [isFollowing, setIsFollowing] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [totalConnections, setTotalConnections] = useState(0);
  
  const supabase = getSupabaseClient();

  const fetchConnectionCount = async () => {
    const targetId = user?.id;
    if (!targetId) return;
    
    // Count Following
    const { count: followingCount } = await supabase
      .from('user_connections')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', targetId);
      
    // Count Followers
    const { count: followersCount } = await supabase
      .from('user_connections')
      .select('*', { count: 'exact', head: true })
      .eq('connected_user_id', targetId);
      
    setTotalConnections((followingCount || 0) + (followersCount || 0));
  };

  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchUserPosts();
      fetchConnectionCount();
      if (activeTab === 'market') {
        fetchUserProducts();
      }
    }
  }, [user, activeTab]);

  useEffect(() => {
    const checkConnectionAndAdmin = async () => {
      if (!session?.user?.id || !user?.id) return;
      
      // Check Connection
      const { data: connData } = await supabase
        .from('user_connections')
        .select('id')
        .eq('user_id', session.user.id)
        .eq('connected_user_id', user.id)
        .maybeSingle();
      if (connData) setIsFollowing(true);

      // Check Admin
      const { data: profileData } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single();
      if (profileData?.role === 'Admin') setIsAdmin(true);
    };
    checkConnectionAndAdmin();
  }, [session, user]);

  const handleFollow = async () => {
    if (!session?.user?.id) {
      toast.error('Silakan login untuk mengikuti');
      return;
    }
    
    try {
      if (isFollowing) {
        // Unfollow
        await supabase.from('user_connections')
          .delete()
          .eq('user_id', session.user.id)
          .eq('connected_user_id', user.id);
        setIsFollowing(false);
        toast.success('Batal mengikuti akun ini');
      } else {
        // Follow
        await supabase.from('user_connections')
          .insert({ user_id: session.user.id, connected_user_id: user.id });
        setIsFollowing(true);
        toast.success('Berhasil mengikuti akun ini!');
      }
    } catch (error) {
      console.error('Error toggling follow:', error);
      toast.error('Gagal memperbarui status ikuti');
    }
  };

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
        
      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const fetchUserPosts = async () => {
    try {
      if (!user) return;
      
      const { data, error } = await supabase
        .from('timeline_posts')
        .select(`
          *,
          profiles:user_id (
            id,
            name,
            avatar_url
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      if (data) {
        const mappedPosts = data.map((post: any) => ({
          ...post,
          image: post.image_url || post.image
        }));
        setUserPosts(mappedPosts);
      }
    } catch (error) {
      console.error('Error fetching user posts:', error);
    }
  };

  const fetchUserProducts = async () => {
    try {
      if (!user) return;
      
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      if (data) {
        setUserProducts(data);
      }
    } catch (error) {
      console.error('Error fetching user products:', error);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  // Stats calculation
  const totalPosts = userPosts.length;
  const totalLikes = userPosts.reduce((sum, post) => sum + (post.likes?.length || 0), 0);
  const mediaPosts = userPosts.filter(post => post.image);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      {/* Background Pattern */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <IslamicPattern className="text-purple-600 dark:text-purple-400 opacity-[0.015]" />
      </div>

      {/* Top Bar - Minimalist */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-20 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-4 flex items-center gap-3"
      >
        <button onClick={onBack} className="p-1 -ml-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 transition-colors">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-bold dark:text-white">Profil</h1>
      </motion.div>

      {/* Profile Section - Threads Style */}
      <div className="relative z-10 px-6 pt-6">
        {/* Header: Name/Username on Left, Avatar on Right */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex items-start justify-between mb-4"
        >
          {/* Left: Name & Username */}
          <div className="flex-1">
            <h2 className="text-2xl font-bold dark:text-white mb-1">
              {profile?.name || 'User'}
            </h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              @{(profile as any)?.username || profile?.email?.split('@')[0] || user?.email?.split('@')[0] || 'jamaah'}
            </p>
          </div>

          {/* Right: Avatar */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, delay: 0.15 }}
            className="flex-shrink-0"
          >
            <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-gray-200 dark:border-gray-700">
              {profile?.avatar_url ? (
                <img 
                  src={profile.avatar_url} 
                  alt={profile.name} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900 dark:to-pink-900 flex items-center justify-center">
                  <User className="w-10 h-10 text-purple-600 dark:text-purple-400" />
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>

        {/* Bio */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-4"
        >
          {profile?.bio && (
            <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
              {profile.bio}
            </p>
          )}
          {profile?.mosque && (
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-3">
              <MosqueIcon className="w-4 h-4" />
              <span>{profile.mosque}</span>
            </div>
          )}
        </motion.div>

        {/* Badges - Horizontal Scroll */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-hide"
        >
          {/* Role Badge */}
          {profile?.role && (
            <div className="flex-shrink-0 border border-gray-300 dark:border-gray-700 rounded-full px-4 py-1.5 text-sm font-medium flex items-center gap-2 bg-white dark:bg-gray-900">
              <Award className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <span className="dark:text-white">{profile.role}</span>
            </div>
          )}

          {/* Member Card Badge */}
          {profile?.member_id && (session?.user?.id === profile.id || isAdmin) && (
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowMemberCardModal(true)}
              className="flex-shrink-0 border border-gray-300 dark:border-gray-700 rounded-full px-4 py-1.5 text-sm font-medium flex items-center gap-2 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              <CreditCard className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span className="dark:text-white">Kartu Member</span>
            </motion.button>
          )}

          {/* Stats Badges */}
          <div className="flex-shrink-0 border border-gray-300 dark:border-gray-700 rounded-full px-4 py-1.5 text-sm font-medium flex items-center gap-2 bg-white dark:bg-gray-900">
            <Grid className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            <span className="dark:text-white">{totalPosts} Postingan</span>
          </div>

          <div className="flex-shrink-0 border border-gray-300 dark:border-gray-700 rounded-full px-4 py-1.5 text-sm font-medium flex items-center gap-2 bg-white dark:bg-gray-900">
            <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span className="dark:text-white">{totalConnections} Koneksi</span>
          </div>
        </motion.div>

        {/* Action Button - Follow & Message */}
        <div className="flex gap-3 mb-6">
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={handleFollow}
            className={`flex-1 py-2 rounded-xl font-semibold text-sm shadow-lg flex items-center justify-center gap-2 transition-colors ${
              isFollowing 
                ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700' 
                : 'bg-emerald-600 text-white'
            }`}
          >
            <UserPlus className="w-4 h-4" />
            {isFollowing ? 'Mengikuti' : 'Ikuti'}
          </motion.button>
          
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onStartChat(user.id)}
            className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-500 text-white py-2 rounded-xl font-semibold text-sm shadow-lg flex items-center justify-center gap-2"
          >
            <MessageSquare className="w-4 h-4" />
            Kirim Pesan
          </motion.button>
        </div>

        {/* Navigation Tabs - Minimalist Text-Based */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35 }}
          className="border-t border-gray-200 dark:border-gray-800 flex"
        >
          <button
            onClick={() => setActiveTab('posts')}
            className={`flex-1 py-3 text-sm font-semibold transition-all ${
              activeTab === 'posts'
                ? 'text-gray-900 dark:text-white border-b-2 border-gray-900 dark:border-white'
                : 'text-gray-400 dark:text-gray-500 border-b-2 border-transparent'
            }`}
          >
            Postingan
          </button>
          <button
            onClick={() => setActiveTab('market')}
            className={`flex-1 py-3 text-sm font-semibold transition-all ${
              activeTab === 'market'
                ? 'text-gray-900 dark:text-white border-b-2 border-gray-900 dark:border-white'
                : 'text-gray-400 dark:text-gray-500 border-b-2 border-transparent'
            }`}
          >
            Pasar
          </button>
          <button
            onClick={() => setActiveTab('media')}
            className={`flex-1 py-3 text-sm font-semibold transition-all ${
              activeTab === 'media'
                ? 'text-gray-900 dark:text-white border-b-2 border-gray-900 dark:border-white'
                : 'text-gray-400 dark:text-gray-500 border-b-2 border-transparent'
            }`}
          >
            Media
          </button>
        </motion.div>
      </div>

      {/* Feed Sections */}
      <div className="relative z-10 px-6 pb-24">
        {/* Posts Tab - Twitter Style */}
        {activeTab === 'posts' && (
          <>
            {userPosts.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 }}
                className="text-center py-16"
              >
                <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Grid className="w-10 h-10 text-gray-400 dark:text-gray-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Belum ada postingan
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Pengguna ini belum memiliki postingan
                </p>
              </motion.div>
            ) : (
              <div className="space-y-3 mt-3">
                {userPosts.map((post, index) => (
                  <TwitterStylePost
                    key={post.id}
                    post={post}
                    session={session}
                    onNavigate={onNavigate}
                    onRefresh={fetchUserPosts}
                    delay={0.4 + index * 0.05}
                  />
                ))}
              </div>
            )}
          </>
        )}

        {/* Market Tab */}
        {activeTab === 'market' && (
          <>
            {userProducts.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 }}
                className="text-center py-16"
              >
                <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ShoppingBag className="w-10 h-10 text-gray-400 dark:text-gray-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Belum ada produk yang dijual
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Belum ada produk dan layanan
                </p>
              </motion.div>
            ) : (
              <div className="grid grid-cols-2 gap-3 mt-3">
                {userProducts.map((product, index) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4 + index * 0.05 }}
                    onClick={() => onNavigate('product-detail', product)}
                    className="cursor-pointer group relative overflow-hidden bg-white dark:bg-gray-800 rounded-2xl shadow-md"
                  >
                    {/* Product Image */}
                    <div className="aspect-square overflow-hidden bg-gray-100 dark:bg-gray-700 relative">
                      {product.images && product.images.length > 0 ? (
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/30 dark:to-teal-900/30 flex items-center justify-center">
                          <ShoppingBag className="w-12 h-12 text-emerald-600 dark:text-emerald-400" />
                        </div>
                      )}
                      
                      {/* Status Badge */}
                      <div className="absolute top-2 right-2">
                        {product.status === 'approved' ? (
                          <div className="bg-green-500 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-lg">
                            LIVE
                          </div>
                        ) : product.status === 'pending' ? (
                          <div className="bg-yellow-500 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-lg">
                            PENDING
                          </div>
                        ) : (
                          <div className="bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-lg">
                            REJECTED
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Product Info */}
                    <div className="p-3">
                      <h3 className="font-semibold text-sm text-gray-900 dark:text-white line-clamp-2 mb-1">
                        {product.name}
                      </h3>
                      <p className="text-emerald-600 dark:text-emerald-400 font-bold text-sm">
                        {formatPrice(product.price)}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Media Tab - Instagram Grid */}
        {activeTab === 'media' && (
          <>
            {mediaPosts.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 }}
                className="text-center py-16"
              >
                <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Grid className="w-10 h-10 text-gray-400 dark:text-gray-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Belum ada media
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Postingan dengan foto akan muncul di sini
                </p>
              </motion.div>
            ) : (
              <div className="grid grid-cols-3 gap-1 mt-1">
                {mediaPosts.map((post, index) => (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4 + index * 0.05 }}
                    onClick={() => onNavigate('timeline-detail', post)}
                    className="aspect-square cursor-pointer group relative overflow-hidden bg-gray-100 dark:bg-gray-800"
                  >
                    <img
                      src={post.image}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                      <div className="flex items-center gap-1 text-white">
                        <Heart className="w-5 h-5" fill="white" />
                        <span className="font-semibold">{post.likes?.length || 0}</span>
                      </div>
                      <div className="flex items-center gap-1 text-white">
                        <MessageCircle className="w-5 h-5" fill="white" />
                        <span className="font-semibold">{post.comments?.length || 0}</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* 3D Member Card Modal */}
      <AnimatePresence>
        {showMemberCardModal && (
          <MemberCard3DModal
            profile={profile}
            user={user}
            onClose={() => setShowMemberCardModal(false)}
          />
        )}
      </AnimatePresence>
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
    setLikes(post.likes || []);
    setComments(post.comments || []);
    
    if (session) {
      setIsLiked((post.likes || []).includes(session.user.id));
      fetchUserRole();
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
        console.error('Error toggling like:', error);
        setIsLiked(!newIsLiked);
        setLikes(likes);
      }
    } catch (error) {
      console.error('Error toggling like:', error);
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

    if (!confirm('Yakin ingin menghapus postingan ini?')) return;

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
               {new Date(post.created_at).toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'short',
              })}
            </span>
            {post.is_approved === false && (
              <span className="hidden"></span>
            )}
          </div>

          {/* Status Badge */}
          {!post.is_approved && (
            <div className={`mb-3 px-3 py-2 rounded-xl border text-xs font-bold inline-block ${post.status === 'rejected' ? 'bg-red-50 border-red-200 text-red-600' : 'bg-orange-50 border-orange-200 text-orange-600'}`}>
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
            (typeof post.image === 'string' && post.image.trim() !== "") || 
            (Array.isArray(post.image) && post.image.length > 0)
          ) && (
            <div className="mb-3 rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700">
              <img
                src={Array.isArray(post.image) ? post.image[0] : post.image}
                alt={post.title || "Post image"}
                className="w-full max-h-96 object-cover"
                onError={(e) => (e.currentTarget.style.display = 'none')}
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

              {/* Retweet (disabled) */}
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

        {/* Admin 3-Dots Menu */}
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

            <AnimatePresence>
              {showAdminMenu && (
                <>
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
                      onClick={handleDeletePost}
                      className="w-full px-4 py-2 text-left flex items-center gap-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span className="text-sm font-medium">Hapus</span>
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

// 3D Member Card Modal with Gyroscope Effect
function MemberCard3DModal({
  profile,
  user,
  onClose,
}: {
  profile: Profile | null;
  user: any;
  onClose: () => void;
}) {
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const rotateXValue = ((y - centerY) / centerY) * -10;
    const rotateYValue = ((x - centerX) / centerX) * 10;
    
    setRotateX(rotateXValue);
    setRotateY(rotateYValue);
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
  };

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-6"
      >
        {/* Card Container */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
          onClick={(e) => e.stopPropagation()}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          style={{
            perspective: 1000,
            transformStyle: 'preserve-3d',
          }}
          className="max-w-md w-full"
        >
          {/* 3D Card */}
          <motion.div
            animate={{
              rotateX: rotateX,
              rotateY: rotateY,
            }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            style={{
              transformStyle: 'preserve-3d',
            }}
            className="relative aspect-[1.6/1] rounded-3xl overflow-hidden shadow-2xl"
          >
            {/* Card Background with Gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-500">
              {/* Animated Gradient Overlay */}
              <motion.div
                animate={{
                  backgroundPosition: ['0% 0%', '100% 100%'],
                }}
                transition={{
                  duration: 10,
                  repeat: Infinity,
                  repeatType: 'reverse',
                }}
                className="absolute inset-0 bg-gradient-to-br from-emerald-300/50 via-transparent to-cyan-400/50"
                style={{
                  backgroundSize: '200% 200%',
                }}
              />
              
              {/* Islamic Pattern */}
              <div className="absolute inset-0 opacity-10">
                <IslamicPattern className="text-white" />
              </div>

              {/* Glassmorphic Overlay */}
              <div className="absolute inset-0 bg-white/5 backdrop-blur-[1px]" />
            </div>

            {/* Card Content - Apple Card Style */}
            <div className="relative z-10 p-8 h-full flex flex-col justify-between">
              {/* Top Row - Header */}
              <div className="flex items-start justify-between">
                {/* Left: Icon + Brand */}
                <div className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-white" />
                  <p className="text-white text-sm font-bold tracking-wide">JAMAAH.NET</p>
                </div>
                
                {/* Right: Verified Badge */}
                <div className="bg-white/20 backdrop-blur-sm border border-white/30 px-3 py-1 rounded-full">
                  <span className="text-white text-[10px] font-bold tracking-wide">VERIFIED</span>
                </div>
              </div>

              {/* Middle Row - Member ID (Centered) */}
              <div className="flex flex-col items-center justify-center">
                <p className="text-white/60 text-[10px] tracking-widest font-medium uppercase mb-3">MEMBER ID</p>
                <p className="font-mono text-4xl font-bold text-white tracking-widest drop-shadow-md">
                  {profile?.member_id?.toUpperCase() || 'JM-202401-XXXX'}
                </p>
              </div>

              {/* Bottom Row - Footer */}
              <div className="flex items-end justify-between">
                {/* Left: Member Info */}
                <div>
                  <p className="text-white/60 text-[10px] tracking-widest font-medium uppercase mb-1.5">MEMBER NAME</p>
                  <p className="text-white text-lg font-bold tracking-wide mb-2">
                    {profile?.name || profile?.email || 'Jamaah Member'}
                  </p>
                  {/* Badges */}
                  <div className="flex items-center gap-1.5">
                    <div className="bg-white/20 text-white text-[10px] px-2 py-0.5 rounded-full backdrop-blur-sm border border-white/20">
                      {profile?.role || 'Member'}
                    </div>
                    {profile?.mosque && (
                      <div className="bg-white/20 text-white text-[10px] px-2 py-0.5 rounded-full backdrop-blur-sm border border-white/20 flex items-center gap-1">
                        <MosqueIcon className="w-2.5 h-2.5" />
                        <span>{profile.mosque}</span>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Right: Joined Date */}
                <div className="text-right">
                  <p className="text-white/60 text-[10px] tracking-widest font-medium uppercase mb-1.5">JOINED</p>
                  <p className="text-white text-sm font-semibold">
                    {(profile as any)?.created_at || user?.created_at 
                      ? new Date((profile as any)?.created_at || user?.created_at).toLocaleDateString('id-ID', { 
                          year: 'numeric', 
                          month: 'short' 
                        })
                      : new Date().toLocaleDateString('id-ID', { 
                          year: 'numeric', 
                          month: 'short' 
                        })
                    }
                  </p>
                </div>
              </div>

              {/* Holographic Effect */}
              <motion.div
                animate={{
                  backgroundPosition: ['0% 0%', '100% 100%'],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  repeatType: 'reverse',
                }}
                className="absolute inset-0 opacity-30 pointer-events-none"
                style={{
                  background: 'linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.3) 50%, transparent 70%)',
                  backgroundSize: '200% 200%',
                }}
              />
            </div>
          </motion.div>

          {/* Close Button */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={onClose}
            className="mt-6 mx-auto block bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-6 py-3 rounded-2xl font-semibold shadow-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            Tutup
          </motion.button>
        </motion.div>
      </motion.div>
    </>
  );
}