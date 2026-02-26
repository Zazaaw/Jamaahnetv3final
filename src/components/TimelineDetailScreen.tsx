import React, { useState, useEffect } from 'react';
import { ArrowLeft, Heart, MessageCircle, Send, Edit2, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { getSupabaseClient } from '../utils/supabase/client';

interface Comment {
  id: string;
  user_id: string;
  user_name: string;
  text: string;
  created_at: string;
}

interface TimelinePost {
  id: string;
  user_id: string;
  user_name: string;
  title: string;
  content: string;
  image?: string;
  created_at: number;
  likes?: string[];
  comments?: Comment[];
}

export default function TimelineDetailScreen({
  post,
  session,
  onBack,
  onEdit,
  onDelete,
}: {
  post: TimelinePost;
  session: any;
  onBack: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const [likes, setLikes] = useState<string[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isLiked, setIsLiked] = useState(false);
  const supabase = getSupabaseClient();

  useEffect(() => {
    loadPostData();
  }, [post.id]);

  const loadPostData = () => {
    // Load from post object (already has likes and comments from API)
    setLikes(post.likes || []);
    setIsLiked(session && (post.likes || []).includes(session.user.id));
    setComments((post.comments || []).sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    ));
  };

  const handleLike = async () => {
    if (!session) {
      toast.error('Silakan login untuk like postingan');
      return;
    }

    const userId = session.user.id;
    const currentLikes = likes || [];
    const isCurrentlyLiked = currentLikes.includes(userId);
    
    let updatedLikes;
    if (isCurrentlyLiked) {
      updatedLikes = currentLikes.filter(id => id !== userId);
    } else {
      updatedLikes = [...currentLikes, userId];
    }

    // Optimistic update
    setLikes(updatedLikes);
    setIsLiked(!isCurrentlyLiked);
    toast.success(!isCurrentlyLiked ? 'Postingan dilike! ❤️' : 'Like dibatalkan');

    try {
      const { error } = await supabase
        .from('announcements')
        .update({ likes: updatedLikes })
        .eq('id', post.id);

      if (error) throw error;
    } catch (error) {
      console.error('Error toggling like:', error);
      toast.error('Gagal toggle like');
      // Revert optimistic update
      setLikes(currentLikes);
      setIsLiked(isCurrentlyLiked);
    }
  };

  const handleAddComment = async () => {
    if (!session) {
      toast.error('Silakan login untuk berkomentar');
      return;
    }

    if (!newComment.trim()) {
      toast.error('Komentar tidak boleh kosong');
      return;
    }

    const newCommentObj: Comment = {
      id: crypto.randomUUID(),
      user_id: session.user.id,
      user_name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'Anonymous',
      text: newComment.trim(),
      created_at: new Date().toISOString(),
    };

    const updatedComments = [newCommentObj, ...comments];

    // Optimistic update
    setComments(updatedComments);
    setNewComment('');
    toast.success('Komentar berhasil ditambahkan! 💬');

    try {
      const { error } = await supabase
        .from('announcements')
        .update({ comments: updatedComments })
        .eq('id', post.id);

      if (error) throw error;
    } catch (error) {
      console.error('Error adding comment:', error);
      toast.error('Gagal menambahkan komentar');
      // Revert optimistic update
      setComments(comments);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!session) return;

    const previousComments = [...comments];
    const updatedComments = comments.filter((c) => c.id !== commentId);

    // Optimistic update
    setComments(updatedComments);
    toast.success('Komentar dihapus');

    try {
      const { error } = await supabase
        .from('announcements')
        .update({ comments: updatedComments })
        .eq('id', post.id);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting comment:', error);
      toast.error('Gagal menghapus komentar');
      // Revert optimistic update
      setComments(previousComments);
    }
  };

  const isOwner = session && session.user.id === post.user_id;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-emerald-50/30 to-teal-50/30 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-emerald-600 via-emerald-500 to-teal-500 dark:from-emerald-700 dark:via-emerald-600 dark:to-teal-600 text-white p-6"
        style={{ borderBottomLeftRadius: '2rem', borderBottomRightRadius: '2rem' }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={onBack}
              className="bg-white/20 backdrop-blur-md p-2 rounded-xl"
            >
              <ArrowLeft className="w-6 h-6" />
            </motion.button>
            <div>
              <h1 className="text-2xl font-bold">Timeline Detail</h1>
              <p className="text-emerald-50 text-sm">Lihat dan berinteraksi</p>
            </div>
          </div>
          {isOwner && (
            <div className="flex gap-2">
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={onEdit}
                className="bg-white/20 backdrop-blur-md p-2 rounded-xl"
              >
                <Edit2 className="w-5 h-5" />
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={onDelete}
                className="bg-red-500/80 backdrop-blur-md p-2 rounded-xl"
              >
                <Trash2 className="w-5 h-5" />
              </motion.button>
            </div>
          )}
        </div>
      </motion.div>

      <div className="p-6 space-y-6">
        {/* Post Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700/50"
        >
          {/* Author Info */}
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-lg">
                {post.user_name?.charAt(0)?.toUpperCase() || 'A'}
              </span>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">{post.user_name}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {new Date(post.created_at).toLocaleDateString('id-ID', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
          </div>

          {/* Post Title */}
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
            {post.title}
          </h2>

          {/* Post Image */}
          {post.image && (
            <div className="mb-4 rounded-2xl overflow-hidden">
              <img
                src={post.image}
                alt={post.title}
                className="w-full h-64 object-cover"
              />
            </div>
          )}

          {/* Post Content */}
          <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap mb-6">
            {post.content}
          </p>

          {/* Like and Comment Count */}
          <div className="flex items-center gap-6 pt-4 border-t border-gray-200 dark:border-gray-700">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleLike}
              className={`flex items-center gap-2 ${
                isLiked ? 'text-red-500' : 'text-gray-500 dark:text-gray-400'
              }`}
            >
              <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
              <span className="font-semibold">{likes.length}</span>
            </motion.button>
            <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
              <MessageCircle className="w-5 h-5" />
              <span className="font-semibold">{comments.length}</span>
            </div>
          </div>
        </motion.div>

        {/* Comments Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700/50"
        >
          <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            Komentar ({comments.length})
          </h3>

          {/* Add Comment */}
          {session ? (
            <div className="mb-6">
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">
                    {(session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'J')[0].toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 flex gap-2">
                  <input
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddComment()}
                    placeholder="Tulis komentar..."
                    className="flex-1 px-4 py-3 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:text-white"
                  />
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={handleAddComment}
                    className="bg-emerald-600 text-white p-3 rounded-2xl"
                  >
                    <Send className="w-5 h-5" />
                  </motion.button>
                </div>
              </div>
            </div>
          ) : (
            <div className="mb-6 text-center py-4 bg-gray-50 dark:bg-gray-700/30 rounded-2xl">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Silakan login untuk berkomentar
              </p>
            </div>
          )}

          {/* Comments List */}
          <div className="space-y-4">
            <AnimatePresence>
              {comments.length === 0 ? (
                <p className="text-center text-gray-400 dark:text-gray-500 text-sm py-8">
                  Belum ada komentar
                </p>
              ) : (
                comments.map((comment, index) => (
                  <motion.div
                    key={comment.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex gap-3 group"
                  >
                    <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-sm">
                        {comment.user_name?.charAt(0)?.toUpperCase() || 'A'}
                      </span>
                    </div>
                    <div className="flex-1 bg-gray-50 dark:bg-gray-700/30 rounded-2xl p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-white text-sm">
                            {comment.user_name}
                          </h4>
                          <p className="text-xs text-gray-400 dark:text-gray-500">
                            {new Date(comment.created_at).toLocaleDateString('id-ID', {
                              day: 'numeric',
                              month: 'short',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                        </div>
                        {session && session.user.id === comment.user_id && (
                          <motion.button
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleDeleteComment(comment.id)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity text-red-500 p-1"
                          >
                            <Trash2 className="w-4 h-4" />
                          </motion.button>
                        )}
                      </div>
                      <p className="text-gray-700 dark:text-gray-300 text-sm">
                        {comment.text}
                      </p>
                    </div>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Bottom Spacing */}
        <div className="h-8" />
      </div>
    </div>
  );
}