import React, { useState, useEffect } from 'react';
import { Heart, TrendingUp, Users, Calendar, Plus, X, Loader2, ArrowLeft, HeartHandshake, Sparkles, FileText, ChevronRight, Target } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { getSupabaseClient } from '../utils/supabase/client';
import DonationModal from './DonationModal';
import { IslamicPattern } from './IslamicPattern';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { toast } from 'sonner';

interface Campaign {
  id: string;
  title: string;
  description: string;
  target_amount: number;
  current_amount: number;
  image: string;
  created_at: number;
}

export default function DonationScreen({ session, onBack }: { session: any; onBack?: () => void }) {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [showDonationModal, setShowDonationModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [currentUserRole, setCurrentUserRole] = useState<string>('');
  const [loading, setLoading] = useState(false);
  
  // Form fields
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formTargetAmount, setFormTargetAmount] = useState('');
  const [formImageUrl, setFormImageUrl] = useState('');
  
  const supabase = getSupabaseClient();

  useEffect(() => {
    fetchCampaigns();
    if (session?.user?.id) {
      fetchUserRole();
    }
  }, [session]);

  const fetchUserRole = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single();
      
      if (error) throw error;
      if (data) setCurrentUserRole(data.role);
    } catch (error) {
      console.error('Error fetching user role:', error);
    }
  };

  const fetchCampaigns = async () => {
    try {
      const { data, error } = await supabase
        .from('donation_campaigns')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data) {
        const mappedCampaigns = data.map((item: any) => ({
          ...item,
          image: item.image_url || 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
          // Ensure amounts are numbers
          target_amount: item.target_amount || 0,
          current_amount: item.current_amount || 0
        }));
        setCampaigns(mappedCampaigns);
      }
    } catch (error) {
      console.error('Error fetching campaigns:', error);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const calculateProgress = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100);
  };

  const handleDonate = (campaign: Campaign) => {
    setSelectedCampaign(campaign);
    setShowDonationModal(true);
  };

  const handleCreateCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!session) {
      toast.error('Silakan login terlebih dahulu');
      return;
    }

    if (!formTitle || !formDescription || !formTargetAmount) {
      toast.error('Semua field wajib diisi (kecuali gambar)');
      return;
    }

    const targetAmount = parseFloat(formTargetAmount);
    if (isNaN(targetAmount) || targetAmount <= 0) {
      toast.error('Target amount harus berupa angka positif');
      return;
    }

    setLoading(true);

    try {
      // 3. ROLE-BASED STATUS LOGIC: Determine status based on user role
      const status = currentUserRole === 'Admin' ? 'active' : 'pending';
      
      const { error } = await supabase
        .from('donation_campaigns')
        .insert({
          title: formTitle,
          description: formDescription,
          target_amount: targetAmount,
          current_amount: 0,
          image_url: formImageUrl || 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
          status: status,
          created_by: session.user.id,
          // Note: created_at is omitted if the database has DEFAULT NOW() setting
          // If you need to set it manually, use: created_at: new Date().toISOString()
        });

      if (error) throw error;

      // Show appropriate success message
      if (status === 'active') {
        toast.success('Kampanye donasi berhasil dibuat! ✅');
      } else {
        toast.success('Pengajuan donasi berhasil dikirim! Mohon tunggu verifikasi Admin. ⏳');
      }

      // 4. UI REFRESH: Reset form and refresh campaigns
      setFormTitle('');
      setFormDescription('');
      setFormTargetAmount('');
      setFormImageUrl('');
      setShowCreateModal(false);
      fetchCampaigns();
      
    } catch (error: any) {
      console.error('Error creating campaign:', error);
      toast.error('Gagal membuat kampanye: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-emerald-50/20 to-teal-50/20 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      {/* Background Pattern */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <IslamicPattern className="text-emerald-600 dark:text-emerald-400 opacity-[0.02]" />
      </div>

      {/* Modern Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative bg-gradient-to-br from-emerald-600 via-teal-600 to-green-600 dark:from-emerald-700 dark:via-teal-700 dark:to-green-700 text-white overflow-hidden"
        style={{ borderBottomLeftRadius: '2rem', borderBottomRightRadius: '2rem' }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
        <IslamicPattern className="text-white opacity-10" />
        
        <div className="relative z-10 p-6 pb-8">
          {/* Back Button */}
          {onBack && (
            <motion.button
              onClick={onBack}
              whileTap={{ scale: 0.9 }}
              className="mb-4 bg-white/20 backdrop-blur-md p-2 rounded-xl"
            >
              <ArrowLeft className="w-5 h-5" />
            </motion.button>
          )}
          
          <div className="flex items-center gap-3 mb-6">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200 }}
              className="bg-white/20 backdrop-blur-md p-3 rounded-2xl"
            >
              <HeartHandshake className="w-6 h-6" />
            </motion.div>
            <div>
              <h1 className="text-2xl font-bold">Infaq & Sedekah</h1>
              <p className="text-emerald-100 text-sm">Berbagi kebaikan untuk sesama</p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 gap-3">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white/15 backdrop-blur-xl rounded-2xl p-4 border border-white/20"
            >
              <div className="text-emerald-100 text-xs mb-1">Total Terkumpul</div>
              <div className="font-bold text-lg">
                {formatPrice(campaigns.reduce((sum, c) => sum + c.current_amount, 0))}
              </div>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white/15 backdrop-blur-xl rounded-2xl p-4 border border-white/20"
            >
              <div className="text-emerald-100 text-xs mb-1">Kampanye Aktif</div>
              <div className="font-bold text-lg flex items-center gap-2">
                {campaigns.length}
                <Sparkles className="w-4 h-4 text-yellow-300" />
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>

      <div className="relative z-10 p-6 space-y-6">
        {/* Transparency Report */}
        {session && (
          <motion.button 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            whileTap={{ scale: 0.98 }}
            className="w-full card-hover bg-white dark:bg-gray-800/50 backdrop-blur-sm rounded-3xl p-5 shadow-lg border border-gray-100 dark:border-gray-700/50 flex items-center justify-between group"
          >
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-br from-blue-500 to-indigo-500 p-4 rounded-2xl shadow-xl group-hover:scale-110 transition-transform">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Laporan Transparansi</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Lihat penggunaan dana donasi</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-blue-600 dark:text-blue-400 group-hover:translate-x-1 transition-transform" />
          </motion.button>
        )}

        {/* Campaign List */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Target className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <h2 className="text-xl font-bold dark:text-white">Kampanye Donasi</h2>
          </div>

          <div className="space-y-4">
            {campaigns.map((campaign, index) => {
              const progress = calculateProgress(campaign.current_amount, campaign.target_amount);

              return (
                <motion.div
                  key={campaign.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  className="card-hover bg-white dark:bg-gray-800/50 backdrop-blur-sm rounded-3xl shadow-lg border border-gray-100 dark:border-gray-700/50 overflow-hidden group"
                >
                  {/* Campaign Image */}
                  <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 relative overflow-hidden">
                    <ImageWithFallback
                      src={campaign.image}
                      alt={campaign.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    
                    {/* Progress Badge */}
                    <div className="absolute bottom-4 left-4 right-4">
                      <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-3">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-xs font-semibold text-gray-600">Progress</span>
                          <span className="text-xs font-bold text-emerald-600">{progress.toFixed(0)}%</span>
                        </div>
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            transition={{ delay: 0.6 + index * 0.1, duration: 0.8 }}
                            className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Campaign Details */}
                  <div className="p-5">
                    <h3 className="font-bold text-gray-900 dark:text-white mb-2 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                      {campaign.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
                      {campaign.description}
                    </p>

                    {/* Amount Info */}
                    <div className="flex items-center justify-between mb-4 p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl">
                      <div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Terkumpul</div>
                        <div className="font-bold text-emerald-600 dark:text-emerald-400">
                          {formatPrice(campaign.current_amount)}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Target</div>
                        <div className="font-semibold text-gray-700 dark:text-gray-300">
                          {formatPrice(campaign.target_amount)}
                        </div>
                      </div>
                    </div>

                    {/* Donate Button */}
                    <motion.button
                      whileTap={{ scale: 0.97 }}
                      onClick={() => handleDonate(campaign)}
                      className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white py-3 px-6 rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
                    >
                      <HeartHandshake className="w-5 h-5" />
                      Donasi Sekarang
                    </motion.button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Bottom Spacing */}
        <div className="h-20" />
      </div>

      {/* Donation Modal */}
      {showDonationModal && selectedCampaign && (
        <DonationModal
          campaign={selectedCampaign}
          session={session}
          onClose={() => {
            setShowDonationModal(false);
            setSelectedCampaign(null);
          }}
          onSuccess={() => {
            setShowDonationModal(false);
            setSelectedCampaign(null);
            fetchCampaigns();
          }}
        />
      )}

      {/* 1. FLOATING ACTION BUTTON (FAB) - Only visible when logged in */}
      {session && (
        <motion.button
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.6, type: 'spring', stiffness: 260, damping: 20 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setShowCreateModal(true)}
          className="fixed bottom-24 right-6 bg-gradient-to-r from-emerald-600 to-teal-600 text-white p-4 rounded-full shadow-2xl hover:shadow-emerald-500/50 transition-all z-50"
        >
          <Plus className="w-6 h-6" />
        </motion.button>
      )}

      {/* 2. CREATE CAMPAIGN MODAL */}
      <AnimatePresence>
        {showCreateModal && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowCreateModal(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
                {/* Modal Header */}
                <div className="sticky top-0 bg-gradient-to-r from-emerald-600 to-teal-600 text-white p-6 rounded-t-3xl flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold">Ajukan Kampanye Donasi</h2>
                    <p className="text-emerald-100 text-sm">Bantu sesama dengan kampanye Anda</p>
                  </div>
                  <button
                    onClick={() => setShowCreateModal(false)}
                    className="bg-white/20 backdrop-blur-md p-2 rounded-xl hover:bg-white/30 transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                {/* Form */}
                <form onSubmit={handleCreateCampaign} className="p-6 space-y-5">
                  {/* Title */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Judul Kampanye *
                    </label>
                    <input
                      type="text"
                      value={formTitle}
                      onChange={(e) => setFormTitle(e.target.value)}
                      placeholder="Contoh: Bantu Renovasi Masjid Al-Ikhlas"
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:text-white"
                      required
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Deskripsi *
                    </label>
                    <textarea
                      value={formDescription}
                      onChange={(e) => setFormDescription(e.target.value)}
                      placeholder="Jelaskan tujuan dan kebutuhan kampanye donasi Anda..."
                      rows={5}
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:text-white resize-none"
                      required
                    />
                  </div>

                  {/* Target Amount */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Target Donasi (IDR) *
                    </label>
                    <input
                      type="number"
                      value={formTargetAmount}
                      onChange={(e) => setFormTargetAmount(e.target.value)}
                      placeholder="Contoh: 50000000"
                      min="1"
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:text-white"
                      required
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {formTargetAmount && !isNaN(parseFloat(formTargetAmount)) && `≈ ${formatPrice(parseFloat(formTargetAmount))}`}
                    </p>
                  </div>

                  {/* Image URL (Optional) */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      URL Gambar (opsional)
                    </label>
                    <input
                      type="url"
                      value={formImageUrl}
                      onChange={(e) => setFormImageUrl(e.target.value)}
                      placeholder="https://example.com/image.jpg"
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:text-white"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Jika kosong, akan menggunakan gambar default
                    </p>
                  </div>

                  {/* Submit Button */}
                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-4 rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      'Mengirim...'
                    ) : (
                      <>
                        <HeartHandshake className="w-5 h-5" />
                        Ajukan Kampanye
                      </>
                    )}
                  </motion.button>
                </form>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}