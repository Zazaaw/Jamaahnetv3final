import React, { useState } from 'react';
import { Lock, ArrowLeft, ShieldCheck, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';
import { toast } from 'sonner';
import { getSupabaseClient } from '../utils/supabase/client';
import { IslamicPattern } from './IslamicPattern';

export default function ResetPasswordScreen({ 
  onSuccess, 
  onBack 
}: { 
  onSuccess: () => void;
  onBack: () => void;
}) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error('Password dan Konfirmasi Password tidak sama wak!');
      return;
    }

    if (password.length < 6) {
      toast.error('Password minimal 6 karakter ya.');
      return;
    }

    setLoading(true);
    try {
      const supabase = getSupabaseClient();
      // Fungsi sakti Supabase buat update password setelah user klik link dari email
      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) throw error;

      toast.success('Alhamdulillah, Password berhasil diperbarui! 🎉');
      onSuccess();
    } catch (error: any) {
      console.error('Error updating password:', error);
      toast.error(error.message || 'Gagal memperbarui password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 relative overflow-hidden">
      {/* Islamic Pattern Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <IslamicPattern className="text-emerald-600 dark:text-emerald-400 opacity-[0.03]" />
      </div>

      {/* Back Button */}
      <motion.button
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        onClick={onBack}
        className="absolute top-6 left-6 z-20 w-12 h-12 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-full flex items-center justify-center shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all"
      >
        <ArrowLeft className="w-5 h-5 text-gray-700 dark:text-gray-300" />
      </motion.button>

      <div className="min-h-screen flex items-center justify-center p-6 pt-24">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md"
        >
          {/* Header Section */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="w-20 h-20 bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-xl"
            >
              <ShieldCheck className="w-10 h-10 text-white" />
            </motion.div>
            
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-3xl font-bold mb-2 dark:text-white bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-400 dark:to-teal-400 bg-clip-text text-transparent"
            >
              Buat Password Baru
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="text-gray-600 dark:text-gray-400 text-sm px-4"
            >
              Silakan masukkan password baru yang kuat dan mudah Anda ingat.
            </motion.p>
          </div>

          {/* Form Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white dark:bg-gray-800/50 backdrop-blur-md rounded-3xl p-8 shadow-xl border border-gray-100 dark:border-gray-700/50"
          >
            <form onSubmit={handleUpdatePassword} className="space-y-5">
              
              {/* Password Baru */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Password Baru
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all dark:text-white"
                    placeholder="Minimal 6 karakter"
                    required
                    minLength={6}
                  />
                </div>
              </div>

              {/* Konfirmasi Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Konfirmasi Password Baru
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all dark:text-white"
                    placeholder="Ulangi password baru"
                    required
                    minLength={6}
                  />
                </div>
              </div>

              {/* Submit Button */}
              <motion.button
                type="submit"
                disabled={loading}
                whileTap={{ scale: 0.98 }}
                className="w-full mt-4 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white py-4 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all flex justify-center items-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Memproses...
                  </>
                ) : (
                  'Simpan Password Baru'
                )}
              </motion.button>
            </form>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}