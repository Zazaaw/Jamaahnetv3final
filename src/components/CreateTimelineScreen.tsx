import React, { useState } from 'react';
import { ArrowLeft, Image as ImageIcon, X } from 'lucide-react';
import { motion } from 'motion/react';
import { toast } from 'sonner';
import { getSupabaseClient } from '../utils/supabase/client';

export default function CreateTimelineScreen({
  session,
  onBack,
  onSuccess,
  editPost,
}: {
  session: any;
  onBack: () => void;
  onSuccess: () => void;
  editPost?: any;
}) {
  const [title, setTitle] = useState(editPost?.title || '');
  const [content, setContent] = useState(editPost?.content || '');
  const [image, setImage] = useState(editPost?.image || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const supabase = getSupabaseClient();

  const isEditMode = !!editPost;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !content.trim()) {
      setError('Judul dan konten tidak boleh kosong');
      return;
    }

    if (!session) {
      setError('Anda harus login terlebih dahulu');
      return;
    }

    setLoading(true);
    setError('');

    try {
      if (isEditMode) {
        // Update existing post via Supabase
        const { error: updateError } = await supabase
          .from('timeline_posts')
          .update({
            title: title.trim(),
            content: content.trim(),
            image_url: image || null,
          })
          .eq('id', editPost.id);

        if (updateError) throw updateError;

        toast.success('Postingan berhasil diupdate! ✅');
      } else {
        // Create new post via Supabase
        const { error: insertError } = await supabase
          .from('timeline_posts')
          .insert({
            user_id: session.user.id,
            title: title.trim(),
            content: content.trim(),
            image_url: image || null,
            status: 'published'
          });

        if (insertError) throw insertError;

        toast.success('Postingan berhasil dibuat! 🎉');
      }

      onSuccess();
    } catch (err: any) {
      console.error('Error saving post:', err);
      setError(err.message || 'Gagal menyimpan postingan');
      toast.error(err.message || 'Gagal menyimpan postingan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-emerald-50/30 to-teal-50/30 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-emerald-600 via-emerald-500 to-teal-500 dark:from-emerald-700 dark:via-emerald-600 dark:to-teal-600 text-white p-6"
        style={{ borderBottomLeftRadius: '2rem', borderBottomRightRadius: '2rem' }}
      >
        <div className="flex items-center gap-4">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={onBack}
            className="bg-white/20 backdrop-blur-md p-2 rounded-xl"
          >
            <ArrowLeft className="w-6 h-6" />
          </motion.button>
          <div>
            <h1 className="text-2xl font-bold">{isEditMode ? 'Edit Postingan' : 'Buat Postingan'}</h1>
            <p className="text-emerald-50 text-sm">{isEditMode ? 'Perbarui kegiatan ibadahmu' : 'Bagikan kegiatan ibadahmu'}</p>
          </div>
        </div>
      </motion.div>

      {/* Form */}
      <div className="p-6">
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          onSubmit={handleSubmit}
          className="space-y-6"
        >
          {/* Title Input */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Judul Postingan
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Contoh: Kajian Subuh Hari Ini"
              className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:text-white"
              disabled={loading}
            />
          </div>

          {/* Content Input */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Konten
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Ceritakan kegiatan ibadahmu..."
              rows={6}
              className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:text-white resize-none"
              disabled={loading}
            />
          </div>

          {/* Image URL Input (Optional) */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
              <ImageIcon className="w-4 h-4" />
              Gambar (opsional)
            </label>
            <input
              type="url"
              value={image}
              onChange={(e) => setImage(e.target.value)}
              placeholder="https://contoh.com/gambar.jpg"
              className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:text-white"
              disabled={loading}
            />
            {image && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mt-3 relative"
              >
                <img
                  src={image}
                  alt="Preview"
                  className="w-full h-48 object-cover rounded-2xl"
                  onError={() => setImage('')}
                />
                <button
                  type="button"
                  onClick={() => setImage('')}
                  className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full"
                >
                  <X className="w-4 h-4" />
                </button>
              </motion.div>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-4"
            >
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </motion.div>
          )}

          {/* Submit Button */}
          <motion.button
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-4 rounded-2xl font-semibold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (isEditMode ? 'Mengupdate...' : 'Memposting...') : (isEditMode ? 'Update Postingan' : 'Posting Sekarang')}
          </motion.button>
        </motion.form>
      </div>
    </div>
  );
}