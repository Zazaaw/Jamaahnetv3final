import React, { useState, useRef } from 'react';
import { X, Upload, Image as ImageIcon, Loader2 } from 'lucide-react';
import { getSupabaseClient } from '../utils/supabase/client';
import { toast } from 'sonner@2.0.3';

export default function PostProductModal({ 
  session, 
  type,
  onClose,
  onSuccess 
}: { 
  session: any;
  type: 'c2c' | 'b2c';
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [uploadedImageUrl, setUploadedImageUrl] = useState('');
  const [imagePreview, setImagePreview] = useState('');
  const [isBarterAllowed, setIsBarterAllowed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  const supabase = getSupabaseClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Format file harus JPG, PNG, atau WebP');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5242880) {
      toast.error('Ukuran file maksimal 5MB');
      return;
    }

    // Show preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload to server
    setUploading(true);
    try {
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}`;
      const filePath = `${session.user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('product_images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('product_images')
        .getPublicUrl(filePath);

      setUploadedImageUrl(data.publicUrl);
      toast.success('Gambar berhasil diupload!');
    } catch (error: any) {
      console.error('Error uploading image:', error);
      toast.error(error.message || 'Gagal mengupload gambar');
      setImagePreview('');
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = () => {
    setImagePreview('');
    setUploadedImageUrl('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Use uploaded image first, then manual URL, then default
      const finalImageUrl = uploadedImageUrl || imageUrl || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e';

      const { error } = await supabase.from('products').insert({
        user_id: session.user.id,
        name,
        description,
        price: parseInt(price),
        images: [finalImageUrl],
        // Note: Check if image_url column exists in your schema, usually images array is enough
        // but adding it as requested by prompt just in case or mapping it to images
        is_barter_allowed: isBarterAllowed,
        status: 'pending',
        category: type === 'c2c' ? 'barang' : 'jasa' // Default category based on type
      });

      if (error) throw error;

      toast.success('Produk berhasil diposting!');
      onSuccess();
    } catch (error: any) {
      console.error('Error posting product:', error);
      toast.error(error.message || 'Gagal memposting produk');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-t-3xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 flex items-center justify-between z-10">
          <h2 className="text-lg dark:text-white">Posting Produk</h2>
          <button onClick={onClose}>
            <X className="w-6 h-6 text-gray-700 dark:text-gray-300" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 pb-32 space-y-4">
          {/* Product Name */}
          <div>
            <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">
              Nama Produk <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              placeholder="Contoh: Kurma Ajwa Premium"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">
              Deskripsi <span className="text-red-500">*</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              rows={4}
              placeholder="Jelaskan kondisi dan detail produk..."
              required
            />
          </div>

          {/* Price */}
          <div>
            <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">
              Harga (Rp) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              placeholder="50000"
              required
              min="0"
            />
          </div>

          {/* Image Upload Section */}
          <div>
            <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">
              Foto Produk
            </label>
            
            {/* Upload Button */}
            {!imagePreview && (
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="w-full border-2 border-dashed border-emerald-500 dark:border-emerald-400 rounded-lg p-6 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="flex flex-col items-center gap-2">
                    {uploading ? (
                      <>
                        <Loader2 className="w-8 h-8 text-emerald-600 dark:text-emerald-400 animate-spin" />
                        <p className="text-sm text-gray-600 dark:text-gray-400">Mengupload...</p>
                      </>
                    ) : (
                      <>
                        <ImageIcon className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
                        <p className="text-emerald-600 dark:text-emerald-400">
                          Upload Foto Produk
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          JPG, PNG, atau WebP (Max 5MB)
                        </p>
                      </>
                    )}
                  </div>
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </div>
            )}

            {/* Image Preview */}
            {imagePreview && (
              <div className="relative">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-48 object-cover rounded-lg"
                />
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors shadow-lg"
                >
                  <X className="w-4 h-4" />
                </button>
                {uploading && (
                  <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
                    <Loader2 className="w-8 h-8 text-white animate-spin" />
                  </div>
                )}
              </div>
            )}

            {/* Manual URL Input (Alternative) */}
            {!imagePreview && (
              <div className="mt-3">
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex-1 h-px bg-gray-300 dark:bg-gray-600"></div>
                  <span className="text-xs text-gray-500 dark:text-gray-400">ATAU</span>
                  <div className="flex-1 h-px bg-gray-300 dark:bg-gray-600"></div>
                </div>
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
                  placeholder="Tempel URL gambar dari internet"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Kosongkan jika ingin menggunakan gambar default
                </p>
              </div>
            )}
          </div>

          {/* Barter Option */}
          {type === 'c2c' && (
            <div className="flex items-center gap-2 p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
              <input
                type="checkbox"
                id="barter"
                checked={isBarterAllowed}
                onChange={(e) => setIsBarterAllowed(e.target.checked)}
                className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
              />
              <label htmlFor="barter" className="text-sm text-gray-700 dark:text-gray-300">
                Bisa barter/tukar barang
              </label>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || uploading}
            className="w-full bg-emerald-600 text-white py-3 rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Memposting...
              </>
            ) : (
              <>
                <Upload className="w-5 h-5" />
                Posting Produk
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
