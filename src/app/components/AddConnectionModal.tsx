import React, { useState } from 'react';
import { X, Search, UserPlus, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { getSupabaseClient } from '../utils/supabase/client';
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
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [addingId, setAddingId] = useState<string | null>(null);

  const supabase = getSupabaseClient();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setLoading(true);
    setSearchResults([]);

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, name, username, avatar_url, mosque')
        .ilike('name', `%${searchQuery}%`)
        .neq('id', session.user.id)
        .limit(5);
      
      if (error) throw error;
      
      setSearchResults(data || []);
      if (data?.length === 0) {
        toast.error('User tidak ditemukan');
      }
    } catch (error) {
      console.error('Error searching user:', error);
      toast.error('Gagal mencari user');
    } finally {
      setLoading(false);
    }
  };

  const handleAddConnection = async (targetId: string) => {
    setAddingId(targetId);
    try {
      const { error } = await supabase
        .from('user_connections')
        .insert({ user_id: session.user.id, connected_user_id: targetId });
      
      if (error) {
        if (error.code === '23505') throw new Error('Sudah berteman dengan user ini');
        throw error;
      }

      toast.success('Koneksi berhasil ditambahkan!');
      onSuccess();
    } catch (error: any) {
      console.error('Error adding connection:', error);
      toast.error(error.message || 'Gagal menambahkan koneksi');
    } finally {
      setAddingId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl max-w-md w-full max-h-[80vh] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="bg-gradient-to-br from-purple-600 via-pink-600 to-purple-700 dark:from-purple-700 dark:via-pink-700 dark:to-purple-800 text-white p-6 shrink-0">
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
            Cari user berdasarkan nama untuk menambahkan koneksi
          </p>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto">
          {/* Search Form */}
          <form onSubmit={handleSearch} className="mb-6">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Masukkan nama jamaah..."
                className="w-full px-4 py-3 pl-12 border border-gray-300 dark:border-gray-600 rounded-2xl focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                disabled={loading}
              />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            </div>
            <button
              type="submit"
              disabled={loading || !searchQuery.trim()}
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

          {/* Search Results */}
          <AnimatePresence>
            {searchResults.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="space-y-3"
              >
                {searchResults.map((result) => (
                  <div 
                    key={result.id}
                    className="bg-gradient-to-br from-gray-50 to-purple-50/30 dark:from-gray-700 dark:to-purple-900/20 rounded-2xl p-4 border border-purple-200 dark:border-purple-700/50"
                  >
                    <div className="flex items-center gap-4 mb-4">
                      {result.avatar_url ? (
                        <img 
                          src={result.avatar_url}
                          alt={result.name}
                          className="w-14 h-14 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-white text-xl font-bold">
                            {result.name?.charAt(0).toUpperCase() || result.username?.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                          {result.name}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                          @{result.username}
                        </p>
                        {result.mosque && (
                          <p className="text-xs text-gray-500 dark:text-gray-500 truncate mt-1">
                            {result.mosque}
                          </p>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => handleAddConnection(result.id)}
                      disabled={addingId === result.id}
                      className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-2xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {addingId === result.id ? (
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
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
