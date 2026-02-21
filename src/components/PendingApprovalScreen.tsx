import React from 'react';
import { motion } from 'motion/react';
import { Clock, Mail, MessageCircle, CheckCircle, ArrowRight, AlertCircle, Calendar, Smartphone } from 'lucide-react';
import { IslamicPattern, MosqueIcon } from './IslamicPattern';

export default function PendingApprovalScreen({ 
  onNavigateToLogin 
}: { 
  onNavigateToLogin: () => void;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900/30">
      {/* Background Pattern */}
      <div className="fixed inset-0 opacity-5 pointer-events-none">
        <IslamicPattern className="text-purple-600 dark:text-purple-400" />
      </div>

      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-lg">
          {/* Logo & Brand */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <div className="w-20 h-20 bg-gradient-to-br from-purple-600 to-pink-600 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-2xl">
              <MosqueIcon className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Jamaah.net</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">Platform Komunitas Muslim Digital</p>
          </motion.div>

          {/* Main Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden"
          >
            {/* Success Header */}
            <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-8 text-white text-center relative overflow-hidden">
              <div className="absolute inset-0 opacity-10">
                <IslamicPattern className="text-white" />
              </div>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
                className="relative z-10"
              >
                <div className="w-24 h-24 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-12 h-12" />
                </div>
                <h2 className="text-2xl font-bold mb-2">Pendaftaran Berhasil!</h2>
                <p className="text-white/90 text-sm">
                  Terima kasih telah mendaftar di Jamaah.net
                </p>
              </motion.div>
            </div>

            {/* Content */}
            <div className="p-8 space-y-6">
              {/* Status Info */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-blue-50 dark:bg-blue-900/30 border-2 border-blue-200 dark:border-blue-700 rounded-2xl p-5"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-800 rounded-xl flex items-center justify-center flex-shrink-0">
                    <AlertCircle className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h3 className="font-bold text-blue-900 dark:text-blue-100 mb-2">
                      🔍 Akun Dalam Proses Verifikasi
                    </h3>
                    <p className="text-sm text-blue-800 dark:text-blue-200 leading-relaxed">
                      Akun Anda sedang ditinjau oleh tim admin kami. Mohon menunggu konfirmasi persetujuan.
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Office Hours Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/30 dark:to-pink-900/30 border-2 border-purple-200 dark:border-purple-700 rounded-2xl p-5"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center">
                    <Clock className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white">⏰ Office Hour Admin</h3>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Waktu operasional tim verifikasi</p>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="bg-white dark:bg-gray-800 rounded-xl p-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">Senin – Jumat</span>
                    </div>
                    <span className="text-sm font-mono font-bold text-purple-600 dark:text-purple-400">08.00 – 17.00 WIB</span>
                  </div>
                  <div className="bg-white dark:bg-gray-800 rounded-xl p-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">Sabtu</span>
                    </div>
                    <span className="text-sm font-mono font-bold text-purple-600 dark:text-purple-400">08.00 – 12.00 WIB</span>
                  </div>
                  <div className="bg-white/50 dark:bg-gray-800/50 rounded-xl p-3 flex items-center justify-between opacity-60">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">Minggu & Libur</span>
                    </div>
                    <span className="text-sm font-bold text-gray-500">Tutup</span>
                  </div>
                </div>

                <div className="bg-amber-100 dark:bg-amber-900/30 border-l-4 border-amber-500 rounded-lg p-3">
                  <p className="text-xs text-amber-900 dark:text-amber-200 leading-relaxed">
                    <strong>📌 Penting:</strong> Proses approval dan pengiriman password <strong>hanya dilakukan pada jam kerja</strong> di atas. Pengajuan di luar jam kerja akan diproses pada hari kerja berikutnya.
                  </p>
                </div>
              </motion.div>

              {/* Notification Info */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="space-y-3"
              >
                <h4 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <Smartphone className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  📬 Notifikasi Persetujuan
                </h4>
                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                  Setelah akun Anda disetujui, Anda akan menerima notifikasi melalui:
                </p>
                
                <div className="space-y-2">
                  <div className="flex items-start gap-3 bg-green-50 dark:bg-green-900/20 rounded-xl p-3">
                    <MessageCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                    <div className="text-sm">
                      <span className="font-semibold text-green-900 dark:text-green-100 block mb-1">WhatsApp</span>
                      <span className="text-green-800 dark:text-green-200">Pesan langsung berisi ID Member dan Password Anda</span>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl p-3">
                    <Mail className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                    <div className="text-sm">
                      <span className="font-semibold text-blue-900 dark:text-blue-100 block mb-1">Email</span>
                      <span className="text-blue-800 dark:text-blue-200">Email resmi dengan detail akun dan instruksi login</span>
                    </div>
                  </div>
                </div>

                <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-700 rounded-xl p-4 mt-4">
                  <p className="text-sm text-emerald-800 dark:text-emerald-200">
                    <strong>✨ Yang Akan Anda Terima:</strong>
                  </p>
                  <ul className="text-sm text-emerald-700 dark:text-emerald-300 mt-2 space-y-1.5 ml-4">
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-500 mt-0.5">•</span>
                      <span><strong>ID Member Unik</strong> (Format: JMH-XXXXXX)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-500 mt-0.5">•</span>
                      <span><strong>Password Login</strong> (8 karakter aman)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-500 mt-0.5">•</span>
                      <span><strong>Instruksi Login</strong> & penggunaan platform</span>
                    </li>
                  </ul>
                </div>
              </motion.div>

              {/* Timeline Estimation */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-2xl p-4"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-xl flex items-center justify-center">
                    <Clock className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">⏱️ Estimasi Waktu</h4>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Proses verifikasi</p>
                  </div>
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  Proses approval biasanya memakan waktu <strong className="text-purple-600 dark:text-purple-400">maksimal 1x24 jam</strong> pada hari kerja. Mohon bersabar dan tunggu notifikasi dari kami.
                </p>
              </motion.div>

              {/* Action Button */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="pt-4"
              >
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onNavigateToLogin}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-4 rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 group"
                >
                  <span>Sudah Disetujui</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </motion.button>
                <p className="text-center text-xs text-gray-500 dark:text-gray-400 mt-3">
                  Setelah menerima notifikasi, klik tombol di atas untuk login
                </p>
              </motion.div>

              {/* Help Text */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.9 }}
                className="text-center pt-4 border-t border-gray-200 dark:border-gray-700"
              >
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                  Butuh bantuan atau ada pertanyaan?
                </p>
                <div className="flex items-center justify-center gap-2 text-xs">
                  <a 
                    href="https://wa.me/6281234567890" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-emerald-600 dark:text-emerald-400 hover:underline font-semibold"
                  >
                    Hubungi Admin via WhatsApp
                  </a>
                  <span className="text-gray-400">atau</span>
                  <a 
                    href="mailto:admin@jamaah.net"
                    className="text-blue-600 dark:text-blue-400 hover:underline font-semibold"
                  >
                    Email Kami
                  </a>
                </div>
              </motion.div>
            </div>
          </motion.div>

          {/* Footer Note */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="text-center mt-6"
          >
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Barakallahu fiikum! Kami menantikan kehadiran Anda di komunitas Jamaah.net 🤲
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}