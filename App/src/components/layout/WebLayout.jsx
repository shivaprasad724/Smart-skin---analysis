import { Outlet, Link, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '@/lib/AuthContext';
import {
  ScanFace, Menu, X, LogOut, Sun, Moon, Shield, Bell, ChevronDown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { motion, AnimatePresence } from 'framer-motion';

const navItems = [
  { label: 'Home', path: '/home' },
  { label: 'Dashboard', path: '/' },
  { label: 'Scanner', path: '/scanner' },
  { label: 'Products', path: '/products' },
  { label: 'History', path: '/history' },
];

export default function WebLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dark, setDark] = useState(document.documentElement.classList.contains('dark'));

  const toggleDark = () => {
    const newDark = !dark;
    setDark(newDark);
    document.documentElement.classList.toggle('dark');
  };

  const initials = user?.displayName
    ? user.displayName.split(' ').map(n => n[0]).join('').toUpperCase()
    : user?.email?.[0]?.toUpperCase() || 'U';

  const isAdmin = user?.email === 'sivasiva18223@gmail.com';

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-body transition-colors duration-300">
      {/* Sticky Website Top Header */}
      <header className="sticky top-0 z-50 w-full bg-background/80 backdrop-blur-xl border-b border-primary/10 shadow-[0_4px_30px_rgba(99,102,241,0.03)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* Logo & Brand */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-primary to-indigo-600 flex items-center justify-center shadow-md shadow-primary/25 group-hover:scale-105 transition-transform duration-200">
              <ScanFace className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <span className="font-heading font-extrabold text-lg bg-gradient-to-r from-primary via-indigo-500 to-cyan-500 bg-clip-text text-transparent">
                Smart Skin AI
              </span>
              <span className="hidden md:inline-block ml-2 text-[10px] text-primary/80 font-bold uppercase tracking-wider bg-primary/10 px-1.5 py-0.5 rounded">
                Web Portal
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map(item => {
              const active = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`relative px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200
                    ${active ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  {item.label}
                  {active && (
                    <motion.span
                      layoutId="activeWebTab"
                      className="absolute bottom-0 left-4 right-4 h-0.5 bg-primary rounded-full"
                      transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                    />
                  )}
                </Link>
              );
            })}
            {isAdmin && (
              <Link
                to="/admin"
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200
                  ${location.pathname === '/admin' ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}
              >
                Admin
              </Link>
            )}
          </nav>

          {/* Desktop Action bar (Right side) */}
          <div className="hidden md:flex items-center gap-4">
            {/* Theme Toggle */}
            <button
              onClick={toggleDark}
              className="p-2 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
              title={dark ? 'Light Mode' : 'Dark Mode'}
            >
              {dark ? <Sun className="w-4 h-4 text-yellow-500" /> : <Moon className="w-4 h-4 text-indigo-500" />}
            </button>

            {/* Notifications */}
            <button className="p-2 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors relative">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-primary" />
            </button>

            {/* Profile Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 pl-2 border-l border-border/60 hover:opacity-90 transition-opacity">
                  <Avatar className="h-8 w-8 ring-2 ring-primary/10">
                    <AvatarFallback className="bg-primary/15 text-primary text-xs font-semibold">{initials}</AvatarFallback>
                  </Avatar>
                  <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 rounded-xl mt-1">
                <div className="p-3 border-b border-border/40">
                  <p className="text-xs font-bold text-foreground truncate">{user?.displayName || 'User'}</p>
                  <p className="text-[10px] text-muted-foreground truncate">{user?.email}</p>
                </div>
                {isAdmin && (
                  <DropdownMenuItem asChild>
                    <Link to="/admin" className="cursor-pointer py-2">
                      <Shield className="w-4 h-4 mr-2 text-primary" />
                      Admin Control Panel
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={toggleDark} className="cursor-pointer py-2">
                  {dark ? <Sun className="w-4 h-4 mr-2 text-yellow-500" /> : <Moon className="w-4 h-4 mr-2 text-indigo-500" />}
                  {dark ? 'Light Mode' : 'Dark Mode'}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout} className="text-destructive cursor-pointer py-2">
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Mobile Hamburger Button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={toggleDark}
              className="p-2 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
            >
              {dark ? <Sun className="w-4.5 h-4.5 text-yellow-500" /> : <Moon className="w-4.5 h-4.5 text-indigo-500" />}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg hover:bg-muted text-foreground focus:outline-none"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>

        {/* Mobile Dropdown Navbar Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-border/40 bg-background/95 backdrop-blur-xl"
            >
              <div className="px-4 pt-2 pb-6 space-y-2">
                {navItems.map(item => {
                  const active = location.pathname === item.path;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`block px-4 py-3 rounded-xl text-sm font-semibold transition-colors
                        ${active ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}
                    >
                      {item.label}
                    </Link>
                  );
                })}
                {isAdmin && (
                  <Link
                    to="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-4 py-3 rounded-xl text-sm font-semibold text-muted-foreground hover:bg-muted hover:text-foreground"
                  >
                    Admin Control Panel
                  </Link>
                )}
                
                <div className="border-t border-border/40 pt-4 mt-2 px-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9">
                      <AvatarFallback className="bg-primary/15 text-primary text-xs font-bold">{initials}</AvatarFallback>
                    </Avatar>
                    <div className="text-left min-w-0">
                      <p className="text-xs font-bold text-foreground truncate">{user?.displayName || 'User'}</p>
                      <p className="text-[9px] text-muted-foreground truncate">{user?.email}</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => { logout(); setMobileMenuOpen(false); }}
                    className="text-destructive font-bold text-xs"
                  >
                    <LogOut className="w-3.5 h-3.5 mr-1" /> Sign Out
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col animate-fade-in">
        <Outlet />
      </main>

      {/* Structured Website Footer */}
      <footer className="bg-card border-t border-border/80 mt-auto select-none">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            
            {/* Column 1: Brand & Info */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shadow-md shadow-primary/20">
                  <ScanFace className="w-4 h-4 text-primary-foreground" />
                </div>
                <span className="font-heading font-extrabold text-md bg-gradient-to-r from-primary to-sky-500 bg-clip-text text-transparent">
                  Smart Skin AI
                </span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Empowering individuals with instant, AI-driven dermatological assessments and personalized skincare routine strategies.
              </p>
            </div>

            {/* Column 2: Quick Features */}
            <div>
              <h4 className="font-heading text-xs font-bold text-foreground uppercase tracking-widest mb-4">Diagnostics</h4>
              <ul className="space-y-2.5">
                <li><Link to="/scanner" className="text-xs text-muted-foreground hover:text-primary transition-colors">Dermal Scan</Link></li>
                <li><Link to="/products" className="text-xs text-muted-foreground hover:text-primary transition-colors">Cream Matching</Link></li>
                <li><Link to="/history" className="text-xs text-muted-foreground hover:text-primary transition-colors">Progress History</Link></li>
                <li><Link to="/" className="text-xs text-muted-foreground hover:text-primary transition-colors">Dashboard Overview</Link></li>
              </ul>
            </div>

            {/* Column 3: Resources & Support */}
            <div>
              <h4 className="font-heading text-xs font-bold text-foreground uppercase tracking-widest mb-4">Resources</h4>
              <ul className="space-y-2.5">
                <li><a href="#" className="text-xs text-muted-foreground hover:text-primary transition-colors">User Manual</a></li>
                <li><a href="#" className="text-xs text-muted-foreground hover:text-primary transition-colors">Clinical Reference</a></li>
                <li><a href="mailto:sivasiva18223@gmail.com" className="text-xs text-muted-foreground hover:text-primary transition-colors">Help Center</a></li>
                <li><a href="#" className="text-xs text-muted-foreground hover:text-primary transition-colors">Developer API</a></li>
              </ul>
            </div>

            {/* Column 4: Compliance & Safety */}
            <div>
              <h4 className="font-heading text-xs font-bold text-foreground uppercase tracking-widest mb-4">Compliance</h4>
              <ul className="space-y-2.5">
                <li className="text-[10px] text-muted-foreground leading-normal">
                  🔐 **HIPAA Compliant**
                  <br />All uploaded diagnostic parameters are fully encrypted.
                </li>
                <li className="text-[10px] text-muted-foreground leading-normal">
                  🛡️ **Data Privacy**
                  <br />We do not share your health metrics or telemetry logs.
                </li>
              </ul>
            </div>

          </div>

          <div className="border-t border-border/40 mt-10 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-[10px] text-muted-foreground font-medium">
              &copy; {new Date().getFullYear()} Smart Skin Analysis System. All rights reserved.
            </p>
            <div className="flex gap-4">
              <a href="#" className="text-[10px] text-muted-foreground hover:text-primary">Privacy Policy</a>
              <a href="#" className="text-[10px] text-muted-foreground hover:text-primary">Terms of Service</a>
              <a href="#" className="text-[10px] text-muted-foreground hover:text-primary">Medical Disclaimer</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
