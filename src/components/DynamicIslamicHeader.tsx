import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Bell, Cloud, Moon, Star, Sun } from 'lucide-react';
import { IslamicPattern, MosqueIcon } from './IslamicPattern';

interface DynamicIslamicHeaderProps {
  notifications: any[];
  showNotifications: boolean;
  onToggleNotifications: () => void;
}

type PrayerPeriod = 'subuh' | 'dzuhur' | 'ashar' | 'maghrib' | 'isya';

interface PrayerTime {
  name: string;
  time: string;
  hour: number;
  minute: number;
}

export default function DynamicIslamicHeader({ 
  notifications, 
  showNotifications, 
  onToggleNotifications 
}: DynamicIslamicHeaderProps) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [activePrayer, setActivePrayer] = useState<string>('');

  // Load prayer times from localStorage or use defaults
  const getStoredPrayerTimes = (): PrayerTime[] => {
    const stored = localStorage.getItem('jamaah_prayer_times');
    if (stored) {
      return JSON.parse(stored);
    }
    return [
      { name: 'Subuh', time: '04:45', hour: 4, minute: 45 },
      { name: 'Dzuhur', time: '12:00', hour: 12, minute: 0 },
      { name: 'Ashar', time: '15:15', hour: 15, minute: 15 },
      { name: 'Maghrib', time: '18:05', hour: 18, minute: 5 },
      { name: 'Isya', time: '19:20', hour: 19, minute: 20 },
    ];
  };

  const [prayerTimes, setPrayerTimes] = useState<PrayerTime[]>(getStoredPrayerTimes());

  // Listen for prayer times updates
  useEffect(() => {
    const handleStorageChange = () => {
      setPrayerTimes(getStoredPrayerTimes());
    };
    
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('prayerTimesUpdated', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('prayerTimesUpdated', handleStorageChange);
    };
  }, []);

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Determine current prayer period and active prayer
  useEffect(() => {
    const hour = currentTime.getHours();
    const minute = currentTime.getMinutes();
    const currentMinutes = hour * 60 + minute;

    // Find which prayer time is active (next upcoming prayer)
    let nextPrayer = '';
    for (let i = 0; i < prayerTimes.length; i++) {
      const prayerMinutes = prayerTimes[i].hour * 60 + prayerTimes[i].minute;
      if (currentMinutes < prayerMinutes) {
        nextPrayer = prayerTimes[i].name;
        break;
      }
    }
    // If past all prayers, next is Subuh tomorrow
    if (!nextPrayer) {
      nextPrayer = prayerTimes[0].name;
    }
    setActivePrayer(nextPrayer);
  }, [currentTime, prayerTimes]);

  const getPrayerPeriod = (): PrayerPeriod => {
    const hour = currentTime.getHours();
    if (hour >= 4 && hour < 6) return 'subuh';
    if (hour >= 6 && hour < 15) return 'dzuhur';
    if (hour >= 15 && hour < 18) return 'ashar';
    if (hour >= 18 && hour < 19) return 'maghrib';
    return 'isya';
  };

  const period = getPrayerPeriod();

  // Theme configuration based on prayer period
  const themes = {
    subuh: {
      gradient: 'from-indigo-900 via-purple-700 to-orange-400',
      overlay: 'from-purple-900/30 via-orange-500/20 to-yellow-300/30',
      icon: Sun,
      animation: 'clouds',
    },
    dzuhur: {
      gradient: 'from-sky-400 via-blue-400 to-cyan-300',
      overlay: 'from-blue-400/20 via-cyan-300/10 to-sky-200/20',
      icon: Cloud,
      animation: 'clouds',
    },
    ashar: {
      gradient: 'from-orange-400 via-amber-400 to-yellow-300',
      overlay: 'from-orange-500/30 via-amber-400/20 to-yellow-300/30',
      icon: Sun,
      animation: 'clouds',
    },
    maghrib: {
      gradient: 'from-purple-800 via-pink-600 to-orange-500',
      overlay: 'from-purple-700/40 via-pink-500/30 to-orange-400/30',
      icon: Sun,
      animation: 'clouds',
    },
    isya: {
      gradient: 'from-slate-900 via-indigo-950 to-slate-800',
      overlay: 'from-indigo-900/40 via-purple-900/20 to-slate-900/30',
      icon: Moon,
      animation: 'stars',
    },
  };

  const theme = themes[period];

  // Format time as HH:MM:SS
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  // Format date
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Cloud animation components - SMOOTHER VERSION
  const CloudAnimation = () => (
    <>
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={`cloud-${i}`}
          initial={{ 
            x: -200 - i * 200, 
            y: 20 + i * 20,
            opacity: 0.4 + (i % 3) * 0.15
          }}
          animate={{
            x: typeof window !== 'undefined' ? window.innerWidth + 200 : 1000,
            y: [
              20 + i * 20,
              20 + i * 20 + Math.sin(i) * 12,
              20 + i * 20 - Math.cos(i) * 10,
              20 + i * 20 + Math.sin(i + 1) * 12,
              20 + i * 20,
            ],
          }}
          transition={{
            x: {
              duration: 25 + i * 6,
              repeat: Infinity,
              ease: 'linear',
              delay: i * 1.5,
            },
            y: {
              duration: 6 + i * 1.5,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: i * 0.3,
            }
          }}
          className="absolute pointer-events-none"
          style={{
            filter: 'blur(0.3px)',
          }}
        >
          <Cloud 
            className="text-white/25 drop-shadow-[0_2px_8px_rgba(255,255,255,0.3)]" 
            size={50 + i * 20}
            fill="currentColor"
            strokeWidth={0.8}
          />
        </motion.div>
      ))}
      
      {/* Sun/Moon with glow effect based on period */}
      {period !== 'isya' && (
        <motion.div
          initial={{ y: -40, opacity: 0, scale: 0.7 }}
          animate={{ 
            y: [0, -8, 0],
            opacity: 1,
            scale: 1,
          }}
          transition={{
            y: {
              duration: 5,
              repeat: Infinity,
              ease: 'easeInOut',
            },
            opacity: {
              duration: 1.5,
              ease: 'easeOut',
            },
            scale: {
              duration: 1.5,
              ease: 'easeOut',
            }
          }}
          className="absolute right-8 top-6"
        >
          <motion.div
            animate={{
              rotate: period === 'dzuhur' ? 360 : [0, 5, -5, 0],
            }}
            transition={{
              rotate: {
                duration: period === 'dzuhur' ? 20 : 7,
                repeat: Infinity,
                ease: period === 'dzuhur' ? 'linear' : 'easeInOut',
              }
            }}
          >
            <Sun 
              className={`drop-shadow-[0_0_20px_rgba(255,255,100,0.6)] ${
                period === 'subuh' ? 'text-orange-200' :
                period === 'dzuhur' ? 'text-yellow-100' :
                period === 'ashar' ? 'text-amber-200' :
                'text-orange-300'
              }`}
              size={60}
              fill="currentColor"
            />
          </motion.div>
        </motion.div>
      )}
    </>
  );

  // Star animation components - SMOOTHER VERSION
  const StarAnimation = () => (
    <>
      {[...Array(30)].map((_, i) => {
        const randomX = typeof window !== 'undefined' ? Math.random() * window.innerWidth : Math.random() * 1000;
        const randomY = Math.random() * 250;
        const randomSize = 4 + Math.random() * 10;
        const randomDelay = Math.random() * 3;
        const randomDuration = 3 + Math.random() * 4;
        
        return (
          <motion.div
            key={`star-${i}`}
            initial={{
              x: randomX,
              y: randomY,
              scale: 0.3,
              opacity: 0,
            }}
            animate={{
              opacity: [0, 0.3, 0.8, 1, 0.8, 0.3, 0],
              scale: [0.3, 0.5, 0.8, 1, 0.8, 0.5, 0.3],
              rotate: [0, 180, 360],
            }}
            transition={{
              opacity: {
                duration: randomDuration,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: randomDelay,
              },
              scale: {
                duration: randomDuration,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: randomDelay,
              },
              rotate: {
                duration: randomDuration * 2,
                repeat: Infinity,
                ease: 'linear',
                delay: randomDelay,
              }
            }}
            className="absolute"
          >
            <Star 
              className="text-yellow-200" 
              size={randomSize}
              fill="currentColor"
            />
          </motion.div>
        );
      })}
      
      {/* Moon with gentle floating animation */}
      <motion.div
        initial={{ y: -30, opacity: 0, scale: 0.8 }}
        animate={{ 
          y: [0, -10, 0],
          opacity: 1,
          scale: 1,
        }}
        transition={{
          y: {
            duration: 6,
            repeat: Infinity,
            ease: 'easeInOut',
          },
          opacity: {
            duration: 1.5,
            ease: 'easeOut',
          },
          scale: {
            duration: 1.5,
            ease: 'easeOut',
          }
        }}
        className="absolute right-12 top-8"
      >
        <motion.div
          animate={{
            rotate: [0, 5, -5, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          <Moon 
            className="text-yellow-100 drop-shadow-[0_0_15px_rgba(255,255,200,0.5)]" 
            size={52}
            fill="currentColor"
          />
        </motion.div>
      </motion.div>
      
      {/* Shooting stars occasionally */}
      {[...Array(2)].map((_, i) => (
        <motion.div
          key={`shooting-star-${i}`}
          initial={{
            x: typeof window !== 'undefined' ? window.innerWidth * 0.2 : 200,
            y: 50 + i * 80,
            opacity: 0,
          }}
          animate={{
            x: typeof window !== 'undefined' ? window.innerWidth : 1000,
            y: 150 + i * 80,
            opacity: [0, 1, 0.8, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            repeatDelay: 8 + i * 3,
            ease: 'easeOut',
          }}
          className="absolute h-0.5 w-20 bg-gradient-to-r from-transparent via-yellow-200 to-transparent"
          style={{
            boxShadow: '0 0 10px rgba(255, 255, 200, 0.8)',
          }}
        />
      ))}
    </>
  );

  return (
    <motion.div 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative bg-gradient-to-br ${theme.gradient} text-white overflow-hidden`}
      style={{ borderBottomLeftRadius: '2rem', borderBottomRightRadius: '2rem' }}
    >
      {/* Animated gradient overlay */}
      <div className={`absolute inset-0 bg-gradient-to-r ${theme.overlay} z-0`} />
      
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden z-[1]">
        {theme.animation === 'clouds' ? <CloudAnimation /> : <StarAnimation />}
      </div>

      {/* Islamic Pattern */}
      <div className="absolute inset-0 z-[2]">
        <IslamicPattern className="text-white opacity-5" />
      </div>
      
      <div className="relative z-10 p-6 pb-8">
        {/* Top Bar */}
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center gap-3">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200 }}
              className="bg-white/20 backdrop-blur-md p-3 rounded-2xl"
            >
              <MosqueIcon className="w-8 h-8 text-white" />
            </motion.div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Jamaah.net</h1>
            </div>
          </div>
          <motion.button 
            whileTap={{ scale: 0.9 }}
            onClick={onToggleNotifications}
            className="bg-white/20 backdrop-blur-md p-3 rounded-2xl relative"
          >
            <Bell className="w-5 h-5" />
            {notifications.length > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-xs font-bold">
                {notifications.length}
              </span>
            )}
          </motion.button>
        </div>

        {/* Real-time Clock Card */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-white/15 backdrop-blur-xl rounded-3xl p-5 border border-white/20 shadow-2xl mb-4"
        >
          <div className="text-center">
            {/* Digital Clock */}
            <motion.div 
              key={formatTime(currentTime)}
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              className="text-5xl md:text-6xl font-bold mb-2 tracking-wider font-mono"
            >
              {formatTime(currentTime)}
            </motion.div>
            
            {/* Date */}
            <div className="text-sm text-white/90 mb-1">
              {formatDate(currentTime)}
            </div>
            
            {/* Period indicator */}
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 py-2 rounded-full mt-2">
              {React.createElement(theme.icon, { className: "w-4 h-4" })}
              <span className="text-sm font-medium">
                Waktu {period.charAt(0).toUpperCase() + period.slice(1)}
              </span>
            </div>
          </div>
        </motion.div>
        
        {/* Prayer Times Card with Glassmorphism */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/15 backdrop-blur-xl rounded-3xl p-4 sm:p-5 border border-white/20 shadow-2xl"
        >
          <div className="flex items-center gap-2 mb-3">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              <Star className="w-4 h-4 text-yellow-300" fill="currentColor" />
            </motion.div>
            <span className="text-xs sm:text-sm font-medium text-white/90">Waktu Shalat Hari Ini</span>
          </div>
          <div className="grid grid-cols-5 gap-1.5 sm:gap-2 md:gap-3">
            {prayerTimes.map((prayer, index) => (
              <motion.div
                key={prayer.name}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                className={`text-center p-2 sm:p-2.5 md:p-3 rounded-xl sm:rounded-2xl transition-all ${
                  prayer.name === activePrayer
                    ? 'bg-white/30 backdrop-blur-md scale-105 shadow-lg' 
                    : 'bg-white/10'
                }`}
              >
                <div className={`text-[10px] sm:text-xs mb-0.5 sm:mb-1 truncate ${prayer.name === activePrayer ? 'text-white font-semibold' : 'text-white/80'}`}>
                  {prayer.name}
                </div>
                <div className={`text-xs sm:text-sm font-bold tabular-nums ${prayer.name === activePrayer ? 'text-white' : 'text-white/90'}`}>
                  {prayer.time}
                </div>
                {prayer.name === activePrayer && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="mt-0.5 sm:mt-1"
                  >
                    <div className="w-1.5 h-1.5 bg-yellow-300 rounded-full mx-auto animate-pulse" />
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}