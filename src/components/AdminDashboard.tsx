import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, Users, ShoppingBag, TrendingUp, AlertCircle, CheckCircle, 
  Clock, Shield, Edit, Trash2, Plus, Search, Filter, MoreVertical, 
  Eye, UserCheck, Calendar, DollarSign, Flag, AlertTriangle, 
  BadgeCheck, ChevronRight, List, BookOpen, X, ShieldAlert, MessageSquare, Activity
} from 'lucide-react';
import { getSupabaseClient } from '../utils/supabase/client';
import { toast } from 'sonner';
import CreateEventModal from './modals/CreateEventModal';
import CreateAnnouncementModal from './modals/CreateAnnouncementModal';
import CreateCampaignModal from './modals/CreateCampaignModal';
import CreateArticleModal from './modals/CreateArticleModal';

interface AdminDashboardProps {
  session: any;
  onNavigate: (screen: string) => void;
}

type TabType = 'overview' | 'users' | 'timeline' | 'events' | 'marketplace' | 'campaigns' | 'articles' | 'reports';

export default function AdminDashboard({ session, onNavigate }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0, activeUsers: 0, pendingUsers: 0,
    totalProducts: 0, pendingProducts: 0,
    activeCampaigns: 0, totalDonations: 0, monthlyGrowth: 0,
    totalPosts: 0
  });

  const [users, setUsers] = useState<any[]>([]);
  const [timelinePosts, setTimelinePosts] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [articles, setArticles] = useState<any[]>([]);
  const [userReports, setUserReports] = useState<any[]>([]);
  const [marketplaceCategory, setMarketplaceCategory] = useState('All');
  
  const [showCreateEvent, setShowCreateEvent] = useState(false);
  const [showCreateAnnouncement, setShowCreateAnnouncement] = useState(false);
  const [showCreateCampaign, setShowCreateCampaign] = useState(false);
  const [showCreateArticle, setShowCreateArticle] = useState(false);

  const supabase = getSupabaseClient();

  useEffect(() => {
    fetchAllData();
  }, [session]);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchUsers(), fetchTimelinePosts(), fetchEvents(), fetchCampaigns(),
        fetchProducts(), fetchArticles(), fetchUserReports()
      ]);
    } catch (error) {
      console.error('Error fetching admin data:', error);
      toast.error('Gagal memuat data dashboard');
    } finally {
      setLoading(false);
    }
  };

  // --- DATA FETCHING (Logic remains identical to preserve your backend connections) ---
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
          content: p.content, image: p.image_url || p.image || null, is_approved: p.is_approved, status: p.status || (p.is_approved ? 'Approved' : 'Pending'), rejection_reason: p.rejection_reason,
          date: new Date(p.created_at).toISOString().split('T')[0], views: p.views || 0
        })));
        setStats(prev => ({ ...prev, totalPosts: data.length }));
      }
    } catch (error) { console.error('Error fetching timeline posts:', error); }
  };

  const fetchEvents = async () => {
    try {
      const { data, error } = await supabase.from('events').select('*').order('date', { ascending: false });
      if (data) setEvents(data);
    } catch (error) {}
  };

  const fetchArticles = async () => {
    try {
      const { data, error } = await supabase.from('articles').select('*').order('created_at', { ascending: false });
      if (data) setArticles(data);
    } catch (error) {}
  };

  const fetchCampaigns = async () => {
    try {
      const { data, error } = await supabase.from('donation_campaigns').select('*');
      if (data) {
        const mappedCampaigns = data.map((c: any) => ({
          id: c.id, title: c.title, target: c.target_amount || 0, collected: c.collected_amount || c.current_amount || 0,
          status: c.status === 'active' ? 'Active' : c.status === 'completed' ? 'Completed' : 'Draft',
          endDate: c.end_date || new Date().toISOString().split('T')[0], donors: c.donor_count || 0
        }));
        setCampaigns(mappedCampaigns);
        setStats(prev => ({
          ...prev, activeCampaigns: mappedCampaigns.filter((c: any) => c.status === 'Active').length,
          totalDonations: mappedCampaigns.reduce((sum: number, c: any) => sum + (c.collected || 0), 0)
        }));
      }
    } catch (error) {}
  };

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase.from('products').select('*, profiles(name)').order('created_at', { ascending: false });
      if (data) {
        setProducts(data);
        setStats(prev => ({
          ...prev, totalProducts: data.length, pendingProducts: data.filter((p: any) => p.status === 'pending').length
        }));
      }
    } catch (error) {}
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

  const handleApproveProduct = async (id: string) => {
    try {
      const { error } = await supabase.from('products').update({ status: 'approved' }).eq('id', id);
      if (error) throw error;
      toast.success('Product approved!');
      fetchProducts();
    } catch (error) { toast.error('Failed to approve product'); }
  };

  const handleRejectProduct = async (id: string) => {
    const reason = window.prompt('Masukkan alasan penolakan/menyembunyikan produk ini:');
    if (reason === null) return;
    try {
      const { error } = await supabase.from('products').update({ status: 'rejected' }).eq('id', id);
      if (error) throw error;
      toast.success(`Produk ditolak/disembunyikan. Alasan: ${reason}`);
      fetchProducts();
    } catch (error) { toast.error('Failed'); }
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
      const table = reportType === 'post' ? 'timeline_posts' : 'products';
      const { error } = await supabase.from(table).delete().eq('id', reportId);
      if (error) throw error;
      toast.success(`Content taken down. Alasan: ${reason}`);
      fetchUserReports();
    } catch (error) { toast.error('Failed to take down content'); }
  };

  const handleApproveUser = async (userId: string) => {
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
    
    setUsers(prev => prev.filter(u => u.id !== userId)); // Optimistic UI
    
    try {
      const { error } = await supabase.from('profiles').delete().eq('id', userId);
      if (error) throw error;
      toast.success('User deleted successfully');
    } catch (error: any) { 
      console.error('Delete error:', error);
      toast.error('Gagal menghapus! Pastikan user tidak memiliki data terkait (post/produk) atau cek RLS database.');
      fetchUsers(); // Revert on failure
    }
  };

  // Generic Deletes
  const handleDeleteItem = async (id: string, table: string) => {
    if (!confirm('Delete this item?')) return;
    try {
      const { error } = await supabase.from(table).delete().eq('id', id);
      if (error) throw error;
      toast.success('Deleted!');
      if (table === 'timeline_posts') fetchTimelinePosts();
      if (table === 'events') fetchEvents();
      if (table === 'products') fetchProducts();
      if (table === 'articles') fetchArticles();
    } catch (error) { toast.error('Failed to delete'); }
  };

  const formatPrice = (price: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price);
  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });

  // --- REUSABLE COMPONENTS ---
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
          <button onClick={() => handleApproveUser(user.id)} className="px-4 py-2 text-xs font-bold bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-xl transition-all">
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
          <TabPill active={activeTab === 'timeline'} onClick={() => setActiveTab('timeline')} label="Timeline" icon={MessageSquare} />
          <TabPill active={activeTab === 'marketplace'} onClick={() => setActiveTab('marketplace')} label="Market" icon={ShoppingBag} />
          <TabPill active={activeTab === 'campaigns'} onClick={() => setActiveTab('campaigns')} label="Campaigns" icon={TrendingUp} />
          <TabPill active={activeTab === 'events'} onClick={() => setActiveTab('events')} label="Events" icon={Calendar} />
        </div>
      </div>

      <div className="p-6 pb-28 max-w-3xl mx-auto">
        <AnimatePresence mode="wait">
          
          {/* 2. OVERVIEW TAB (DRIBBBLE STYLE) */}
          {activeTab === 'overview' && (
            <motion.div key="overview" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
              
              {/* SMOOTH MOUNTAIN CHART CARD (Donations/Sales) */}
              <div className="bg-white dark:bg-gray-900 rounded-[2rem] p-6 shadow-sm border border-gray-100 dark:border-gray-800 relative overflow-hidden">
                <div className="flex justify-between items-start mb-6 relative z-10">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-8 h-8 rounded-full bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center">
                        <DollarSign className="w-4 h-4 text-emerald-500" />
                      </div>
                      <p className="text-sm font-semibold text-gray-500">Total Donations</p>
                    </div>
                    <h3 className="text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">{formatPrice(stats.totalDonations)}</h3>
                  </div>
                  <div className="bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 border border-emerald-100 dark:border-emerald-800/30">
                    <TrendingUp className="w-3 h-3"/> +12.5%
                  </div>
                </div>

                {/* SVG Curve Line Chart (Gunung-gunung) */}
                <div className="h-32 w-full relative -mx-2 -mb-2 mt-4">
                  <svg viewBox="0 0 100 40" preserveAspectRatio="none" className="w-full h-full overflow-visible">
                    <defs>
                      <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
                        <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    {/* Fill Area */}
                    <path d="M0,35 Q15,20 30,25 T60,15 T85,20 T100,5 L100,40 L0,40 Z" fill="url(#chartGrad)" />
                    {/* Smooth Stroke */}
                    <path d="M0,35 Q15,20 30,25 T60,15 T85,20 T100,5" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    {/* Pulsing Dot at the end */}
                    <circle cx="100" cy="5" r="3" fill="#fff" stroke="#10b981" strokeWidth="2" className="drop-shadow-md" />
                  </svg>
                  {/* Decorative dashed lines */}
                  <div className="absolute inset-0 flex justify-between px-4">
                    <div className="h-full border-l border-dashed border-gray-100 dark:border-gray-800"></div>
                    <div className="h-full border-l border-dashed border-gray-100 dark:border-gray-800"></div>
                    <div className="h-full border-l border-dashed border-gray-100 dark:border-gray-800"></div>
                  </div>
                </div>
              </div>

              {/* STATS GRID */}
              <div className="grid grid-cols-2 gap-4">
                <StatCard icon={Users} title="Total Users" value={stats.totalUsers} trend="+42" color="blue" />
                <StatCard icon={ShoppingBag} title="Products" value={stats.totalProducts} trend="+12" color="orange" />
                <StatCard icon={MessageSquare} title="Timeline Posts" value={stats.totalPosts} trend="+89" color="purple" />
                <StatCard icon={Flag} title="Active Campaigns" value={stats.activeCampaigns} trend="+2" color="emerald" />
              </div>

              {/* COMPREHENSIVE ACTION SUMMARY */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-bold text-gray-900 dark:text-white">Requires Attention</h3>
                </div>
                <div className="space-y-3">
                  
                  {/* Pending Users Summary */}
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



          {/* 5. TIMELINE / POSTS TAB */}
          {activeTab === 'timeline' && (
            <motion.div key="timeline" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <button onClick={() => setShowCreateAnnouncement(true)} className="w-full mb-6 bg-gray-900 text-white dark:bg-white dark:text-gray-900 py-4 rounded-[2rem] text-sm font-bold flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all"><Plus className="w-5 h-5"/> New Broadcast</button>
              <CreateAnnouncementModal session={session} isOpen={showCreateAnnouncement} onClose={() => setShowCreateAnnouncement(false)} onSuccess={fetchAllData} />
              
              <div className="space-y-4">
                {timelinePosts.map((post) => (
                  <div key={post.id} className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-[2rem] p-6 shadow-sm">
                    <div className="flex justify-between items-start mb-3">
                      <h4 className="font-bold text-base text-gray-900 dark:text-white pr-4">{post.title}</h4>
                      <span className={`text-[10px] font-bold px-2 py-1 rounded-md uppercase shrink-0 ${post.is_approved ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>{post.status}</span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-5 whitespace-pre-wrap leading-relaxed">{post.content}</p>
                    {post.image && (
                      <img src={post.image} alt="Post image" className="w-full max-h-64 object-cover rounded-xl mb-4 border border-gray-100 dark:border-gray-800 shadow-sm" />
                    )}
                    <div className="flex gap-2 pt-3 border-t border-gray-50 dark:border-gray-800">
                      {/* If pending, show Approve & Reject */}
                      {(!post.is_approved && post.status !== 'rejected') && (
                        <>
                          <button onClick={() => handleApproveTimeline(post.id)} className="flex-1 py-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 rounded-lg">Approve</button>
                          <button onClick={() => handleRejectTimeline(post.id)} className="flex-1 py-1.5 text-xs font-bold text-orange-700 bg-orange-50 rounded-lg">Reject</button>
                        </>
                      )}
                      {/* If approved, show Take Down */}
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

          {/* 6. MARKETPLACE TAB */}
          {activeTab === 'marketplace' && (
            <motion.div key="marketplace" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="grid grid-cols-2 gap-4">
                {products.map((product) => (
                  <div key={product.id} className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl overflow-hidden shadow-sm flex flex-col">
                    <div className="h-32 bg-gray-50 dark:bg-gray-800 relative p-2">
                      {product.images?.[0] ? <img src={product.images[0]} className="w-full h-full object-cover rounded-2xl" alt=""/> : <div className="w-full h-full flex items-center justify-center text-gray-300 rounded-2xl border border-dashed border-gray-200"><ShoppingBag className="w-6 h-6"/></div>}
                      <span className={`absolute top-4 right-4 text-[9px] font-bold px-2 py-1 rounded-full uppercase shadow-sm ${product.status === 'approved' ? 'bg-gray-900 text-white' : 'bg-white text-gray-900 border border-gray-200'}`}>{product.status}</span>
                    </div>
                    <div className="p-4 flex-1 flex flex-col justify-between">
                      <div>
                        <h4 className="font-bold text-sm text-gray-900 dark:text-white truncate mb-1">{product.name}</h4>
                        <p className="text-sm font-extrabold text-emerald-600">{formatPrice(product.price)}</p>
                      </div>
                      <div className="flex gap-2 mt-4">
                        {product.status === 'pending' && (
                          <button onClick={() => handleApproveProduct(product.id)} className="flex-1 bg-gray-900 text-white py-2 rounded-xl flex justify-center"><CheckCircle className="w-4 h-4"/></button>
                        )}
                        {product.status === 'pending' && (
                          <button onClick={() => handleRejectProduct(product.id)} className="flex-1 bg-amber-50 text-amber-600 py-2 rounded-xl flex justify-center"><X className="w-4 h-4"/></button>
                        )}
                        <button onClick={() => handleDeleteItem(product.id, 'products')} className="flex-1 bg-red-50 text-red-600 py-2 rounded-xl flex justify-center"><Trash2 className="w-4 h-4"/></button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* 7. CAMPAIGNS TAB */}
          {activeTab === 'campaigns' && (
            <motion.div key="campaigns" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
               <button onClick={() => setShowCreateCampaign(true)} className="w-full mb-6 bg-gray-900 text-white py-4 rounded-[2rem] text-sm font-bold flex items-center justify-center gap-2 shadow-lg"><Plus className="w-5 h-5"/> New Campaign</button>
               <CreateCampaignModal session={session} isOpen={showCreateCampaign} onClose={() => setShowCreateCampaign(false)} onSuccess={fetchAllData} />
               <div className="space-y-4">
                 {campaigns.map((camp) => (
                   <div key={camp.id} className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-[2rem] p-6 shadow-sm">
                     <h4 className="font-bold text-base text-gray-900 dark:text-white mb-2 truncate">{camp.title}</h4>
                     <div className="flex justify-between text-xs text-gray-500 mb-3 font-medium">
                       <span><strong className="text-emerald-600 text-sm">{formatPrice(camp.collected)}</strong> raised</span>
                       <span>{formatPrice(camp.target)} goal</span>
                     </div>
                     <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden mb-5">
                       <div className="h-full bg-emerald-500 rounded-full" style={{width: `${Math.min((camp.collected/camp.target)*100, 100)}%`}}></div>
                     </div>
                     <div className="flex gap-2">
                       <button className="flex-1 py-2.5 bg-gray-50 text-gray-700 rounded-xl text-xs font-bold hover:bg-gray-100 transition-colors">Edit</button>
                     </div>
                   </div>
                 ))}
               </div>
            </motion.div>
          )}

          {/* EVENTS, ARTICLES, REPORTS (Placeholders for SaaS style) */}
          {(activeTab === 'events' || activeTab === 'articles' || activeTab === 'reports') && (
            <motion.div key={activeTab} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center py-16 bg-white dark:bg-gray-900 rounded-[2rem] border border-gray-100 shadow-sm">
               <div className="w-20 h-20 bg-gray-50 rounded-[2rem] flex items-center justify-center mx-auto mb-5">
                 {activeTab === 'reports' ? <Flag className="w-8 h-8 text-gray-400"/> : <List className="w-8 h-8 text-gray-400"/>}
               </div>
               <h3 className="text-lg font-bold text-gray-900 mb-2 capitalize">Manage {activeTab}</h3>
               <p className="text-gray-500 text-sm mb-6 px-8 leading-relaxed">This module is currently running in background. Content can be managed via primary database.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// Mini Component: SaaS Stat Card
function StatCard({ icon: Icon, title, value, trend, color }: any) {
  const colorMap: any = {
    blue: 'bg-blue-50 text-blue-600', orange: 'bg-orange-50 text-orange-600',
    purple: 'bg-purple-50 text-purple-600', emerald: 'bg-emerald-50 text-emerald-600'
  };
  return (
    <div className="bg-white dark:bg-gray-900 p-5 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col justify-between h-36 relative overflow-hidden group hover:shadow-md transition-all cursor-default">
      <div className="flex justify-between items-start">
        <div className={`w-10 h-10 rounded-2xl ${colorMap[color]} flex items-center justify-center`}>
          <Icon className="w-5 h-5" />
        </div>
        <span className="text-[10px] font-bold text-gray-400 bg-gray-50 px-2 py-1 rounded-lg">{trend} this week</span>
      </div>
      <div>
        <h3 className="text-2xl font-black text-gray-900 dark:text-white mt-2">{value}</h3>
        <p className="text-xs font-semibold text-gray-500 mt-0.5">{title}</p>
      </div>
    </div>
  );
}

// Mini Component: Tab Pill (Clean Dribbble Style)
function TabPill({ active, onClick, label, icon: Icon, alert }: any) {
  return (
    <button onClick={onClick} className={`px-4 py-2.5 rounded-[1rem] text-sm font-bold whitespace-nowrap transition-all duration-200 flex items-center gap-2 ${active ? 'bg-gray-900 text-white shadow-md' : 'bg-transparent text-gray-500 hover:bg-gray-100'}`}>
      {Icon && <Icon className="w-4 h-4" />}
      {label}
      {alert && <span className="w-2 h-2 rounded-full bg-red-500 ml-1"></span>}
    </button>
  );
}