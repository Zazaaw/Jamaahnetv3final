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
  avatar_url?: string;
}

import { getSupabaseClient } from '../utils/supabase/client';

export default function ConnectionsScreen({
  session,
  onBack,
  onStartChat,
  onNavigate,
}: {
  session: any;
  onBack: () => void;
  onStartChat: (userId: string) => void;
  onNavigate?: (screen: string, data?: any) => void;
}) {
  const [activeTab, setActiveTab] = useState<'mengikuti' | 'pengikut'>('mengikuti');
  const [following, setFollowing] = useState<Connection[]>([]);
  const [followers, setFollowers] = useState<Connection[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const supabase = getSupabaseClient();
      
      // 1. Fetch Following (Mengikuti)
      const { data: followingData } = await supabase.from('user_connections').select('connected_user_id').eq('user_id', session.user.id);
      if (followingData && followingData.length > 0) {
        const ids = followingData.map(d => d.connected_user_id);
        const { data: profiles } = await supabase.from('profiles').select('id, name, username, mosque, avatar_url').in('id', ids);
        setFollowing(profiles || []);
      } else { 
        setFollowing([]); 
      }

      // 2. Fetch Followers (Pengikut)
      const { data: followersData } = await supabase.from('user_connections').select('user_id').eq('connected_user_id', session.user.id);
      if (followersData && followersData.length > 0) {
        const ids = followersData.map(d => d.user_id);
        const { data: profiles } = await supabase.from('profiles').select('id, name, username, mosque, avatar_url').in('id', ids);
        setFollowers(profiles || []);
      } else { 
        setFollowers([]); 
      }
    } catch (error) {
      console.error('Error fetching connections:', error);
    } finally {
      setLoading(false);
    }
  };

  const currentList = activeTab === 'mengikuti' ? following : followers;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50/20 to-pink-50/20 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      {/* Background Pattern */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <IslamicPattern className="text-purple-600 dark:text-purple-400 opacity-[0.02]" />
      </div>

      {/* Header Pattern Only */}
      <div className="fixed top-0 left-0 right-0 h-32 bg-gradient-to-br from-purple-50/50 to-pink-50/50 dark:from-purple-900/10 dark:to-pink-900/10 pointer-events-none" />

      {/* Clean Sticky Header */}
      <div className="sticky top-0 z-30 bg-white/80 dark:bg-gray-950/80 backdrop-blur-xl pt-12 pb-4 px-6 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center justify-between mb-4">
          <button 
            onClick={onBack} 
            className="p-2.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors text-gray-700 dark:text-gray-300"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
            Koneksi
          </h1>

          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setShowAddModal(true)}
            className="p-2.5 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-xl hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-colors"
          >
            <UserPlus className="w-5 h-5" />
          </motion.button>
        </div>

        {/* Tab Bar within Sticky Header */}
        <div className="bg-gray-100/80 dark:bg-gray-800/80 p-1.5 rounded-2xl flex gap-2">
          <button
            onClick={() => setActiveTab('mengikuti')}
            className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-semibold transition-all ${
              activeTab === 'mengikuti'
                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-500 dark:text-gray-400 hover:bg-white/50 dark:hover:bg-gray-700/50'
            }`}
          >
            Mengikuti ({following.length})
          </button>
          <button
            onClick={() => setActiveTab('pengikut')}
            className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-semibold transition-all ${
              activeTab === 'pengikut'
                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-500 dark:text-gray-400 hover:bg-white/50 dark:hover:bg-gray-700/50'
            }`}
          >
            Pengikut ({followers.length})
          </button>
        </div>
      </div>

      {/* Connections List */}
      <div className="relative z-10 p-6 pb-28">
        {loading ? (
          <div className="text-center py-12">
            <Loader2 className="w-12 h-12 text-purple-600 dark:text-purple-400 animate-spin mx-auto mb-3" />
            <p className="text-gray-500 dark:text-gray-400">Memuat koneksi...</p>
          </div>
        ) : currentList.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-10 h-10 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              {activeTab === 'mengikuti' ? 'Belum ada yang Anda ikuti' : 'Belum ada pengikut'}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {activeTab === 'mengikuti' 
                ? 'Cari dan ikuti jamaah lain untuk melihat aktivitas mereka.'
                : 'Belum ada jamaah yang mengikuti Anda.'}
            </p>
            {activeTab === 'mengikuti' && (
              <button
                onClick={() => setShowAddModal(true)}
                className="bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 px-6 rounded-2xl font-semibold hover:shadow-lg transition-all"
              >
                Cari Jamaah
              </button>
            )}
          </motion.div>
        ) : (
          <div className="space-y-3">
            {currentList.map((connection, index) => (
              <motion.div
                key={connection.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => onNavigate?.('public-profile', connection)}
                className="bg-white dark:bg-gray-800/50 backdrop-blur-sm rounded-3xl p-5 shadow-lg border border-gray-100 dark:border-gray-700/50 cursor-pointer hover:border-purple-300 transition-colors"
              >
                <div className="flex items-center gap-4">
                  {connection.avatar_url ? (
                    <img
                      src={connection.avatar_url}
                      alt={connection.name}
                      className="w-14 h-14 rounded-full object-cover flex-shrink-0 border-2 border-white dark:border-gray-800 shadow-sm"
                    />
                  ) : (
                    <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm">
                      <span className="text-white text-lg font-medium">
                        {connection.name?.charAt(0).toUpperCase() || connection.username?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
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
                    onClick={(e) => {
                      e.stopPropagation();
                      onStartChat(connection.id);
                    }}
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
            fetchData();
          }}
        />
      )}
    </div>
  );
}
