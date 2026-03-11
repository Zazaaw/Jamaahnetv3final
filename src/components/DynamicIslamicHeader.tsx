import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Bell, Cloud, Star, MapPin, User } from 'lucide-react';
import { IslamicPattern, MosqueIcon } from './IslamicPattern';

interface DynamicIslamicHeaderProps {
  notifications: any[];
  showNotifications: boolean;
  onToggleNotifications: () => void;
  session?: any;
}

interface PrayerTime {
  name: string;
  time: string;
}

export default function DynamicIslamicHeader({ 
  notifications, 
  showNotifications, 
  onToggleNotifications,
  session
}: DynamicIslamicHeaderProps) {
  const [currentTime, setCurrentTime] = useState(new Date());
  
  // GPS & Prayer Times State
  const [locationName, setLocationName] = useState('Mendeteksi lokasi...');
  const [prayerTimes, setPrayerTimes] = useState<PrayerTime[]>([]);
  const [nextPrayer, setNextPrayer] = useState({ name: 'Memuat...', time: '--:--' });
  const [timeRemaining, setTimeRemaining] = useState('--:--:--');

  // Dynamic Sky Logic
  const getDynamicSkyTheme = () => {
    const hour = currentTime.getHours();
    if (hour >= 19 || hour < 4) {
      // Night
      return {
        bgClasses: 'from-slate-900 via-indigo-950 to-slate-900',
        textClass: 'text-white',
        animation: 'stars',
        glassBg: 'bg-white/10',
        glassBorder: 'border-white/10'
      };
    } else if (hour >= 4 && hour < 6) {
      // Dawn
      return {
        bgClasses: 'from-indigo-900 via-purple-800 to-orange-500',
        textClass: 'text-white',
        animation: 'clouds',
        glassBg: 'bg-white/15',
        glassBorder: 'border-white/20'
      };
    } else if (hour >= 6 && hour < 16) {
      // Day
      return {
        bgClasses: 'from-blue-500 via-sky-400 to-sky-200',
        textClass: 'text-gray-900',
        animation: 'clouds',
        glassBg: 'bg-white/30',
        glassBorder: 'border-white/40'
      };
    } else {
      // Sunset (16 - 19)
      return {
        bgClasses: 'from-blue-900 via-orange-600 to-red-500',
        textClass: 'text-white',
        animation: 'clouds',
        glassBg: 'bg-white/15',
        glassBorder: 'border-white/20'
      };
    }
  };

  const theme = getDynamicSkyTheme();

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch Location & Prayer Times
  useEffect(() => {
    let isMounted = true;

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          if (!isMounted) return;
          const { latitude, longitude } = position.coords;
          
          try {
            // Reverse Geocoding
            const geoRes = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=id`);
            if (geoRes.ok) {
              const geoData = await geoRes.json();
              setLocationName(geoData.city || geoData.locality || 'Lokasi Ditemukan');
            } else {
              setLocationName('Lokasi Ditemukan');
            }

            // Aladhan API
            const prayerRes = await fetch(`https://api.aladhan.com/v1/timings?latitude=${latitude}&longitude=${longitude}&method=2`);
            if (prayerRes.ok) {
              const data = await prayerRes.json();
              const timings = data.data.timings;
              
              setPrayerTimes([
                { name: 'Subuh', time: timings.Fajr },
                { name: 'Dzuhur', time: timings.Dhuhr },
                { name: 'Ashar', time: timings.Asr },
                { name: 'Maghrib', time: timings.Maghrib },
                { name: 'Isya', time: timings.Isha },
              ]);
            }
          } catch (error) {
            console.error('API Error:', error);
            setLocationName('Gagal mengambil data');
          }
        },
        (error) => {
          console.error('GPS Error:', error);
          if (isMounted) setLocationName('GPS tidak diaktifkan');
        }
      );
    } else {
      setLocationName('GPS tidak didukung');
    }

    return () => { isMounted = false; };
  }, []);

  // Calculate Next Prayer and Countdown
  useEffect(() => {
    if (prayerTimes.length === 0) return;

    const currentHour = currentTime.getHours();
    const currentMin = currentTime.getMinutes();
    const currentSec = currentTime.getSeconds();
    const totalSecondsNow = currentHour * 3600 + currentMin * 60 + currentSec;

    let upcoming: PrayerTime | null = null;
    let secondsDiff = 0;

    for (let i = 0; i < prayerTimes.length; i++) {
      const [ph, pm] = prayerTimes[i].time.split(':').map(Number);
      const prayerSeconds = ph * 3600 + pm * 60;
      
      if (totalSecondsNow < prayerSeconds) {
        upcoming = prayerTimes[i];
        secondsDiff = prayerSeconds - totalSecondsNow;
        break;
      }
    }

    if (!upcoming) {
      // Next prayer is Subuh tomorrow
      upcoming = prayerTimes[0];
      const [ph, pm] = upcoming.time.split(':').map(Number);
      const nextDaySeconds = 24 * 3600;
      secondsDiff = nextDaySeconds - totalSecondsNow + (ph * 3600 + pm * 60);
    }

    setNextPrayer(upcoming);

    const h = Math.floor(secondsDiff / 3600);
    const m = Math.floor((secondsDiff % 3600) / 60);
    const s = secondsDiff % 60;
    
    setTimeRemaining(`-${h.toString().padStart(2,'0')}:${m.toString().padStart(2,'0')}:${s.toString().padStart(2,'0')}`);
  }, [currentTime, prayerTimes]);
  
  // Cloud animation component
  const CloudAnimation = () => (
    <>
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={`cloud-${i}`}
          initial={{ x: -200 - i * 150, y: 20 + i * 25, opacity: 0.4 + (i % 3) * 0.15 }}
          animate={{
            x: typeof window !== 'undefined' ? window.innerWidth + 200 : 1000,
            y: [20 + i * 25, 20 + i * 25 + 10, 20 + i * 25],
          }}
          transition={{
            x: { duration: 30 + i * 8, repeat: Infinity, ease: 'linear', delay: i * 2 },
            y: { duration: 6 + i * 1.5, repeat: Infinity, ease: 'easeInOut', delay: i * 0.5 }
          }}
          className="absolute pointer-events-none"
        >
          <Cloud 
            className={`${theme.textClass === 'text-gray-900' ? 'text-white/60' : 'text-white/20'}`} 
            size={60 + i * 20}
            fill="currentColor"
          />
        </motion.div>
      ))}
    </>
  );

  // Star animation component
  const StarAnimation = () => (
    <>
      {[...Array(30)].map((_, i) => {
        const randomX = typeof window !== 'undefined' ? Math.random() * window.innerWidth : Math.random() * 1000;
        const randomY = Math.random() * 250;
        const randomSize = 4 + Math.random() * 8;
        const randomDelay = Math.random() * 3;
        const randomDuration = 3 + Math.random() * 4;
        
        return (
          <motion.div
            key={`star-${i}`}
            initial={{ x: randomX, y: randomY, scale: 0.3, opacity: 0 }}
            animate={{
              opacity: [0, 0.4, 0.8, 1, 0.8, 0.4, 0],
              scale: [0.3, 0.5, 0.8, 1, 0.8, 0.5, 0.3],
            }}
            transition={{
              opacity: { duration: randomDuration, repeat: Infinity, ease: 'easeInOut', delay: randomDelay },
              scale: { duration: randomDuration, repeat: Infinity, ease: 'easeInOut', delay: randomDelay },
            }}
            className="absolute"
          >
            <Star className="text-yellow-100" size={randomSize} fill="currentColor" />
          </motion.div>
        );
      })}
    </>
  );

  const userName = session?.user?.user_metadata?.name || 'Hamba Allah';
  const avatarUrl = session?.user?.user_metadata?.avatar_url;

  return (
    <motion.div 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative bg-gradient-to-br ${theme.bgClasses} transition-colors duration-1000 ${theme.textClass} overflow-hidden`}
      style={{ borderBottomLeftRadius: '2.5rem', borderBottomRightRadius: '2.5rem' }}
    >
      {/* Background Animations */}
      <div className="absolute inset-0 overflow-hidden z-[1]">
        {theme.animation === 'clouds' ? <CloudAnimation /> : <StarAnimation />}
      </div>

      {/* Islamic Pattern */}
      <div className="absolute inset-0 z-[2] mix-blend-overlay">
        <IslamicPattern className={`opacity-10 ${theme.textClass}`} />
      </div>
      
      <div className="relative z-10 p-6 pt-10 pb-8 space-y-6">
        {/* Top Row: Greeting & Avatar */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-full overflow-hidden border-2 ${theme.glassBorder} shadow-lg ${theme.glassBg} backdrop-blur-md`}>
              {avatarUrl ? (
                <img src={avatarUrl} alt={userName} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <User className={`w-6 h-6 ${theme.textClass}`} />
                </div>
              )}
            </div>
            <div>
              <p className="text-sm font-medium opacity-80">Assalamu'alaikum,</p>
              <h1 className="text-xl font-bold tracking-tight">{userName}</h1>
            </div>
          </div>
          
          {/* Notification Bell */}
          <motion.button 
            whileTap={{ scale: 0.9 }}
            onClick={onToggleNotifications}
            className={`${theme.glassBg} backdrop-blur-md rounded-full w-12 h-12 flex items-center justify-center relative border ${theme.glassBorder} shadow-sm`}
          >
            <Bell className={`w-5 h-5 ${theme.textClass}`} />
            {notifications && notifications.length > 0 && (
              <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-[10px] font-bold text-white border border-white">
                {notifications.length}
              </span>
            )}
          </motion.button>
        </div>

        {/* Middle Row: Next Prayer (Glassmorphism) */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`${theme.glassBg} backdrop-blur-xl rounded-[2rem] p-8 text-center border ${theme.glassBorder} shadow-2xl relative overflow-hidden`}
        >
          {/* Decorative Mosque in background of card */}
          <div className="absolute -bottom-6 -right-6 opacity-10 pointer-events-none">
            <MosqueIcon className={`w-40 h-40 ${theme.textClass}`} />
          </div>

          <p className="text-sm font-semibold tracking-wider uppercase opacity-80 mb-2">Shalat Berikutnya</p>
          <h2 className="text-5xl font-black mb-3 tracking-tight">
            {nextPrayer.name}
          </h2>
          <div className="flex items-center justify-center gap-4">
            <span className="text-3xl font-bold font-mono">{nextPrayer.time}</span>
            <div className="h-8 w-[2px] bg-current opacity-20 rounded-full" />
            <span className="text-xl font-medium opacity-90 font-mono tracking-widest">{timeRemaining}</span>
          </div>
        </motion.div>

        {/* All 5 Prayers Scrollable Row */}
        {prayerTimes.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex gap-3 overflow-x-auto scrollbar-hide pb-2"
          >
            {prayerTimes.map((prayer) => {
              const isNext = nextPrayer.name === prayer.name;
              return (
                <div 
                  key={prayer.name}
                  className={`flex-shrink-0 min-w-[80px] p-3 rounded-2xl backdrop-blur-md border transition-all ${
                    isNext 
                      ? `${theme.textClass === 'text-gray-900' ? 'bg-white/40 border-white/60' : 'bg-white/30 border-white/50'} scale-105 shadow-md` 
                      : `${theme.textClass === 'text-gray-900' ? 'bg-white/20 border-white/20' : 'bg-white/10 border-white/10'}`
                  }`}
                >
                  <p className={`text-xs font-medium mb-1 text-center ${theme.textClass} opacity-80`}>{prayer.name}</p>
                  <p className={`text-sm font-bold text-center ${theme.textClass}`}>{prayer.time}</p>
                </div>
              );
            })}
          </motion.div>
        )}

        {/* Bottom Row: Location Pill */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex justify-center"
        >
          <div className={`inline-flex items-center gap-2 ${theme.glassBg} backdrop-blur-md px-5 py-2.5 rounded-full border ${theme.glassBorder} shadow-lg`}>
            <MapPin className="w-4 h-4" />
            <span className="text-sm font-medium">{locationName}</span>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
