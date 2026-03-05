import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Search, TrendingUp, Calendar as CalendarIcon, BookOpen, GraduationCap } from 'lucide-react';
import { getSupabaseClient } from '../utils/supabase/client';

// ExploreScreen - Twitter/X style explore page
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
  const [articles, setArticles] = useState<Article[]>([]);
  
  // Search engine states
  const [userResults, setUserResults] = useState<any[]>([]);
  const [articleResults, setArticleResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    fetchArticles();
  }, []);

  // Search engine logic
  useEffect(() => {
    const performSearch = async () => {
      if (searchQuery.length > 2) {
        setIsSearching(true);
        try {
          const supabase = getSupabaseClient();
          
          // Search for users
          const { data: users, error: userError } = await supabase
            .from('profiles')
            .select('id, name, avatar_url, role')
            .ilike('name', `%${searchQuery}%`)
            .limit(10);

          if (userError) throw userError;

          // Search for articles
          const { data: articles, error: articleError } = await supabase
            .from('articles')
            .select('*')
            .ilike('title', `%${searchQuery}%`)
            .limit(10);

          if (articleError) throw articleError;

          setUserResults(users || []);
          setArticleResults(articles || []);
        } catch (error) {
          console.error('Search error:', error);
        } finally {
          setIsSearching(false);
        }
      } else {
        // Clear results if query is too short
        setUserResults([]);
        setArticleResults([]);
      }
    };

    // Debounce search
    const timeoutId = setTimeout(performSearch, 300);
    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const fetchArticles = async () => {
    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data) {
        setArticles(data);
      }
    } catch (error) {
      console.error('Error fetching articles:', error);
    }
  };

  const tabs = [
    { id: 'untuk_anda', label: 'Untuk Anda', icon: TrendingUp },
    { id: 'berita_masjid', label: 'Berita Masjid', icon: CalendarIcon },
    { id: 'kajian', label: 'Kajian', icon: BookOpen },
    { id: 'edukasi', label: 'Edukasi', icon: GraduationCap },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-emerald-50/30 to-teal-50/30 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 pt-12">
      {/* Sticky Header with Title and Search Bar */}
      <div className="sticky top-0 z-20 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
        <div className="pt-4 px-4">
          {/* Page Title */}
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Eksplor 🌍
          </h1>
        </div>
        
        <div className="px-4 pb-4">
          {/* Premium Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-full bg-gray-100 dark:bg-gray-800 px-4 py-2.5 flex items-center gap-3 shadow-sm"
          >
            <Search className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari jamaah atau artikel..."
              className="flex-1 bg-transparent outline-none text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 text-sm"
            />
          </motion.div>
        </div>

        {/* Scrollable Tabs - Only show when not searching */}
        {!searchQuery && (
          <div className="overflow-x-auto scrollbar-hide flex gap-6 px-4 py-3 border-t border-gray-200 dark:border-gray-800">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <motion.button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  whileTap={{ scale: 0.95 }}
                  className="relative flex items-center gap-2 whitespace-nowrap pb-3 transition-colors"
                >
                  <Icon className={`w-4 h-4 ${
                    activeTab === tab.id
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-gray-500 dark:text-gray-400'
                  }`} />
                  <span className={`text-sm ${
                    activeTab === tab.id
                      ? 'text-gray-900 dark:text-white font-bold'
                      : 'text-gray-500 dark:text-gray-400 font-medium'
                  }`}>
                    {tab.label}
                  </span>
                  {activeTab === tab.id && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-400 dark:to-teal-400 rounded-full"
                      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    />
                  )}
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
              // Loading state
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center min-h-[40vh]"
              >
                <div className="w-16 h-16 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin mb-4" />
                <p className="text-gray-600 dark:text-gray-400">Mencari...</p>
              </motion.div>
            ) : (
              <>
                {/* Show results or empty state */}
                {userResults.length === 0 && articleResults.length === 0 ? (
                  // No results found
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-6 flex flex-col items-center justify-center min-h-[40vh]"
                  >
                    <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-full flex items-center justify-center mb-4">
                      <Search className="w-10 h-10 text-gray-400 dark:text-gray-500" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                      Pencarian tidak ditemukan
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 text-center max-w-md">
                      Tidak ada hasil untuk "{searchQuery}". Coba kata kunci lain.
                    </p>
                  </motion.div>
                ) : (
                  <>
                    {/* Section A: Jamaah Results */}
                    {userResults.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                      >
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3 px-2">
                          Jamaah
                        </h2>
                        <div className="space-y-2">
                          {userResults.map((user, index) => (
                            <motion.div
                              key={user.id}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.05 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => onNavigate?.('public-profile', user)}
                              className="bg-white dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-gray-100 dark:border-gray-700/50 cursor-pointer hover:shadow-xl hover:border-emerald-300 dark:hover:border-emerald-600 transition-all"
                            >
                              <div className="flex items-center gap-4">
                                {/* Avatar */}
                                <div className="flex-shrink-0">
                                  {user.avatar_url ? (
                                    <img
                                      src={user.avatar_url}
                                      alt={user.name}
                                      className="w-14 h-14 rounded-full object-cover"
                                    />
                                  ) : (
                                    <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center">
                                      <span className="text-white text-lg font-bold">
                                        {user.name?.charAt(0).toUpperCase()}
                                      </span>
                                    </div>
                                  )}
                                </div>
                                
                                {/* User Info */}
                                <div className="flex-1 min-w-0">
                                  <h3 className="font-bold text-base text-gray-900 dark:text-white truncate">
                                    {user.name}
                                  </h3>
                                  {user.role && (
                                    <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                                      {user.role}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      </motion.div>
                    )}

                    {/* Section B: Artikel Results */}
                    {articleResults.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                      >
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3 px-2">
                          Artikel
                        </h2>
                        <div className="space-y-3">
                          {articleResults.map((article, index) => (
                            <motion.div
                              key={article.id}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.15 + index * 0.05 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => onNavigate?.('article-detail', article)}
                              className="bg-white dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-gray-100 dark:border-gray-700/50 cursor-pointer group hover:shadow-xl transition-all"
                            >
                              <div className="flex gap-4">
                                {/* Content (Left Side) */}
                                <div className="flex-1 min-w-0">
                                  {article.category && (
                                    <span className="inline-block px-2 py-0.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 text-[10px] font-semibold rounded-full mb-2">
                                      {article.category}
                                    </span>
                                  )}
                                  <h3 className="font-bold text-base text-gray-900 dark:text-white mb-1 line-clamp-2 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                                    {article.title}
                                  </h3>
                                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 line-clamp-1">
                                    {article.author}
                                  </p>
                                  <span className="text-xs text-gray-400 dark:text-gray-500">
                                    {new Date(article.created_at).toLocaleDateString('id-ID', {
                                      day: 'numeric',
                                      month: 'short',
                                    })}
                                  </span>
                                </div>

                                {/* Image (Right Side) */}
                                {article.image && (
                                  <div className="flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden">
                                    <img
                                      src={article.image}
                                      alt={article.title}
                                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                    />
                                  </div>
                                )}
                              </div>
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
          // Articles Content
          <div className="p-4 space-y-6">
            {articles.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl p-12 text-center shadow-lg border border-gray-100 dark:border-gray-700/50"
              >
                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Belum ada artikel
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Artikel akan segera ditambahkan
                </p>
              </motion.div>
            ) : (
              <>
                {/* Hero Article (First Item) */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onNavigate?.('article-detail', articles[0])}
                  className="bg-white dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700/50 overflow-hidden cursor-pointer group"
                >
                  {articles[0].image && (
                    <div className="aspect-video w-full overflow-hidden">
                      <img
                        src={articles[0].image}
                        alt={articles[0].title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  )}
                  <div className="p-5">
                    {articles[0].category && (
                      <div className="inline-block px-3 py-1 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-xs font-semibold rounded-full mb-3">
                        {articles[0].category}
                      </div>
                    )}
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                      {articles[0].title}
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-3 line-clamp-2">
                      {articles[0].excerpt}
                    </p>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-500 dark:text-gray-400 flex items-center gap-2">
                        <div className="w-6 h-6 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center">
                          <span className="text-[10px]">👤</span>
                        </div>
                        {articles[0].author}
                      </span>
                      <span className="text-gray-400 dark:text-gray-500">
                        {new Date(articles[0].created_at).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </span>
                    </div>
                  </div>
                </motion.div>

                {/* List Articles (Remaining Items) */}
                <div className="space-y-3">
                  {articles.slice(1).map((article, index) => (
                    <motion.div
                      key={article.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 + index * 0.05 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => onNavigate?.('article-detail', article)}
                      className="bg-white dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-gray-100 dark:border-gray-700/50 cursor-pointer group hover:shadow-xl transition-all"
                    >
                      <div className="flex gap-4">
                        {/* Content (Left Side) */}
                        <div className="flex-1 min-w-0">
                          {article.category && (
                            <span className="inline-block px-2 py-0.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 text-[10px] font-semibold rounded-full mb-2">
                              {article.category}
                            </span>
                          )}
                          <h3 className="font-bold text-base text-gray-900 dark:text-white mb-1 line-clamp-2 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                            {article.title}
                          </h3>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 line-clamp-1">
                            {article.author}
                          </p>
                          <span className="text-xs text-gray-400 dark:text-gray-500">
                            {new Date(article.created_at).toLocaleDateString('id-ID', {
                              day: 'numeric',
                              month: 'short',
                            })}
                          </span>
                        </div>

                        {/* Image (Right Side) */}
                        {article.image && (
                          <div className="flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden">
                            <img
                              src={article.image}
                              alt={article.title}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                            />
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* Bottom Spacing for Tab Bar */}
        <div className="h-24" />
      </div>
    </div>
  );
}
