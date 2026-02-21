import React, { useState, useEffect } from 'react';
import { ArrowLeft, Shield, MessageCircle, ArrowLeftRight, User, Trash2, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { StarRating } from './StarRating';
import { toast } from 'sonner@2.0.3';

interface Review {
  id: string;
  product_id: string;
  user_id: string;
  user_name: string;
  rating: number;
  comment: string;
  created_at: number;
}

export default function ProductDetailScreen({ 
  product, 
  session,
  onBack,
  onStartChat 
}: { 
  product: any;
  session: any;
  onBack: () => void;
  onStartChat: (recipientId: string, productId: string) => void;
}) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [newRating, setNewRating] = useState(0);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingReviews, setIsLoadingReviews] = useState(true);

  useEffect(() => {
    fetchReviews();
  }, [product.id]);

  const fetchReviews = async () => {
    try {
      setIsLoadingReviews(true);
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-4319e602/api/products/${product.id}/reviews`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );
      const data = await response.json();
      setReviews(data);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setIsLoadingReviews(false);
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!session) {
      toast.error('Silakan login terlebih dahulu untuk memberikan ulasan');
      return;
    }

    if (newRating === 0) {
      toast.error('Silakan pilih rating terlebih dahulu');
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-4319e602/api/products/${product.id}/reviews`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ rating: newRating, comment: newComment }),
        }
      );

      if (response.ok) {
        const review = await response.json();
        setReviews([review, ...reviews]);
        setNewRating(0);
        setNewComment('');
        toast.success('Ulasan berhasil dikirim!');
      } else {
        const error = await response.json();
        toast.error(error.error || 'Gagal mengirim ulasan');
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error('Gagal mengirim ulasan');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus ulasan ini?')) {
      return;
    }

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-4319e602/api/products/${product.id}/reviews/${reviewId}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
          },
        }
      );

      if (response.ok) {
        setReviews(reviews.filter(r => r.id !== reviewId));
        toast.success('Ulasan berhasil dihapus');
      } else {
        const error = await response.json();
        toast.error(error.error || 'Gagal menghapus ulasan');
      }
    } catch (error) {
      console.error('Error deleting review:', error);
      toast.error('Gagal menghapus ulasan');
    }
  };

  const averageRating = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const handleStartTransaction = () => {
    if (!session) {
      alert('Silakan login terlebih dahulu');
      return;
    }
    alert('Fitur transaksi Rekber akan segera hadir!');
  };

  const handleChatForCOD = () => {
    if (!session) {
      alert('Silakan login terlebih dahulu');
      return;
    }
    onStartChat(product.seller_id, product.id);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4 flex items-center gap-3 sticky top-0 z-10">
        <button onClick={onBack}>
          <ArrowLeft className="w-6 h-6 text-gray-700" />
        </button>
        <h1 className="text-lg">Detail Produk</h1>
      </div>

      {/* Product Images */}
      <div className="bg-white">
        <div className="aspect-square bg-gray-100 relative">
          <ImageWithFallback
            src={product.images[currentImageIndex]}
            alt={product.name}
            className="w-full h-full object-cover"
          />
          {product.is_barter_allowed && (
            <div className="absolute top-4 right-4 bg-orange-500 text-white px-3 py-2 rounded-full text-sm flex items-center gap-2">
              <ArrowLeftRight className="w-4 h-4" />
              Bisa Barter
            </div>
          )}
        </div>
        
        {/* Image Indicators */}
        {product.images.length > 1 && (
          <div className="flex gap-2 justify-center py-3">
            {product.images.map((_: any, index: number) => (
              <button
                key={index}
                onClick={() => setCurrentImageIndex(index)}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentImageIndex ? 'bg-emerald-600 w-6' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="bg-white mt-2 p-6">
        <h2 className="text-2xl mb-2">{product.name}</h2>
        <p className="text-emerald-600 text-xl mb-4">{formatPrice(product.price)}</p>
        
        {/* Seller Info */}
        <div className="flex items-center gap-3 py-4 border-t border-b border-gray-200">
          <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
            <span className="text-emerald-600">
              {product.seller_name.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <div className="text-sm">Dijual oleh</div>
            <div className="text-gray-700">{product.seller_name}</div>
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="bg-white mt-2 p-6">
        <h3 className="text-base mb-3">Deskripsi Produk</h3>
        <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">
          {product.description}
        </p>
      </div>

      {/* Rating & Reviews Section */}
      <div className="bg-white mt-2 p-6 pb-48 mb-4">
        {/* Rating Summary */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
          <div>
            <h3 className="text-base mb-2">Rating & Ulasan</h3>
            <div className="flex items-center gap-3">
              <div className="text-3xl font-bold text-gray-900">
                {averageRating > 0 ? averageRating.toFixed(1) : '0.0'}
              </div>
              <div>
                <StarRating rating={Math.round(averageRating)} readonly size="sm" />
                <p className="text-sm text-gray-500 mt-1">
                  {reviews.length} ulasan
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Review Form */}
        {session ? (
          <form onSubmit={handleSubmitReview} className="mb-6">
            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-2xl p-4 border border-emerald-200 dark:border-emerald-700/50">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                Berikan Ulasan
              </h4>
              <div className="mb-3">
                <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">
                  Rating
                </label>
                <StarRating 
                  rating={newRating} 
                  onRatingChange={setNewRating}
                  size="lg"
                />
              </div>
              <div className="mb-3">
                <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">
                  Komentar (opsional)
                </label>
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Bagikan pengalaman Anda..."
                  className="w-full px-4 py-3 bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500 text-gray-900 dark:text-white"
                  rows={3}
                  disabled={isSubmitting}
                />
              </div>
              <motion.button
                type="submit"
                whileTap={{ scale: 0.95 }}
                disabled={isSubmitting || newRating === 0}
                className="w-full flex items-center justify-center gap-2 px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Mengirim...
                  </>
                ) : (
                  <>
                    <Star className="w-4 h-4" />
                    Kirim Ulasan
                  </>
                )}
              </motion.button>
            </div>
          </form>
        ) : (
          <div className="mb-6 p-4 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-2xl border border-amber-200 dark:border-amber-700/50">
            <p className="text-center text-gray-700 dark:text-gray-300 text-sm">
              Silakan <span className="font-semibold text-emerald-600 dark:text-emerald-400">login</span> untuk memberikan ulasan
            </p>
          </div>
        )}

        {/* Reviews List */}
        <div className="space-y-4">
          {isLoadingReviews ? (
            <div className="text-center py-8">
              <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Memuat ulasan...</p>
            </div>
          ) : reviews.length === 0 ? (
            <div className="text-center py-8">
              <Star className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
              <p className="text-gray-500 dark:text-gray-400">
                Belum ada ulasan. Jadilah yang pertama memberikan ulasan!
              </p>
            </div>
          ) : (
            <AnimatePresence>
              {reviews.map((review, index) => (
                <motion.div
                  key={review.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex gap-3 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-gray-100 dark:border-gray-700/50"
                >
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/30 dark:to-teal-900/30 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white">
                          {review.user_name}
                        </h4>
                        <div className="flex items-center gap-2 mt-1">
                          <StarRating rating={review.rating} readonly size="sm" />
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {new Date(review.created_at).toLocaleDateString('id-ID', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </span>
                        </div>
                      </div>
                      {session && session.user.id === review.user_id && (
                        <motion.button
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleDeleteReview(review.id)}
                          className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </motion.button>
                      )}
                    </div>
                    {review.comment && (
                      <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-sm mt-2">
                        {review.comment}
                      </p>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 safe-area-bottom z-50 shadow-lg">
        <div className="max-w-md mx-auto space-y-2">
          {/* Rekber Button */}
          <button
            onClick={handleStartTransaction}
            className="w-full bg-emerald-600 text-white py-3 rounded-lg hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2"
          >
            <Shield className="w-5 h-5" />
            Beli Sekarang (Rekber Aman)
          </button>

          {/* Chat Button */}
          {session && (
            <button
              onClick={handleChatForCOD}
              className="w-full bg-white border border-emerald-600 text-emerald-600 py-3 rounded-lg hover:bg-emerald-50 transition-colors flex items-center justify-center gap-2"
            >
              <MessageCircle className="w-5 h-5" />
              Chat untuk COD/Nego
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
