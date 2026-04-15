import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import Lottie from 'lottie-react';
import { BlurFade } from './magicui/blur-fade';

export default function SplashScreen() {
  const [animationData, setAnimationData] = useState<any>(null);

  useEffect(() => {
    // Jalur VVIP: Ambil animasi langsung dari folder public tanpa lewat mesin Vite
    fetch('https://uskqgyaxwcnjrizgppdq.supabase.co/storage/v1/object/public/assets/mosque.json')
      .then((response) => response.json())
      .then((data) => setAnimationData(data))
      .catch((error) => console.error('Gagal memuat animasi:', error));
  }, []);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 flex flex-col items-center justify-center overflow-hidden">
      
      {/* Container Animasi Lottie */}
      <BlurFade delay={0.3} duration={0.8}>
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="w-48 h-48 md:w-64 md:h-64 mb-4 flex items-center justify-center"
      >
        {animationData ? (
          <Lottie 
            animationData={animationData} 
            loop={true} 
            className="w-full h-full"
          />
        ) : (
          // Lingkaran loading cadangan selama Lottie-nya didownload
          <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
        )}
      </motion.div>
      </BlurFade>

      {/* Teks Brand - Clean & Tajam */}
      <BlurFade delay={0.3} duration={1.0}>
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.3 }}
        className="text-center"
      >
        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-2">
          jamaah<span className="text-emerald-500">.net</span>
        </h1>
        <p className="text-[10px] md:text-xs text-gray-400 dark:text-gray-500 font-bold tracking-[0.3em] uppercase">
          Social & Business Network
        </p>
      </motion.div>
      </BlurFade>

      {/* Loading Dots Opsional */}
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