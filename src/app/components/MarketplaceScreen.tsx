import React, { useState, useEffect } from 'react';
import { Plus, ArrowLeft, ArrowLeftRight, Filter, Search, Sparkles, Tag, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { getSupabaseClient } from '../utils/supabase/client';
import PostProductModal from './PostProductModal';
import { IslamicPattern } from './IslamicPattern';
import { StarRating } from './StarRating';
import { BlurFade } from './magicui/blur-fade';
import TimelineArchive from './TimelineArchive';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  images: string[];
  is_barter_allowed: boolean;
  seller_id: string;
  seller_name: string;
  status: string;
  category: string;
  subcategory?: string;
}

const CATEGORIES = {
  barang: {
    label: 'Barang',
    icon: '📦',
    subcategories: ['Barang Rumah', 'Alat Olahraga', 'Elektronik', 'Fashion', 'Buku & Hobi', 'Lainnya']
  },
  jasa: {
    label: 'Jasa',
    icon: '🛠️',
    subcategories: ['Jasa Perbaikan', 'Jasa Kebersihan', 'Jasa Pengajaran', 'Jasa IT', 'Jasa Katering', 'Lainnya']
  },
  lainnya: {
    label: 'Lain-lain',
    icon: '✨',
    subcategories: []
  }
};

