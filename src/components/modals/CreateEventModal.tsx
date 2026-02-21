import React, { useState } from 'react';
import { X, Calendar, MapPin, AlignLeft, Type, Hash } from 'lucide-react';
import { getSupabaseClient } from '../../utils/supabase/client';
import { toast } from 'sonner@2.0.3';

interface CreateEventModalProps {
  session: any;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreateEventModal({ session, isOpen, onClose, onSuccess }: CreateEventModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    category: 'Kajian',
    date: '',
    location: '',
    description: ''
  });

  const supabase = getSupabaseClient();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.from('events').insert([{
        title: formData.title,
        category: formData.category,
        date: formData.date,
        location: formData.location,
        description: formData.description,
        organizer_id: session.user.id
      }]);

      if (error) throw error;

      toast.success('Event successfully created!');
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error creating event:', error);
      toast.error('Failed to create event');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-gray-800 shadow-2xl">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold dark:text-white">Create New Event</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors text-gray-500"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5 dark:text-gray-300">Title</label>
              <div className="relative">
                <Type className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none dark:text-white transition-all"
                  placeholder="Event Title"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5 dark:text-gray-300">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none dark:text-white transition-all appearance-none"
              >
                <option value="Kajian">Kajian</option>
                <option value="Sholat">Sholat</option>
                <option value="Sosial">Sosial</option>
                <option value="Umum">Umum</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1.5 dark:text-gray-300">Date</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none dark:text-white transition-all"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5 dark:text-gray-300">Location</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  required
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none dark:text-white transition-all"
                  placeholder="Event Location"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5 dark:text-gray-300">Description</label>
              <div className="relative">
                <AlignLeft className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <textarea
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none dark:text-white transition-all resize-none"
                  placeholder="Event Description..."
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating...' : 'Create Event'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
