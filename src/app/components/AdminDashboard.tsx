import React, { useState, useEffect } from 'react';
import emailjs from '@emailjs/browser';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, Users, AlertCircle, CheckCircle, 
  Clock, Shield, Edit, Trash2, Plus, Search, Filter, MoreVertical, 
  Eye, UserCheck, Calendar, DollarSign, Flag, AlertTriangle, 
  BadgeCheck, ChevronRight, List, BookOpen, X, ShieldAlert, MessageSquare, Activity, MapPin, Repeat
} from 'lucide-react';
import { getSupabaseClient } from '../utils/supabase/client';
import { toast } from 'sonner';
import CreateAnnouncementModal from './modals/CreateAnnouncementModal';

interface AdminDashboardProps {
  session: any;
  onNavigate: (screen: string) => void;
}

type TabType = 'overview' | 'users' | 'timeline' | 'reports';

export default function AdminDashboard({ session, onNavigate }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0, activeUsers: 0, pendingUsers: 0,
    totalPosts: 0
  });

  const [users, setUsers] = useState<any[]>([]);
  const [timelinePosts, setTimelinePosts] = useState<any[]>([]);
  const [userReports, setUserReports] = useState<any[]>([]);
  
  const [showCreateAnnouncement, setShowCreateAnnouncement] = useState(false);

  const supabase = getSupabaseClient();

  useEffect(() => {
    fetchAllData();
  }, [session]);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchUsers(), fetchTimelinePosts(), fetchUserReports()
      ]);
    } catch (error) {
      console.error('Error fetching admin data:', error);
      toast.error('Gagal memuat data dashboard');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase.from('profiles').select('*');
      if (error) throw error;
      if (data) {
        const mappedUsers = data.map((u: any) => ({
          id: u.id, name: u.full_name || u.name || 'Anonymous User', email: u.email || 'Email hidden',
          memberId: u.member_id || (u.status === 'Pending' ? 'Pending Approval' : u.id.substring(0, 8).toUpperCase()),
          status: u.status || 'Active', role: u.role || 'user', avatar_url: u.avatar_url
        }));
        setUsers(mappedUsers);
        setStats(prev => ({
          ...prev, totalUsers: mappedUsers.length,
          activeUsers: mappedUsers.filter((u: any) => u.status === 'Active' || u.status === 'approved').length,
          pendingUsers: mappedUsers.filter((u: any) => u.status === 'Pending' || u.status === 'pending').length
        }));
      }
    } catch (error) { console.error('Error fetching users:', error); }
  };

  const fetchTimelinePosts = async () => {
    try {
      const { data, error } = await supabase.from('timeline_posts').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      if (data) {
        setTimelinePosts(data.map((p: any) => ({
          id: p.id, title: p.title || (p.content ? p.content.substring(0, 50) + '...' : 'No Content'),
          content: p.content, image: p.image_url || p.image || null, is_approved: p.is_approved, 
          status: p.status || (p.is_approved ? 'Approved' : 'Pending'), rejection_reason: p.rejection_reason,
          date: new Date(p.created_at).toISOString().split('T')[0], views: p.views || 0,
          category: p.category || 'Sosial' // AMBIL KATEGORI NYA WAK
        })));
        setStats(prev => ({ ...prev, totalPosts: data.length }));
      }
    } catch (error) { console.error('Error fetching timeline posts:', error); }
  };

  const fetchUserReports = async () => {
    try {
      const { data: postsData } = await supabase.from('timeline_posts').select('*, profiles(name)').limit(5);
      const reportedItems: any[] = [];
      const reasons = ['Spam', 'Inappropriate Content', 'Harassment'];
      if (postsData) postsData.forEach((post: any, index: number) => {
        reportedItems.push({
          id: post.id, type: 'post', authorName: post.profiles?.full_name || post.profiles?.name || 'Anonymous User',
          authorId: post.user_id, content: post.content || 'No content', image: post.image_url || null,
          timestamp: post.created_at, title: post.title || null, reason: reasons[index % reasons.length],
          totalReports: Math.floor(Math.random() * 10) + 1, reportStatus: 'pending'
        });
      });
      reportedItems.sort((a, b) => b.totalReports - a.totalReports);
      setUserReports(reportedItems);
    } catch (error) {}
  };

  // --- ACTIONS ---

  // FUNGSI BARU WAK: Ubah Kategori Postingan
  const handleChangeCategory = async (id: string, newCategory: string) => {
    try {
      const { error } = await supabase
        .from('timeline_posts')
        .update({ category: newCategory })
        .eq('id', id);
      
      if (error) throw error;
      toast.success(`Jalur dialihkan ke ${newCategory} 🔄`);
      fetchTimelinePosts();
    } catch (error) { 
      toast.error('Gagal memindahkan jalur postingan'); 
    }
  };

  const handleApproveTimeline = async (id: string) => {
    try {
      const { error } = await supabase.from('timeline_posts').update({ is_approved: true }).eq('id', id);
      if (error) throw error;
      toast.success('Post approved!');
      fetchTimelinePosts();
    } catch (error) { toast.error('Failed to approve post'); }
  };

  const handleRejectTimeline = async (id: string) => {
    const reason = window.prompt('Masukkan alasan penolakan postingan ini:');
    if (reason === null) return;
    try {
      const { error } = await supabase.from('timeline_posts').update({ is_approved: false, status: 'rejected', rejection_reason: reason }).eq('id', id);
      if (error) throw error;
      toast.success('Postingan ditolak.');
      fetchTimelinePosts();
    } catch (error) { toast.error('Gagal menolak postingan'); }
  };

  const handleTakeDownTimeline = async (id: string) => {
    const reason = window.prompt('Masukkan alasan Take Down postingan ini:');
    if (reason === null) return;
    try {
      const { error } = await supabase.from('timeline_posts').update({ is_approved: false, status: 'rejected', rejection_reason: `[TAKE DOWN] ${reason}` }).eq('id', id);
      if (error) throw error;
      toast.success('Postingan berhasil di-Take Down.');
      fetchTimelinePosts();
    } catch (error) { toast.error('Gagal melakukan Take Down'); }
  };

  const handleDismissReport = async () => {
    if (!confirm('Dismiss this report?')) return;
    toast.success('Report dismissed!');
    fetchUserReports();
  };

  const handleTakeDownAndWarn = async (reportId: string, reportType: string) => {
    const reason = window.prompt('Masukkan alasan take down & peringatan untuk author:');
    if (reason === null) return;
    try {
      const { error } = await supabase.from('timeline_posts').delete().eq('id', reportId);
      if (error) throw error;
      toast.success(`Content taken down. Alasan: ${reason}`);
      fetchUserReports();
    } catch (error) { toast.error('Failed to take down content'); }
  };

  const handleApproveUser = async (user: any) => {
    const userId = user.id;
    try {
      const { data: existingProfile } = await supabase.from('profiles').select('member_id').eq('id', userId).single();
      let updateData: any = { status: 'Active' };
      if (!existingProfile?.member_id) {
        const date = new Date();
        updateData.member_id = `JM-${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}-${Math.floor(1000 + Math.random() * 9000)}`;
      }
      const { error } = await supabase.from('profiles').update(updateData).eq('id', userId);
      if (error) throw error;
      toast.success('User disetujui!');

      try {
        if (user.email && user.email !== 'Email hidden') {
          await emailjs.send(
            'service_p441z', 'template_k9d1jeu', { to_email: user.email, to_name: user.name }, '2IFdOhs7McDyIdxSj'
          );
        }
      } catch (emailError) {}

      fetchUsers();
    } catch (error) { toast.error('Gagal menyetujui user'); }
  };

  const handleUpdateRole = async (userId: string, newRole: string) => {
    try {
      const { error } = await supabase.from('profiles').update({ role: newRole, is_official_mode: newRole === 'pengurus_masjid' ? false : null }).eq('id', userId);
      if (error) throw error;
      toast.success(`Role diubah menjadi ${newRole}`);
      fetchUsers();
    } catch (error) { toast.error('Gagal mengubah role'); }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!window.confirm('Delete this user? (Note: Ensure they have no active posts/products first)')) return;
    setUsers(prev => prev.filter(u => u.id !== userId)); 
    try {
      const { error } = await supabase.from('profiles').delete().eq('id', userId);
      if (error) throw error;
      toast.success('User deleted successfully');
    } catch (error: any) { 
      toast.error('Gagal menghapus! Pastikan user tidak memiliki data terkait.');
      fetchUsers();
    }
  };

  const handleDeleteItem = async (id: string, table: string) => {
    if (!confirm('Delete this item?')) return;
    try {
      const { error } = await supabase.from(table).delete().eq('id', id);
      if (error) throw error;
      toast.success('Deleted!');
      if (table === 'timeline_posts') fetchTimelinePosts();
    } catch (error) { toast.error('Failed to delete'); }
  };

  const UserRow = ({ user }: any) => (
    <div className="flex items-center justify-between p-4 border-b border-gray-50 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors bg-white dark:bg-gray-900 first:rounded-t-3xl last:rounded-b-3xl">
      <div className="flex items-center gap-4 min-w-0">
        <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-bold text-sm shrink-0 overflow-hidden">
          {user.avatar_url ? <img src={user.avatar_url} className="w-full h-full object-cover" alt=""/> : user.name.charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="font-bold text-sm text-gray-900 dark:text-white truncate">{user.name}</h4>
            {user.role === 'Admin' && <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-gray-900 text-white dark:bg-white dark:text-gray-900">ADMIN</span>}
            {user.role === 'pengurus_masjid' && <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-50 text-blue-600 border border-blue-100">PENGURUS</span>}
          </div>
          <p className="text-xs text-gray-500 truncate mt-0.5">{user.email} • <span className="font-mono">{user.memberId?.toUpperCase()}</span></p>
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0 ml-4">
        {user.status === 'Pending' || user.status === 'pending' ? (
          <button onClick={() => handleApproveUser(user)} className="px-4 py-2 text-xs font-bold bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-xl transition-all">
            Approve
          </button>
        ) : (
          <select 
            value={user.role || 'user'} onChange={(e) => handleUpdateRole(user.id, e.target.value)}
            className="text-xs font-bold bg-transparent border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-gray-700 dark:text-gray-300 outline-none focus:border-emerald-500"
          >
            <option value="user">Jamaah</option>
            <option value="pengurus_masjid">Pengurus</option>
            <option value="Admin">Admin</option>
          </select>
        )}
        <button onClick={() => handleDeleteUser(user.id)} className="p-2 text-gray-400 hover:text-red-500 transition-colors rounded-xl hover:bg-red-50">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8F9FB] dark:bg-gray-950 font-sans">
      
      {/* 1. CLEAN SAAS HEADER */}
      <div className="sticky top-0 z-40 bg-white/80 dark:bg-gray-950/80 backdrop-blur-xl border-b border-gray-100 dark:border-gray-800 pt-12 pb-4 px-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button onClick={() => onNavigate('profile')} className="p-2.5 bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 rounded-2xl transition-colors">
              <ArrowLeft className="w-5 h-5 text-gray-700 dark:text-gray-300" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">Global Connect</h1>
              <p className="text-xs text-gray-500 font-medium">{stats.totalUsers} Members • Admin Access</p>
            </div>
          </div>
          <div className="w-10 h-10 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center text-sm font-bold border border-emerald-100 dark:border-emerald-800/50">
            AD
          </div>
        </div>

        {/* Horizontal Scrolling Tab Pills - Dribbble Style */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
          <TabPill active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} label="Dashboard" icon={Activity} />
          <TabPill active={activeTab === 'users'} onClick={() => setActiveTab('users')} label="Users" icon={Users} />
          <TabPill active={activeTab === 'timeline'} onClick={() => setActiveTab('timeline')} label="Posts Feed" icon={MessageSquare} />
          <TabPill active={activeTab === 'reports'} onClick={() => setActiveTab('reports')} label="Reports" icon={Flag} />
        </div>
      </div>

      <div className="p-6 pb-28 max-w-3xl mx-auto">
        <AnimatePresence mode="wait">
          
          {/* 2. OVERVIEW TAB */}
          {activeTab === 'overview' && (
            <motion.div key="overview" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
              
              {/* STATS GRID */}
              <div className="grid grid-cols-2 gap-4">
                <StatCard icon={Users} title="Total Users" value={stats.totalUsers} color="blue" />
                <StatCard icon={CheckCircle} title="Active Users" value={stats.activeUsers} color="emerald" />
                <StatCard icon={MessageSquare} title="Total Posts" value={stats.totalPosts} color="purple" />
                <StatCard icon={UserCheck} title="Pending Users" value={stats.pendingUsers} color="orange" />
              </div>

              {/* COMPREHENSIVE ACTION SUMMARY */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-bold text-gray-900 dark:text-white">Requires Attention</h3>
                </div>
                <div className="space-y-3">
                  
                  <div onClick={() => setActiveTab('users')} className="bg-white dark:bg-gray-900 p-5 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 cursor-pointer hover:border-orange-200 transition-colors flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-orange-50 dark:bg-orange-900/20 text-orange-500 rounded-2xl flex items-center justify-center"><UserCheck className="w-5 h-5"/></div>
                      <div>
                        <h4 className="font-bold text-gray-900 dark:text-white text-sm">Pending Approvals</h4>
                        <p className="text-xs text-gray-500 mt-0.5">New user registrations</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-black text-gray-900 dark:text-white">{stats.pendingUsers}</span>
                      <ChevronRight className="w-5 h-5 text-gray-300" />
                    </div>
                  </div>

                </div>
              </div>
            </motion.div>
          )}

          {/* 3. USERS LIST TAB */}
          {activeTab === 'users' && (
            <motion.div key="users" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="relative mb-6">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input type="text" placeholder="Search by name or ID..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-12 pr-4 py-4 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-[2rem] text-sm font-medium focus:outline-none focus:border-emerald-300 focus:ring-4 focus:ring-emerald-50 dark:text-white transition-all shadow-sm" />
              </div>
              
              <div className="flex gap-2 mb-4 overflow-x-auto scrollbar-hide">
                <span className="px-4 py-1.5 bg-gray-900 text-white rounded-full text-xs font-bold">All ({users.length})</span>
                <span className="px-4 py-1.5 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-full text-xs font-bold">Active ({stats.activeUsers})</span>
                <span className="px-4 py-1.5 bg-orange-50 text-orange-600 border border-orange-100 rounded-full text-xs font-bold">Pending ({stats.pendingUsers})</span>
              </div>

              <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-[2rem] shadow-sm flex flex-col">
                {users.map((user) => <UserRow key={user.id} user={user} />)}
              </div>
            </motion.div>
          )}

          {/* 4. TIMELINE / POSTS TAB (AGGREGATOR) */}
          {activeTab === 'timeline' && (
            <motion.div key="timeline" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <button onClick={() => setShowCreateAnnouncement(true)} className="w-full mb-6 bg-gray-900 text-white dark:bg-white dark:text-gray-900 py-4 rounded-[2rem] text-sm font-bold flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all"><Plus className="w-5 h-5"/> New Broadcast</button>
              <CreateAnnouncementModal session={session} isOpen={showCreateAnnouncement} onClose={() => setShowCreateAnnouncement(false)} onSuccess={fetchAllData} />
              
              <div className="space-y-4">
                {timelinePosts.map((post) => (
                  <div key={post.id} className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-[2rem] p-6 shadow-sm">
                    
                    {/* Header: Title & Route Changer */}
                    <div className="flex justify-between items-start mb-3 border-b border-gray-100 dark:border-gray-800 pb-3">
                      <div className="pr-4 flex-1">
                        <h4 className="font-bold text-base text-gray-900 dark:text-white mb-1">{post.title}</h4>
                        <div className="flex items-center gap-2">
                          <Repeat className="w-3 h-3 text-gray-400" />
                          <span className="text-xs text-gray-500 font-medium">Jalur Kategori:</span>
                          <select 
                            value={post.category} 
                            onChange={(e) => handleChangeCategory(post.id, e.target.value)}
                            className="text-xs font-bold bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-2 py-1 text-gray-700 dark:text-gray-300 outline-none focus:border-emerald-500 cursor-pointer"
                          >
                            <option value="Sosial">🤝 Sosial</option>
                            <option value="Bisnis">💼 Bisnis</option>
                            <option value="Donasi">💝 Donasi</option>
                          </select>
                        </div>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-1 rounded-md uppercase shrink-0 mt-1 ${post.is_approved ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>{post.status}</span>
                    </div>

                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-5 whitespace-pre-wrap leading-relaxed">{post.content}</p>
                    {post.image && (
                      (typeof post.image === 'string' && post.image.trim() !== "") || 
                      (Array.isArray(post.image) && post.image.length > 0)
                    ) && (
                      <img src={Array.isArray(post.image) ? post.image[0] : post.image} alt="Post image" className="w-full max-h-64 object-cover rounded-xl mb-4 border border-gray-100 dark:border-gray-800 shadow-sm" onError={(e) => (e.currentTarget.style.display = 'none')} />
                    )}
                    
                    <div className="flex gap-2 pt-3 border-t border-gray-50 dark:border-gray-800">
                      {(!post.is_approved && post.status !== 'rejected') && (
                        <>
                          <button onClick={() => handleApproveTimeline(post.id)} className="flex-1 py-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 rounded-lg">Approve</button>
                          <button onClick={() => handleRejectTimeline(post.id)} className="flex-1 py-1.5 text-xs font-bold text-orange-700 bg-orange-50 rounded-lg">Reject</button>
                        </>
                      )}
                      {post.is_approved && (
                        <button onClick={() => handleTakeDownTimeline(post.id)} className="flex-1 py-1.5 text-xs font-bold text-amber-700 bg-amber-50 rounded-lg">Take Down</button>
                      )}
                      <button onClick={() => handleDeleteItem(post.id, 'timeline_posts')} className="flex-1 py-1.5 text-xs font-bold text-red-600 bg-red-50 rounded-lg">Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* REPORTS TAB */}
          {activeTab === 'reports' && (
            <motion.div key={activeTab} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center py-16 bg-white dark:bg-gray-900 rounded-[2rem] border border-gray-100 shadow-sm">
               <div className="w-20 h-20 bg-gray-50 rounded-[2rem] flex items-center justify-center mx-auto mb-5">
                 <Flag className="w-8 h-8 text-gray-400"/>
               </div>
               <h3 className="text-lg font-bold text-gray-900 mb-2 capitalize">Manage Reports</h3>
               <p className="text-gray-500 text-sm mb-6 px-8 leading-relaxed">Sistem laporan berjalan di latar belakang.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, title, value, color }: any) {
  const colorMap: any = {
    blue: 'bg-blue-50 text-blue-600', orange: 'bg-orange-50 text-orange-600',
    purple: 'bg-purple-50 text-purple-600', emerald: 'bg-emerald-50 text-emerald-600'
  };
  return (
    <div className="bg-white dark:bg-gray-900 p-5 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col justify-center h-28 relative overflow-hidden group hover:shadow-md transition-all cursor-default">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-2xl ${colorMap[color]} flex items-center justify-center`}>
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-2xl font-black text-gray-900 dark:text-white leading-none">{value}</h3>
          <p className="text-xs font-semibold text-gray-500 mt-1">{title}</p>
        </div>
      </div>
    </div>
  );
}

function TabPill({ active, onClick, label, icon: Icon, alert }: any) {
  return (
    <button onClick={onClick} className={`px-4 py-2.5 rounded-[1rem] text-sm font-bold whitespace-nowrap transition-all duration-200 flex items-center gap-2 ${active ? 'bg-gray-900 text-white shadow-md dark:bg-white dark:text-gray-900' : 'bg-transparent text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'}`}>
      {Icon && <Icon className="w-4 h-4" />}
      {label}
      {alert && <span className="w-2 h-2 rounded-full bg-red-500 ml-1"></span>}
    </button>
  );
}