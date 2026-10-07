import { Outlet, Link, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '@/lib/AuthContext';
import {
  LayoutDashboard, ScanFace, History, ShoppingBag, LogOut,
  Sun, Moon, Shield, ChevronRight, Bell
} from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { motion, AnimatePresence } from 'framer-motion';
import { useNativeApp } from '@/hooks/useNativeApp';
import { StatusBar, Style } from '@capacitor/status-bar';
import { Capacitor } from '@capacitor/core';
import WebLayout from './WebLayout';

const navItems = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/' },
  { label: 'History', icon: History, path: '/history' },
  { label: 'Scanner', icon: ScanFace, path: '/scanner', isFab: true },
  { label: 'Products', icon: ShoppingBag, path: '/products' },
];

export default function AppLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dark, setDark] = useState(document.documentElement.classList.contains('dark'));
  const { triggerHaptic } = useNativeApp();

  const toggleDark = async () => {
    const newDark = !dark;
    setDark(newDark);
    document.documentElement.classList.toggle('dark');

    if (Capacitor.isNativePlatform()) {
      try {
        await StatusBar.setStyle({
          style: newDark ? Style.Dark : Style.Light
        });
        await StatusBar.setBackgroundColor({
          color: newDark ? '#061c15' : '#fafaf9'
        });
      } catch (e) {
        console.error('StatusBar update error', e);
      }
    }
    triggerHaptic();
  };

  // If not running inside the native platform, return the WebLayout
  if (!Capacitor.isNativePlatform()) {
    return <WebLayout />;
  }

  const initials = user?.displayName
    ? user.displayName.split(' ').map(n => n[0]).join('').toUpperCase()
    : user?.email?.[0]?.toUpperCase() || 'U';

  const isAdmin = user?.email === 'sivasiva18223@gmail.com';

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-body pb-24">
      {/* Mobile Top App Header */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-background/85 backdrop-blur-xl border-b border-primary/10 px-4 h-16 flex items-center justify-between safe-top">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-primary to-emerald-600 flex items-center justify-center shadow-md shadow-primary/20">
            <ScanFace className="w-4 h-4 text-primary-foreground animate-pulse" />
          </div>
          <span className="font-heading font-extrabold text-base bg-gradient-to-r from-primary to-emerald-600 bg-clip-text text-transparent">Smart Skin AI</span>
        </Link>

        <div className="flex items-center gap-2">
          <button className="w-9 h-9 rounded-full bg-muted/40 hover:bg-muted/80 flex items-center justify-center text-muted-foreground relative">
            <Bell className="w-4 h-4" />
            <span className="absolute top-2.5 right-2.5 w-1.5 h-1.5 rounded-full bg-primary" />
          </button>
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="w-9 h-9 rounded-full overflow-hidden border-2 border-primary/20 focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <Avatar className="h-full w-full">
              <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">{initials}</AvatarFallback>
            </Avatar>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 pt-16 flex flex-col">
        <Outlet />
      </main>

      {/* Mobile Settings Slide-up Bottom Sheet */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="fixed bottom-0 left-0 right-0 z-50 bg-card rounded-t-[2.5rem] border-t border-border/80 p-6 pb-10 space-y-6 shadow-2xl safe-bottom"
            >
              {/* Sheet Handle */}
              <div className="w-12 h-1.5 bg-muted rounded-full mx-auto" onClick={() => setMobileMenuOpen(false)} />

              <div className="flex items-center gap-4">
                <Avatar className="h-14 w-14 ring-4 ring-primary/10">
                  <AvatarFallback className="bg-primary/15 text-primary text-lg font-bold">{initials}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-heading font-extrabold text-lg text-foreground">{user?.displayName || user?.email?.split('@')[0] || 'Skin Care User'}</h3>
                  <p className="text-xs text-muted-foreground">{user?.email}</p>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider px-3 mb-1">Preferences & Account</p>
                
                <button
                  onClick={() => { toggleDark(); setMobileMenuOpen(false); }}
                  className="flex items-center justify-between w-full px-4 py-3.5 rounded-xl hover:bg-muted text-sm font-medium text-foreground transition-all"
                >
                  <div className="flex items-center gap-3">
                    {dark ? <Sun className="w-5 h-5 text-yellow-500" /> : <Moon className="w-5 h-5 text-indigo-500" />}
                    <span>{dark ? 'Light Mode' : 'Dark Mode'}</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </button>

                {isAdmin && (
                  <Link
                    to="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-between w-full px-4 py-3.5 rounded-xl hover:bg-muted text-sm font-medium text-foreground transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <Shield className="w-5 h-5 text-primary" />
                      <span>Admin Control Panel</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </Link>
                )}

                <button
                  onClick={() => { logout(); setMobileMenuOpen(false); }}
                  className="flex items-center justify-between w-full px-4 py-3.5 rounded-xl hover:bg-destructive/10 text-sm font-semibold text-destructive transition-all"
                >
                  <div className="flex items-center gap-3">
                    <LogOut className="w-5 h-5" />
                    <span>Sign Out</span>
                  </div>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Mobile Bottom Navigation (Native Android / Material 3 Style) */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-background/95 backdrop-blur-xl border-t border-border/40 h-[calc(5rem+env(safe-area-inset-bottom))] flex items-start justify-around px-2 pt-3 pb-[env(safe-area-inset-bottom)] safe-bottom">
        {navItems.map((item, idx) => {
          if (item.isFab) {
            // Scanner central floating button
            const active = location.pathname === item.path;
            return (
              <div key={item.path} className="relative w-1/4 flex flex-col items-center justify-center">
                <Link
                  to={item.path}
                  onClick={triggerHaptic}
                  className={`w-14 h-10 rounded-full flex items-center justify-center transition-all duration-300 active:scale-90
                    ${active ? 'bg-primary/20 text-primary' : 'text-muted-foreground'}`}
                >
                  <ScanFace className={`w-6 h-6 ${active ? 'scale-110' : ''}`} />
                </Link>
                <span className={`text-[10px] mt-1 font-bold tracking-tight transition-colors ${active ? 'text-primary' : 'text-muted-foreground'}`}>
                  Scanner
                </span>
              </div>
            );
          }

          const active = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={triggerHaptic}
              className="flex flex-col items-center justify-center w-1/4 h-12 relative group"
            >
              <div className={`w-14 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${active ? 'bg-primary/20' : 'group-active:bg-muted'}`}>
                <item.icon className={`w-6 h-6 transition-colors ${active ? 'text-primary' : 'text-muted-foreground'}`} />
              </div>
              <span className={`text-[10px] mt-1 font-bold tracking-tight transition-colors ${active ? 'text-primary' : 'text-muted-foreground'}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}


