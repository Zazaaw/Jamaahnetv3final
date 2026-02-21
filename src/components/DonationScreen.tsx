import React, { useState, useEffect } from 'react';
import { Target, TrendingUp, FileText, HeartHandshake, Sparkles, ChevronRight } from 'lucide-react';
import { motion } from 'motion/react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { getSupabaseClient } from '../utils/supabase/client';
import DonationModal from './DonationModal';
import { IslamicPattern } from './IslamicPattern';

interface Campaign {
  id: string;
  title: string;
  description: string;
  target_amount: number;
  current_amount: number;
  image: string;
  created_at: number;
}

export default function DonationScreen({ session }: { session: any }) {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [showDonationModal, setShowDonationModal] = useState(false);
  
  const supabase = getSupabaseClient();

  useEffect(() => {
    fetchCampaigns();
  }, []);

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
    </div>
  );
}
