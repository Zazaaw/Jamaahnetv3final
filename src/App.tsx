import React, { useEffect, useState } from 'react';
import { Home, Calendar, Store, HeartHandshake, User } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Toaster } from 'sonner@2.0.3';
import { getSupabaseClient } from './utils/supabase/client';
import { projectId } from './utils/supabase/info';
import SplashScreen from './components/SplashScreen';
import HomeScreen from './components/HomeScreen';
import CalendarScreen from './components/CalendarScreen';
import MarketplaceScreen from './components/MarketplaceScreen';
import DonationScreen from './components/DonationScreen';
import ProfileScreen from './components/ProfileScreen';
import AuthScreen from './components/AuthScreen';
import PendingApprovalScreen from './components/PendingApprovalScreen';
import ProductDetailScreen from './components/ProductDetailScreen';
import ChatListScreen from './components/ChatListScreen';
import ChatScreen from './components/ChatScreen';
import ConnectionsScreen from './components/ConnectionsScreen';
import ArticleDetailScreen from './components/ArticleDetailScreen';
import AllArticlesScreen from './components/AllArticlesScreen';
import CreateTimelineScreen from './components/CreateTimelineScreen';
import TimelineDetailScreen from './components/TimelineDetailScreen';
import ContactScreen from './components/ContactScreen';
import AdminDashboard from './components/AdminDashboard';
import AppFooter from './components/AppFooter';
import InitData from './components/InitData';
import { toast } from 'sonner';

const supabase = getSupabaseClient();

