import React, { useState } from 'react';
import { X, Type, AlignLeft } from 'lucide-react';
import { getSupabaseClient } from '../../utils/supabase/client';
import { toast } from 'sonner@2.0.3';

interface CreateAnnouncementModalProps {
  session: any;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreateAnnouncementModal({ session, isOpen, onClose, onSuccess }: CreateAnnouncementModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: ''
  });

  const supabase = getSupabaseClient();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.from('announcements').insert([{
        title: formData.title,
        content: formData.content,
        author_id: session.user.id
      }]);

      if (error) throw error;

      toast.success('Announcement successfully created!');
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error creating announcement:', error);
      toast.error('Failed to create announcement');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-md w-full border border-gray-200 dark:border-gray-800 shadow-2xl">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold dark:text-white">New Announcement</h2>
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
                  placeholder="Announcement Title"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5 dark:text-gray-300">Content</label>
              <div className="relative">
                <AlignLeft className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <textarea
                  required
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  rows={6}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none dark:text-white transition-all resize-none"
                  placeholder="Write your announcement here..."
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Publishing...' : 'Publish Announcement'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
