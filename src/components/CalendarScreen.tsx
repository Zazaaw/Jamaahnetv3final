import React, { useState, useEffect } from 'react';
import { MapPin, Users, Check, Calendar as CalendarIcon, Clock, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';
import { projectId } from '../utils/supabase/info';
import { getSupabaseClient } from '../utils/supabase/client';
import { IslamicPattern } from './IslamicPattern';

interface Event {
  id: string;
  title: string;
  category: string;
  date: number;
  location: string;
  description: string;
  rsvp: string[];
  created_at: number;
}

const CATEGORY_COLORS = {
  'Shalat': 'from-emerald-500 to-teal-500',
  'Kajian': 'from-blue-500 to-indigo-500',
  'Acara Komunitas': 'from-purple-500 to-pink-500',
};

const CATEGORY_ICONS = {
  'Shalat': '🕌',
  'Kajian': '📖',
  'Acara Komunitas': '🤝',
};

export default function CalendarScreen({ session }: { session: any }) {
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');
  const categories = ['Semua', 'Shalat', 'Kajian', 'Acara Komunitas'];

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase
        .from('events')
        .select('*');
      
      if (error) throw error;
      if (data) setEvents(data);
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  };

  const handleRSVP = async (eventId: string) => {
    if (!session) {
      alert('Silakan login terlebih dahulu untuk RSVP');
      return;
    }

    try {
      const supabase = getSupabaseClient();
      
      // Get current event to check RSVP status
      const { data: currentEvent, error: fetchError } = await supabase
        .from('events')
        .select('rsvp')
        .eq('id', eventId)
        .single();

      if (fetchError) throw fetchError;

      const currentRsvp = currentEvent?.rsvp || [];
      
      // Check if user already RSVPed
      if (!currentRsvp.includes(session.user.id)) {
        const newRsvp = [...currentRsvp, session.user.id];
        
        const { error: updateError } = await supabase
          .from('events')
          .update({ rsvp: newRsvp })
          .eq('id', eventId);

        if (updateError) throw updateError;
        
        // Refresh events
        fetchEvents();
      }
    } catch (error) {
      console.error('Error RSVPing to event:', error);
      alert('Gagal RSVP');
    }
  };

  const filteredEvents = selectedCategory === 'Semua'
    ? events
    : events.filter(event => event.category === selectedCategory);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/20 to-purple-50/20 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      {/* Background Pattern */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <IslamicPattern className="text-blue-600 dark:text-blue-400 opacity-[0.02]" />
      </div>

      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 dark:from-blue-700 dark:via-indigo-700 dark:to-purple-700 text-white overflow-hidden"
        style={{ borderBottomLeftRadius: '2rem', borderBottomRightRadius: '2rem' }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
        <IslamicPattern className="text-white opacity-10" />
        
        <div className="relative z-10 p-6 pb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-white/20 backdrop-blur-md p-3 rounded-2xl">
              <CalendarIcon className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Kegiatan Jamaah</h1>
              <p className="text-blue-100 text-sm">Jangan lewatkan momen berharga</p>
            </div>
          </div>
          
          {/* Category Pills */}
          <div className="flex gap-2 overflow-x-auto pb-2 hide-scrollbar">
            {categories.map((category) => (
              <motion.button
                key={category}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedCategory(category)}
                className={`px-5 py-2.5 rounded-full whitespace-nowrap font-medium transition-all ${
                  selectedCategory === category
                    ? 'bg-white text-blue-600 shadow-lg'
                    : 'bg-white/20 backdrop-blur-md text-white'
                }`}
              >
                {category !== 'Semua' && CATEGORY_ICONS[category as keyof typeof CATEGORY_ICONS]} {category}
              </motion.button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Events List */}
      <div className="relative z-10 p-6 space-y-4">
        {filteredEvents.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-3xl flex items-center justify-center mx-auto mb-4">
              <CalendarIcon className="w-10 h-10 text-gray-400" />
            </div>
            <p className="text-gray-500 dark:text-gray-400 font-medium">
              Tidak ada kegiatan untuk kategori ini
            </p>
          </motion.div>
        ) : (
          filteredEvents.map((event, index) => {
            const eventDate = new Date(event.date);
            const hasRSVPed = session && event.rsvp.includes(session.user.id);
            const categoryGradient = CATEGORY_COLORS[event.category as keyof typeof CATEGORY_COLORS] || 'from-gray-500 to-gray-600';

            return (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="card-hover bg-white dark:bg-gray-800/50 backdrop-blur-sm rounded-3xl shadow-lg border border-gray-100 dark:border-gray-700/50 overflow-hidden"
              >
                <div className="flex gap-0">
                  {/* Date Badge - Vertical */}
                  <div className={`bg-gradient-to-br ${categoryGradient} text-white p-5 flex flex-col items-center justify-center min-w-[100px]`}>
                    <div className="text-4xl font-bold mb-1">
                      {eventDate.getDate()}
                    </div>
                    <div className="text-xs uppercase tracking-wider opacity-90">
                      {eventDate.toLocaleDateString('id-ID', { month: 'short' })}
                    </div>
                    <div className="text-xs opacity-75 mt-2">
                      {eventDate.toLocaleDateString('id-ID', { weekday: 'short' })}
                    </div>
                  </div>

                  {/* Event Details */}
                  <div className="flex-1 p-5">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-2xl">
                            {CATEGORY_ICONS[event.category as keyof typeof CATEGORY_ICONS]}
                          </span>
                          <h3 className="font-bold text-gray-900 dark:text-white">
                            {event.title}
                          </h3>
                        </div>
                        <p className="text-gray-600 dark:text-gray-400 text-sm mb-3 line-clamp-2">
                          {event.description}
                        </p>
                      </div>
                      <span className={`px-3 py-1.5 bg-gradient-to-r ${categoryGradient} text-white text-xs font-semibold rounded-full whitespace-nowrap`}>
                        {event.category}
                      </span>
                    </div>

                    {/* Event Meta */}
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-4">
                      <div className="flex items-center gap-2">
                        <div className="bg-gray-100 dark:bg-gray-700 p-2 rounded-lg">
                          <MapPin className="w-4 h-4" />
                        </div>
                        <span>{event.location}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="bg-gray-100 dark:bg-gray-700 p-2 rounded-lg">
                          <Users className="w-4 h-4" />
                        </div>
                        <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                          {event.rsvp.length} peserta
                        </span>
                      </div>
                    </div>

                    {/* RSVP Button */}
                    {session && (
                      <motion.button
                        whileTap={{ scale: 0.97 }}
                        onClick={() => handleRSVP(event.id)}
                        disabled={hasRSVPed}
                        className={`w-full px-5 py-3 rounded-2xl font-semibold transition-all ${
                          hasRSVPed
                            ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 cursor-default'
                            : `bg-gradient-to-r ${categoryGradient} text-white shadow-lg hover:shadow-xl`
                        }`}
                      >
                        {hasRSVPed ? (
                          <span className="flex items-center justify-center gap-2">
                            <Check className="w-5 h-5" />
                            Sudah RSVP
                          </span>
                        ) : (
                          <span className="flex items-center justify-center gap-2">
                            <Sparkles className="w-5 h-5" />
                            RSVP Sekarang
                          </span>
                        )}
                      </motion.button>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })
        )}

        {/* Bottom Spacing */}
        <div className="h-20" />
      </div>
    </div>
  );
}