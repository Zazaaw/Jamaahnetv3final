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
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [isBarterAllowed, setIsBarterAllowed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  const supabase = getSupabaseClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Check total images limit
    if (imagePreviews.length + files.length > 5) {
      toast.error('Maksimal 5 foto per produk');
      return;
    }

    setUploading(true);
    const newImageUrls: string[] = [];
    const newPreviews: string[] = [];

    for (const file of files) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        toast.error(`${file.name}: Format harus JPG, PNG, atau WebP`);
        continue;
      }

      // Validate file size (max 5MB)
      if (file.size > 5242880) {
        toast.error(`${file.name}: Ukuran maksimal 5MB`);
        continue;
      }

      try {
        // Create preview
        const previewUrl = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        });
        newPreviews.push(previewUrl);

        // Upload to server
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}`;
        const filePath = `${session.user.id}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('product_images')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data } = supabase.storage
          .from('product_images')
          .getPublicUrl(filePath);

        newImageUrls.push(data.publicUrl);
      } catch (error: any) {
        console.error('Error uploading image:', error);
        toast.error(`Gagal upload ${file.name}`);
      }
    }

    setImageUrls(prev => [...prev, ...newImageUrls]);
    setImagePreviews(prev => [...prev, ...newPreviews]);
    setUploading(false);
    
    if (newImageUrls.length > 0) {
      toast.success(`${newImageUrls.length} foto berhasil diupload!`);
    }
  };

  const handleRemoveImage = (index: number) => {
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
    setImageUrls(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Use uploaded image first, then manual URL, then default
      const finalImageUrls = imageUrls.length > 0 ? imageUrls : ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e'];

      const { error } = await supabase.from('products').insert({
        user_id: session.user.id,
        name,
        description,
        price: parseInt(price),
        images: finalImageUrls,
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
              Foto Produk {imagePreviews.length > 0 && `(${imagePreviews.length}/5)`}
            </label>
            
            {/* Upload Button */}
            {imagePreviews.length === 0 && (
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
                          JPG, PNG, atau WebP (Max 5MB, hingga 5 foto)
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
                  multiple
                />
              </div>
            )}

            {/* Image Preview Grid */}
            {imagePreviews.length > 0 && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  {imagePreviews.map((preview, index) => (
                    <div key={index} className="relative">
                      <img
                        src={preview}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-48 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(index)}
                        className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors shadow-lg"
                      >
                        <X className="w-4 h-4" />
                      </button>
                      {index === 0 && (
                        <div className="absolute bottom-2 left-2 bg-emerald-600 text-white px-2 py-1 rounded-full text-xs font-semibold">
                          Foto Utama
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                
                {/* Add More Photos Button */}
                {imagePreviews.length < 5 && (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="w-full border-2 border-dashed border-emerald-500 dark:border-emerald-400 rounded-lg p-4 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <div className="flex items-center justify-center gap-2">
                      {uploading ? (
                        <>
                          <Loader2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 animate-spin" />
                          <span className="text-sm text-gray-600 dark:text-gray-400">Mengupload...</span>
                        </>
                      ) : (
                        <>
                          <ImageIcon className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                          <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                            Tambah Foto
                          </span>
                        </>
                      )}
                    </div>
                  </button>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  onChange={handleImageUpload}
                  className="hidden"
                  multiple
                />
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