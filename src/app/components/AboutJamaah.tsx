import React from 'react';
import { ArrowLeft, Heart, Users, Sparkles, BookOpen, MessageCircle, AlertCircle, Lightbulb } from 'lucide-react';
import { motion } from 'motion/react';
import { IslamicPattern, MosqueIcon } from './IslamicPattern';

export default function AboutJamaah({ onBack }: { onBack: () => void }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-emerald-50/30 to-teal-50/30 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      {/* Decorative Islamic Pattern Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <IslamicPattern className="text-emerald-600 dark:text-emerald-400 opacity-[0.03]" />
      </div>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative bg-gradient-to-br from-emerald-600 via-emerald-500 to-teal-500 dark:from-emerald-700 dark:via-emerald-600 dark:to-teal-600 text-white p-6 pb-12"
        style={{ borderBottomLeftRadius: '2rem', borderBottomRightRadius: '2rem' }}
      >
        <div className="flex items-center gap-4 mb-6">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={onBack}
            className="bg-white/20 backdrop-blur-md p-2 rounded-xl"
          >
            <ArrowLeft className="w-6 h-6" />
          </motion.button>
          <div>
            <h1 className="text-2xl font-bold">Tentang Jamaah.net</h1>
            <p className="text-emerald-50 text-sm">Visi & misi komunitas</p>
          </div>
        </div>

        {/* Decorative Mosque Icon */}
        <div className="absolute top-4 right-6 opacity-20">
          <MosqueIcon className="w-24 h-24" />
        </div>
      </motion.div>

      <div className="relative z-10 p-6 space-y-6 pb-24">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-emerald-500 to-teal-500 dark:from-emerald-600 dark:to-teal-600 rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden"
        >
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full -ml-16 -mb-16" />
          
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-white/20 backdrop-blur-md p-3 rounded-2xl">
                <Heart className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-bold">Menjadi Saudara yang Sebenar-benarnya</h2>
            </div>
            <p className="text-emerald-50 leading-relaxed text-lg">
              Jamaahdotnet adalah platform digital yang memudahkan <span className="font-semibold text-white">jamaah masjid dan kerabatnya</span> untuk saling berinteraksi, baik secara sosial maupun bisnis. Kami hadir sebagai wadah agar komunikasi sesama jamaah menjadi <span className="font-semibold text-white">lebih banyak dan dalam</span>, memperkuat ikatan emosional untuk saling membantu dan mendukung.
            </p>
          </div>
        </motion.div>

        {/* Realita Saat Ini Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-4"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center shadow-lg">
              <AlertCircle className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              Realita & Keperihatinan
            </h3>
          </div>

          {/* Reality Card 1 */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-orange-50 dark:bg-orange-900/20 border-l-4 border-orange-500 rounded-2xl p-5 shadow-md"
          >
            <div className="flex items-start gap-3">
              <div className="bg-orange-500 text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-sm font-bold mt-0.5">
                1
              </div>
              <p className="text-gray-800 dark:text-gray-200">
                Hampir setiap hari bertemu di masjid, tapi <span className="font-semibold text-orange-700 dark:text-orange-400">kenal nama saja tidak</span>. Apakah kita sudah benar-benar bersaudara?
              </p>
            </div>
          </motion.div>

          {/* Reality Card 2 */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.35 }}
            className="bg-orange-50 dark:bg-orange-900/20 border-l-4 border-orange-500 rounded-2xl p-5 shadow-md"
          >
            <div className="flex items-start gap-3">
              <div className="bg-orange-500 text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-sm font-bold mt-0.5">
                2
              </div>
              <p className="text-gray-800 dark:text-gray-200">
                Sering bertemu, sudah kenal nama, tapi obrolan baru sebatas basa-basi <span className="font-semibold text-orange-700 dark:text-orange-400">"Assalamualaikum... sehat?"</span>
              </p>
            </div>
          </motion.div>

          {/* Reality Card 3 */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-orange-50 dark:bg-orange-900/20 border-l-4 border-orange-500 rounded-2xl p-5 shadow-md"
          >
            <div className="flex items-start gap-3">
              <div className="bg-orange-500 text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-sm font-bold mt-0.5">
                3
              </div>
              <p className="text-gray-800 dark:text-gray-200">
                Saat butuh bantuan (misal: servis AC), kita tidak tahu bahwa saudara yang sholat berjamaah di sebelah kita ternyata adalah teknisinya. <span className="font-semibold text-orange-700 dark:text-orange-400">Sangat disayangkan jika kita tidak tahu profesi saudara sendiri</span>.
              </p>
            </div>
          </motion.div>
        </motion.div>

        {/* Landasan Kami Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="space-y-4"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center shadow-lg">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              Landasan Kami
            </h3>
          </div>

          {/* Quranic Verse */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
            className="bg-white dark:bg-gray-800/50 backdrop-blur-sm rounded-3xl p-6 shadow-xl border border-emerald-200 dark:border-emerald-700/50"
          >
            <div className="text-center mb-4">
              <div className="inline-block bg-emerald-100 dark:bg-emerald-900/30 px-4 py-2 rounded-full mb-4">
                <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">
                  QS. Al-Hujurat Ayat 10
                </p>
              </div>
            </div>
            
            <div className="mb-6 text-center">
              <p className="text-3xl leading-loose text-emerald-700 dark:text-emerald-300" style={{ fontFamily: 'serif', direction: 'rtl' }}>
                اِنَّمَا الْمُؤْمِنُوْنَ اِخْوَةٌ
              </p>
            </div>
            
            <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl p-4">
              <p className="text-gray-700 dark:text-gray-300 text-center italic leading-relaxed">
                "Sesungguhnya orang-orang mukmin itu bersaudara, karena itu damaikanlah kedua saudaramu dan bertakwalah kepada Allah agar kamu dirahmati."
              </p>
            </div>
          </motion.div>

          {/* Hadith Bukhari */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.55 }}
            className="bg-white dark:bg-gray-800/50 backdrop-blur-sm rounded-3xl p-6 shadow-xl border border-blue-200 dark:border-blue-700/50"
          >
            <div className="text-center mb-4">
              <div className="inline-block bg-blue-100 dark:bg-blue-900/30 px-4 py-2 rounded-full mb-4">
                <p className="text-sm font-semibold text-blue-700 dark:text-blue-400">
                  HR. Bukhari
                </p>
              </div>
            </div>
            
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-4">
              <p className="text-gray-700 dark:text-gray-300 text-center italic leading-relaxed">
                "Muslim itu adalah saudara muslim yang lain, jangan berbuat aniaya. Barangsiapa membantu kebutuhan saudaranya, maka Allah membantu kebutuhannya."
              </p>
            </div>
          </motion.div>

          {/* Hadith Thabrani */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6 }}
            className="bg-white dark:bg-gray-800/50 backdrop-blur-sm rounded-3xl p-6 shadow-xl border border-teal-200 dark:border-teal-700/50"
          >
            <div className="text-center mb-4">
              <div className="inline-block bg-teal-100 dark:bg-teal-900/30 px-4 py-2 rounded-full mb-4">
                <p className="text-sm font-semibold text-teal-700 dark:text-teal-400">
                  HR. Thabrani
                </p>
              </div>
            </div>
            
            <div className="mb-6 text-center">
              <p className="text-3xl leading-loose text-teal-700 dark:text-teal-300" style={{ fontFamily: 'serif', direction: 'rtl' }}>
                خَيْرُ الناسِ أَنفَعُهُم لِلنَّاسِ
              </p>
            </div>
            
            <div className="bg-teal-50 dark:bg-teal-900/20 rounded-2xl p-4">
              <p className="text-gray-700 dark:text-gray-300 text-center italic">
                "Sebaik-baik manusia adalah yang paling bermanfaat bagi orang lain."
              </p>
            </div>
          </motion.div>
        </motion.div>

        {/* Pesan Pemberdayaan Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.65 }}
          className="space-y-4"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              Pesan Pemberdayaan
            </h3>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.7 }}
            className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-3xl p-8 shadow-xl border-l-4 border-purple-500 relative overflow-hidden"
          >
            {/* Quote decoration */}
            <div className="absolute top-4 left-4 text-purple-200 dark:text-purple-700 text-8xl font-serif leading-none opacity-30">
              "
            </div>
            <div className="absolute bottom-4 right-4 text-purple-200 dark:text-purple-700 text-8xl font-serif leading-none opacity-30 rotate-180">
              "
            </div>

            <div className="relative z-10 space-y-4">
              <p className="text-gray-800 dark:text-gray-200 text-lg leading-relaxed italic">
                Masjid bukan hanya tempat ibadah, tetapi <span className="font-semibold text-purple-700 dark:text-purple-400">pusat pemberdayaan masyarakat</span> yang harus saling memakmurkan.
              </p>
              <p className="text-gray-800 dark:text-gray-200 text-lg leading-relaxed italic">
                Kemakmuran masjid tidak hanya diukur dari bangunannya yang besar atau ramainya jamaah, tetapi juga dari <span className="font-semibold text-purple-700 dark:text-purple-400">meningkatnya kesejahteraan warga dan jamaah</span> di sekitarnya.
              </p>
              <div className="flex items-center gap-3 mt-6 pt-4 border-t-2 border-purple-200 dark:border-purple-700/30">
                <div className="h-12 w-1 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full" />
                <div>
                  <p className="font-bold text-gray-900 dark:text-white">
                    M. Jusuf Kalla
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Ketua Dewan Masjid Indonesia (DMI)
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Harapan Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.75 }}
          className="space-y-4"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-yellow-500 rounded-2xl flex items-center justify-center shadow-lg">
              <Lightbulb className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              Harapan
            </h3>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.8 }}
            className="bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 rounded-3xl p-8 shadow-xl border-l-4 border-amber-500"
          >
            <p className="text-gray-800 dark:text-gray-200 text-lg leading-relaxed">
              Bila kondisi masjid sudah menjadi <span className="font-semibold text-amber-700 dark:text-amber-400">pusat pemberdayaan</span>, jamaah akan benar-benar menjadi saudara yang <span className="font-semibold text-amber-700 dark:text-amber-400">saling memberi manfaat</span> dan <span className="font-semibold text-amber-700 dark:text-amber-400">berkontribusi nyata</span> pada kesejahteraan umat.
            </p>
          </motion.div>
        </motion.div>

        {/* Footer CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.85 }}
          className="bg-gradient-to-br from-emerald-600 to-teal-600 dark:from-emerald-700 dark:to-teal-700 rounded-3xl p-8 text-center text-white shadow-2xl"
        >
          <div className="flex justify-center mb-4">
            <div className="bg-white/20 backdrop-blur-md p-4 rounded-2xl">
              <Users className="w-8 h-8" />
            </div>
          </div>
          <h3 className="text-2xl font-bold mb-3">
            Mari Bersama Membangun Ukhuwah
          </h3>
          <p className="text-emerald-50 mb-6 max-w-md mx-auto">
            Bergabunglah dengan komunitas jamaah masjid yang saling mendukung dan memberdayakan
          </p>
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-6 py-3 rounded-full">
            <MessageCircle className="w-5 h-5" />
            <span className="font-semibold">Jamaah.net</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}