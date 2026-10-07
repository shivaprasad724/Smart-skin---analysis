import { db } from '@/lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/lib/AuthContext';
import { ShoppingBag, Sparkles, Search, Sun, Moon, Star } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { Input } from '@/components/ui/input';

const conditionLabels = {
  acne: 'Acne', pimples: 'Pimples', dry_skin: 'Dry Skin',
  oily_skin: 'Oily Skin', dark_spots: 'Dark Spots', normal: 'Normal',
};

export default function Products() {
  const { user } = useAuth();
  const [typeFilter, setTypeFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // 1. Get user's most recent scan to know their condition
  const { data: latestAnalysis } = useQuery({
    queryKey: ['latest-analysis', user?.uid],
    queryFn: async () => {
      if (!user?.uid) return null;
      const q = query(
        collection(db, "SkinAnalysis"),
        where("userId", "==", user.uid)
      );
      const querySnapshot = await getDocs(q);
      const docs = querySnapshot.docs.map(doc => doc.data());
      // Sort by date manually if created_at exists
      return docs.sort((a, b) => {
        const timeA = a.created_at?.toDate?.()?.getTime() || 0;
        const timeB = b.created_at?.toDate?.()?.getTime() || 0;
        return timeB - timeA;
      })[0] || null;
    },
    enabled: !!user,
  });

  // 2. Fetch ALL products from the global 'products' collection
  const { data: allProducts, isLoading } = useQuery({
    queryKey: ['global-products'],
    queryFn: async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "products"));
        const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        console.log("Fetched global products:", data.length);
        return data;
      } catch (err) {
        console.error("Products Fetch Error:", err);
        return [];
      }
    },
    initialData: [],
  });

  const userCondition = latestAnalysis?.skin_condition || 'normal';

  // Filter products based on search, type, and prioritize user's condition
  const filtered = allProducts.filter(p => {
    const matchesType = typeFilter === 'all' || p.type === typeFilter;
    const matchesSearch = p.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  }).sort((a, b) => {
    // Show products matching user's condition first
    if (a.condition === userCondition && b.condition !== userCondition) return -1;
    if (a.condition !== userCondition && b.condition === userCondition) return 1;
    return 0;
  });

  if (typeof Capacitor !== 'undefined' && Capacitor?.isNativePlatform?.()) {
    return (
      <div className="p-4 space-y-6 pb-24 animate-in fade-in slide-in-from-right-4 duration-500">
        <div className="px-1">
          <h1 className="text-2xl font-black text-foreground tracking-tight">Skincare Routine</h1>
          <p className="text-xs text-muted-foreground font-medium">Recommended for your {userCondition.replace('_', ' ')} skin</p>
        </div>

        {/* App Search Bar */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-14 pl-12 pr-4 rounded-2xl bg-card border border-border/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 shadow-sm"
          />
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-44 bg-card rounded-[2rem] animate-pulse border border-border/40" />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((p, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="p-5 rounded-[2rem] border border-border/40 shadow-sm bg-card flex flex-col gap-4">
                  <div className="flex justify-between items-start">
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                      <Sparkles className="w-6 h-6" />
                    </div>
                    <Badge className="bg-secondary/50 text-secondary-foreground text-[10px] font-bold px-3 py-1 rounded-full border-0">
                      {p.type?.toUpperCase() || 'PRODUCT'}
                    </Badge>
                  </div>

                  <div>
                    <h3 className="text-lg font-black leading-tight mb-1">{p.name}</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                      {p.description}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-border/40 flex items-center justify-between">
                    <span className="text-[10px] font-black text-primary uppercase tracking-widest italic">
                      {p.usage}
                    </span>
                    <div className="flex items-center gap-0.5 text-amber-500">
                      <Star className="w-3.5 h-3.5 fill-current" />
                      <span className="text-xs font-bold ml-0.5">4.9</span>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    );
  }

  const types = ['all', ...new Set(allProducts.map(p => p.type).filter(Boolean))];

  return (
    <div className="p-4 lg:p-8 pb-28 lg:pb-8 flex-1 bg-background select-none font-body flex justify-center">
      <div className="w-full max-w-4xl space-y-6">
        
        {/* Header Title */}
        <div>
          <span className="text-[10px] font-bold text-primary uppercase tracking-widest">Your Skincare Shelf</span>
          <h1 className="font-heading text-xl lg:text-2xl font-black text-foreground tracking-tight flex items-center gap-1.5 mt-0.5">
            <ShoppingBag className="w-5 h-5 text-primary" />
            Recommended Routine
          </h1>
          <p className="text-muted-foreground text-xs font-medium">
            AI-prescribed products matching your diagnosed skin needs
          </p>
        </div>

        {/* Pill Categories & Search */}
        <div className="space-y-4">
          {/* Search bar */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search active routines or products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-11 rounded-2xl border-border/50 bg-card/60 backdrop-blur-md text-xs placeholder:text-muted-foreground/60 focus-visible:ring-primary focus-visible:ring-1"
            />
          </div>

          {/* Horizontal category scroll pills */}
          {types.length > 1 && (
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1.5 select-none -mx-4 px-4">
              {types.map(t => {
                const isActive = typeFilter === t;
                return (
                  <button
                    key={t}
                    onClick={() => setTypeFilter(t)}
                    className={`px-4 py-1.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider border transition-all flex-shrink-0
                      ${isActive
                        ? 'bg-primary border-primary text-primary-foreground shadow-sm shadow-primary/25'
                        : 'bg-card/60 border-border/40 hover:border-border/80 text-muted-foreground hover:text-foreground'}`}
                  >
                    {t === 'all' ? 'All Routine Types' : t}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {isLoading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="p-4 rounded-3xl"><Skeleton className="h-32 w-full" /></Card>
            ))}
          </div>
        ) : filtered.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((p, i) => {
              const isNight = p.usage?.toLowerCase().includes('night');
              const isMorning = p.usage?.toLowerCase().includes('morning') || p.usage?.toLowerCase().includes('daily') || p.usage?.toLowerCase().includes('twice');
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  whileHover={{ y: -3 }}
                >
                  <Card className="p-4 border border-border/50 shadow-sm hover:shadow-md transition-all duration-300 rounded-[1.8rem] bg-card/60 backdrop-blur-md flex flex-col justify-between h-full relative overflow-hidden">
                    <div className="space-y-3.5">
                      {/* Product Header timing & badge */}
                      <div className="flex justify-between items-start gap-2">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                          <Sparkles className="w-4.5 h-4.5" />
                        </div>
                        
                        <div className="flex items-center gap-1.5">
                          {isMorning && (
                            <span className="p-1 rounded-md bg-amber-500/10 text-amber-500 text-[10px] font-bold flex items-center gap-0.5">
                              <Sun className="w-3 h-3" /> AM
                            </span>
                          )}
                          {isNight && (
                            <span className="p-1 rounded-md bg-indigo-500/10 text-indigo-500 text-[10px] font-bold flex items-center gap-0.5">
                              <Moon className="w-3 h-3" /> PM
                            </span>
                          )}
                          {p.type && (
                            <Badge variant="secondary" className="text-[9px] uppercase px-1.5 py-0.5 rounded-full font-bold shadow-none">
                              {p.type}
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* Info body */}
                      <div className="space-y-1">
                        <h3 className="font-heading font-black text-foreground text-sm tracking-tight">{p.name}</h3>
                        <div className="flex items-center gap-0.5 text-amber-500">
                          {[...Array(5)].map((_, idx) => (
                            <Star key={idx} className="w-3 h-3 fill-current" />
                          ))}
                          <span className="text-[9px] text-muted-foreground font-semibold ml-1">4.9</span>
                        </div>
                        {p.condition && (
                          <Badge variant="outline" className="text-[9px] font-bold border-primary/20 text-primary">
                            Condition: {conditionLabels[p.condition] || p.condition}
                          </Badge>
                        )}
                        {p.description && (
                          <p className="text-xs text-muted-foreground leading-normal line-clamp-3 pt-1">
                            {p.description}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Routine instructions */}
                    {p.usage && (
                      <div className="border-t border-border/50 pt-2.5 mt-3">
                        <p className="text-[9px] text-primary/85 font-black uppercase tracking-wider italic">
                          Routine: {p.usage}
                        </p>
                      </div>
                    )}
                  </Card>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <Card className="p-12 text-center rounded-[2.5rem] border border-dashed border-border/80 bg-card/20">
            <ShoppingBag className="w-10 h-10 mx-auto text-muted-foreground/40 mb-3" />
            <h3 className="font-heading font-black text-sm text-foreground tracking-tight">No Prescriptions Matching Filter</h3>
            <p className="text-xs text-muted-foreground max-w-xs mx-auto mt-1">
              Complete skin scans first to register products on your skincare shelf.
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}

