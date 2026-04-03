import React from 'react';
import { motion } from 'motion/react';
import { Building2 } from 'lucide-react';

export default function SplashScreen() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 flex flex-col items-center justify-center overflow-hidden">
      
      {/* Ikon Masjid dengan efek Pulsing lembut */}
      <motion.div
        animate={{ scale: [1, 1.1, 1], opacity: [0.7, 1, 0.7] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
        className="w-24 h-24 bg-emerald-50 dark:bg-emerald-900/20 rounded-full flex items-center justify-center mb-6 shadow-sm border border-emerald-100 dark:border-emerald-900/50"
      >
        <Building2 className="w-12 h-12 text-emerald-600 dark:text-emerald-400" />
      </motion.div>

      {/* Teks Brand - Clean & Tajam */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="text-center"
      >
        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-2">
          jamaah<span className="text-emerald-500">.net</span>
        </h1>
        <p className="text-[10px] md:text-xs text-gray-400 dark:text-gray-500 font-bold tracking-[0.3em] uppercase">
          Social & Business Network
        </p>
      </motion.div>

      {/* Loading Dots Bouncing - Super Smooth */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="absolute bottom-16 flex gap-2"
      >
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            animate={{ y: [0, -8, 0], opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2, ease: "easeInOut" }}
            className="w-2 h-2 bg-emerald-500 rounded-full"
          />
        ))}
      </motion.div>

    </div>
  );
}