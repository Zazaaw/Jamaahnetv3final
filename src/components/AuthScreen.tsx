import React, { useState } from 'react';
import { ArrowLeft, Mail, Lock, Key, User as UserIcon, Phone } from 'lucide-react';
import { getSupabaseClient } from '../utils/supabase/client';

const supabase = getSupabaseClient();

export default function AuthScreen({ 
  onSuccess,
  onSignupSuccess,
  onBack 
}: { 
  onSuccess: () => void;
  onSignupSuccess: () => void;
  onBack: () => void;
}) {
  const [isSignup, setIsSignup] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [invitationCode, setInvitationCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Validasi format nomor HP Indonesia
  const validatePhoneNumber = (phone: string): boolean => {
    // Hapus semua karakter non-digit
    const cleaned = phone.replace(/\D/g, '');
    
    // Format yang diterima:
    // 08xxxxxxxxxx (10-13 digit)
    // 628xxxxxxxxxx (11-14 digit)
    // +628xxxxxxxxxx (12-15 digit dengan +)
    
    if (phone.startsWith('+62')) {
      return /^\+62\d{9,12}$/.test(phone);
    } else if (phone.startsWith('62')) {
      return /^62\d{9,12}$/.test(phone);
    } else if (phone.startsWith('08')) {
      return /^08\d{8,11}$/.test(phone);
    }
    
    return false;
  };

  const handlePhoneChange = (value: string) => {
    // Hanya izinkan angka, + dan spasi
    const cleaned = value.replace(/[^\d+\s]/g, '');
    setPhone(cleaned);
  };

  const handleGoogleLogin = async () => {
    try {
      setError('');
      // Note: User must complete setup at https://supabase.com/docs/guides/auth/social-login/auth-google
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
      });
      
      if (error) {
        setError(error.message);
      }
    } catch (err: any) {
      setError(err.message || 'Gagal login dengan Google');
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validasi nomor HP
    if (!validatePhoneNumber(phone)) {
      setError('Format nomor HP tidak valid. Gunakan format: 08xxxxxxxxxx, 628xxxxxxxxxx, atau +628xxxxxxxxxx');
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
            phone, 
            invitationCode 
          } 
        } 
      });

      if (error) {
        throw error;
      }

      // Redirect to pending approval screen
      onSignupSuccess();
      
      // Clear form
      setEmail('');
      setName('');
      setPhone('');
      setInvitationCode('');
      setPassword('');
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

      if (error) {
        throw error;
      }

      // Check profile status
      if (data.user) {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('status')
          .eq('id', data.user.id)
          .single();
        
        if (profileError) {
          console.error('Error fetching profile status:', profileError);
          // Don't block login on profile fetch error, but log it
        }

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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-6">
        <button onClick={onBack} className="mb-4">
          <ArrowLeft className="w-6 h-6 text-gray-700" />
        </button>
        <h1 className="text-2xl">{isSignup ? 'Daftar & Bergabung' : 'Masuk'}</h1>
        <p className="text-gray-600 text-sm">
          {isSignup ? 'Bergabung dengan komunitas jamaah.net' : 'Masuk ke akun Anda'}
        </p>
      </div>

      <div className="p-6">
        <form onSubmit={isSignup ? handleSignup : handleSignin} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Name (signup only) */}
          {isSignup && (
            <div>
              <label className="block text-sm text-gray-700 mb-2">Nama Lengkap</label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="Masukkan nama lengkap"
                  required
                />
              </div>
            </div>
          )}

          {/* Email */}
          <div>
            <label className="block text-sm text-gray-700 mb-2">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                placeholder="nama@email.com"
                required
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm text-gray-700 mb-2">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                placeholder="Masukkan password Anda"
                required
                minLength={6}
              />
            </div>
          </div>

          {/* Phone (signup only) */}
          {isSignup && (
            <div>
              <label className="block text-sm text-gray-700 mb-2">
                Nomor Telepon <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => handlePhoneChange(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="081234567890 atau +6281234567890"
                  required
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Format: 08xxxxxxxxxx, 628xxxxxxxxxx, atau +628xxxxxxxxxx
              </p>
            </div>
          )}

          {/* Invitation Code (signup only) */}
          {isSignup && (
            <div>
              <label className="block text-sm text-gray-700 mb-2">
                Kode Undangan <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={invitationCode}
                  onChange={(e) => setInvitationCode(e.target.value.toUpperCase())}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent uppercase"
                  placeholder="MASJID2024"
                  required
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Hubungi pengurus masjid untuk mendapatkan kode undangan
              </p>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-600 text-white py-3 rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Memproses...' : (isSignup ? 'Daftar' : 'Masuk')}
          </button>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-gray-50 text-gray-500">atau</span>
            </div>
          </div>

          {/* Google Login */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            className="w-full bg-white border border-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Lanjutkan dengan Google
          </button>
        </form>

        {/* Toggle Signup/Signin */}
        <div className="mt-6 text-center text-sm">
          {isSignup ? (
            <>
              Sudah punya akun?{' '}
              <button
                onClick={() => setIsSignup(false)}
                className="text-emerald-600 hover:underline"
              >
                Masuk di sini
              </button>
            </>
          ) : (
            <>
              Belum punya akun?{' '}
              <button
                onClick={() => setIsSignup(true)}
                className="text-emerald-600 hover:underline"
              >
                Daftar di sini
              </button>
            </>
          )}
        </div>

        {/* Invitation Code Info */}
        {isSignup && (
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
            <strong>Demo Kode Undangan:</strong>
            <div className="mt-2 space-y-1">
              <div className="font-mono bg-white px-2 py-1 rounded">MASJID2024</div>
              <div className="font-mono bg-white px-2 py-1 rounded">JAMAAH2024</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}