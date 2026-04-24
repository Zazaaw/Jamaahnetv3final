import React from 'react';
import { ArrowLeft, Users } from 'lucide-react';
import { motion } from 'motion/react';
import { IslamicPattern } from './IslamicPattern';
import TimelineArchive from './TimelineArchive';

export default function CalendarScreen({ 
  session, 
  onNavigate, 
  onBack 
}: { 
  session: any; 
  onNavigate?: (screen: string, data?: any) => void; 
  onBack?: () => void; 
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/20 to-purple-50/20 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      {/* Background Pattern */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <IslamicPattern className="text-blue-600 dark:text-blue-400 opacity-[0.02]" />
      </div>

      {/* Modern Header (Style mirip Bisnis) */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 dark:from-blue-700 dark:via-indigo-700 dark:to-purple-700 text-white overflow-hidden"
        style={{ borderBottomLeftRadius: '2rem', borderBottomRightRadius: '2rem' }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
        <IslamicPattern className="text-white opacity-10" />
        
        <div className="relative z-10 p-6 pb-8">
          {/* Back Button */}
          {onBack && (
            <motion.button
              onClick={onBack}
              className="mb-4 p-2.5 rounded-2xl bg-white/20 backdrop-blur-md hover:bg-white/30 transition-all flex items-center justify-center w-10 h-10"
              whileTap={{ scale: 0.9 }}
            >
              <ArrowLeft className="w-5 h-5" />
            </motion.button>
          )}
          
          {/* Title */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold mb-1 flex items-center gap-2">
                <Users className="w-6 h-6" />
                Sosial Jamaah
              </h1>
              <p className="text-blue-100 text-sm">Kabar dan aktivitas terkini</p>
            </div>
          </div>

          {/* Single Tab / Kolom 1 Kategori - Style Bisnis */}
          <div className="bg-black/20 backdrop-blur-md p-1.5 rounded-2xl flex">
            <div className="flex-1 px-4 py-3 rounded-xl bg-white text-blue-600 shadow-lg font-bold text-center flex items-center justify-center gap-2">
              📢 Kabar Sosial
            </div>
          </div>
        </div>
      </motion.div>

      {/* Content: ONLY Kabar Sosial (Langsung dari TimelineArchive) */}
      <div className="relative z-10 p-6">
        <div className="space-y-4">
          <TimelineArchive category="Sosial" session={session} onNavigate={onNavigate} />
        </div>

        {/* Bottom Spacing */}
        <div className="h-20" />
      </div>
    </div>
  );
}