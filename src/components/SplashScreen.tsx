import React from 'react';
import { motion } from 'motion/react';
import { Building2, Sparkles } from 'lucide-react';

export default function SplashScreen() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-600 via-teal-600 to-emerald-700 flex items-center justify-center overflow-hidden relative">
      {/* Animated Background Circles */}
      <motion.div
        className="absolute w-96 h-96 bg-emerald-400/20 rounded-full blur-3xl"
        animate={{
          scale: [1, 1.2, 1],
          x: [-50, 50, -50],
          y: [-50, 50, -50],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        style={{ top: '10%', left: '10%' }}
      />
      <motion.div
        className="absolute w-96 h-96 bg-teal-400/20 rounded-full blur-3xl"
        animate={{
          scale: [1.2, 1, 1.2],
          x: [50, -50, 50],
          y: [50, -50, 50],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        style={{ bottom: '10%', right: '10%' }}
      />

      {/* Islamic Geometric Pattern Decorations */}
      <motion.div
        className="absolute top-10 left-10"
        animate={{ rotate: 360 }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
      >
        <Sparkles className="w-8 h-8 text-white/30" />
      </motion.div>
      <motion.div
        className="absolute bottom-10 right-10"
        animate={{ rotate: -360 }}
        transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
      >
        <Sparkles className="w-6 h-6 text-white/30" />
      </motion.div>
      <motion.div
        className="absolute top-1/4 right-20"
        animate={{ rotate: 360, scale: [1, 1.2, 1] }}
        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
      >
        <Sparkles className="w-5 h-5 text-white/20" />
      </motion.div>

      {/* Main Content */}
      <div className="text-center space-y-6 px-6 relative z-10">
        {/* Logo Container with Animation */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{
            type: "spring",
            stiffness: 260,
            damping: 20,
            delay: 0.2
          }}
        >
          <motion.div
            className="w-28 h-28 bg-white rounded-full flex items-center justify-center mx-auto shadow-2xl relative"
            animate={{
              boxShadow: [
                '0 20px 60px rgba(0,0,0,0.3)',
                '0 20px 80px rgba(16, 185, 129, 0.4)',
                '0 20px 60px rgba(0,0,0,0.3)',
              ]
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            {/* Rotating Ring */}
            <motion.div
              className="absolute inset-0 rounded-full border-4 border-emerald-400/50"
              animate={{ rotate: 360 }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            />
            
            <motion.div
              animate={{
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <Building2 className="w-14 h-14 text-emerald-600" />
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Brand Name with Staggered Animation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
        >
          <motion.h1
            className="text-white text-5xl tracking-wide"
            animate={{
              textShadow: [
                '0 0 20px rgba(255,255,255,0.5)',
                '0 0 40px rgba(255,255,255,0.8)',
                '0 0 20px rgba(255,255,255,0.5)',
              ]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            jamaah.net
          </motion.h1>
        </motion.div>

        {/* Tagline with Fade In */}
        <motion.p
          className="text-emerald-50 text-lg max-w-md mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 1 }}
        >
          jamaah masjid social and business network
        </motion.p>

        {/* Animated Loading Dots */}
        <motion.div
          className="flex gap-2 justify-center mt-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
        >
          {[0, 1, 2].map((index) => (
            <motion.div
              key={index}
              className="w-3 h-3 bg-white rounded-full"
              animate={{
                y: [0, -15, 0],
                opacity: [1, 0.5, 1],
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                delay: index * 0.2,
                ease: "easeInOut"
              }}
            />
          ))}
        </motion.div>

        {/* Subtle Islamic Pattern Decoration */}
        <motion.div
          className="flex justify-center gap-4 mt-6"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.5, duration: 0.8 }}
        >
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              className="w-2 h-2 bg-white/40 rounded-full"
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.4, 0.8, 0.4],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: i * 0.15,
                ease: "easeInOut"
              }}
            />
          ))}
        </motion.div>
      </div>
    </div>
  );
}