export default function MarketplaceScreen({ 
  session,
  onNavigate,
  onBack
}: { 
  session: any;
  onNavigate: (screen: string, data?: any) => void;
  onBack?: () => void;
}) {
  const [activeTab, setActiveTab] = useState<'c2c' | 'kabar'>('c2c');
  const [products, setProducts] = useState<Product[]>([]);
  const [showPostModal, setShowPostModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [productRatings, setProductRatings] = useState<{ [key: string]: { avg: number; count: number } }>({});
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchProducts();
  }, [activeTab]);

  const fetchProducts = async () => {
    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase
        .from('products')
        .select('*, profiles(name)')
        .eq('status', 'approved');
      
      if (error) throw error;

      if (data) {
        // Map the data to match the interface, specifically handling the join and legacy fields
        const mappedProducts = data.map((item: any) => ({
          ...item,
          seller_name: item.profiles?.name || 'Anonymous',
          images: item.images || []
        }));
        
        setProducts(mappedProducts);
        
        // Skip fetching ratings as we don't have the table yet
        // mappedProducts.forEach((product: Product) => {
        //   fetchProductRating(product.id);
        // });
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const fetchProductRating = async (productId: string) => {
    // Temporary stub until reviews table is ready
    return;
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const filteredProducts = products.filter(product => {
    if (selectedCategory !== 'all' && product.category !== selectedCategory) {
      return false;
    }
    if (selectedSubcategory !== 'all' && product.subcategory !== selectedSubcategory) {
      return false;
    }
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        product.name.toLowerCase().includes(query) ||
        product.description?.toLowerCase().includes(query) ||
        product.category?.toLowerCase().includes(query) ||
        product.subcategory?.toLowerCase().includes(query)
      );
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-orange-50/20 to-emerald-50/20 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      {/* Background Pattern */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <IslamicPattern className="text-orange-600 dark:text-orange-400 opacity-[0.02]" />
      </div>

      {/* Modern Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative bg-gradient-to-br from-orange-500 via-orange-600 to-red-500 dark:from-orange-600 dark:via-orange-700 dark:to-red-600 text-white overflow-hidden"
        style={{ borderBottomLeftRadius: '2rem', borderBottomRightRadius: '2rem' }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
        <IslamicPattern className="text-white opacity-10" />
        
        <div className="relative z-10 p-6 pb-8">
          {/* Back Button */}
          {onBack && (
            <motion.button
              onClick={onBack}
              className="mb-4 p-2.5 rounded-2xl bg-white/20 backdrop-blur-md hover:bg-white/30 transition-all flex items-center justify-center"
              whileTap={{ scale: 0.9 }}
            >
              <ArrowLeft className="w-5 h-5" />
            </motion.button>
          )}
          
          {/* Title */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold mb-1 flex items-center gap-2">
                <Tag className="w-6 h-6" />
                Bisnis Halal
              </h1>
              <p className="text-orange-100 text-sm">Jual beli dengan berkah</p>
            </div>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setShowFilters(!showFilters)}
              className={`p-3 rounded-2xl backdrop-blur-md transition-all ${
                showFilters ? 'bg-white/30' : 'bg-white/20'
              }`}
            >
              <Filter className="w-5 h-5" />
            </motion.button>
          </div>

          {/* Tabs - Segmented Control with Updated Labels */}
          <div className="bg-black/20 backdrop-blur-md p-1.5 rounded-2xl flex gap-1">
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => setActiveTab('c2c')}
              className={`flex-1 px-4 py-3 rounded-xl transition-all font-medium ${
                activeTab === 'c2c'
                  ? 'bg-white text-orange-600 shadow-lg'
                  : 'text-white/80'
              }`}
            >
              🤝 Produk dan Jasa
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => setActiveTab('kabar')}
              className={`flex-1 px-4 py-3 rounded-xl transition-all font-medium ${
                activeTab === 'kabar'
                  ? 'bg-white text-orange-600 shadow-lg'
                  : 'text-white/80'
              }`}
            >
              📢 Kabar Bisnis
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Filters Panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700"
          >
            <div className="p-6 space-y-4">
              {/* Category Pills */}
              <div>
                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3 block">
                  Kategori
                </label>
                <div className="flex flex-wrap gap-2">
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      setSelectedCategory('all');
                      setSelectedSubcategory('all');
                    }}
                    className={`px-4 py-2 rounded-full font-medium text-sm transition-all ${
                      selectedCategory === 'all'
                        ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    ✨ Semua
                  </motion.button>
                  {Object.entries(CATEGORIES).map(([key, cat]) => (
                    <motion.button
                      key={key}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        setSelectedCategory(key);
                        setSelectedSubcategory('all');
                      }}
                      className={`px-4 py-2 rounded-full font-medium text-sm transition-all ${
                        selectedCategory === key
                          ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                    >
                      {cat.icon} {cat.label}
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Subcategory Pills */}
              {selectedCategory !== 'all' && CATEGORIES[selectedCategory as keyof typeof CATEGORIES].subcategories.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3 block">
                    Sub-Kategori
                  </label>
                  <div className="flex flex-wrap gap-2">
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setSelectedSubcategory('all')}
                      className={`px-3 py-1.5 rounded-full text-sm transition-all ${
                        selectedSubcategory === 'all'
                          ? 'bg-emerald-600 text-white'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                      }`}
                    >
                      Semua
                    </motion.button>
                    {CATEGORIES[selectedCategory as keyof typeof CATEGORIES].subcategories.map((sub) => (
                      <motion.button
                        key={sub}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setSelectedSubcategory(sub)}
                        className={`px-3 py-1.5 rounded-full text-sm transition-all ${
                          selectedSubcategory === sub
                            ? 'bg-emerald-600 text-white'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                        }`}
                      >
                        {sub}
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Products Grid atau Kabar */}
      <div className="relative z-10 p-6">
        
        {/* LAMPU HIJAU: Cuma muncul kalau tab Produk (c2c) aktif */}
        {activeTab === 'c2c' && (
          <>
            {/* Search Bar */}
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari produk atau jasa..."
                  className="w-full pl-12 pr-12 py-3.5 bg-white dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-200 dark:border-gray-700/50 shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 dark:focus:ring-orange-400 transition-all text-gray-900 dark:text-white placeholder-gray-400"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
              {searchQuery && (
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  Ditemukan {filteredProducts.length} hasil untuk "{searchQuery}"
                </p>
              )}
            </div>

            {/* List Produk */}
            {filteredProducts.length > 0 ? (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="grid grid-cols-2 gap-4"
              >
                {/* ... (Isi map produk kau biarkan sama persis seperti sebelumnya) ... */}
                {filteredProducts.map((product, index) => (
                  <BlurFade key={product.id} delay={0.2 + index * 0.08} duration={0.4}>
                     {/* ... Kodingan produk Card-mu ... */}
                     <motion.button
                       onClick={() => onNavigate('product-detail', product)}
                       className="group bg-white dark:bg-gray-800/50 backdrop-blur-sm rounded-3xl shadow-lg border border-gray-100 dark:border-gray-700/50 overflow-hidden text-left card-hover"
                     >
                       {/* Isi Card Produk */}
                       <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 relative overflow-hidden">
                         <ImageWithFallback src={product.images[0]} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                       </div>
                       <div className="p-4">
                         <h3 className="font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">{product.name}</h3>
                         <p className="text-lg font-bold text-orange-600 dark:text-orange-400">{formatPrice(product.price)}</p>
                       </div>
                     </motion.button>
                  </BlurFade>
                ))}
              </motion.div>
            ) : (
              <motion.div className="text-center py-20">
                 {/* ... Tampilan Kosong Produk ... */}
                 <p className="text-gray-500">Belum ada produk</p>
              </motion.div>
            )}
          </>
        )}

        {/* LAMPU HIJAU: Cuma muncul kalau tab Kabar aktif */}
        {activeTab === 'kabar' && (
          <div className="space-y-4">
            <TimelineArchive category="Bisnis" session={session} onNavigate={onNavigate} />
          </div>
        )}

        {/* Bottom Spacing */}
        <div className="h-20" />
      </div>

      {/* Floating Action Button */}
      {session && (
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setShowPostModal(true)}
          className="fixed bottom-24 right-6 bg-gradient-to-br from-orange-500 to-red-500 text-white p-5 rounded-full shadow-2xl hover:shadow-orange-500/50 transition-all group"
        >
          <Plus className="w-7 h-7 group-hover:rotate-90 transition-transform" />
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-400 rounded-full animate-pulse" />
        </motion.button>
      )}

      {/* Post Product Modal */}
      {showPostModal && (
        <PostProductModal
          session={session}
          type={activeTab}
          onClose={() => setShowPostModal(false)}
          onSuccess={() => {
            setShowPostModal(false);
            fetchProducts();
          }}
        />
      )}
    </div>
  );
}