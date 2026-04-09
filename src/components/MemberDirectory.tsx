import React, { useEffect, useState } from 'react';
import { Users, Search, ArrowLeft } from 'lucide-react';
import { motion } from 'motion/react';
import { getSupabaseClient } from '../utils/supabase/client';

export default function MemberDirectory({ onNavigate }: { onNavigate?: (screen: string, data?: any) => void }) {
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const supabase = getSupabaseClient();
        const { data, error } = await supabase
          .from('profiles')
          .select('id, name, role, avatar_url')
          .order('name', { ascending: true });

        if (error) throw error;
        setMembers(data || []);
      } catch (error) {
        console.error('Error fetching members:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMembers();
  }, []);

  const filteredMembers = members.filter(member => 
    member.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-20">
      <div className="bg-white dark:bg-gray-900 px-4 py-4 sticky top-0 z-20 border-b border-gray-100 dark:border-gray-800 shadow-sm flex items-center gap-3">
        <button onClick={() => onNavigate?.('home')} className="p-2 -ml-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div>
          <h1 className="text-xl font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
            Direktori Jamaah
          </h1>
          <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">{members.length} Member Terdaftar</p>
        </div>
      </div>

      <div className="p-4 max-w-2xl mx-auto space-y-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input 
            type="text"
            placeholder="Cari nama jamaah..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all shadow-sm text-gray-900 dark:text-white"
          />
        </div>

        {loading ? (
          <div className="flex justify-center py-10">
            <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            className="grid grid-cols-1 gap-3"
          >
            {filteredMembers.map((member, index) => (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                key={member.id} 
                onClick={() => onNavigate?.('other-profile', { userId: member.id })}
                className="flex items-center gap-4 p-4 bg-white dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700/50 rounded-2xl hover:border-emerald-200 dark:hover:border-emerald-800 transition-all cursor-pointer shadow-sm group"
              >
                {member.avatar_url ? (
                  <img src={member.avatar_url} alt={member.name} className="w-12 h-12 rounded-full object-cover border border-gray-200 dark:border-gray-700" />
                ) : (
                  <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-inner">
                    {member.name ? member.name.charAt(0).toUpperCase() : '?'}
                  </div>
                )}
                <div className="flex-1">
                  <h4 className="font-bold text-gray-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                    {member.name || 'Jamaah Tanpa Nama'}
                  </h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{member.role || 'Member'}</p>
                </div>
              </motion.div>
            ))}
            {filteredMembers.length === 0 && (
              <div className="text-center py-10 text-gray-500 dark:text-gray-400">
                Jamaah tidak ditemukan.
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}