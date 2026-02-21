import React, { useState, useEffect } from 'react';
import { ArrowLeft, Users, UserPlus, MessageCircle, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';
import { projectId } from '../utils/supabase/info';
import AddConnectionModal from './AddConnectionModal';
import { IslamicPattern } from './IslamicPattern';

interface Connection {
  id: string;
  name: string;
  username: string;
  mosque?: string;
}

export default function ConnectionsScreen({
  session,
  onBack,
  onStartChat,
}: {
  session: any;
  onBack: () => void;
  onStartChat: (userId: string) => void;
}) {
  const [connections, setConnections] = useState<Connection[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    fetchConnections();
  }, []);

  const fetchConnections = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-4319e602/api/connections`,
        {
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
          },
        }
      );
      const data = await response.json();
      setConnections(data);
    } catch (error) {
      console.error('Error fetching connections:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50/20 to-pink-50/20 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      {/* Background Pattern */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <IslamicPattern className="text-purple-600 dark:text-purple-400 opacity-[0.02]" />
      </div>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative bg-gradient-to-br from-purple-600 via-pink-600 to-purple-700 dark:from-purple-700 dark:via-pink-700 dark:to-purple-800 text-white p-6"
        style={{ borderBottomLeftRadius: '2rem', borderBottomRightRadius: '2rem' }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
        <IslamicPattern className="text-white opacity-10" />
        
        <div className="relative z-10">
          <button onClick={onBack} className="mb-4 p-2 hover:bg-white/20 rounded-xl transition-colors">
            <ArrowLeft className="w-6 h-6" />
          </button>
          
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center">
              <Users className="w-8 h-8" />
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold mb-1">Koneksi</h1>
              <p className="text-white/80 text-sm">
                {connections.length} Koneksi
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="w-full bg-white/20 backdrop-blur-md hover:bg-white/30 text-white py-3 px-6 rounded-2xl font-semibold flex items-center justify-center gap-2 transition-all"
          >
            <UserPlus className="w-5 h-5" />
            Tambah Koneksi
          </button>
        </div>
      </motion.div>

      {/* Connections List */}
      <div className="relative z-10 p-6 pb-28">
        {loading ? (
          <div className="text-center py-12">
            <Loader2 className="w-12 h-12 text-purple-600 dark:text-purple-400 animate-spin mx-auto mb-3" />
            <p className="text-gray-500 dark:text-gray-400">Memuat koneksi...</p>
          </div>
        ) : connections.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-10 h-10 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Belum ada koneksi
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Tambahkan koneksi untuk mulai chat dengan jamaah lain
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 px-6 rounded-2xl font-semibold hover:shadow-lg transition-all"
            >
              Tambah Koneksi Pertama
            </button>
          </motion.div>
        ) : (
          <div className="space-y-3">
            {connections.map((connection, index) => (
              <motion.div
                key={connection.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white dark:bg-gray-800/50 backdrop-blur-sm rounded-3xl p-5 shadow-lg border border-gray-100 dark:border-gray-700/50"
              >
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-lg">
                      {connection.name?.charAt(0).toUpperCase() || connection.username?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                      {connection.name}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                      @{connection.username}
                    </p>
                    {connection.mosque && (
                      <p className="text-xs text-gray-500 dark:text-gray-500 truncate mt-1">
                        {connection.mosque}
                      </p>
                    )}
                  </div>
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => onStartChat(connection.id)}
                    className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 text-white rounded-2xl hover:shadow-lg transition-all flex-shrink-0"
                  >
                    <MessageCircle className="w-5 h-5" />
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Add Connection Modal */}
      {showAddModal && (
        <AddConnectionModal
          session={session}
          onClose={() => setShowAddModal(false)}
          onSuccess={() => {
            setShowAddModal(false);
            fetchConnections();
          }}
        />
      )}
    </div>
  );
}
