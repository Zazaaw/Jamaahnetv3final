import React, { useState, useEffect } from 'react';
import { ArrowLeft, Calendar, User, Share2, MessageCircle, Send, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner@2.0.3';
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

interface Comment {
  id: string;
  article_id: string;
  user_id: string;
  user_name: string;
  text: string;
  created_at: number;
}

interface ArticleDetailScreenProps {
  article: Article;
  session: any;
  onBack: () => void;
}

export default function ArticleDetailScreen({ article, session, onBack }: ArticleDetailScreenProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingComments, setIsLoadingComments] = useState(true);

  useEffect(() => {
    fetchComments();
  }, [article.id]);

  const fetchComments = async () => {
    try {
      setIsLoadingComments(true);
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-4319e602/api/articles/${article.id}/comments`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );
      const data = await response.json();
      setComments(data);
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setIsLoadingComments(false);
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!session) {
      toast.error('Silakan login terlebih dahulu untuk berkomentar');
      return;
    }

    if (!newComment.trim()) {
      toast.error('Komentar tidak boleh kosong');
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-4319e602/api/articles/${article.id}/comments`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ text: newComment }),
        }
      );

      if (response.ok) {
        const comment = await response.json();
        setComments([comment, ...comments]);
        setNewComment('');
        toast.success('Komentar berhasil dikirim!');
      } else {
        const error = await response.json();
        toast.error(error.error || 'Gagal mengirim komentar');
      }
    } catch (error) {
      console.error('Error submitting comment:', error);
      toast.error('Gagal mengirim komentar');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus komentar ini?')) {
      return;
    }

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-4319e602/api/articles/${article.id}/comments/${commentId}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
          },
        }
      );

      if (response.ok) {
        setComments(comments.filter(c => c.id !== commentId));
        toast.success('Komentar berhasil dihapus');
      } else {
        const error = await response.json();
        toast.error(error.error || 'Gagal menghapus komentar');
      }
    } catch (error) {
      console.error('Error deleting comment:', error);
      toast.error('Gagal menghapus komentar');
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: article.title,
        text: article.excerpt,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link artikel disalin!');
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
        
        <div className="relative z-10 p-6">
          <div className="flex items-center justify-between mb-4">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={onBack}
              className="bg-white/20 backdrop-blur-md p-3 rounded-2xl"
            >
              <ArrowLeft className="w-5 h-5" />
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={handleShare}
              className="bg-white/20 backdrop-blur-md p-3 rounded-2xl"
            >
              <Share2 className="w-5 h-5" />
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Article Content */}
      <div className="relative z-10 -mt-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mx-4 bg-white dark:bg-gray-800/90 backdrop-blur-sm rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-700/50 overflow-hidden"
        >
          {/* Article Image */}
          {article.image && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="relative w-full h-64 overflow-hidden"
            >
              <img
                src={article.image}
                alt={article.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
            </motion.div>
          )}

          {/* Article Meta & Content */}
          <div className="p-6 space-y-6">
            {/* Title */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                {article.title}
              </h1>
            </motion.div>

            {/* Meta Info */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex flex-wrap gap-4 pb-6 border-b border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <div className="bg-emerald-100 dark:bg-emerald-900/30 p-2 rounded-xl">
                  <User className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                </div>
                <span>{article.author}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <div className="bg-teal-100 dark:bg-teal-900/30 p-2 rounded-xl">
                  <Calendar className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                </div>
                <span>
                  {new Date(article.created_at).toLocaleDateString('id-ID', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </span>
              </div>
            </motion.div>

            {/* Article Content */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="prose prose-emerald dark:prose-invert max-w-none"
            >
              {article.content ? (
                <div className="text-gray-700 dark:text-gray-300 leading-relaxed space-y-4">
                  {article.content.split('\n\n').map((paragraph, index) => (
                    <p key={index} className="text-base">
                      {paragraph}
                    </p>
                  ))}
                </div>
              ) : (
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  {article.excerpt}
                </p>
              )}
            </motion.div>

            {/* Islamic Decoration */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6 }}
              className="flex justify-center py-6"
            >
              <div className="text-emerald-600 dark:text-emerald-400 text-2xl">
                ۞
              </div>
            </motion.div>

            {/* CTA Section */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-2xl p-6 border border-emerald-200 dark:border-emerald-700/50"
            >
              <p className="text-center text-gray-700 dark:text-gray-300 text-sm italic">
                "Barangsiapa menunjuki kepada kebaikan maka dia akan mendapat pahala seperti orang yang melakukannya."
                <span className="block mt-2 text-emerald-600 dark:text-emerald-400">
                  (HR. Muslim)
                </span>
              </p>
            </motion.div>
          </div>
        </motion.div>

        {/* Comments Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mx-4 mt-6 bg-white dark:bg-gray-800/90 backdrop-blur-sm rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-700/50 overflow-hidden"
        >
          <div className="p-6">
            {/* Comments Header */}
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-gradient-to-br from-emerald-500 to-teal-500 p-3 rounded-2xl">
                <MessageCircle className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white">
                  Diskusi Artikel
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {comments.length} komentar
                </p>
              </div>
            </div>

            {/* Comment Form */}
            {session ? (
              <form onSubmit={handleSubmitComment} className="mb-6">
                <div className="flex gap-3">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/30 dark:to-teal-900/30 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Tulis komentar Anda..."
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400 text-gray-900 dark:text-white"
                      rows={3}
                      disabled={isSubmitting}
                    />
                    <div className="flex justify-end mt-2">
                      <motion.button
                        type="submit"
                        whileTap={{ scale: 0.95 }}
                        disabled={isSubmitting || !newComment.trim()}
                        className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isSubmitting ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Mengirim...
                          </>
                        ) : (
                          <>
                            <Send className="w-4 h-4" />
                            Kirim
                          </>
                        )}
                      </motion.button>
                    </div>
                  </div>
                </div>
              </form>
            ) : (
              <div className="mb-6 p-4 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-2xl border border-amber-200 dark:border-amber-700/50">
                <p className="text-center text-gray-700 dark:text-gray-300 text-sm">
                  Silakan <span className="font-semibold text-emerald-600 dark:text-emerald-400">login</span> untuk berkomentar
                </p>
              </div>
            )}

            {/* Comments List */}
            <div className="space-y-4">
              {isLoadingComments ? (
                <div className="text-center py-8">
                  <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Memuat komentar...</p>
                </div>
              ) : comments.length === 0 ? (
                <div className="text-center py-8">
                  <MessageCircle className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-500 dark:text-gray-400">
                    Belum ada komentar. Jadilah yang pertama berkomentar!
                  </p>
                </div>
              ) : (
                <AnimatePresence>
                  {comments.map((comment, index) => (
                    <motion.div
                      key={comment.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex gap-3 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-gray-100 dark:border-gray-700/50"
                    >
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/30 dark:to-teal-900/30 rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h4 className="font-semibold text-gray-900 dark:text-white">
                              {comment.user_name}
                            </h4>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {new Date(comment.created_at).toLocaleDateString('id-ID', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </p>
                          </div>
                          {session && session.user.id === comment.user_id && (
                            <motion.button
                              whileTap={{ scale: 0.9 }}
                              onClick={() => handleDeleteComment(comment.id)}
                              className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </motion.button>
                          )}
                        </div>
                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                          {comment.text}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
            </div>
          </div>
        </motion.div>

        {/* Bottom Spacing */}
        <div className="h-8" />
      </div>
    </div>
  );
}
