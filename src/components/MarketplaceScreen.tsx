import React, { useState, useEffect } from 'react';
import { Plus, ArrowLeftRight, Filter, Search, Sparkles, Tag, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { getSupabaseClient } from '../utils/supabase/client';
import PostProductModal from './PostProductModal';
import { IslamicPattern } from './IslamicPattern';
import { StarRating } from './StarRating';

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
  onNavigate 
}: { 
  session: any;
  onNavigate: (screen: string, data?: any) => void;
}) {
  const [activeTab, setActiveTab] = useState<'c2c' | 'b2c'>('c2c');
  const [products, setProducts] = useState<Product[]>([]);
  const [showPostModal, setShowPostModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [productRatings, setProductRatings] = useState<{ [key: string]: { avg: number; count: number } }>({});

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
          {/* Title */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold mb-1 flex items-center gap-2">
                <Tag className="w-6 h-6" />
                Pasar Halal
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

          {/* Tabs - Segmented Control */}
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
              🤝 Pasar Jamaah
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => setActiveTab('b2c')}
              className={`flex-1 px-4 py-3 rounded-xl transition-all font-medium ${
                activeTab === 'b2c'
                  ? 'bg-white text-orange-600 shadow-lg'
                  : 'text-white/80'
              }`}
            >
              🕌 Toko Masjid
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

      {/* Products Grid */}
      <div className="relative z-10 p-6">
        {filteredProducts.length > 0 ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-2 gap-4"
          >
            {filteredProducts.map((product, index) => (
              <motion.button
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ y: -4 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onNavigate('product-detail', product)}
                className="group bg-white dark:bg-gray-800/50 backdrop-blur-sm rounded-3xl shadow-lg border border-gray-100 dark:border-gray-700/50 overflow-hidden text-left card-hover"
              >
                {/* Product Image */}
                <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 relative overflow-hidden">
                  <ImageWithFallback
                    src={product.images[0]}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  
                  {/* Badges */}
                  <div className="absolute top-3 left-3 right-3 flex justify-between items-start">
                    {product.subcategory && (
                      <div className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-3 py-1.5 rounded-full text-xs font-semibold backdrop-blur-sm shadow-lg">
                        {product.subcategory}
                      </div>
                    )}
                    {product.is_barter_allowed && (
                      <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1 backdrop-blur-sm shadow-lg">
                        <ArrowLeftRight className="w-3 h-3" />
                        Barter
                      </div>
                    )}
                  </div>

                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>

                {/* Product Info */}
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                    {product.name}
                  </h3>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-lg font-bold text-orange-600 dark:text-orange-400">
                      {formatPrice(product.price)}
                    </p>
                  </div>
                  
                  {/* Rating */}
                  {productRatings[product.id] && (
                    <div className="mb-2">
                      <StarRating 
                        rating={Math.round(productRatings[product.id].avg)}
                        readonly
                        size="sm"
                        showCount
                        count={productRatings[product.id].count}
                      />
                    </div>
                  )}
                  
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 bg-gradient-to-br from-emerald-400 to-teal-400 rounded-full flex items-center justify-center text-[10px]">
                      👤
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {product.seller_name}
                    </p>
                  </div>
                </div>
              </motion.button>
            ))}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-3xl flex items-center justify-center mx-auto mb-4">
              <Search className="w-10 h-10 text-gray-400" />
            </div>
            <p className="text-gray-500 dark:text-gray-400 font-medium">
              Belum ada produk di kategori ini
            </p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
              Coba pilih kategori lain
            </p>
          </motion.div>
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
