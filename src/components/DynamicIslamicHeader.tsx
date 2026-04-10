import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Bell, Cloud, Star, MapPin, User } from "lucide-react";
import { IslamicPattern, MosqueIcon } from "./IslamicPattern";
import { getSupabaseClient } from "../utils/supabase/client";
import NotificationDropdown from "./NotificationDropdown";

interface DynamicIslamicHeaderProps {
  notifications: any[];
  showNotifications: boolean;
  onToggleNotifications: () => void;
  session?: any;
  onNavigate?: (screen: string) => void;
}

interface PrayerTime {
  name: string;
  time: string;
}

// =========================================================================
// ⛅ KOMPONEN AWAN KITA KELUARIN KE SINI BIAR GAK KE-RESET TIAP DETIK
// =========================================================================
const CloudAnimation = ({
  isSunset,
}: {
  isSunset: boolean;
}) => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Matahari Bercahaya */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 2, ease: "easeOut" }}
        className={`absolute ${
          isSunset
            ? "top-20 right-16 w-24 h-24 bg-gradient-to-br from-orange-200 to-orange-500 shadow-[0_0_70px_30px_rgba(251,146,60,0.5)]"
            : "top-10 right-20 w-32 h-32 bg-gradient-to-br from-yellow-100 to-yellow-300 shadow-[0_0_70px_30px_rgba(253,224,71,0.5)]"
        } rounded-full`}
      />

      {/* Awan Fluffy ala iOS */}
      {[...Array(5)].map((_, i) => (
        <motion.div
          key={`cloud-${i}`}
          animate={{ x: ["-50vw", "150vw"] }}
          transition={{
            duration: 60 + i * 20,
            repeat: Infinity,
            ease: "linear",
            delay: -(i * 35),
          }}
          className="absolute flex items-center justify-center"
          style={{
            top: `${5 + i * 15}%`,
            opacity: isSunset ? 0.25 : 0.4,
            scale: 0.5 + i * 0.15,
          }}
        >
          <div className="relative w-72 h-24">
            <div className="absolute bottom-0 w-full h-12 bg-white rounded-full blur-[16px]" />
            <div className="absolute bottom-4 left-8 w-24 h-24 bg-white rounded-full blur-[16px]" />
            <div className="absolute bottom-2 left-28 w-28 h-28 bg-white rounded-full blur-[16px]" />
          </div>
        </motion.div>
      ))}
    </div>
  );
};

// =========================================================================
// 🌙 KOMPONEN BINTANG JUGA KITA KELUARIN KE SINI
// =========================================================================
const StarAnimation = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    {/* Bulan Purnama */}
    <motion.div
      animate={{
        y: [0, -8, 0],
        boxShadow: [
          "0 0 60px 15px rgba(219,234,254,0.1)",
          "0 0 80px 25px rgba(219,234,254,0.2)",
          "0 0 60px 15px rgba(219,234,254,0.1)",
        ],
      }}
      transition={{
        duration: 6,
        repeat: Infinity,
        ease: "easeInOut",
      }}
      className="absolute top-12 right-12 w-20 h-20 bg-gradient-to-br from-indigo-50 to-blue-200 rounded-full"
    />

    {/* Bintang Kelap-kelip */}
    {[...Array(40)].map((_, i) => {
      const size = Math.random() * 2.5 + 1;
      return (
        <motion.div
          key={`star-${i}`}
          className="absolute bg-white rounded-full blur-[1px]"
          style={{
            width: size,
            height: size,
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
          }}
          animate={{
            opacity: [0.1, 0.9, 0.1],
            scale: [1, 1.3, 1],
          }}
          transition={{
            duration: Math.random() * 4 + 2,
            repeat: Infinity,
            ease: "easeInOut",
            delay: Math.random() * 5,
          }}
        />
      );
    })}

    {/* Awan Malam Tipis */}
    {[...Array(3)].map((_, i) => (
      <motion.div
        key={`night-cloud-${i}`}
        animate={{ x: ["-50vw", "150vw"] }}
        transition={{
          duration: 90 + i * 30,
          repeat: Infinity,
          ease: "linear",
          delay: -(i * 40),
        }}
        className="absolute flex items-center justify-center"
        style={{
          top: `${10 + i * 25}%`,
          opacity: 0.08,
          scale: 0.6 + i * 0.2,
        }}
      >
        <div className="relative w-72 h-24">
          <div className="absolute bottom-0 w-full h-12 bg-indigo-200 rounded-full blur-[20px]" />
          <div className="absolute bottom-4 left-8 w-24 h-24 bg-indigo-200 rounded-full blur-[20px]" />
          <div className="absolute bottom-2 left-28 w-28 h-28 bg-indigo-200 rounded-full blur-[20px]" />
        </div>
      </motion.div>
    ))}

    {/* Bintang Jatuh */}
    <motion.div
      className="absolute w-32 h-[2px] bg-gradient-to-r from-transparent via-white to-transparent blur-[1px]"
      style={{ top: "10%", right: "10%", rotate: "-35deg" }}
      animate={{
        x: ["10vw", "-100vw"],
        y: ["-10vh", "100vh"],
        opacity: [0, 1, 0],
      }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        repeatDelay: 12,
        ease: "linear",
      }}
    />
  </div>
);

