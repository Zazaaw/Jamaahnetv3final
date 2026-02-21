import React from 'react';
import { ArrowLeft, Mail, Phone, MapPin, Clock, MessageCircle, Instagram, Facebook, Calendar, AlertCircle, CheckCircle, Zap } from 'lucide-react';
import { motion } from 'motion/react';
import { IslamicPattern, MosqueIcon } from './IslamicPattern';

export default function ContactScreen({ onBack }: { onBack: () => void }) {
  const officeHours = [
    { day: 'Senin - Jumat', time: '08.00 - 17.00 WIB' },
    { day: 'Sabtu', time: '08.00 - 12.00 WIB' },
    { day: 'Minggu & Libur', time: 'Tutup' },
  ];

  const contactMethods = [
    {
      icon: Phone,
      title: 'WhatsApp Admin',
      value: '+62 812-3456-7890',
      link: 'https://wa.me/6281234567890',
      gradient: 'from-green-500 to-emerald-500',
    },
    {
      icon: Mail,
      title: 'Email',
      value: 'admin@jamaah.net',
      link: 'mailto:admin@jamaah.net',
      gradient: 'from-blue-500 to-indigo-500',
    },
    {
      icon: Instagram,
      title: 'Instagram',
      value: '@jamaah.net',
      link: 'https://instagram.com/jamaah.net',
      gradient: 'from-pink-500 to-purple-500',
    },
    {
      icon: Facebook,
      title: 'Facebook',
      value: 'Jamaah.net',
      link: 'https://facebook.com/jamaah.net',
      gradient: 'from-blue-600 to-blue-700',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-emerald-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header with Islamic Pattern */}
      <div className="relative bg-gradient-to-br from-emerald-600 via-teal-600 to-emerald-700 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <IslamicPattern className="text-white" />
        </div>
        
        <div className="relative z-10 p-6 pb-8">
          <button 
            onClick={onBack}
            className="mb-4 p-2 hover:bg-white/20 rounded-xl transition-colors backdrop-blur-sm"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center">
              <MessageCircle className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Hubungi Kami</h1>
              <p className="text-white/90 text-sm mt-1">
                Kami siap membantu Anda
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6 max-w-4xl mx-auto">
        {/* Office Hours - Highlighted Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/30 dark:to-pink-900/30 border-2 border-purple-200 dark:border-purple-700 rounded-3xl p-6 shadow-lg"
        >
          <div className="flex items-start gap-4 mb-4">
            <div className="w-14 h-14 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center flex-shrink-0">
              <Clock className="w-7 h-7 text-white" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                ⏰ Office Hour Admin
              </h2>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                Waktu operasional tim admin Jamaah.net
              </p>
            </div>
          </div>

          {/* Schedule */}
          <div className="space-y-3 mb-5">
            {officeHours.map((schedule, index) => (
              <div 
                key={index}
                className="bg-white dark:bg-gray-800 rounded-2xl p-4 flex items-center justify-between border border-purple-100 dark:border-purple-800"
              >
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {schedule.day}
                  </span>
                </div>
                <span className="font-mono font-bold text-purple-600 dark:text-purple-400">
                  {schedule.time}
                </span>
              </div>
            ))}
          </div>

          {/* Important Notice */}
          <div className="bg-amber-50 dark:bg-amber-900/30 border-l-4 border-amber-500 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-semibold text-amber-900 dark:text-amber-100 mb-2">
                  📋 Informasi Penting:
                </p>
                <ul className="text-amber-800 dark:text-amber-200 space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="text-amber-500 mt-0.5">•</span>
                    <span>
                      <strong>Pengajuan pendaftaran</strong> yang masuk akan <strong>diproses pada jam kerja</strong> yang tertera di atas
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-amber-500 mt-0.5">•</span>
                    <span>
                      <strong>Approval akun</strong> dan <strong>pengiriman password</strong> dilakukan maksimal <strong>1x24 jam</strong> (hari kerja)
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-amber-500 mt-0.5">•</span>
                    <span>
                      Pengajuan di luar jam kerja akan <strong>direspons pada hari kerja berikutnya</strong>
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-amber-500 mt-0.5">•</span>
                    <span>
                      Untuk <strong>pertanyaan urgent</strong>, hubungi kami via WhatsApp
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </motion.div>

        {/* EMERGENCY CONTACT SECTION - New! */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-gradient-to-br from-red-50 via-orange-50 to-red-50 dark:from-red-900/30 dark:via-orange-900/30 dark:to-red-900/30 border-2 border-red-300 dark:border-red-700 rounded-3xl overflow-hidden shadow-xl"
        >
          {/* Header with Pulse Effect */}
          <div className="relative bg-gradient-to-br from-red-600 via-red-700 to-orange-600 p-6 text-white overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute inset-0" style={{
                backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
                backgroundSize: '20px 20px'
              }}></div>
            </div>

            {/* Pulse Ring Animation */}
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full animate-ping"></div>

            <div className="relative z-10">
              <div className="flex items-start gap-4 mb-3">
                <div className="relative">
                  <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center">
                    <Phone className="w-8 h-8 animate-pulse" />
                  </div>
                  {/* Lightning Badge */}
                  <div className="absolute -top-1 -right-1 w-7 h-7 bg-yellow-400 rounded-full flex items-center justify-center border-2 border-white shadow-lg">
                    <Zap className="w-4 h-4 text-red-700" />
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h2 className="text-2xl font-bold">🚨 Kontak Darurat</h2>
                  </div>
                  <p className="text-white/90 text-sm">
                    Hotline 24/7 untuk kebutuhan mendesak di luar office hour
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-5">
            {/* Warning - When to Use */}
            <div className="bg-amber-50 dark:bg-amber-900/30 border-2 border-amber-200 dark:border-amber-700 rounded-2xl p-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-amber-100 dark:bg-amber-800 rounded-xl flex items-center justify-center flex-shrink-0">
                  <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <h3 className="font-bold text-amber-900 dark:text-amber-100 mb-2">
                    ⚠️ Kapan Menggunakan Kontak Darurat?
                  </h3>
                  <p className="text-sm text-amber-800 dark:text-amber-200 mb-3 leading-relaxed">
                    Gunakan kontak darurat ini <strong>hanya untuk kebutuhan yang sangat mendesak</strong>, terutama di luar jam kerja admin reguler (Senin-Jumat, 08.00-17.00 WIB).
                  </p>
                  
                  <div className="bg-white dark:bg-gray-800 rounded-xl p-3">
                    <p className="text-xs font-semibold text-gray-900 dark:text-white mb-2">
                      📋 Contoh Kebutuhan Darurat:
                    </p>
                    <ul className="space-y-1.5 text-xs text-gray-700 dark:text-gray-300">
                      <li className="flex items-start gap-2">
                        <span className="text-red-500 mt-0.5">•</span>
                        <span>Masalah teknis yang menghalangi akses ibadah atau donasi mendesak</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-red-500 mt-0.5">•</span>
                        <span>Kebutuhan verifikasi akun untuk keperluan urgent</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-red-500 mt-0.5">•</span>
                        <span>Masalah keamanan akun yang perlu penanganan segera</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-red-500 mt-0.5">•</span>
                        <span>Bantuan koordinasi kegiatan jamaah yang mendesak</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Emergency Number Card */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border-2 border-red-200 dark:border-red-700">
              <div className="text-center mb-5">
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-2 uppercase tracking-wide font-semibold">
                  Hotline Admin Darurat
                </p>
                <a 
                  href="tel:+6281396081230"
                  className="block text-4xl font-bold font-mono text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors mb-2"
                >
                  081396081230
                </a>
                <div className="inline-flex items-center gap-2 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700 rounded-full px-4 py-1.5">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <p className="text-xs font-semibold text-green-700 dark:text-green-300">
                    Aktif 24/7
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                {/* WhatsApp Button - Primary */}
                <motion.a
                  href="https://wa.me/6281396081230"
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-3 group"
                >
                  <MessageCircle className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  <span>Chat via WhatsApp</span>
                  <span className="text-xs bg-white/20 px-2.5 py-1 rounded-lg">Direkomendasikan</span>
                </motion.a>

                {/* Call Button - Secondary */}
                <motion.a
                  href="tel:+6281396081230"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full bg-white dark:bg-gray-700 border-2 border-red-200 dark:border-red-700 text-red-600 dark:text-red-400 py-4 rounded-xl font-semibold hover:bg-red-50 dark:hover:bg-red-900/30 transition-all flex items-center justify-center gap-3 group"
                >
                  <Phone className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                  <span>Telepon Langsung</span>
                </motion.a>
              </div>
            </div>

            {/* Info Note */}
            <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="text-blue-900 dark:text-blue-100 mb-2">
                    <strong>💡 Untuk Pertanyaan Reguler:</strong>
                  </p>
                  <p className="text-blue-800 dark:text-blue-200 leading-relaxed">
                    Jika pertanyaan Anda <strong>tidak mendesak</strong>, silakan hubungi admin reguler pada jam kerja (Senin-Jumat 08.00-17.00 WIB, Sabtu 08.00-12.00 WIB) melalui WhatsApp atau email di atas. Terima kasih! 🙏
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Contact Methods */}
        <div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            📞 Hubungi Kami
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {contactMethods.map((contact, index) => (
              <motion.a
                key={index}
                href={contact.link}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 bg-gradient-to-br ${contact.gradient} rounded-xl flex items-center justify-center flex-shrink-0`}>
                    <contact.icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                      {contact.title}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                      {contact.value}
                    </p>
                  </div>
                  <ArrowLeft className="w-5 h-5 text-gray-400 rotate-180" />
                </div>
              </motion.a>
            ))}
          </div>
        </div>

        {/* Address */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm"
        >
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-orange-500 rounded-xl flex items-center justify-center flex-shrink-0">
              <MapPin className="w-6 h-6 text-white" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                📍 Alamat Kantor
              </h4>
              <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                Jl. Masjid Raya No. 123<br />
                Kelurahan Sejahtera, Kecamatan Bahagia<br />
                Jakarta Selatan 12345<br />
                Indonesia
              </p>
            </div>
          </div>
        </motion.div>

        {/* FAQ Quick Tips */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/30 dark:to-teal-900/30 border border-emerald-200 dark:border-emerald-700 rounded-2xl p-6"
        >
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <CheckCircle className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            💡 Tips & Panduan
          </h3>
          <div className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
            <div className="flex items-start gap-3">
              <span className="text-emerald-500 font-bold mt-0.5">1.</span>
              <p>
                <strong>Belum punya kode undangan?</strong> Hubungi pengurus masjid terdekat atau admin via WhatsApp
              </p>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-emerald-500 font-bold mt-0.5">2.</span>
              <p>
                <strong>Lupa password?</strong> Hubungi admin untuk reset password Anda
              </p>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-emerald-500 font-bold mt-0.5">3.</span>
              <p>
                <strong>Ingin memberikan saran?</strong> Kami terbuka untuk kritik dan saran melalui email atau WhatsApp
              </p>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-emerald-500 font-bold mt-0.5">4.</span>
              <p>
                <strong>Butuh bantuan teknis?</strong> Kirimkan screenshot dan deskripsi masalah ke email atau WhatsApp
              </p>
            </div>
          </div>
        </motion.div>

        {/* Bottom Spacing */}
        <div className="h-20" />
      </div>
    </div>
  );
}