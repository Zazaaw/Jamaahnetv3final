import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Clock, Save, RotateCcw } from 'lucide-react';

interface PrayerTime {
  name: string;
  time: string;
  hour: number;
  minute: number;
}

interface PrayerTimesSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PrayerTimesSettingsModal({
  isOpen,
  onClose,
}: PrayerTimesSettingsModalProps) {
  const defaultPrayerTimes: PrayerTime[] = [
    { name: 'Subuh', time: '04:45', hour: 4, minute: 45 },
    { name: 'Dzuhur', time: '12:00', hour: 12, minute: 0 },
    { name: 'Ashar', time: '15:15', hour: 15, minute: 15 },
    { name: 'Maghrib', time: '18:05', hour: 18, minute: 5 },
    { name: 'Isya', time: '19:20', hour: 19, minute: 20 },
  ];

  const [prayerTimes, setPrayerTimes] = useState<PrayerTime[]>([]);

  useEffect(() => {
    if (isOpen) {
      loadPrayerTimes();
    }
  }, [isOpen]);

  const loadPrayerTimes = () => {
    const stored = localStorage.getItem('jamaah_prayer_times');
    if (stored) {
      setPrayerTimes(JSON.parse(stored));
    } else {
      setPrayerTimes(defaultPrayerTimes);
    }
  };

  const handleTimeChange = (index: number, value: string) => {
    const [hourStr, minuteStr] = value.split(':');
    const hour = parseInt(hourStr);
    const minute = parseInt(minuteStr);
    
    const newPrayerTimes = [...prayerTimes];
    newPrayerTimes[index] = {
      ...newPrayerTimes[index],
      time: value,
      hour,
      minute,
    };
    setPrayerTimes(newPrayerTimes);
  };

  const handleSave = () => {
    localStorage.setItem('jamaah_prayer_times', JSON.stringify(prayerTimes));
    // Dispatch event to notify other components
    window.dispatchEvent(new Event('prayerTimesUpdated'));
    onClose();
  };

  const handleReset = () => {
    setPrayerTimes(defaultPrayerTimes);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 30 }}
          transition={{ 
            type: 'spring', 
            stiffness: 400, 
            damping: 30,
            mass: 0.8
          }}
          className="relative bg-white dark:bg-gray-800 rounded-3xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-hidden border border-gray-200 dark:border-gray-700"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-6 text-white">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center">
                  <Clock className="w-5 h-5" />
                </div>
                <h2 className="text-2xl font-bold">Pengaturan Waktu Sholat</h2>
              </div>
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center hover:bg-white/30 transition-colors"
              >
                <X className="w-5 h-5" />
              </motion.button>
            </div>
            <p className="text-white/80 text-sm">
              Sesuaikan jadwal sholat dengan lokasi Anda
            </p>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-250px)]">
            <div className="space-y-4">
              {prayerTimes.map((prayer, index) => (
                <motion.div
                  key={prayer.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-2xl p-4 border border-emerald-200 dark:border-emerald-700/50"
                >
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-semibold text-gray-900 dark:text-white">
                      {prayer.name}
                    </label>
                    <input
                      type="time"
                      value={prayer.time}
                      onChange={(e) => handleTimeChange(index, e.target.value)}
                      className="bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl px-4 py-2 text-sm font-mono font-semibold text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                    />
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Info */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mt-6 bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-4 border border-blue-200 dark:border-blue-700/50"
            >
              <p className="text-sm text-blue-800 dark:text-blue-200">
                💡 <strong>Tips:</strong> Waktu sholat akan otomatis tersimpan dan ditampilkan di halaman utama. Pastikan waktu sesuai dengan lokasi Anda.
              </p>
            </motion.div>
          </div>

          {/* Footer */}
          <div className="p-6 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-700 flex gap-3">
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={handleReset}
              className="flex-1 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 px-6 py-3 rounded-xl font-semibold border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 transition-all flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Reset Default
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={handleSave}
              className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-emerald-700 hover:to-teal-700 transition-all flex items-center justify-center gap-2 shadow-lg"
            >
              <Save className="w-4 h-4" />
              Simpan
            </motion.button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}