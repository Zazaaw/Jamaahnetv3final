import React, { useState, useEffect } from 'react';
import { ArrowLeft, Calendar, User, TrendingUp, Search } from 'lucide-react';
import { motion } from 'motion/react';
import { IslamicPattern } from './IslamicPattern';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface Article {
  id: string;
  title: string;
  excerpt: string;
  author: string;
  created_at: number;
  image?: string;
  content?: string;
}

interface AllArticlesScreenProps {
  onBack: () => void;
  onSelectArticle: (article: Article) => void;
}

export default function AllArticlesScreen({ onBack, onSelectArticle }: AllArticlesScreenProps) {
  const [articles, setArticles] = useState<Article[]>([]);
  const [filteredArticles, setFilteredArticles] = useState<Article[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchArticles();
  }, []);

  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = articles.filter(article =>
        article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.author.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredArticles(filtered);
    } else {
      setFilteredArticles(articles);
    }
  }, [searchQuery, articles]);

  const fetchArticles = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-4319e602/api/articles`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );
      const data = await response.json();
      setArticles(data);
      setFilteredArticles(data);
    } catch (error) {
      console.error('Error fetching articles:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-emerald-50/30 to-teal-50/30 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      {/* Decorative Islamic Pattern Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <IslamicPattern className="text-emerald-600 dark:text-emerald-400 opacity-[0.03]" />
      </div>

      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative bg-gradient-to-br from-emerald-600 via-emerald-500 to-teal-500 dark:from-emerald-700 dark:via-emerald-600 dark:to-teal-600 text-white"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
        <IslamicPattern className="text-white opacity-10" />
        
        <div className="relative z-10 p-6 pb-8">
          {/* Top Bar */}
          <div className="flex items-center gap-4 mb-6">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={onBack}
              className="bg-white/20 backdrop-blur-md p-3 rounded-2xl"
            >
              <ArrowLeft className="w-5 h-5" />
            </motion.button>
            <div>
              <h1 className="text-2xl font-bold">Semua Artikel</h1>
              <p className="text-emerald-50 text-sm">Baca kajian dan informasi terkini</p>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-emerald-600" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari artikel..."
              className="w-full pl-12 pr-4 py-3 bg-white/90 backdrop-blur-md rounded-2xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/50"
            />
          </div>
        </div>
      </motion.div>

      {/* Articles List */}
      <div className="relative z-10 p-6 space-y-4">
        {isLoading ? (
          <div className="text-center py-12">
            <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">Memuat artikel...</p>
          </div>
        ) : filteredArticles.length === 0 ? (
          <div className="text-center py-12">
            <TrendingUp className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">
              {searchQuery ? 'Artikel tidak ditemukan' : 'Belum ada artikel'}
            </p>
          </div>
        ) : (
          filteredArticles.map((article, index) => (
            <motion.div
              key={article.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => onSelectArticle(article)}
              className="card-hover bg-white dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl overflow-hidden shadow-lg border border-gray-100 dark:border-gray-700/50 cursor-pointer group"
            >
              <div className="flex gap-4 p-4">
                {/* Article Image */}
                {article.image ? (
                  <div className="flex-shrink-0 w-28 h-28 rounded-xl overflow-hidden">
                    <img 
                      src={article.image} 
                      alt={article.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                ) : (
                  <div className="flex-shrink-0 w-28 h-28 bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/30 dark:to-teal-900/30 rounded-xl flex items-center justify-center">
                    <TrendingUp className="w-12 h-12 text-emerald-600 dark:text-emerald-400" />
                  </div>
                )}

                {/* Article Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                    {article.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-3 line-clamp-2">
                    {article.excerpt}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                    <div className="flex items-center gap-1">
                      <User className="w-3 h-3" />
                      <span>{article.author}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>
                        {new Date(article.created_at).toLocaleDateString('id-ID', { 
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))
        )}

        {/* Bottom Spacing */}
        <div className="h-4" />
      </div>
    </div>
  );
}
