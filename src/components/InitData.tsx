import React, { useEffect, useState } from 'react';
import { projectId, publicAnonKey } from '../utils/supabase/info';

export default function InitData() {
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    // Data is now initialized on server start, so we just mark as done
    const hasInitialized = localStorage.getItem('jamaah_data_initialized_v2');
    if (!hasInitialized) {
      initializeData();
    } else {
      setInitialized(true);
    }
  }, []);

  const initializeData = async () => {
    try {
      // Create sample announcements
      await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-4319e602/api/announcements`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title: 'Jadwal Shalat Jumat',
            content: 'Khotbah dimulai pukul 12:00 WIB. Jamaah diharapkan hadir 15 menit sebelumnya.',
            image: 'https://images.unsplash.com/photo-1591604466107-ec97de577aff',
          }),
        }
      ).catch(() => {});

      await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-4319e602/api/announcements`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title: 'Kajian Rutin Ahad Pagi',
            content: 'Kajian rutin setiap Ahad pukul 08:00 WIB dengan tema Tafsir Al-Quran.',
            image: 'https://images.unsplash.com/photo-1609599006353-e629aaabfeae',
          }),
        }
      ).catch(() => {});

      localStorage.setItem('jamaah_data_initialized_v2', 'true');
      setInitialized(true);
    } catch (error) {
      console.log('Data initialization skipped or already done');
      setInitialized(true);
    }
  };

  return null;
}