type Screen = 'splash' | 'home' | 'calendar' | 'marketplace' | 'donation' | 'profile' | 'auth' | 'pending-approval' | 'product-detail' | 'chat-list' | 'chat' | 'connections' | 'article-detail' | 'all-articles' | 'create-timeline' | 'timeline-detail' | 'contact' | 'admin-dashboard';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('splash');
  const [previousScreen, setPreviousScreen] = useState<Screen>('home');
  const [session, setSession] = useState<any>(null);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [selectedChat, setSelectedChat] = useState<any>(null);
  const [selectedArticle, setSelectedArticle] = useState<any>(null);
  const [selectedTimeline, setSelectedTimeline] = useState<any>(null);
  const [editingTimeline, setEditingTimeline] = useState<any>(null);
  const [homeRefreshKey, setHomeRefreshKey] = useState(0);
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('jamaah_dark_mode');
    return saved === 'true';
  });

  useEffect(() => {
    // Apply dark mode class to document
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  useEffect(() => {
    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    // Show splash screen for 3.5 seconds (longer to showcase motion graphics)
    const timer = setTimeout(() => {
      setCurrentScreen('home');
    }, 3500);

    return () => {
      subscription.unsubscribe();
      clearTimeout(timer);
    };
  }, []);

  const handleToggleDarkMode = () => {
    setDarkMode(prev => {
      const newValue = !prev;
      localStorage.setItem('jamaah_dark_mode', String(newValue));
      return newValue;
    });
  };

  const handleNavigation = (screen: Screen, data?: any) => {
    setPreviousScreen(currentScreen);
    if (screen === 'product-detail') {
      setSelectedProduct(data);
    } else if (screen === 'chat') {
      setSelectedChat(data);
    } else if (screen === 'article-detail') {
      setSelectedArticle(data);
    } else if (screen === 'timeline-detail') {
      setSelectedTimeline(data);
    }
    setCurrentScreen(screen);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setCurrentScreen('home');
  };

  if (currentScreen === 'splash') {
    return (
      <>
        <SplashScreen />
        <Toaster position="top-center" richColors />
      </>
    );
  }

  if (currentScreen === 'auth') {
    return (
      <>
        <AuthScreen 
          onSuccess={() => setCurrentScreen('home')}
          onSignupSuccess={() => setCurrentScreen('pending-approval')}
          onBack={() => setCurrentScreen('profile')}
        />
        <Toaster position="top-center" richColors />
      </>
    );
  }

  if (currentScreen === 'pending-approval') {
    return (
      <>
        <PendingApprovalScreen 
          onNavigateToLogin={() => {
            setCurrentScreen('auth');
          }}
        />
        <Toaster position="top-center" richColors />
      </>
    );
  }

  if (currentScreen === 'product-detail' && selectedProduct) {
    return (
      <>
        <ProductDetailScreen 
          product={selectedProduct}
          session={session}
          onBack={() => setCurrentScreen('marketplace')}
          onStartChat={(recipientId, productId) => {
            handleNavigation('chat', { recipientId, productId });
          }}
        />
        <Toaster position="top-center" richColors />
      </>
    );
  }

  if (currentScreen === 'chat-list') {
    return (
      <>
        <ChatListScreen 
          session={session}
          onBack={() => setCurrentScreen('profile')}
          onSelectChat={(chat) => handleNavigation('chat', chat)}
        />
        <Toaster position="top-center" richColors />
      </>
    );
  }

  if (currentScreen === 'chat' && selectedChat) {
    return (
      <>
        <ChatScreen 
          chat={selectedChat}
          session={session}
          onBack={() => setCurrentScreen('chat-list')}
        />
        <Toaster position="top-center" richColors />
      </>
    );
  }

  if (currentScreen === 'connections') {
    return (
      <>
        <ConnectionsScreen 
          session={session}
          onBack={() => setCurrentScreen('profile')}
          onStartChat={async (recipientId) => {
            // Create or get chat with this user
            try {
              const response = await fetch(
                `https://${projectId}.supabase.co/functions/v1/make-server-4319e602/api/chats`,
                {
                  method: 'POST',
                  headers: {
                    'Authorization': `Bearer ${session.access_token}`,
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                    recipient_id: recipientId,
                  }),
                }
              );
              
              if (response.ok) {
                const chat = await response.json();
                handleNavigation('chat', chat);
              }
            } catch (error) {
              console.error('Error starting chat:', error);
            }
          }}
        />
        <Toaster position="top-center" richColors />
      </>
    );
  }

  if (currentScreen === 'article-detail' && selectedArticle) {
    return (
      <>
        <ArticleDetailScreen 
          article={selectedArticle}
          session={session}
          onBack={() => setCurrentScreen(previousScreen === 'all-articles' ? 'all-articles' : 'home')}
        />
        <Toaster position="top-center" richColors />
      </>
    );
  }

  if (currentScreen === 'all-articles') {
    return (
      <>
        <AllArticlesScreen 
          onBack={() => setCurrentScreen('home')}
          onSelectArticle={(article) => handleNavigation('article-detail', article)}
        />
        <Toaster position="top-center" richColors />
      </>
    );
  }

  if (currentScreen === 'create-timeline') {
    return (
      <>
        <CreateTimelineScreen 
          session={session}
          editPost={editingTimeline}
          onBack={() => {
            setEditingTimeline(null);
            setCurrentScreen('home');
          }}
          onSuccess={() => {
            setEditingTimeline(null);
            setCurrentScreen('home');
            // Home screen akan auto-refresh karena useEffect
            setHomeRefreshKey(prev => prev + 1);
          }}
        />
        <Toaster position="top-center" richColors />
      </>
    );
  }

  if (currentScreen === 'timeline-detail' && selectedTimeline) {
    return (
      <>
        <TimelineDetailScreen 
          post={selectedTimeline}
          session={session}
          onBack={() => {
            setCurrentScreen('home');
            setHomeRefreshKey(prev => prev + 1);
          }}
          onEdit={() => {
            setEditingTimeline(selectedTimeline);
            setCurrentScreen('create-timeline');
          }}
          onDelete={async () => {
            if (confirm('Yakin ingin menghapus postingan ini?')) {
              try {
                const response = await fetch(
                  `https://${projectId}.supabase.co/functions/v1/make-server-4319e602/api/timeline/${selectedTimeline.id}`,
                  {
                    method: 'DELETE',
                    headers: {
                      'Authorization': `Bearer ${session?.access_token}`,
                    },
                  }
                );

                if (response.ok) {
                  toast.success('Postingan berhasil dihapus');
                  setCurrentScreen('home');
                  setHomeRefreshKey(prev => prev + 1);
                } else {
                  const errorData = await response.json();
                  toast.error(errorData.error || 'Gagal menghapus postingan');
                }
              } catch (error) {
                console.error('Error deleting post:', error);
                toast.error('Gagal menghapus postingan');
              }
            }
          }}
        />
        <Toaster position="top-center" richColors />
      </>
    );
  }

  if (currentScreen === 'contact') {
    return (
      <>
        <ContactScreen 
          onBack={() => setCurrentScreen('profile')}
        />
        <Toaster position="top-center" richColors />
      </>
    );
  }

  if (currentScreen === 'admin-dashboard') {
    return (
      <>
        <AdminDashboard 
          session={session}
          onNavigate={handleNavigation}
        />
        <Toaster position="top-center" richColors />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      <InitData />
      <Toaster position="top-center" richColors />
      
      {/* Main Content */}
      <div className="flex-1 overflow-auto pb-20">
        {currentScreen === 'home' && <HomeScreen session={session} onNavigate={handleNavigation} key={homeRefreshKey} />}
        {currentScreen === 'calendar' && <CalendarScreen session={session} />}
        {currentScreen === 'marketplace' && (
          <MarketplaceScreen 
            session={session}
            onNavigate={handleNavigation}
          />
        )}
        {currentScreen === 'donation' && <DonationScreen session={session} />}
        {currentScreen === 'profile' && (
          <ProfileScreen 
            session={session}
            onNavigate={handleNavigation}
            onLogout={handleLogout}
            darkMode={darkMode}
            onToggleDarkMode={handleToggleDarkMode}
          />
        )}
      </div>

      {/* Liquid Glass Tab Bar - iOS 26 Style */}
      <div className="fixed bottom-0 left-0 right-0 pointer-events-none px-4 pb-6 safe-area-bottom z-50">
        <motion.div 
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
          className="max-w-md mx-auto pointer-events-auto"
        >
          <div className="relative backdrop-blur-2xl bg-white/70 dark:bg-gray-900/70 rounded-[2rem] shadow-[0_8px_32px_rgba(0,0,0,0.12)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.4)] border border-white/20 dark:border-white/10 overflow-hidden">
            {/* Gradient overlay for depth */}
            <div className="absolute inset-0 bg-gradient-to-b from-white/40 to-transparent dark:from-white/5 pointer-events-none" />
            
            {/* Tab buttons container */}
            <div className="relative flex justify-around items-center px-2 py-3">
              <TabButton
                icon={Home}
                label="Masjid"
                active={currentScreen === 'home'}
                onClick={() => setCurrentScreen('home')}
              />
              <TabButton
                icon={Calendar}
                label="Kegiatan"
                active={currentScreen === 'calendar'}
                onClick={() => setCurrentScreen('calendar')}
              />
              <TabButton
                icon={Store}
                label="Pasar"
                active={currentScreen === 'marketplace'}
                onClick={() => setCurrentScreen('marketplace')}
              />
              <TabButton
                icon={HeartHandshake}
                label="Donasi"
                active={currentScreen === 'donation'}
                onClick={() => setCurrentScreen('donation')}
              />
              <TabButton
                icon={User}
                label="Akun"
                active={currentScreen === 'profile'}
                onClick={() => setCurrentScreen('profile')}
              />
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function TabButton({ 
  icon: Icon, 
  label, 
  active, 
  onClick 
}: { 
  icon: React.ElementType; 
  label: string; 
  active: boolean; 
  onClick: () => void;
}) {
  return (
    <motion.button
      onClick={onClick}
      className="relative flex flex-col items-center justify-center gap-1 px-4 py-2 min-w-[60px]"
      whileTap={{ scale: 0.92 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
    >
      {/* Active background bubble */}
      <AnimatePresence>
        {active && (
          <motion.div
            layoutId="tabBubble"
            className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 dark:from-emerald-400/20 dark:to-teal-400/20 rounded-2xl"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
          />
        )}
      </AnimatePresence>
      
      {/* Icon with scale animation */}
      <motion.div
        animate={{ 
          scale: active ? 1.1 : 1,
          y: active ? -2 : 0
        }}
        transition={{ type: "spring", stiffness: 400, damping: 17 }}
        className="relative z-10"
      >
        <Icon 
          className={`w-5 h-5 transition-colors duration-200 ${
            active 
              ? 'text-emerald-600 dark:text-emerald-400' 
              : 'text-gray-500 dark:text-gray-400'
          }`}
          strokeWidth={active ? 2.5 : 2}
        />
      </motion.div>
      
      {/* Label with fade animation */}
      <motion.span
        animate={{ 
          opacity: active ? 1 : 0.7,
          y: active ? 0 : 1
        }}
        transition={{ duration: 0.2 }}
        className={`relative z-10 text-[10px] transition-colors duration-200 ${
          active 
            ? 'text-emerald-600 dark:text-emerald-400' 
            : 'text-gray-500 dark:text-gray-400'
        }`}
      >
        {label}
      </motion.span>
      
      {/* Active indicator dot */}
      <AnimatePresence>
        {active && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="absolute -top-1 w-1 h-1 bg-emerald-500 dark:bg-emerald-400 rounded-full"
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
          />
        )}
      </AnimatePresence>
    </motion.button>
  );
}