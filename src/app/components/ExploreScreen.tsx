import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Search, TrendingUp, Compass, X, AlertCircle, Users, Mail, Phone, MapPin, BookOpen } from 'lucide-react';
import { getSupabaseClient } from '../utils/supabase/client';

interface Article {
  id: string;
  title: string;
  excerpt: string;
  author: string;
  created_at: number;
  image?: string;
  content?: string;
  category?: string;
}

interface ExploreScreenProps {
  session: any;
  onNavigate?: (screen: string, data?: any) => void;
}

export default function ExploreScreen({ session, onNavigate }: ExploreScreenProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('untuk_anda');
  
  // Data States
  const [articles, setArticles] = useState<Article[]>([]);
  const [adminBroadcasts, setAdminBroadcasts] = useState<Article[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<{ id: string; role: string } | null>(null);
  
  // Search engine states
  const [userResults, setUserResults] = useState<any[]>([]);
  const [articleResults, setArticleResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    fetchArticlesAndBroadcasts();
    fetchMembersAndUser();
  }, []);

  // Fetch Articles & Admin Broadcasts
  const fetchArticlesAndBroadcasts = async () => {
    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .order('created_at', { ascending: false });

      if (data) {
        // Pisahkan Artikel biasa dan Broadcast Admin
        setAdminBroadcasts(data.filter((a: any) => a.category === 'Berita Penting'));
        setArticles(data.filter((a: any) => a.category !== 'Berita Penting'));
      }
    } catch (error) {
      console.error('Error fetching articles:', error);
    }
  };

  // Fetch Members (Untuk Direktori Jamaah)
  const fetchMembersAndUser = async () => {
    try {
      const supabase = getSupabaseClient();
      if (session?.user?.id) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('id, role')
          .eq('id', session.user.id)
          .single();
        setCurrentUser(profile);
      }

      const { data } = await supabase
        .from('profiles')
        .select('id, name, role, avatar_url, email, phone, address')
        .order('name', { ascending: true });

      if (data) setMembers(data);
    } catch (error) {
      console.error('Error fetching members:', error);
    }
  };

  // Search engine logic
  useEffect(() => {
    const performSearch = async () => {
      if (searchQuery.length > 2) {
        setIsSearching(true);
        try {
          const supabase = getSupabaseClient();
          
          const { data: users } = await supabase
            .from('profiles')
            .select('id, name, avatar_url, role')
            .ilike('name', `%${searchQuery}%`)
            .limit(10);

          const { data: articles } = await supabase
            .from('articles')
            .select('*')
            .ilike('title', `%${searchQuery}%`)
            .limit(10);

          setUserResults(users || []);
          setArticleResults(articles || []);
        } catch (error) {
          console.error('Search error:', error);
        } finally {
          setIsSearching(false);
        }
      } else {
        setUserResults([]);
        setArticleResults([]);
      }
    };

    const timeoutId = setTimeout(performSearch, 300);
    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  // CUMA DUA TABS SEKARANG WAK
  const tabs = [
    { id: 'untuk_anda', label: 'Untuk Anda', icon: TrendingUp },
    { id: 'direktori', label: 'Direktori Jamaah', icon: Users },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-24">
      {/* Unified Sticky Glassmorphic Header */}
      <div className="sticky top-0 z-30 bg-white/80 dark:bg-gray-950/80 backdrop-blur-xl pt-12 pb-4 px-5 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl">
              <Compass className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
              Eksplor
            </h1>
          </div>
        </div>

        {/* Modern Search Bar */}
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-emerald-500 transition-colors" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari jamaah atau artikel..."
            className="w-full bg-gray-100/80 dark:bg-gray-800/80 text-gray-900 dark:text-white placeholder-gray-500 rounded-2xl py-3.5 pl-12 pr-12 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:bg-white dark:focus:bg-gray-900 transition-all shadow-inner"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors"
            >
              <X className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            </button>
          )}
        </div>

        {/* Scrollable Tabs - CUMA ADA 2 TABS */}
        {!searchQuery && (
          <div className="overflow-x-auto scrollbar-hide flex gap-2 mt-4">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <motion.button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  whileTap={{ scale: 0.95 }}
                  className={`flex-1 flex justify-center items-center gap-2 whitespace-nowrap transition-all ${
                    isActive
                      ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900 px-4 py-2.5 rounded-xl shadow-md'
                      : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 px-4 py-2.5 bg-gray-100 dark:bg-gray-800 rounded-xl'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-sm font-bold">
                    {tab.label}
                  </span>
                </motion.button>
              );
            })}
          </div>
        )}
      </div>

      {/* Content Area */}
      <div className="relative z-10">
        {searchQuery.length > 0 ? (
          // Search Results Mode
          <div className="p-4 space-y-6">
            {isSearching ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center min-h-[40vh]">
                <div className="w-16 h-16 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin mb-4" />
                <p className="text-gray-600 dark:text-gray-400">Mencari...</p>
              </motion.div>
            ) : (
              <>
                {userResults.length === 0 && articleResults.length === 0 ? (
                  <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="p-6 flex flex-col items-center justify-center min-h-[40vh]">
                    <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-full flex items-center justify-center mb-4">
                      <Search className="w-10 h-10 text-gray-400 dark:text-gray-500" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Pencarian tidak ditemukan</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 text-center max-w-md">Tidak ada hasil untuk "{searchQuery}".</p>
                  </motion.div>
                ) : (
                  <>
                    {/* Hasil Jamaah */}
                    {userResults.length > 0 && (
                      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3 px-2">Jamaah</h2>
                        <div className="space-y-2">
                          {userResults.map((user, index) => (
                            <motion.div
                              key={user.id}
                              initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.05 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => onNavigate?.('public-profile', user)}
                              className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 cursor-pointer hover:border-emerald-300 transition-all flex items-center gap-4"
                            >
                              <div className="flex-shrink-0">
                                {user.avatar_url ? (
                                  <img src={user.avatar_url} alt={user.name} className="w-14 h-14 rounded-full object-cover" />
                                ) : (
                                  <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center">
                                    <span className="text-white text-lg font-bold">{user.name?.charAt(0).toUpperCase()}</span>
                                  </div>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <h3 className="font-bold text-base text-gray-900 dark:text-white truncate">{user.name}</h3>
                                {user.role && <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">{user.role}</p>}
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      </motion.div>
                    )}

                    {/* Hasil Artikel */}
                    {articleResults.length > 0 && (
                      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mt-6">
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3 px-2">Artikel & Berita</h2>
                        <div className="space-y-3">
                          {articleResults.map((article, index) => (
                            <motion.div
                              key={article.id}
                              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 + index * 0.05 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => onNavigate?.('article-detail', article)}
                              className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex gap-4 items-center cursor-pointer hover:shadow-md transition-all"
                            >
                              <div className="flex-1 min-w-0">
                                <h4 className="font-bold text-gray-900 dark:text-white text-base mb-1 line-clamp-2">{article.title}</h4>
                                <p className="text-gray-500 dark:text-gray-400 text-sm line-clamp-1 mb-2">{article.excerpt}</p>
                                <div className="flex items-center gap-2 text-xs text-gray-400">
                                  <span>👤 {article.author}</span> • 
                                  <span>{new Date(article.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}</span>
                                </div>
                              </div>
                              {article.image && (
                                <div className="flex-shrink-0 w-24 h-24 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-700">
                                  <img src={article.image} alt={article.title} className="w-full h-full object-cover" />
                                </div>
                              )}
                            </motion.div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </>
                )}
              </>
            )}
          </div>
        ) : (
          <div className="p-4 space-y-6">
            
            {/* TAB 1: UNTUK ANDA (BERITA PENTING ADMIN + ARTIKEL) */}
            {activeTab === 'untuk_anda' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                
                {/* Section A: Broadcast Admin (Berita Penting) */}
                {adminBroadcasts.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-3 px-1">
                      <AlertCircle className="w-5 h-5 text-red-500" />
                      <h2 className="text-lg font-bold text-gray-900 dark:text-white">Berita Penting</h2>
                    </div>
                    <div className="space-y-4">
                      {adminBroadcasts.map((post, index) => (
                        <motion.div 
                          key={post.id} 
                          initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}
                          onClick={() => onNavigate?.('article-detail', post)}
                          className="bg-white dark:bg-gray-800 p-5 rounded-3xl border-2 border-red-100 dark:border-red-900/30 shadow-md cursor-pointer hover:shadow-lg transition-shadow relative overflow-hidden"
                        >
                          <div className="absolute top-0 right-0 w-20 h-20 bg-red-500/10 rounded-bl-full -mr-10 -mt-10" />
                          <h3 className="font-bold text-xl text-gray-900 dark:text-white mb-2 relative z-10">{post.title}</h3>
                          <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-3 relative z-10">{post.excerpt || post.content}</p>
                          <div className="flex items-center justify-between text-xs font-medium text-gray-500 border-t border-gray-100 dark:border-gray-700 pt-3">
                            <span>Admin {post.author?.split(' ')[0]}</span>
                            <span>{new Date(post.created_at).toLocaleDateString('id-ID', {day: 'numeric', month:'short', year: 'numeric'})}</span>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Section B: Artikel Biasa */}
                <div>
                  <div className="flex items-center gap-2 mb-3 px-1">
                    <BookOpen className="w-5 h-5 text-emerald-500" />
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">Bacaan Jamaah</h2>
                  </div>
                  
                  {articles.length === 0 ? (
                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-10 text-center shadow-sm border border-gray-100 dark:border-gray-700">
                      <p className="text-gray-500 dark:text-gray-400">Belum ada artikel</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {articles.map((article, index) => (
                        <motion.div
                          key={article.id}
                          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + index * 0.05 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => onNavigate?.('article-detail', article)}
                          className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex gap-4 items-center cursor-pointer hover:shadow-md transition-all"
                        >
                          <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-gray-900 dark:text-white text-lg mb-2 line-clamp-2 leading-snug">{article.title}</h4>
                            <p className="text-gray-500 dark:text-gray-400 text-sm line-clamp-2 mb-3">{article.excerpt}</p>
                            <div className="flex items-center gap-2 text-xs text-gray-400">
                              <span>👤 {article.author}</span> • 
                              <span>{new Date(article.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}</span>
                            </div>
                          </div>
                          {article.image && (
                            <div className="flex-shrink-0 w-24 h-24 rounded-xl overflow-hidden">
                              <img src={article.image} alt={article.title} className="w-full h-full object-cover" />
                            </div>
                          )}
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* TAB 2: DIREKTORI JAMAAH */}
            {activeTab === 'direktori' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
                <div className="bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-2xl border border-emerald-100 dark:border-emerald-800/50 mb-4 flex items-center gap-3">
                  <Users className="w-8 h-8 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                  <div>
                    <h3 className="font-bold text-emerald-800 dark:text-emerald-300">Jamaah Terdaftar</h3>
                    <p className="text-xs text-emerald-600 dark:text-emerald-400">Gunakan kotak pencarian di atas untuk mencari nama spesifik.</p>
                  </div>
                </div>

                {members.map((member, index) => {
                  const canViewSensitiveData = currentUser?.role === 'Admin' || currentUser?.id === member.id;
                  return (
                    <motion.div 
                      key={member.id} 
                      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}
                      onClick={() => onNavigate?.('public-profile', member)}
                      className="flex items-center gap-4 p-4 bg-white dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700/50 rounded-2xl hover:border-emerald-200 transition-all cursor-pointer shadow-sm group"
                    >
                      {member.avatar_url ? (
                        <img src={member.avatar_url} alt={member.name} className="w-14 h-14 rounded-full object-cover border border-gray-200 dark:border-gray-700" />
                      ) : (
                        <div className="w-14 h-14 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-inner">
                          {member.name ? member.name.charAt(0).toUpperCase() : '?'}
                        </div>
                      )}
                      <div className="flex-1">
                        <h4 className="font-bold text-gray-900 dark:text-white group-hover:text-emerald-600 transition-colors">
                          {member.name || 'Jamaah Tanpa Nama'}
                        </h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{member.role || 'Member'}</p>
                        
                        {canViewSensitiveData && (
                          <div className="mt-2 space-y-1">
                            {member.email && (
                              <div className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400"><Mail className="w-3 h-3" /><span>{member.email}</span></div>
                            )}
                            {member.phone && (
                              <div className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400"><Phone className="w-3 h-3" /><span>{member.phone}</span></div>
                            )}
                            {member.address && (
                              <div className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400"><MapPin className="w-3 h-3" /><span className="line-clamp-1">{member.address}</span></div>
                            )}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
            )}

          </div>
        )}
      </div>
    </div>
  );
}