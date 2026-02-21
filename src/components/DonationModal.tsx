import React, { useState } from 'react';
import { X } from 'lucide-react';
import { getSupabaseClient } from '../utils/supabase/client';

const PRESET_AMOUNTS = [10000, 25000, 50000, 100000, 250000, 500000];

export default function DonationModal({ 
  campaign, 
  session,
  onClose,
  onSuccess 
}: { 
  campaign: any;
  session: any;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [amount, setAmount] = useState('');
  const [donorName, setDonorName] = useState(session?.user?.user_metadata?.name || '');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const supabase = getSupabaseClient();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Insert the donation record
      const { error: insertError } = await supabase.from('donations').insert({
        campaign_id: campaign.id,
        user_id: session?.user?.id || null,
        amount: parseInt(amount),
        donor_name: donorName,
        is_anonymous: isAnonymous,
        status: 'success'
      });

      if (insertError) throw insertError;

      // 2. Update the campaign totals
      const { data: currentCampaign, error: fetchError } = await supabase
        .from('donation_campaigns')
        .select('current_amount, donor_count')
        .eq('id', campaign.id)
        .single();

      if (fetchError) throw fetchError;

      const newAmount = (currentCampaign.current_amount || 0) + parseInt(amount);
      const newCount = (currentCampaign.donor_count || 0) + 1;

      const { error: updateError } = await supabase
        .from('donation_campaigns')
        .update({
          current_amount: newAmount,
          donor_count: newCount
        })
        .eq('id', campaign.id);

      if (updateError) throw updateError;

      alert('Terima kasih atas donasi Anda! 🙏');
      onSuccess();
    } catch (error: any) {
      console.error('Error creating donation:', error);
      alert(error.message || 'Gagal membuat donasi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-t-3xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 flex items-center justify-between">
          <h2 className="text-lg dark:text-white">Donasi: {campaign.title}</h2>
          <button onClick={onClose}>
            <X className="w-6 h-6 text-gray-700 dark:text-gray-300" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 pb-32 space-y-4">
          {/* Preset Amounts */}
          <div>
            <label className="block text-sm text-gray-700 mb-2">Pilih Nominal</label>
            <div className="grid grid-cols-3 gap-2">
              {PRESET_AMOUNTS.map((presetAmount) => (
                <button
                  key={presetAmount}
                  type="button"
                  onClick={() => setAmount(presetAmount.toString())}
                  className={`px-4 py-3 rounded-lg border transition-colors text-sm ${
                    amount === presetAmount.toString()
                      ? 'bg-emerald-600 text-white border-emerald-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-emerald-600'
                  }`}
                >
                  {formatPrice(presetAmount).replace('Rp', '').trim()}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Amount */}
          <div>
            <label className="block text-sm text-gray-700 mb-2">Atau Masukkan Nominal</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              placeholder="Nominal donasi (Rp)"
              required
              min="1000"
            />
          </div>

          {/* Donor Name */}
          <div>
            <label className="block text-sm text-gray-700 mb-2">Nama Donatur</label>
            <input
              type="text"
              value={donorName}
              onChange={(e) => setDonorName(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              placeholder="Nama Anda"
              required={!isAnonymous}
              disabled={isAnonymous}
            />
          </div>

          {/* Anonymous Option */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="anonymous"
              checked={isAnonymous}
              onChange={(e) => setIsAnonymous(e.target.checked)}
              className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
            />
            <label htmlFor="anonymous" className="text-sm text-gray-700">
              Donasi sebagai Hamba Allah (anonim)
            </label>
          </div>

          {/* Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
            <strong>Informasi:</strong>
            <p className="mt-1">
              Ini adalah demo. Integrasi pembayaran Midtrans/Xendit akan ditambahkan untuk produksi.
            </p>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-600 text-white py-3 rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Memproses...' : `Donasi ${amount ? formatPrice(parseInt(amount)) : ''}`}
          </button>
        </form>
      </div>
    </div>
  );
}
