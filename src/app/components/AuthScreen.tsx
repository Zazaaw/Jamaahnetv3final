import React, { useState, useEffect } from 'react';
import { ArrowLeft, Mail, Lock, Key, User as UserIcon, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { getSupabaseClient } from '../utils/supabase/client';
import { IslamicPattern, MosqueIcon } from './IslamicPattern';
import { toast } from 'sonner';

const supabase = getSupabaseClient();

// Master invitation codes that are always valid
const MASTER_CODES = ['MASJID2024', 'JAMAAH2024'];

export default function AuthScreen({ 
  onSuccess,
  onSignupSuccess,
  onBack 
}: { 
  onSuccess: () => void;
  onSignupSuccess: () => void;
  onBack: () => void;
}) {
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [invitationCode, setInvitationCode] = useState('');
  const [inviterName, setInviterName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // State untuk Fitur Lupa Password
  const [showForgotPwd, setShowForgotPwd] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [isResetting, setIsResetting] = useState(false);

  // Real-time inviter name lookup
  useEffect(() => {
    const lookupInviterName = async () => {
      if (!invitationCode || !isSignup) {
        setInviterName('');
        return;
      }

      if (MASTER_CODES.includes(invitationCode)) {
        setInviterName('Pusat Jamaah.net');
        return;
      }

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('name')
          .ilike('member_id', invitationCode.trim())
          .maybeSingle();

        if (error) {
          console.log('Error looking up inviter:', error);
          setInviterName('');
          return;
        }

        if (data && data.name) {
          setInviterName(data.name);
        } else {
          setInviterName('');
        }
      } catch (err) {
        console.log('Error in inviter lookup:', err);
        setInviterName('');
      }
    };

    const timeoutId = setTimeout(() => {
      lookupInviterName();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [invitationCode, isSignup]);

  const handleGoogleLogin = async () => {
    try {
      setError('');
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin
        }
      });
      if (error) throw error;
    } catch (err: any) {
      setError(err.message || 'Gagal login dengan Google');
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (password !== confirmPassword) {
      setError('Password tidak cocok');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('Password minimal 6 karakter');
      setLoading(false);
      return;
    }

    if (!inviterName) {
      setError('Kode Referral tidak valid atau tidak ditemukan. Silakan hubungi pengurus masjid.');
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.auth.signUp({ 
        email, 
        password, 
        options: { 
          data: { 
            name, 
            invited_by: inviterName,
            status: 'Pending'
          } 
        } 
      });

      if (error) throw error;

      onSignupSuccess();
      
      setEmail('');
      setName('');
      setInvitationCode('');
      setInviterName('');
      setPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setError(err.message || 'Gagal mendaftar');
    } finally {
      setLoading(false);
    }
  };

  const handleSignin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('status')
          .eq('id', data.user.id)
          .maybeSingle();
        
        if (profile && profile.status === 'Pending') {
          await supabase.auth.signOut();
          throw new Error('Akun Anda masih menunggu persetujuan Admin.');
        }
      }

      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Gagal masuk');
    } finally {
      setLoading(false);
    }
  };

  // Fungsi Baru: Kirim Email Reset Password
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!resetEmail) {
      toast.error('Masukkan email Anda dulu wak!');
      return;
    }

    setIsResetting(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: `${window.location.origin}/`,
      });

      if (error) throw error;

      toast.success('Alhamdulillah! Link reset password telah dikirim ke email Anda. Cek kotak masuk atau spam ya. ✉️', { duration: 5000 });
      setShowForgotPwd(false); 
      setResetEmail('');
      
    } catch (error: any) {
      console.error('Error reset password:', error);
      toast.error(error.message || 'Gagal mengirim link reset. Pastikan email terdaftar.');
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 relative overflow-hidden">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <IslamicPattern className="text-emerald-600 dark:text-emerald-400 opacity-[0.03]" />
      </div>

      <motion.button
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        onClick={onBack}
        className="absolute top-6 left-6 z-20 w-12 h-12 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all hover:scale-105"
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
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="w-20 h-20 bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-2xl"
            >
              <UserIcon className="w-10 h-10 text-white" />
            </motion.div>
            
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-3xl font-bold mb-2 dark:text-white bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-400 dark:to-teal-400 bg-clip-text text-transparent"
            >
              {showForgotPwd ? 'Reset Password' : (isSignup ? 'Daftar & Bergabung' : 'Masuk')}
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="text-gray-600 dark:text-gray-400 text-sm"
            >
              {showForgotPwd ? 'Masukkan email terdaftar Anda' : (isSignup ? 'Bergabung dengan komunitas jamaah.net' : 'Masuk ke akun Anda')}
            </motion.p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="relative bg-white dark:bg-gray-800/50 backdrop-blur-md rounded-3xl p-8 shadow-2xl border border-gray-100 dark:border-gray-700/50"
          >
            <AnimatePresence mode="wait">
              {showForgotPwd ? (
                // FORM LUPA PASSWORD
                <motion.form 
                  key="forgot"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  onSubmit={handleForgotPassword} 
                  className="space-y-5"
                >
                  <div>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="email"
                        value={resetEmail}
                        onChange={(e) => setResetEmail(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all dark:text-white"
                        placeholder="nama@email.com"
                        required
                      />
                    </div>
                  </div>

                  <motion.button
                    type="submit"
                    disabled={isResetting}
                    whileTap={{ scale: 0.98 }}
                    className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white py-3.5 rounded-xl font-bold shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isResetting ? 'Mengirim...' : 'Kirim Link Reset'}
                  </motion.button>

                  <div className="text-center mt-4">
                    <button
                      type="button"
                      onClick={() => setShowForgotPwd(false)}
                      className="text-sm font-semibold text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors"
                    >
                      Kembali ke Login
                    </button>
                  </div>
                </motion.form>
              ) : (
                // FORM LOGIN/DAFTAR
                <motion.form 
                  key="auth"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  onSubmit={isSignup ? handleSignup : handleSignin} 
                  className="space-y-5"
                >
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-xl text-sm"
                    >
                      {error}
                    </motion.div>
                  )}

                  {isSignup && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Nama Lengkap
                      </label>
                      <div className="relative">
                        <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all dark:text-white"
                          placeholder="Masukkan nama lengkap"
                          required
                        />
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Email
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all dark:text-white"
                        placeholder="nama@email.com"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Password
                      </label>
                      
                      {!isSignup && (
                        <button
                          type="button"
                          onClick={() => setShowForgotPwd(true)}
                          className="text-xs font-bold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 hover:underline transition-all"
                        >
                          Lupa Password?
                        </button>
                      )}
                    </div>
                    
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all dark:text-white"
                        placeholder="Masukkan password Anda"
                        required
                        minLength={6}
                      />
                    </div>
                  </div>

                  {isSignup && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Konfirmasi Password
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all dark:text-white"
                          placeholder="Konfirmasi password Anda"
                          required
                          minLength={6}
                        />
                      </div>
                    </div>
                  )}

                  {isSignup && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Kode Undangan <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="text"
                          value={invitationCode}
                          onChange={(e) => setInvitationCode(e.target.value.toUpperCase())}
                          className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent uppercase transition-all dark:text-white"
                          placeholder="JM-XXXXXX"
                          required
                        />
                      </div>
                      
                      <AnimatePresence>
                        {inviterName && (
                          <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="mt-3 flex items-center gap-2 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 px-3 py-2 rounded-lg"
                          >
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                            <span className="text-sm text-emerald-700 dark:text-emerald-300 font-medium">
                              Diundang oleh: {inviterName}
                            </span>
                          </motion.div>
                        )}
                      </AnimatePresence>
                      
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                        Masukkan ID Member rekan Anda atau hubungi Pengurus Masjid jika belum memiliki kode.
                      </p>
                    </div>
                  )}

                  <motion.button
                    type="submit"
                    disabled={loading}
                    whileTap={{ scale: 0.98 }}
                    className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white py-4 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {loading ? 'Memproses...' : (isSignup ? 'Daftar' : 'Masuk')}
                  </motion.button>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-3 bg-white dark:bg-gray-800/50 text-gray-500 dark:text-gray-400">atau</span>
                    </div>
                  </div>

                  <motion.button
                    type="button"
                    onClick={handleGoogleLogin}
                    whileTap={{ scale: 0.98 }}
                    className="w-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 py-3.5 rounded-xl hover:bg-white dark:hover:bg-gray-700 transition-all shadow-sm hover:shadow-md flex items-center justify-center gap-3 font-semibold"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                    <span>Lanjutkan dengan Google</span>
                  </motion.button>
                </motion.form>
              )}
            </AnimatePresence>

            {!showForgotPwd && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="mt-8 text-center text-sm"
              >
                {isSignup ? (
                  <>
                    <span className="text-gray-600 dark:text-gray-400">Sudah punya akun?</span>{' '}
                    <button
                      onClick={() => setIsSignup(false)}
                      className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 hover:underline font-semibold transition-colors"
                    >
                      Klik disini untuk login
                    </button>
                  </>
                ) : (
                  <>
                    <span className="text-gray-600 dark:text-gray-400">Belum punya akun?</span>{' '}
                    <button
                      onClick={() => setIsSignup(true)}
                      className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 hover:underline font-semibold transition-colors"
                    >
                      Klik disini untuk daftar
                    </button>
                  </>
                )}
              </motion.div>
            )}
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}