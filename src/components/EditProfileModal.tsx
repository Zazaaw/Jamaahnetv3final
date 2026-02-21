import React, { useState, useRef } from 'react';
import { X, User, Phone, MapPin, Building2, AtSign, Camera, Upload } from 'lucide-react';
import { getSupabaseClient } from '../utils/supabase/client';
import { toast } from 'sonner@2.0.3';

interface EditProfileModalProps {
  session: any;
  currentProfile: any;
  onClose: () => void;
  onSuccess: () => void;
}

export default function EditProfileModal({ 
  session, 
  currentProfile,
  onClose, 
  onSuccess 
}: EditProfileModalProps) {
  const [name, setName] = useState(currentProfile?.name || '');
  const [username, setUsername] = useState(currentProfile?.username || '');
  const [phone, setPhone] = useState(currentProfile?.phone || '');
  const [address, setAddress] = useState(currentProfile?.address || '');
  const [mosque, setMosque] = useState(currentProfile?.mosque || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [avatarPreview, setAvatarPreview] = useState(currentProfile?.avatar_url || '');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const supabase = getSupabaseClient();

  const handleAvatarSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('File harus berupa gambar');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Ukuran file maksimal 5MB');
      return;
    }

    // Store file
    setSelectedFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      setAvatarPreview(result);
    };
    reader.readAsDataURL(file);
  };

  const handleUploadAvatar = async () => {
    if (!selectedFile) return null;

    setUploadingAvatar(true);
    setError('');

    try {
      const fileName = `${session.user.id}-${Date.now()}`;
      const { data, error } = await supabase.storage
        .from('avatars')
        .upload(fileName, selectedFile, { upsert: true });

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      toast.success('Foto profil berhasil diupdate!');
      setAvatarPreview(publicUrl);
      setSelectedFile(null);
      return publicUrl;
    } catch (error) {
      console.error('Error uploading avatar:', error);
      setError('Gagal mengupload foto. Silakan coba lagi.');
      return null;
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!name.trim()) {
      setError('Nama wajib diisi');
      return;
    }

    if (username && !/^[a-zA-Z0-9_]+$/.test(username)) {
      setError('Username hanya boleh mengandung huruf, angka, dan underscore');
      return;
    }

    setIsSubmitting(true);

    try {
      let currentAvatarUrl = avatarPreview;

      // Upload avatar first if there's a new one
      if (selectedFile) {
        const uploadedUrl = await handleUploadAvatar();
        if (uploadedUrl) {
          currentAvatarUrl = uploadedUrl;
        } else {
          // If upload failed, stop submission? 
          // The previous code would show error and stop.
          // handleUploadAvatar sets error state, so we can return here if we want strictly robust code.
          // But to match previous flow where it might continue or stop, let's assume we stop if upload fails.
          setIsSubmitting(false);
          return; 
        }
      }

      const { error } = await supabase.from('profiles').update({ 
        name, 
        username, 
        phone, 
        address, 
        mosque, 
        avatar_url: currentAvatarUrl 
      }).eq('id', session.user.id);

      if (error) throw error;

      toast.success('Profil berhasil diperbarui!');
      onSuccess();
    } catch (error) {
      console.error('Error updating profile:', error);
      setError('Gagal memperbarui profil. Silakan coba lagi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl dark:text-white">Edit Profil</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
            >
              <X className="w-5 h-5 dark:text-white" />
            </button>
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Avatar Upload */}
            <div className="flex flex-col items-center mb-6">
              <div className="relative mb-3">
                <div className="w-24 h-24 rounded-full overflow-hidden bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center">
                  {avatarPreview ? (
                    <img 
                      src={avatarPreview} 
                      alt="Avatar" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-12 h-12 text-white" />
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-0 right-0 p-2 bg-emerald-600 text-white rounded-full hover:bg-emerald-700 transition-colors shadow-lg"
                >
                  <Camera className="w-4 h-4" />
                </button>
              </div>
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarSelect}
                className="hidden"
              />
              
              {selectedFile && (
                <button
                  type="button"
                  onClick={handleUploadAvatar}
                  disabled={uploadingAvatar}
                  className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:bg-gray-400 text-sm"
                >
                  <Upload className="w-4 h-4" />
                  {uploadingAvatar ? 'Mengupload...' : 'Upload Foto'}
                </button>
              )}
              
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
                Klik ikon kamera untuk mengganti foto profil<br/>
                (Max 5MB, format: JPG, PNG)
              </p>
            </div>

            <div>
              <label className="block text-sm mb-2 dark:text-gray-300">
                <User className="w-4 h-4 inline mr-2" />
                Nama Lengkap *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                placeholder="Masukkan nama lengkap"
                required
              />
            </div>

            <div>
              <label className="block text-sm mb-2 dark:text-gray-300">
                <AtSign className="w-4 h-4 inline mr-2" />
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase())}
                className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                placeholder="contoh: ahmad_123"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Username untuk dicari oleh pengguna lain
              </p>
            </div>

            <div>
              <label className="block text-sm mb-2 dark:text-gray-300">
                <Phone className="w-4 h-4 inline mr-2" />
                Nomor Telepon
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                placeholder="08xx xxxx xxxx"
              />
            </div>

            <div>
              <label className="block text-sm mb-2 dark:text-gray-300">
                <Building2 className="w-4 h-4 inline mr-2" />
                Masjid
              </label>
              <input
                type="text"
                value={mosque}
                onChange={(e) => setMosque(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                placeholder="Contoh: Masjid Al-Ikhlas"
              />
            </div>

            <div>
              <label className="block text-sm mb-2 dark:text-gray-300">
                <MapPin className="w-4 h-4 inline mr-2" />
                Alamat
              </label>
              <textarea
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                placeholder="Masukkan alamat lengkap"
                rows={3}
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-3 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                disabled={isSubmitting}
              >
                Batal
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:bg-gray-400"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Menyimpan...' : 'Simpan'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}