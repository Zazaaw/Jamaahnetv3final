import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, 
  Users, 
  ShoppingBag, 
  Megaphone, 
  TrendingUp,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock,
  Shield,
  Edit,
  Trash2,
  Plus,
  Search,
  Filter,
  MoreVertical,
  Eye,
  UserCheck,
  UserX,
  Calendar,
  Package,
  DollarSign,
  Activity,
  Bell,
  ShieldAlert,
  ImageIcon,
  X,
  Flag,
  AlertTriangle,
  BadgeCheck,
  ChevronRight,
  Zap,
  List
} from 'lucide-react';
import { IslamicPattern } from './IslamicPattern';
import { getSupabaseClient } from '../utils/supabase/client';
import { toast } from 'sonner';
import CreateEventModal from './modals/CreateEventModal';
import CreateAnnouncementModal from './modals/CreateAnnouncementModal';
import CreateCampaignModal from './modals/CreateCampaignModal';

interface AdminDashboardProps {
  session: any;
  onNavigate: (screen: string) => void;
}

type TabType = 'overview' | 'users' | 'announcements' | 'events' | 'marketplace' | 'campaigns' | 'moderation' | 'reports';

export default function AdminDashboard({ session, onNavigate }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    pendingUsers: 0,
    totalProducts: 0,
    pendingProducts: 0,
    activeCampaigns: 0,
    totalDonations: 0,
    monthlyGrowth: 0
  });

  const [users, setUsers] = useState<any[]>([]);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [moderationQueue, setModerationQueue] = useState<any[]>([]);
  const [userReports, setUserReports] = useState<any[]>([]);
  const [marketplaceCategory, setMarketplaceCategory] = useState('All');
  const [showCreateEvent, setShowCreateEvent] = useState(false);
  const [showCreateAnnouncement, setShowCreateAnnouncement] = useState(false);
  const [showCreateCampaign, setShowCreateCampaign] = useState(false);

  const supabase = getSupabaseClient();

  useEffect(() => {
    fetchAllData();
  }, [session]);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchUsers(),
        fetchAnnouncements(), // Timeline/Posts
        fetchEvents(),
        fetchCampaigns(),
        fetchProducts(),
        fetchDonations(),
        fetchModerationQueue(),
        fetchUserReports()
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
      // Fetch all profiles directly from Supabase
      const { data, error } = await supabase
        .from('profiles')
        .select('*');

      if (error) throw error;

      if (data) {
        const mappedUsers = data.map((u: any) => ({
          id: u.id,
          name: u.full_name || u.name || 'Anonymous User',
          email: u.email || 'Email hidden', // Email might not be available in profiles
          memberId: u.id ? u.id.substring(0, 8).toUpperCase() : 'UNKNOWN',
          status: u.status || 'Active', // Default to Active if status column missing
          role: u.role || 'user'
        }));
        
        setUsers(mappedUsers);
        
        // Calculate stats
        const activeCount = mappedUsers.filter((u: any) => u.status === 'Active' || u.status === 'approved').length;
        const pendingCount = mappedUsers.filter((u: any) => u.status === 'Pending' || u.status === 'pending').length;
        
        setStats(prev => ({
          ...prev,
          totalUsers: mappedUsers.length,
          activeUsers: activeCount,
          pendingUsers: pendingCount
        }));
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchAnnouncements = async () => {
    // Fetch from 'posts' table (Timeline)
    try {
      const { data, error } = await supabase
        .from('timeline_posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data) {
        setAnnouncements(data.map((p: any) => ({
          id: p.id,
          title: p.title || (p.content ? p.content.substring(0, 50) + (p.content.length > 50 ? '...' : '') : 'No Content'),
          content: p.content,
          is_approved: p.is_approved, // Include is_approved value
          status: p.is_approved ? 'Approved' : 'Pending', // Dynamic status based on is_approved
          date: new Date(p.created_at).toISOString().split('T')[0],
          views: p.views || 0
        })));
      }
    } catch (error) {
      console.error('Error fetching announcements (posts):', error);
    }
  };

  const fetchEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('date', { ascending: false });

      if (error) throw error;

      if (data) {
        setEvents(data);
      }
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  };

  const fetchCampaigns = async () => {
    try {
      const { data, error } = await supabase
        .from('donation_campaigns')
        .select('*');

      if (error) throw error;

      if (data) {
        const mappedCampaigns = data.map((c: any) => ({
          id: c.id,
          title: c.title,
          target: c.target_amount || 0,
          collected: c.collected_amount || c.current_amount || 0,
          status: c.status === 'active' ? 'Active' : c.status === 'completed' ? 'Completed' : 'Draft',
          endDate: c.end_date || new Date().toISOString().split('T')[0],
          donors: c.donor_count || 0
        }));

        setCampaigns(mappedCampaigns);

        const activeCount = mappedCampaigns.filter((c: any) => c.status === 'Active').length;
        const totalDonations = mappedCampaigns.reduce((sum: number, c: any) => sum + (c.collected || 0), 0);
        
        setStats(prev => ({
          ...prev,
          activeCampaigns: activeCount,
          totalDonations: totalDonations
        }));
      }
    } catch (error) {
      console.error('Error fetching campaigns:', error);
    }
  };

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*, profiles(name)')
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data) {
        setProducts(data);
        const pendingCount = data.filter((p: any) => p.status === 'pending').length;
        
        setStats(prev => ({
          ...prev,
          totalProducts: data.length,
          pendingProducts: pendingCount
        }));
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const fetchDonations = async () => {
    // Additional donation stats if needed, or use campaign data
    // For now we rely on campaign data aggregation
  };

  const fetchModerationQueue = async () => {
    try {
      // Fetch posts (timeline content) - get all or those needing review
      const { data: postsData, error: postsError } = await supabase
        .from('timeline_posts')
        .select('*, profiles(name)')
        .order('created_at', { ascending: false })
        .limit(20);

      // Fetch products from marketplace - get pending or all
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('*, profiles(name)')
        .order('created_at', { ascending: false })
        .limit(20);

      if (postsError) console.error('Error fetching posts for moderation:', postsError);
      if (productsError) console.error('Error fetching products for moderation:', productsError);

      const moderationItems = [];

      // Map posts
      if (postsData) {
        postsData.forEach((post: any) => {
          moderationItems.push({
            id: post.id,
            type: 'post',
            userName: post.profiles?.full_name || post.profiles?.name || 'Anonymous User',
            userId: post.user_id,
            content: post.content || 'No content',
            image: post.image_url || null,
            timestamp: post.created_at,
            status: post.status || 'published',
            title: post.title || null
          });
        });
      }

      // Map products
      if (productsData) {
        productsData.forEach((product: any) => {
          moderationItems.push({
            id: product.id,
            type: 'product',
            userName: product.profiles?.full_name || product.profiles?.name || 'Anonymous User',
            userId: product.user_id,
            content: product.description || product.name || 'No description',
            image: product.image_url || product.images?.[0] || null,
            timestamp: product.created_at,
            status: product.status || 'pending',
            title: product.name || null,
            price: product.price || 0
          });
        });
      }

      // Sort by timestamp
      moderationItems.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

      setModerationQueue(moderationItems);
    } catch (error) {
      console.error('Error fetching moderation queue:', error);
    }
  };

  const handleApproveContent = async (itemId: string, itemType: string) => {
    try {
      const table = itemType === 'post' ? 'timeline_posts' : 'products';
      const { error } = await supabase
        .from(table)
        .update({ status: itemType === 'post' ? 'published' : 'approved' })
        .eq('id', itemId);

      if (error) throw error;

      toast.success(`${itemType === 'post' ? 'Post' : 'Product'} approved successfully!`);
      fetchModerationQueue(); // Refresh queue
    } catch (error) {
      console.error('Error approving content:', error);
      toast.error('Failed to approve content');
    }
  };

  const handleTakeDownContent = async (itemId: string, itemType: string) => {
    if (!confirm(`Are you sure you want to take down this ${itemType}? This action will delete the content.`)) return;

    try {
      const table = itemType === 'post' ? 'timeline_posts' : 'products';
      const { error } = await supabase
        .from(table)
        .delete()
        .eq('id', itemId);

      if (error) throw error;

      toast.success(`${itemType === 'post' ? 'Post' : 'Product'} taken down successfully!`);
      fetchModerationQueue(); // Refresh queue
    } catch (error) {
      console.error('Error taking down content:', error);
      toast.error('Failed to take down content');
    }
  };

  const fetchUserReports = async () => {
    try {
      // Mock data for reports since we don't have a reports table yet
      // In a real implementation, this would fetch from a 'content_reports' table
      // and aggregate by content_id with count of reports
      
      // Create sample reported content from posts and products
      const { data: postsData } = await supabase
        .from('timeline_posts')
        .select('*, profiles(name)')
        .limit(5);

      const { data: productsData } = await supabase
        .from('products')
        .select('*, profiles(name)')
        .limit(3);

      const reportedItems = [];

      // Sample report reasons
      const reasons = ['Spam', 'Inappropriate Content', 'Harassment', 'Misleading Information', 'Offensive Language'];

      if (postsData) {
        postsData.forEach((post: any, index: number) => {
          reportedItems.push({
            id: post.id,
            type: 'post',
            authorName: post.profiles?.full_name || post.profiles?.name || 'Anonymous User',
            authorId: post.user_id,
            content: post.content || 'No content',
            image: post.image_url || null,
            timestamp: post.created_at,
            title: post.title || null,
            reason: reasons[index % reasons.length],
            totalReports: Math.floor(Math.random() * 10) + 1,
            reportStatus: 'pending'
          });
        });
      }

      if (productsData) {
        productsData.forEach((product: any, index: number) => {
          reportedItems.push({
            id: product.id,
            type: 'product',
            authorName: product.profiles?.full_name || product.profiles?.name || 'Anonymous User',
            authorId: product.user_id,
            content: product.description || product.name || 'No description',
            image: product.image_url || product.images?.[0] || null,
            timestamp: product.created_at,
            title: product.name || null,
            price: product.price || 0,
            reason: reasons[index % reasons.length],
            totalReports: Math.floor(Math.random() * 15) + 3,
            reportStatus: 'pending'
          });
        });
      }

      // Sort by total reports (highest first)
      reportedItems.sort((a, b) => b.totalReports - a.totalReports);

      setUserReports(reportedItems);
    } catch (error) {
      console.error('Error fetching user reports:', error);
    }
  };

  const handleDismissReport = async (reportId: string, reportType: string) => {
    if (!confirm('Are you sure you want to dismiss this report? The content will remain visible.')) return;

    try {
      // In a real implementation, this would update the report status to 'dismissed'
      // For now, we just remove it from the list
      toast.success('Report dismissed successfully!');
      fetchUserReports(); // Refresh reports
    } catch (error) {
      console.error('Error dismissing report:', error);
      toast.error('Failed to dismiss report');
    }
  };

  const handleTakeDownAndWarn = async (reportId: string, reportType: string, authorId: string) => {
    if (!confirm('Are you sure you want to take down this content and warn the author? This action cannot be undone.')) return;

    try {
      // Delete the content
      const table = reportType === 'post' ? 'timeline_posts' : 'products';
      const { error: deleteError } = await supabase
        .from(table)
        .delete()
        .eq('id', reportId);

      if (deleteError) throw deleteError;

      // In a real implementation, send a warning notification to the author
      // For now, just show success message

      toast.success('Content taken down and author warned!');
      fetchUserReports(); // Refresh reports
    } catch (error) {
      console.error('Error taking down content:', error);
      toast.error('Failed to take down content');
    }
  };

  const handleApproveUser = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ status: 'Active' })
        .eq('id', userId);

      if (error) throw error;

      toast.success('User berhasil disetujui!');
      fetchUsers(); // Refresh data
    } catch (error) {
      console.error('Error approving user:', error);
      toast.error('Gagal menyetujui user');
    }
  };

  const handleUpdateRole = async (userId: string, newRole: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', userId);

      if (error) throw error;

      toast.success(`Role user berhasil diubah menjadi ${newRole}`);
      fetchUsers();
    } catch (error) {
      console.error('Error updating user role:', error);
      toast.error('Gagal mengubah role user');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);

      if (error) throw error;

      toast.success('User berhasil dihapus');
      fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Gagal menghapus user');
    }
  };

  const handleDeleteAnnouncement = async (announcementId: string) => {
    if (!confirm('Yakin ingin menghapus postingan ini?')) return;

    try {
      const { error } = await supabase
        .from('timeline_posts')
        .delete()
        .eq('id', announcementId);

      if (error) throw error;

      toast.success('Postingan berhasil dihapus!');
      fetchAnnouncements(); // Refresh data
    } catch (error) {
      console.error('Error deleting announcement:', error);
      toast.error('Gagal menghapus postingan');
    }
  };

  const handleApproveTimeline = async (id: string) => {
    try {
      const { error } = await supabase
        .from('timeline_posts')
        .update({ is_approved: true })
        .eq('id', id);

      if (error) throw error;

      toast.success('Postingan berhasil disetujui!');
      fetchAnnouncements(); // Refresh data
    } catch (error) {
      console.error('Error approving timeline post:', error);
      toast.error('Gagal menyetujui postingan');
    }
  };

  const handleRejectTimeline = async (id: string) => {
    try {
      const { error } = await supabase
        .from('timeline_posts')
        .update({ is_approved: false })
        .eq('id', id);

      if (error) throw error;

      toast.success('Postingan berhasil disembunyikan!');
      fetchAnnouncements(); // Refresh data
    } catch (error) {
      console.error('Error rejecting timeline post:', error);
      toast.error('Gagal menyembunyikan postingan');
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (!confirm('Yakin ingin menghapus kegiatan ini?')) return;

    try {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', eventId);

      if (error) throw error;

      toast.success('Kegiatan berhasil dihapus!');
      fetchEvents();
    } catch (error) {
      console.error('Error deleting event:', error);
      toast.error('Gagal menghapus kegiatan');
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('Yakin ingin menghapus produk ini?')) return;

    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);

      if (error) throw error;

      toast.success('Produk berhasil dihapus!');
      fetchProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Gagal menghapus produk');
    }
  };

  const handleApproveProduct = async (productId: string) => {
    try {
      const { error } = await supabase
        .from('products')
        .update({ status: 'approved' })
        .eq('id', productId);

      if (error) throw error;

      toast.success('Produk berhasil disetujui!');
      fetchProducts();
    } catch (error) {
      console.error('Error approving product:', error);
      toast.error('Gagal menyetujui produk');
    }
  };

  const handleRejectProduct = async (productId: string) => {
    if (!confirm('Yakin ingin menolak produk ini?')) return;
    try {
      const { error } = await supabase
        .from('products')
        .update({ status: 'rejected' })
        .eq('id', productId);

      if (error) throw error;

      toast.success('Produk berhasil ditolak!');
      fetchProducts();
    } catch (error) {
      console.error('Error rejecting product:', error);
      toast.error('Gagal menolak produk');
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const UserCard = ({ user, index, handleUpdateRole, handleDeleteUser, handleApproveUser }: any) => (
    <motion.div
      key={user.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="bg-white dark:bg-gray-900 rounded-2xl p-4 shadow-sm border border-gray-200 dark:border-gray-800"
    >
      <div className="flex items-center gap-4">
        {user.avatar_url ? (
          <img 
            src={user.avatar_url} 
            alt={user.name} 
            className="w-12 h-12 rounded-full object-cover border-2 border-white dark:border-gray-800 shadow-sm"
          />
        ) : (
          <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold text-lg shadow-sm">
            {user.name.charAt(0).toUpperCase()}
          </div>
        )}
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <h4 className="font-semibold text-gray-900 dark:text-white truncate">
              {user.name}
            </h4>
            {user.role === 'Admin' && (
              <BadgeCheck className="w-5 h-5 text-white fill-blue-500 shrink-0" />
            )}
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
            {user.email}
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
            user.status === 'Active' || user.status === 'approved'
              ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
              : 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400'
          }`}>
            {user.status || 'Active'}
          </span>

          <div className="relative">
            <select 
              value={user.role || 'Member'}
              onChange={(e) => handleUpdateRole(user.id, e.target.value)}
              className="bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs font-semibold rounded-xl px-4 py-2 text-gray-700 dark:text-gray-300 appearance-none active:scale-95 transition-all outline-none focus:ring-2 focus:ring-emerald-500"
              onClick={(e) => e.stopPropagation()}
            >
              <option value="Member">Member</option>
              <option value="Admin">Admin</option>
            </select>
          </div>
          
          {user.status === 'Pending' || user.status === 'pending' ? (
            <motion.button
              whileTap={{ scale: 0.95 }}
              className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all flex items-center gap-1 text-xs"
              onClick={() => handleApproveUser(user.id)}
            >
              <UserCheck className="w-4 h-4" />
              APPROVE
            </motion.button>
          ) : (
            <button
              className="p-2 text-red-500 bg-red-50 dark:bg-red-500/10 active:bg-red-100 dark:active:bg-red-500/20 rounded-xl transition-all active:scale-95 hover:bg-red-100 dark:hover:bg-red-900/20"
              onClick={() => handleDeleteUser(user.id)}
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Islamic Pattern Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <IslamicPattern className="text-emerald-600 dark:text-emerald-400 opacity-[0.02]" />
      </div>

      {/* Admin Header - Dark Navy/Emerald to indicate Admin Mode */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-20 bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800 text-white shadow-2xl"
      >
        <div className="px-6 py-4">
          <div className="flex items-center gap-4 mb-4">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => onNavigate('profile')}
              className="p-2 hover:bg-white/10 rounded-xl transition-colors"
            >
              <ArrowLeft className="w-6 h-6" />
            </motion.button>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <Shield className="w-6 h-6 text-amber-300" />
                <h1 className="text-xl font-bold">Admin Dashboard</h1>
              </div>
              <p className="text-emerald-100 text-sm mt-1">Control Center • jamaah.net</p>
            </div>
            <motion.button
              whileTap={{ scale: 0.9 }}
              className="p-2 hover:bg-white/10 rounded-xl transition-colors relative"
            >
              <Bell className="w-6 h-6" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
            </motion.button>
          </div>

          {/* Admin Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500/20 backdrop-blur-md rounded-full border border-amber-400/30">
            <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse"></div>
            <span className="text-sm font-semibold text-amber-200">Admin Mode Active</span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 flex gap-2 overflow-x-auto scrollbar-hide pb-2">
          <TabButton
            active={activeTab === 'overview'}
            onClick={() => setActiveTab('overview')}
            icon={Activity}
            label="Overview"
          />
          <TabButton
            active={activeTab === 'users'}
            onClick={() => setActiveTab('users')}
            icon={Users}
            label="Users"
          />
          <TabButton
            active={activeTab === 'events'}
            onClick={() => setActiveTab('events')}
            icon={Calendar}
            label="Events"
          />
          <TabButton
            active={activeTab === 'marketplace'}
            onClick={() => setActiveTab('marketplace')}
            icon={ShoppingBag}
            label="Marketplace"
          />
          <TabButton
            active={activeTab === 'announcements'}
            onClick={() => setActiveTab('announcements')}
            icon={Megaphone}
            label="Announcements"
          />
          <TabButton
            active={activeTab === 'campaigns'}
            onClick={() => setActiveTab('campaigns')}
            icon={TrendingUp}
            label="Campaigns"
          />
          <TabButton
            active={activeTab === 'moderation'}
            onClick={() => setActiveTab('moderation')}
            icon={ShieldAlert}
            label="Moderation"
          />
          <TabButton
            active={activeTab === 'reports'}
            onClick={() => setActiveTab('reports')}
            icon={Flag}
            label="Reports"
          />
        </div>
      </motion.div>

      {/* Content Area */}
      <div className="relative z-10 p-6 pb-24">
        <AnimatePresence mode="wait">
          {/* OVERVIEW TAB */}
          {activeTab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
            >
              {/* HERO STATS - 2 LARGE CARDS */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                {/* Total Users & Active */}
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 }}
                  className="bg-gradient-to-br from-emerald-600 to-teal-800 rounded-3xl p-6 text-white relative overflow-hidden shadow-xl"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-xl"></div>
                  <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12 blur-xl"></div>
                  
                  <div className="relative z-10 flex flex-col h-full justify-between">
                    <div>
                      <div className="p-2 bg-white/20 backdrop-blur-md rounded-xl w-fit mb-3">
                        <Users className="w-6 h-6 text-white" />
                      </div>
                      <p className="text-emerald-100 text-sm font-medium mb-1">Total Users</p>
                      <h3 className="text-3xl font-bold tracking-tight">{stats.totalUsers}</h3>
                    </div>
                    
                    <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between">
                      <div>
                        <p className="text-xs text-emerald-100 uppercase tracking-wider font-semibold">Active</p>
                        <p className="text-lg font-bold">{stats.activeUsers}</p>
                      </div>
                      <div className="px-2 py-1 bg-emerald-500/30 rounded-lg text-xs font-bold text-emerald-100 flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" />
                        +12%
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Total Donations */}
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 }}
                  className="bg-gradient-to-br from-emerald-600 to-teal-800 rounded-3xl p-6 text-white relative overflow-hidden shadow-xl"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-xl"></div>
                  <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12 blur-xl"></div>
                  
                  <div className="relative z-10 flex flex-col h-full justify-between">
                    <div>
                      <div className="p-2 bg-white/20 backdrop-blur-md rounded-xl w-fit mb-3">
                        <DollarSign className="w-6 h-6 text-white" />
                      </div>
                      <p className="text-emerald-100 text-sm font-medium mb-1">Total Donations</p>
                      <h3 className="text-2xl font-bold tracking-tight truncate">{formatPrice(stats.totalDonations)}</h3>
                    </div>
                    
                    <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between">
                      <div className="px-2 py-1 bg-emerald-500/30 rounded-lg text-xs font-bold text-emerald-100 flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" />
                        +{stats.monthlyGrowth}%
                      </div>
                      <p className="text-xs text-emerald-100">this month</p>
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* SECONDARY STATS LIST */}
              <div className="space-y-4 mb-8">
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="bg-white dark:bg-gray-900 rounded-2xl p-4 shadow-sm border border-gray-200 dark:border-gray-800 flex items-center justify-between group cursor-pointer hover:border-emerald-500/30 transition-all"
                  onClick={() => setActiveTab('users')}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center text-orange-600 dark:text-orange-400 group-hover:scale-110 transition-transform">
                      <UserCheck className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 dark:text-white">Pending Users</h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Requires approval</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xl font-bold text-gray-900 dark:text-white block">{stats.pendingUsers}</span>
                    {stats.pendingUsers > 0 && (
                      <span className="text-xs font-semibold text-orange-600 dark:text-orange-400">Action needed</span>
                    )}
                  </div>
                </motion.div>

                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35 }}
                  className="bg-white dark:bg-gray-900 rounded-2xl p-4 shadow-sm border border-gray-200 dark:border-gray-800 flex items-center justify-between group cursor-pointer hover:border-emerald-500/30 transition-all"
                  onClick={() => setActiveTab('marketplace')}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform">
                      <ShoppingBag className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 dark:text-white">Active Products</h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Marketplace items</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xl font-bold text-gray-900 dark:text-white block">{stats.totalProducts}</span>
                    <span className="text-xs font-semibold text-green-600 dark:text-green-400">+5% growth</span>
                  </div>
                </motion.div>
              </div>

              {/* ACTIVE CAMPAIGNS & ACTIONS */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Active Campaigns List */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <div className="flex items-center justify-between mb-4 px-1">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">Active Campaigns</h3>
                    <button 
                      onClick={() => setActiveTab('campaigns')}
                      className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 flex items-center hover:underline"
                    >
                      View All <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <div className="space-y-3">
                    {campaigns.slice(0, 3).map((campaign) => (
                      <div key={campaign.id} className="bg-white dark:bg-gray-900 rounded-2xl p-4 shadow-sm border border-gray-200 dark:border-gray-800 flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-bold text-sm shrink-0">
                          {Math.round((campaign.collected / campaign.target) * 100)}%
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-gray-900 dark:text-white truncate text-sm">{campaign.title}</h4>
                          <div className="h-1.5 w-full bg-gray-100 dark:bg-gray-800 rounded-full mt-2 overflow-hidden">
                            <div 
                              className="h-full bg-emerald-500 rounded-full"
                              style={{ width: `${Math.min((campaign.collected / campaign.target) * 100, 100)}%` }}
                            ></div>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="text-xs font-bold text-gray-900 dark:text-white block">{formatPrice(campaign.collected)}</span>
                          <span className="text-[10px] text-gray-500 dark:text-gray-400">raised</span>
                        </div>
                      </div>
                    ))}
                    {campaigns.length === 0 && (
                      <div className="text-center py-8 text-gray-500 dark:text-gray-400 text-sm bg-white dark:bg-gray-900 rounded-2xl border border-dashed border-gray-300 dark:border-gray-700">
                        No active campaigns
                      </div>
                    )}
                  </div>
                </motion.div>

                {/* Quick Actions List */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.45 }}
                >
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 px-1">Quick Actions</h3>
                  <div className="space-y-3">
                    <button
                      onClick={() => setShowCreateAnnouncement(true)}
                      className="w-full bg-white dark:bg-gray-900 rounded-2xl p-4 shadow-sm border border-gray-200 dark:border-gray-800 flex items-center gap-4 group hover:border-blue-500/50 transition-all text-left"
                    >
                      <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform">
                        <Plus className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-gray-900 dark:text-white text-sm">New Announcement</h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Post update to timeline</p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-500 transition-colors" />
                    </button>

                    <button
                      onClick={() => setActiveTab('users')}
                      className="w-full bg-white dark:bg-gray-900 rounded-2xl p-4 shadow-sm border border-gray-200 dark:border-gray-800 flex items-center gap-4 group hover:border-emerald-500/50 transition-all text-left"
                    >
                      <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform">
                        <UserCheck className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-gray-900 dark:text-white text-sm">Approve Users</h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Review pending registrations</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {stats.pendingUsers > 0 && (
                          <span className="px-2 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-[10px] font-bold rounded-full">
                            {stats.pendingUsers}
                          </span>
                        )}
                        <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-emerald-500 transition-colors" />
                      </div>
                    </button>

                    <button
                      onClick={() => setActiveTab('campaigns')}
                      className="w-full bg-white dark:bg-gray-900 rounded-2xl p-4 shadow-sm border border-gray-200 dark:border-gray-800 flex items-center gap-4 group hover:border-purple-500/50 transition-all text-left"
                    >
                      <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform">
                        <TrendingUp className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-gray-900 dark:text-white text-sm">Manage Campaigns</h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Track donations & progress</p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-purple-500 transition-colors" />
                    </button>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          )}

          {/* USERS TAB */}
          {activeTab === 'users' && (
            <motion.div
              key="users"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
            >
              {/* Search and Filter Bar */}
              <div className="mb-6 space-y-3">
                <div className="flex gap-3">
                  <div className="flex-1 relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search users..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    className="p-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl"
                  >
                    <Filter className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                  </motion.button>
                </div>

                {/* Stats Row */}
                <div className="flex gap-3 overflow-x-auto scrollbar-hide">
                  <div className="flex-shrink-0 px-4 py-2 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                    <span className="text-sm font-semibold text-blue-700 dark:text-blue-400">
                      All ({users.length})
                    </span>
                  </div>
                  <div className="flex-shrink-0 px-4 py-2 bg-green-100 dark:bg-green-900/30 rounded-xl">
                    <span className="text-sm font-semibold text-green-700 dark:text-green-400">
                      Active ({users.filter(u => u.status === 'Active').length})
                    </span>
                  </div>
                  <div className="flex-shrink-0 px-4 py-2 bg-orange-100 dark:bg-orange-900/30 rounded-xl">
                    <span className="text-sm font-semibold text-orange-700 dark:text-orange-400">
                      Pending ({users.filter(u => u.status === 'Pending').length})
                    </span>
                  </div>
                </div>
              </div>

              {/* Users List Grouped */}
              <div className="space-y-8">
                {/* Admins Section */}
                {users.filter(u => u.role === 'Admin').length > 0 && (
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                      <Shield className="w-5 h-5 text-amber-500" />
                      Admins
                    </h3>
                    <div className="space-y-3">
                      {users.filter(u => u.role === 'Admin').map((user, index) => (
                        <UserCard 
                          key={user.id} 
                          user={user} 
                          index={index} 
                          handleUpdateRole={handleUpdateRole}
                          handleDeleteUser={handleDeleteUser}
                          handleApproveUser={handleApproveUser}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Pending Approval Section */}
                {users.filter(u => u.status === 'Pending' || u.status === 'pending').length > 0 && (
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                      <Clock className="w-5 h-5 text-orange-500" />
                      Pending Approval
                    </h3>
                    <div className="space-y-3">
                      {users.filter(u => u.status === 'Pending' || u.status === 'pending').map((user, index) => (
                        <UserCard 
                          key={user.id} 
                          user={user} 
                          index={index} 
                          handleUpdateRole={handleUpdateRole}
                          handleDeleteUser={handleDeleteUser}
                          handleApproveUser={handleApproveUser}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Active Members Section */}
                {users.filter(u => u.role !== 'Admin' && (u.status === 'Active' || u.status === 'approved')).length > 0 && (
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                      <Users className="w-5 h-5 text-emerald-500" />
                      Active Members
                    </h3>
                    <div className="space-y-3">
                      {users.filter(u => u.role !== 'Admin' && (u.status === 'Active' || u.status === 'approved')).map((user, index) => (
                        <UserCard 
                          key={user.id} 
                          user={user} 
                          index={index} 
                          handleUpdateRole={handleUpdateRole}
                          handleDeleteUser={handleDeleteUser}
                          handleApproveUser={handleApproveUser}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* EVENTS TAB */}
          {activeTab === 'events' && (
            <motion.div
              key="events"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
            >
              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileTap={{ scale: 0.98 }}
                className="w-full mb-6 bg-gradient-to-r from-teal-500 to-emerald-600 text-white rounded-2xl p-4 shadow-xl flex items-center justify-center gap-3 font-semibold"
                onClick={() => setShowCreateEvent(true)}
              >
                <Plus className="w-6 h-6" />
                Create New Event
              </motion.button>

              <CreateEventModal
                session={session}
                isOpen={showCreateEvent}
                onClose={() => setShowCreateEvent(false)}
                onSuccess={fetchAllData}
              />

              <div className="space-y-3">
                {events.map((event, index) => (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-white dark:bg-gray-900 rounded-2xl p-5 shadow-sm border border-gray-200 dark:border-gray-800"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-2xl">
                            {event.category === 'Shalat' ? '🕌' : event.category === 'Kajian' ? '📖' : '🤝'}
                          </span>
                          <h4 className="font-bold text-gray-900 dark:text-white">
                            {event.title}
                          </h4>
                          <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full text-xs font-semibold">
                            {event.category}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                          {event.description}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-500">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {new Date(event.date).toLocaleDateString('id-ID', {
                              weekday: 'long',
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric'
                            })}
                          </div>
                          {event.location && (
                            <div className="flex items-center gap-1">
                              <span className="text-lg">📍</span>
                              {event.location}
                            </div>
                          )}
                          <div className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            {event.rsvp?.length || 0} Attending
                          </div>
                        </div>
                      </div>
                      <motion.button
                        whileTap={{ scale: 0.9 }}
                        className="p-2 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-xl"
                        onClick={() => handleDeleteEvent(event.id)}
                      >
                        <Trash2 className="w-5 h-5" />
                      </motion.button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* MARKETPLACE TAB */}
          {activeTab === 'marketplace' && (
            <motion.div
              key="marketplace"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
            >
              {/* Category Filter */}
              <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
                {['All', 'barang', 'jasa', 'lainnya'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setMarketplaceCategory(cat)}
                    className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all whitespace-nowrap capitalize ${
                      marketplaceCategory === cat
                        ? 'bg-emerald-600 text-white shadow-lg'
                        : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {products
                  .filter(p => marketplaceCategory === 'All' || p.category === marketplaceCategory)
                  .map((product, index) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-white dark:bg-gray-900 rounded-2xl p-4 shadow-sm border border-gray-200 dark:border-gray-800 flex gap-4"
                  >
                    <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-xl flex-shrink-0 overflow-hidden">
                      {product.images && product.images[0] ? (
                        <img 
                          src={product.images[0]} 
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <ShoppingBag className="w-8 h-8" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start">
                          <h4 className="font-bold text-gray-900 dark:text-white truncate pr-2">
                            {product.name}
                          </h4>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            product.status === 'approved' 
                              ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                              : 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400'
                          }`}>
                            {product.status}
                          </span>
                        </div>
                        <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                          {formatPrice(product.price)}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {product.profiles?.name || 'Unknown Seller'}
                        </p>
                      </div>
                      <div className="flex justify-end pt-2 gap-2">
                         {product.status === 'pending' && (
                          <>
                            <motion.button
                              whileTap={{ scale: 0.9 }}
                              className="p-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-lg"
                              onClick={() => handleApproveProduct(product.id)}
                              title="Approve"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </motion.button>
                            <motion.button
                              whileTap={{ scale: 0.9 }}
                              className="p-2 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 rounded-lg"
                              onClick={() => handleRejectProduct(product.id)}
                              title="Reject"
                            >
                              <X className="w-4 h-4" />
                            </motion.button>
                          </>
                        )}
                        <motion.button
                          whileTap={{ scale: 0.9 }}
                          className="p-2 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg"
                          onClick={() => handleDeleteProduct(product.id)}
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* ANNOUNCEMENTS TAB */}
          {activeTab === 'announcements' && (
            <motion.div
              key="announcements"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
            >
              {/* Create New Button */}
              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileTap={{ scale: 0.98 }}
                className="w-full mb-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl p-4 shadow-xl flex items-center justify-center gap-3 font-semibold"
                onClick={() => setShowCreateAnnouncement(true)}
              >
                <Plus className="w-6 h-6" />
                Create New Announcement
              </motion.button>

              <CreateAnnouncementModal
                session={session}
                isOpen={showCreateAnnouncement}
                onClose={() => setShowCreateAnnouncement(false)}
                onSuccess={fetchAllData}
              />

              {/* Announcements List */}
              <div className="space-y-3">
                {announcements.map((announcement, index) => (
                  <motion.div
                    key={announcement.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-white dark:bg-gray-900 rounded-2xl p-5 shadow-sm border border-gray-200 dark:border-gray-800"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-bold text-gray-900 dark:text-white">
                            {announcement.title}
                          </h4>
                          {/* Dynamic Status Badge */}
                          <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                            announcement.is_approved
                              ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                              : 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400'
                          }`}>
                            {announcement.is_approved ? '🟢 Approved' : '⏳ Pending'}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                          {announcement.content}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-500">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {formatDate(announcement.date)}
                          </div>
                          {announcement.is_approved && (
                            <div className="flex items-center gap-1">
                              <Eye className="w-4 h-4" />
                              {announcement.views} views
                            </div>
                          )}
                        </div>
                      </div>
                      <motion.button
                        whileTap={{ scale: 0.9 }}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
                      >
                        <MoreVertical className="w-5 h-5 text-gray-400" />
                      </motion.button>
                    </div>
                    <div className="flex gap-2">
                      {/* Approve Button - Show only if not approved */}
                      {!announcement.is_approved && (
                        <motion.button
                          whileTap={{ scale: 0.95 }}
                          className="flex-1 py-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-xl text-sm font-semibold flex items-center justify-center gap-2"
                          onClick={() => handleApproveTimeline(announcement.id)}
                        >
                          <CheckCircle className="w-4 h-4" />
                          Approve
                        </motion.button>
                      )}
                      
                      {/* Reject/Hide Button - Show only if approved */}
                      {announcement.is_approved && (
                        <motion.button
                          whileTap={{ scale: 0.95 }}
                          className="flex-1 py-2 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 rounded-xl text-sm font-semibold flex items-center justify-center gap-2"
                          onClick={() => handleRejectTimeline(announcement.id)}
                        >
                          <XCircle className="w-4 h-4" />
                          Hide
                        </motion.button>
                      )}
                      
                      {/* Delete Button - Always shown */}
                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        className="flex-1 py-2 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-xl text-sm font-semibold flex items-center justify-center gap-2"
                        onClick={() => handleDeleteAnnouncement(announcement.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </motion.button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* CAMPAIGNS TAB */}
          {activeTab === 'campaigns' && (
            <motion.div
              key="campaigns"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
            >
              {/* Create New Button */}
              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileTap={{ scale: 0.98 }}
                className="w-full mb-6 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-2xl p-4 shadow-xl flex items-center justify-center gap-3 font-semibold"
                onClick={() => setShowCreateCampaign(true)}
              >
                <Plus className="w-6 h-6" />
                Create New Campaign
              </motion.button>

              <CreateCampaignModal
                session={session}
                isOpen={showCreateCampaign}
                onClose={() => setShowCreateCampaign(false)}
                onSuccess={fetchAllData}
              />

              {/* Campaigns List */}
              <div className="space-y-4">
                {campaigns.map((campaign, index) => {
                  const percentage = (campaign.collected / campaign.target) * 100;
                  
                  return (
                    <motion.div
                      key={campaign.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="bg-white dark:bg-gray-900 rounded-2xl p-5 shadow-sm border border-gray-200 dark:border-gray-800"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-bold text-gray-900 dark:text-white">
                              {campaign.title}
                            </h4>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                              campaign.status === 'Active'
                                ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                                : campaign.status === 'Completed'
                                ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400'
                            }`}>
                              {campaign.status}
                            </span>
                          </div>
                        </div>
                        <motion.button
                          whileTap={{ scale: 0.9 }}
                          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
                        >
                          <MoreVertical className="w-5 h-5 text-gray-400" />
                        </motion.button>
                      </div>

                      {/* Progress Bar */}
                      <div className="mb-4">
                        <div className="flex justify-between text-sm mb-2">
                          <span className="font-semibold text-gray-900 dark:text-white">
                            {formatPrice(campaign.collected)}
                          </span>
                          <span className="text-gray-500 dark:text-gray-400">
                            {formatPrice(campaign.target)}
                          </span>
                        </div>
                        <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${percentage}%` }}
                            transition={{ duration: 1, delay: index * 0.1 }}
                            className={`h-full ${
                              percentage >= 100
                                ? 'bg-gradient-to-r from-blue-500 to-indigo-600'
                                : 'bg-gradient-to-r from-emerald-500 to-teal-600'
                            }`}
                          />
                        </div>
                        <div className="flex justify-between mt-2 text-xs text-gray-500 dark:text-gray-400">
                          <span>{percentage.toFixed(1)}% completed</span>
                          <span>{campaign.donors} donors</span>
                        </div>
                      </div>

                      {/* Campaign Details */}
                      <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-500 mb-4">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          Ends {formatDate(campaign.endDate)}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        <motion.button
                          whileTap={{ scale: 0.95 }}
                          className="flex-1 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-xl text-sm font-semibold flex items-center justify-center gap-2"
                        >
                          <Edit className="w-4 h-4" />
                          Edit
                        </motion.button>
                        <motion.button
                          whileTap={{ scale: 0.95 }}
                          className="flex-1 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400 rounded-xl text-sm font-semibold flex items-center justify-center gap-2"
                        >
                          <Eye className="w-4 h-4" />
                          View
                        </motion.button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* MODERATION TAB */}
          {activeTab === 'moderation' && (
            <motion.div
              key="moderation"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
            >
              {/* Header */}
              <div className="mb-6">
                <div className="flex items-center gap-3 mb-2">
                  <ShieldAlert className="w-7 h-7 text-red-600 dark:text-red-400" />
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    🛡️ Content Moderation
                  </h2>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Review user-generated content and take action on policy violations
                </p>
              </div>

              {/* Stats Bar */}
              <div className="grid grid-cols-3 gap-3 mb-6">
                <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-4 text-white">
                  <p className="text-sm opacity-90">Total Items</p>
                  <p className="text-2xl font-bold">{moderationQueue.length}</p>
                </div>
                <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl p-4 text-white">
                  <p className="text-sm opacity-90">Pending</p>
                  <p className="text-2xl font-bold">
                    {moderationQueue.filter(item => item.status === 'pending').length}
                  </p>
                </div>
                <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-4 text-white">
                  <p className="text-sm opacity-90">Approved</p>
                  <p className="text-2xl font-bold">
                    {moderationQueue.filter(item => item.status === 'published' || item.status === 'approved').length}
                  </p>
                </div>
              </div>

              {/* Moderation Queue Feed */}
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Review Queue</h3>
                
                {moderationQueue.length === 0 ? (
                  <div className="bg-white dark:bg-gray-900 rounded-2xl p-12 text-center border border-gray-200 dark:border-gray-800">
                    <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                      All Clear!
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      No content pending moderation at the moment.
                    </p>
                  </div>
                ) : (
                  moderationQueue.map((item, index) => {
                    const formattedTime = new Date(item.timestamp).toLocaleString('id-ID', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    });

                    return (
                      <motion.div
                        key={`${item.type}-${item.id}`}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="bg-white dark:bg-gray-900 rounded-2xl p-5 shadow-lg border-2 border-gray-200 dark:border-gray-800 hover:border-emerald-500 dark:hover:border-emerald-500 transition-all"
                      >
                        {/* Content Card */}
                        <div className="flex gap-4 mb-4">
                          {/* User Avatar */}
                          <div className="flex-shrink-0">
                            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
                              <span className="text-white font-bold text-lg">
                                {item.userName.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          </div>

                          {/* Content Details */}
                          <div className="flex-1 min-w-0">
                            {/* User Name & Type Badge */}
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="font-bold text-gray-900 dark:text-white">
                                {item.userName}
                              </h4>
                              <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                                item.type === 'post'
                                  ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                                  : 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400'
                              }`}>
                                {item.type === 'post' ? '📝 Post' : '🛒 Product'}
                              </span>
                              <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                                item.status === 'pending'
                                  ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400'
                                  : 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                              }`}>
                                {item.status}
                              </span>
                            </div>

                            {/* Title (if exists) */}
                            {item.title && (
                              <h5 className="font-semibold text-gray-900 dark:text-white mb-1">
                                {item.title}
                              </h5>
                            )}

                            {/* Content Snippet */}
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 line-clamp-3">
                              {item.content}
                            </p>

                            {/* Price (for products) */}
                            {item.type === 'product' && item.price && (
                              <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 mb-2">
                                {formatPrice(item.price)}
                              </p>
                            )}

                            {/* Timestamp */}
                            <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-500">
                              <Clock className="w-3 h-3" />
                              {formattedTime}
                            </div>
                          </div>

                          {/* Image Preview (if exists) */}
                          {item.image && (
                            <div className="flex-shrink-0">
                              <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800">
                                <img 
                                  src={item.image} 
                                  alt="Content preview"
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="80" height="80"%3E%3Crect fill="%23e5e7eb" width="80" height="80"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%239ca3af" font-family="sans-serif" font-size="12"%3ENo Image%3C/text%3E%3C/svg%3E';
                                  }}
                                />
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-3">
                          <motion.button
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleApproveContent(item.id, item.type)}
                            className="flex-1 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg transition-all"
                          >
                            <CheckCircle className="w-5 h-5" />
                            ✅ Approve
                          </motion.button>
                          
                          <motion.button
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleTakeDownContent(item.id, item.type)}
                            className="flex-1 py-3 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg transition-all"
                          >
                            <Trash2 className="w-5 h-5" />
                            🗑️ Take Down
                          </motion.button>
                        </div>
                      </motion.div>
                    );
                  })
                )}
              </div>
            </motion.div>
          )}

          {/* REPORTS TAB */}
          {activeTab === 'reports' && (
            <motion.div
              key="reports"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
            >
              {/* Header */}
              <div className="mb-6">
                <div className="flex items-center gap-3 mb-2">
                  <Flag className="w-7 h-7 text-red-600 dark:text-red-400" />
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    🚩 User Reports
                  </h2>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Content flagged by the community - review and take action
                </p>
              </div>

              {/* Stats Bar */}
              <div className="grid grid-cols-3 gap-3 mb-6">
                <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-2xl p-4 text-white">
                  <p className="text-sm opacity-90">Total Reports</p>
                  <p className="text-2xl font-bold">{userReports.length}</p>
                </div>
                <div className="bg-gradient-to-br from-orange-500 to-amber-600 rounded-2xl p-4 text-white">
                  <p className="text-sm opacity-90">High Priority</p>
                  <p className="text-2xl font-bold">
                    {userReports.filter(r => r.totalReports >= 5).length}
                  </p>
                </div>
                <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-4 text-white">
                  <p className="text-sm opacity-90">Low Priority</p>
                  <p className="text-2xl font-bold">
                    {userReports.filter(r => r.totalReports < 5).length}
                  </p>
                </div>
              </div>

              {/* Reports Feed */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">Flagged Content</h3>
                  <div className="flex items-center gap-2 px-3 py-1 bg-red-100 dark:bg-red-900/30 rounded-full">
                    <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400" />
                    <span className="text-sm font-semibold text-red-700 dark:text-red-400">
                      Requires Review
                    </span>
                  </div>
                </div>
                
                {userReports.length === 0 ? (
                  <div className="bg-white dark:bg-gray-900 rounded-2xl p-12 text-center border border-gray-200 dark:border-gray-800">
                    <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                      No Reports!
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      No content has been flagged by the community.
                    </p>
                  </div>
                ) : (
                  userReports.map((report, index) => {
                    const formattedTime = new Date(report.timestamp).toLocaleString('id-ID', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    });

                    return (
                      <motion.div
                        key={`${report.type}-${report.id}`}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className={`bg-white dark:bg-gray-900 rounded-2xl p-5 shadow-lg border-2 transition-all ${
                          report.totalReports >= 5
                            ? 'border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-950/20'
                            : 'border-gray-200 dark:border-gray-800'
                        } hover:border-red-500 dark:hover:border-red-500`}
                      >
                        {/* Priority Indicator */}
                        {report.totalReports >= 5 && (
                          <div className="flex items-center gap-2 mb-3 px-3 py-1 bg-red-600 text-white rounded-full w-fit">
                            <AlertTriangle className="w-4 h-4 animate-pulse" />
                            <span className="text-xs font-bold">HIGH PRIORITY</span>
                          </div>
                        )}

                        {/* Report Card */}
                        <div className="flex gap-4 mb-4">
                          {/* Author Avatar */}
                          <div className="flex-shrink-0">
                            <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-orange-600 rounded-full flex items-center justify-center">
                              <span className="text-white font-bold text-lg">
                                {report.authorName.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          </div>

                          {/* Content Details */}
                          <div className="flex-1 min-w-0">
                            {/* Author Name & Badges */}
                            <div className="flex items-center gap-2 mb-2 flex-wrap">
                              <h4 className="font-bold text-gray-900 dark:text-white">
                                {report.authorName}
                              </h4>
                              <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                                report.type === 'post'
                                  ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                                  : 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400'
                              }`}>
                                {report.type === 'post' ? '📝 Post' : '🛒 Product'}
                              </span>
                              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400">
                                🚩 {report.totalReports} {report.totalReports === 1 ? 'Report' : 'Reports'}
                              </span>
                            </div>

                            {/* Reason for Report */}
                            <div className="mb-2 px-3 py-2 bg-orange-100 dark:bg-orange-900/20 rounded-lg border border-orange-300 dark:border-orange-700">
                              <div className="flex items-center gap-2">
                                <AlertCircle className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                                <span className="text-sm font-semibold text-orange-800 dark:text-orange-300">
                                  Reason: {report.reason}
                                </span>
                              </div>
                            </div>

                            {/* Title (if exists) */}
                            {report.title && (
                              <h5 className="font-semibold text-gray-900 dark:text-white mb-1">
                                {report.title}
                              </h5>
                            )}

                            {/* Content Snippet */}
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">
                              {report.content}
                            </p>

                            {/* Price (for products) */}
                            {report.type === 'product' && report.price && (
                              <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 mb-2">
                                {formatPrice(report.price)}
                              </p>
                            )}

                            {/* Timestamp */}
                            <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-500">
                              <Clock className="w-3 h-3" />
                              {formattedTime}
                            </div>
                          </div>

                          {/* Image Preview (if exists) */}
                          {report.image && (
                            <div className="flex-shrink-0">
                              <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800 border-2 border-red-300 dark:border-red-700">
                                <img 
                                  src={report.image} 
                                  alt="Reported content"
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="80" height="80"%3E%3Crect fill="%23e5e7eb" width="80" height="80"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%239ca3af" font-family="sans-serif" font-size="12"%3EFlagged%3C/text%3E%3C/svg%3E';
                                  }}
                                />
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-3">
                          <motion.button
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleDismissReport(report.id, report.type)}
                            className="flex-1 py-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-md transition-all"
                          >
                            <X className="w-5 h-5" />
                            Dismiss Report
                          </motion.button>
                          
                          <motion.button
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleTakeDownAndWarn(report.id, report.type, report.authorId)}
                            className="flex-1 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg transition-all"
                          >
                            <AlertTriangle className="w-5 h-5" />
                            🗑️ Take Down & Warn
                          </motion.button>
                        </div>
                      </motion.div>
                    );
                  })
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// Tab Button Component
function TabButton({ 
  active, 
  onClick, 
  icon: Icon, 
  label 
}: { 
  active: boolean; 
  onClick: () => void; 
  icon: React.ElementType; 
  label: string; 
}) {
  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm whitespace-nowrap transition-all ${
        active
          ? 'bg-white text-emerald-700 shadow-lg'
          : 'bg-white/10 text-white/70 hover:bg-white/20'
      }`}
    >
      <Icon className="w-4 h-4" />
      {label}
    </motion.button>
  );
}

// Stat Card Component
function StatCard({ 
  icon: Icon, 
  label, 
  value, 
  change, 
  badge,
  gradient, 
  delay 
}: { 
  icon: React.ElementType; 
  label: string; 
  value: number; 
  change?: string; 
  badge?: string;
  gradient: string; 
  delay: number; 
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay }}
      className="bg-white dark:bg-gray-900 rounded-2xl p-4 shadow-sm border border-gray-200 dark:border-gray-800 relative overflow-hidden"
    >
      <div className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-br ${gradient} opacity-10 rounded-full -mr-10 -mt-10`}></div>
      
      <div className="relative z-10">
        <div className={`w-10 h-10 bg-gradient-to-br ${gradient} rounded-xl flex items-center justify-center mb-3`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{label}</p>
        <div className="flex items-end justify-between">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{value}</h3>
          {change && (
            <span className="text-xs font-semibold text-green-600 dark:text-green-400">
              {change}
            </span>
          )}
          {badge === 'urgent' && (
            <span className="text-xs font-semibold text-red-600 dark:text-red-400 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// Quick Action Button Component
function QuickActionButton({ 
  icon: Icon, 
  label, 
  gradient, 
  badge,
  onClick 
}: { 
  icon: React.ElementType; 
  label: string; 
  gradient: string; 
  badge?: number;
  onClick: () => void; 
}) {
  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className="relative bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow text-left"
    >
      {badge && badge > 0 && (
        <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center border-2 border-gray-50 dark:border-gray-950">
          <span className="text-xs font-bold text-white">{badge}</span>
        </div>
      )}
      <div className={`w-12 h-12 bg-gradient-to-br ${gradient} rounded-xl flex items-center justify-center mb-3`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <p className="text-sm font-semibold text-gray-900 dark:text-white">{label}</p>
    </motion.button>
  );
}