// =========================================================================
// 🚀 KOMPONEN UTAMA (HEADER)
// =========================================================================
export default function DynamicIslamicHeader({
  notifications,
  showNotifications,
  onToggleNotifications,
  session,
  onNavigate,
}: DynamicIslamicHeaderProps) {
  const [profileAvatar, setProfileAvatar] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const fetchAvatar = async () => {
      if (!session?.user?.id) return;
      const supabase = getSupabaseClient();
      const { data } = await supabase.from('profiles').select('avatar_url, name').eq('id', session.user.id).single();
      if (data?.avatar_url) setProfileAvatar(data.avatar_url);
    };
    fetchAvatar();
  }, [session]);

  const [locationName, setLocationName] = useState(
    "Mendeteksi lokasi...",
  );
  const [prayerTimes, setPrayerTimes] = useState<PrayerTime[]>(
    [],
  );
  const [nextPrayer, setNextPrayer] = useState({
    name: "Memuat...",
    time: "--:--",
  });
  const [timeRemaining, setTimeRemaining] =
    useState("--:--:--");

  const getDynamicSkyTheme = () => {
    const hour = currentTime.getHours();
    if (hour >= 19 || hour < 4) {
      return {
        bgClasses: "from-slate-900 via-indigo-950 to-slate-900",
        textClass: "text-white",
        animation: "stars",
        glassBg: "bg-white/10",
        glassBorder: "border-white/10",
      };
    } else if (hour >= 4 && hour < 6) {
      return {
        bgClasses:
          "from-indigo-900 via-purple-800 to-orange-500",
        textClass: "text-white",
        animation: "clouds",
        glassBg: "bg-white/15",
        glassBorder: "border-white/20",
      };
    } else if (hour >= 6 && hour < 16) {
      return {
        bgClasses: "from-blue-500 via-sky-400 to-sky-200",
        textClass: "text-gray-900",
        animation: "clouds",
        glassBg: "bg-white/30",
        glassBorder: "border-white/40",
      };
    } else {
      return {
        bgClasses: "from-blue-900 via-orange-600 to-red-500",
        textClass: "text-white",
        animation: "clouds",
        glassBg: "bg-white/15",
        glassBorder: "border-white/20",
      };
    }
  };

  const theme = getDynamicSkyTheme();
  // Cek untuk di passing ke awan
  const isSunset =
    theme.bgClasses.includes("orange") ||
    theme.bgClasses.includes("red");

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    let isMounted = true;

    const fetchPrayerData = async (
      latitude: number,
      longitude: number,
      isFallback = false,
    ) => {
      try {
        if (!isFallback) {
          const geoRes = await fetch(
            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=id`,
          );
          if (geoRes.ok) {
            const geoData = await geoRes.json();
            if (isMounted)
              setLocationName(
                geoData.city ||
                  geoData.locality ||
                  "Lokasi Ditemukan",
              );
          }
        } else {
          if (isMounted) setLocationName("Medan (GPS Default)");
        }

        const prayerRes = await fetch(
          `https://api.aladhan.com/v1/timings?latitude=${latitude}&longitude=${longitude}&method=2`,
        );
        if (prayerRes.ok) {
          const data = await prayerRes.json();
          const timings = data.data.timings;

          if (isMounted) {
            setPrayerTimes([
              { name: "Subuh", time: timings.Fajr },
              { name: "Dzuhur", time: timings.Dhuhr },
              { name: "Ashar", time: timings.Asr },
              { name: "Maghrib", time: timings.Maghrib },
              { name: "Isya", time: timings.Isha },
            ]);
          }
        }
      } catch (error) {
        console.error("API Error:", error);
        if (isMounted) setLocationName("Gagal mengambil data");
      }
    };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          fetchPrayerData(
            position.coords.latitude,
            position.coords.longitude,
          );
        },
        (error) => {
          console.error("GPS Error:", error.message || error);
          fetchPrayerData(3.5952, 98.6722, true);
        },
        { timeout: 10000, maximumAge: 60000 },
      );
    } else {
      fetchPrayerData(3.5952, 98.6722, true);
    }

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (prayerTimes.length === 0) return;

    const currentHour = currentTime.getHours();
    const currentMin = currentTime.getMinutes();
    const currentSec = currentTime.getSeconds();
    const totalSecondsNow =
      currentHour * 3600 + currentMin * 60 + currentSec;

    let upcoming: PrayerTime | null = null;
    let secondsDiff = 0;

    for (let i = 0; i < prayerTimes.length; i++) {
      const [ph, pm] = prayerTimes[i].time
        .split(":")
        .map(Number);
      const prayerSeconds = ph * 3600 + pm * 60;

      if (totalSecondsNow < prayerSeconds) {
        upcoming = prayerTimes[i];
        secondsDiff = prayerSeconds - totalSecondsNow;
        break;
      }
    }

    if (!upcoming) {
      upcoming = prayerTimes[0];
      const [ph, pm] = upcoming.time.split(":").map(Number);
      const nextDaySeconds = 24 * 3600;
      secondsDiff =
        nextDaySeconds -
        totalSecondsNow +
        (ph * 3600 + pm * 60);
    }

    setNextPrayer(upcoming);

    const h = Math.floor(secondsDiff / 3600);
    const m = Math.floor((secondsDiff % 3600) / 60);
    const s = secondsDiff % 60;

    setTimeRemaining(
      `-${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`,
    );
  }, [currentTime, prayerTimes]);

  const userName =
    session?.user?.user_metadata?.name || "Hamba Allah";
  const avatarUrl = session?.user?.user_metadata?.avatar_url;
  const finalAvatar = profileAvatar || avatarUrl;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative bg-gradient-to-br ${theme.bgClasses} transition-colors duration-1000 ${theme.textClass} overflow-hidden`}
      style={{
        borderBottomLeftRadius: "2.5rem",
        borderBottomRightRadius: "2.5rem",
      }}
    >
      <div className="absolute inset-0 overflow-hidden z-[1]">
        {/* INI KUNCI-NYA! KITA PANGGIL KOMPONEN YANG UDAH DI LUAR */}
        {theme.animation === "clouds" ? (
          <CloudAnimation isSunset={isSunset} />
        ) : (
          <StarAnimation />
        )}
      </div>

      <div className="absolute inset-0 z-[2] mix-blend-overlay">
        <IslamicPattern
          className={`opacity-10 ${theme.textClass}`}
        />
      </div>

      <div className="relative z-10 p-6 pt-10 pb-8 space-y-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div
              className={`w-12 h-12 rounded-full overflow-hidden border-2 ${theme.glassBorder} shadow-lg ${theme.glassBg} backdrop-blur-md`}
            >
              {finalAvatar ? (
                <img
                  src={finalAvatar}
                  alt={userName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <User
                    className={`w-6 h-6 ${theme.textClass}`}
                  />
                </div>
              )}
            </div>
            <div>
              <p className="text-sm font-medium opacity-80">
                Assalamu'alaikum,
              </p>
              <h1 className="text-xl font-bold tracking-tight">
                {userName}
              </h1>
            </div>
          </div>

          {/* Notification Dropdown - Replaces old Bell button */}
          {session && <NotificationDropdown session={session} onNavigate={onNavigate} />}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`${theme.glassBg} backdrop-blur-xl rounded-[2rem] p-8 text-center border ${theme.glassBorder} shadow-2xl relative overflow-hidden`}
        >
          <div className="absolute -bottom-6 -right-6 opacity-10 pointer-events-none">
            <MosqueIcon
              className={`w-40 h-40 ${theme.textClass}`}
            />
          </div>

          <p className="text-sm font-semibold tracking-wider uppercase opacity-80 mb-2">
            Shalat Berikutnya
          </p>
          <h2 className="text-5xl font-black mb-3 tracking-tight">
            {nextPrayer.name}
          </h2>
          <div className="flex items-center justify-center gap-4">
            <span className="text-3xl font-bold font-mono">
              {nextPrayer.time}
            </span>
            <div className="h-8 w-[2px] bg-current opacity-20 rounded-full" />
            <span className="text-xl font-medium opacity-90 font-mono tracking-widest">
              {timeRemaining}
            </span>
          </div>
        </motion.div>

        {prayerTimes.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex justify-center gap-2 sm:gap-3 overflow-x-auto scrollbar-hide py-1 w-full"
          >
            {prayerTimes.map((prayer) => {
              const isNext = nextPrayer.name === prayer.name;
              return (
                <div
                  key={prayer.name}
                  className={`flex-shrink-0 min-w-[76px] p-3 rounded-2xl backdrop-blur-md border transition-all ${
                    isNext
                      ? `${theme.textClass === "text-gray-900" ? "bg-white/40 border-white/60" : "bg-white/30 border-white/50"} scale-105 shadow-md`
                      : `${theme.textClass === "text-gray-900" ? "bg-white/20 border-white/20" : "bg-white/10 border-white/10"}`
                  }`}
                >
                  <p
                    className={`text-xs font-semibold mb-1 text-center ${theme.textClass} opacity-80 uppercase tracking-wide`}
                  >
                    {prayer.name}
                  </p>
                  <p
                    className={`text-sm font-bold text-center ${theme.textClass} font-mono`}
                  >
                    {prayer.time}
                  </p>
                </div>
              );
            })}
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex justify-center"
        >
          <div
            className={`inline-flex items-center gap-2 ${theme.glassBg} backdrop-blur-md px-5 py-2.5 rounded-full border ${theme.glassBorder} shadow-lg`}
          >
            <MapPin className="w-4 h-4" />
            <span className="text-sm font-medium">
              {locationName}
            </span>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}