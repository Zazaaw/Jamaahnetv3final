import React, { useState } from 'react';
import { X, Search, UserPlus, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { projectId } from '../utils/supabase/info';
import { toast } from 'sonner@2.0.3';

export default function AddConnectionModal({
  session,
  onClose,
  onSuccess,
}: {
  session: any;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [username, setUsername] = useState('');
  const [searchResult, setSearchResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) return;

    setLoading(true);
    setSearchResult(null);

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-4319e602/api/users/search?username=${encodeURIComponent(username)}`,
        {
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setSearchResult(data);
      } else {
        const error = await response.json();
        toast.error(error.error || 'User tidak ditemukan');
      }
    } catch (error) {
      console.error('Error searching user:', error);
      toast.error('Gagal mencari user');
    } finally {
      setLoading(false);
    }
  };

  const handleAddConnection = async () => {
    if (!searchResult) return;

    setAdding(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-4319e602/api/connections`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            user_id: searchResult.id,
          }),
        }
      );

      if (response.ok) {
        toast.success('Koneksi berhasil ditambahkan!');
        onSuccess();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Gagal menambahkan koneksi');
      }
    } catch (error) {
      console.error('Error adding connection:', error);
      toast.error('Gagal menambahkan koneksi');
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl max-w-md w-full max-h-[80vh] overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-br from-purple-600 via-pink-600 to-purple-700 dark:from-purple-700 dark:via-pink-700 dark:to-purple-800 text-white p-6">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xl font-bold">Tambah Koneksi</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <p className="text-white/80 text-sm">
            Cari user berdasarkan username untuk menambahkan koneksi
          </p>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Search Form */}
          <form onSubmit={handleSearch} className="mb-6">
            <div className="relative">
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Masukkan username"
                className="w-full px-4 py-3 pl-12 border border-gray-300 dark:border-gray-600 rounded-2xl focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                disabled={loading}
              />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            </div>
            <button
              type="submit"
              disabled={loading || !username.trim()}
              className="w-full mt-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-2xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Mencari...
                </>
              ) : (
                <>
                  <Search className="w-5 h-5" />
                  Cari User
                </>
              )}
            </button>
          </form>

          {/* Search Result */}
          <AnimatePresence>
            {searchResult && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="bg-gradient-to-br from-gray-50 to-purple-50/30 dark:from-gray-700 dark:to-purple-900/20 rounded-2xl p-4 border border-purple-200 dark:border-purple-700/50"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-xl">
                      {searchResult.name?.charAt(0).toUpperCase() || searchResult.username?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                      {searchResult.name}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                      @{searchResult.username}
                    </p>
                    {searchResult.mosque && (
                      <p className="text-xs text-gray-500 dark:text-gray-500 truncate mt-1">
                        {searchResult.mosque}
                      </p>
                    )}
                  </div>
                </div>
                <button
                  onClick={handleAddConnection}
                  disabled={adding}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-2xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {adding ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Menambahkan...
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-5 h-5" />
                      Tambah Koneksi
                    </>
                  )}
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
