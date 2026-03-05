import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Search, TrendingUp, Calendar as CalendarIcon, BookOpen, GraduationCap, ImageIcon, Compass, X } from 'lucide-react';
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Unified Sticky Glassmorphic Header */}
      <div className="sticky top-0 z-30 bg-white/80 dark:bg-gray-950/80 backdrop-blur-xl pt-12 pb-4 px-5 border-b border-gray-100 dark:border-gray-800">
        {/* Premium Title Area */}
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
            placeholder="Cari jamaah, kajian, atau artikel..."
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

        {/* Scrollable Tabs - Modern Pill Style */}
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
                  className={`flex items-center gap-2 whitespace-nowrap transition-all ${
                    isActive
                      ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900 px-4 py-1.5 rounded-full'
                      : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 px-4 py-1.5'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-sm font-semibold">
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
                              className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 cursor-pointer hover:shadow-md hover:border-emerald-300 dark:hover:border-emerald-600 transition-all"
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
                              className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex gap-4 items-center cursor-pointer hover:shadow-md transition-all"
                            >
                              {/* Content (Left Side) */}
                              <div className="flex-1 min-w-0">
                                <h4 className="font-bold text-gray-900 dark:text-white text-base mb-1 line-clamp-2">
                                  {article.title}
                                </h4>
                                <p className="text-gray-500 dark:text-gray-400 text-sm line-clamp-1 mb-2">
                                  {article.excerpt}
                                </p>
                                <div className="flex items-center gap-2 text-xs text-gray-400">
                                  <span>👤</span>
                                  <span>{article.author}</span>
                                  <span>•</span>
                                  <span>
                                    {new Date(article.created_at).toLocaleDateString('id-ID', {
                                      day: 'numeric',
                                      month: 'short',
                                    })}
                                  </span>
                                </div>
                              </div>

                              {/* Thumbnail (Right Side) */}
                              <div className="flex-shrink-0 w-24 h-24 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-700">
                                {article.image ? (
                                  <img
                                    src={article.image}
                                    alt={article.title}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center">
                                    <ImageIcon className="w-8 h-8 text-gray-400" />
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
                className="bg-white dark:bg-gray-800 rounded-2xl p-12 text-center shadow-sm border border-gray-100 dark:border-gray-700"
              >
                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
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
                {/* Hero Article (First Item) - Premium Overlaid Design */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onNavigate?.('article-detail', articles[0])}
                  className="relative w-full h-72 rounded-3xl overflow-hidden shadow-xl mb-6 group cursor-pointer border border-gray-100 dark:border-gray-800"
                >
                  {/* Background Image or Gradient Fallback */}
                  {articles[0].image ? (
                    <img
                      src={articles[0].image}
                      alt={articles[0].title}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-600 via-teal-600 to-blue-600" />
                  )}
                  
                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
                  
                  {/* Top Badge */}
                  <div className="absolute top-4 left-4 bg-emerald-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1">
                    ✨ Sorotan
                  </div>
                  
                  {/* Content (Bottom) */}
                  <div className="absolute bottom-0 left-0 right-0 p-5">
                    <h3 className="text-2xl font-bold text-white mb-2 leading-tight line-clamp-2">
                      {articles[0].title}
                    </h3>
                    <div className="flex items-center gap-2 text-gray-300 text-xs">
                      <span className="flex items-center gap-1">
                        <span>👤</span>
                        <span>{articles[0].author}</span>
                      </span>
                      <span>•</span>
                      <span>
                        {new Date(articles[0].created_at).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </span>
                    </div>
                  </div>
                </motion.div>

                {/* List Articles (Remaining Items) - Modern Row Layout */}
                <div className="space-y-3">
                  {articles.slice(1).map((article, index) => (
                    <motion.div
                      key={article.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 + index * 0.05 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => onNavigate?.('article-detail', article)}
                      className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex gap-4 items-center cursor-pointer hover:shadow-md transition-all"
                    >
                      {/* Content (Left Side) */}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-gray-900 dark:text-white text-lg mb-2 line-clamp-2 leading-snug">
                          {article.title}
                        </h4>
                        <p className="text-gray-500 dark:text-gray-400 text-base line-clamp-2 mb-3 leading-relaxed">
                          {article.excerpt}
                        </p>
                        <div className="flex items-center gap-2 text-sm text-gray-400">
                          <span>👤</span>
                          <span>{article.author}</span>
                          <span>•</span>
                          <span>
                            {new Date(article.created_at).toLocaleDateString('id-ID', {
                              day: 'numeric',
                              month: 'short',
                            })}
                          </span>
                        </div>
                      </div>

                      {/* Thumbnail (Right Side) - Only show if image exists */}
                      {article.image && (
                        <div className="flex-shrink-0 w-24 h-24 rounded-xl overflow-hidden">
                          <img
                            src={article.image}
                            alt={article.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
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
