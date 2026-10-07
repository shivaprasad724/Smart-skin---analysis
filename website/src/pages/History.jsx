import { useAuth } from '@/lib/AuthContext';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { History as HistoryIcon, ScanFace, Filter, Calendar, Image as ImageIcon, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { motion } from 'framer-motion';
import { format, isValid } from 'date-fns';
import { useState } from 'react';

const conditionLabels = {
  acne: 'Acne', pimples: 'Pimples', dry_skin: 'Dry Skin',
  oily_skin: 'Oily Skin', dark_spots: 'Dark Spots', normal: 'Normal Skin',
};

const severityColors = {
  none: 'bg-muted text-muted-foreground',
  mild: 'bg-secondary text-secondary-foreground',
  moderate: 'bg-accent text-accent-foreground',
  severe: 'bg-destructive/10 text-destructive',
};

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1616391182219-e080b4d1043a?q=80&w=300&auto=format&fit=crop';

export default function History() {
  const { user } = useAuth();
  const [conditionFilter, setConditionFilter] = useState('all');

  const { data: analyses, isLoading } = useQuery({
    queryKey: ['my-analyses-history', user?.uid],
    queryFn: async () => {
      if (!user?.uid) return [];
      try {
        console.log("Fetching history for UID:", user.uid);

        // Simple query first to avoid missing index issues initially
        const q = query(
          collection(db, "SkinAnalysis"),
          where("userId", "==", user.uid)
        );

        const querySnapshot = await getDocs(q);
        console.log("Found raw docs:", querySnapshot.size);

        const fetchedData = querySnapshot.docs.map(doc => {
          const d = doc.data();
          let date = new Date();

          if (d.created_at) {
            // Handle Firestore Timestamp or ISO string
            date = typeof d.created_at.toDate === 'function'
              ? d.created_at.toDate()
              : new Date(d.created_at);
          }

          return {
            id: doc.id,
            ...d,
            created_at: date
          };
        });

        // Manual sort by date descending
        const sortedData = fetchedData.sort((a, b) => {
          const timeA = a.created_at instanceof Date ? a.created_at.getTime() : 0;
          const timeB = b.created_at instanceof Date ? b.created_at.getTime() : 0;
          return timeB - timeA;
        });

        console.log("Final sorted history count:", sortedData.length);
        return sortedData;
      } catch (err) {
        console.error("History Page Error:", err);
        throw err;
      }
    },
    enabled: !!user?.uid,
    staleTime: 0, // Always refetch when opening the page
    initialData: [],
  });

  const filtered = (analyses || []).filter(
    (a) => conditionFilter === "all" || a.skin_condition === conditionFilter
  );

  const formatDateSafe = (dateVal) => {
    if (!dateVal || !isValid(new Date(dateVal)) || new Date(dateVal).getTime() <= 0) return '—';
    return format(new Date(dateVal), 'MMM d, yyyy');
  };

  if (typeof Capacitor !== 'undefined' && Capacitor?.isNativePlatform?.()) {
    return (
      <div className="p-4 space-y-6 pb-24 animate-in fade-in slide-in-from-left-4 duration-500">
        <div className="px-1">
          <h1 className="text-2xl font-black text-foreground tracking-tight flex items-center gap-2">
            <HistoryIcon className="w-6 h-6 text-primary" />
            Your Records
          </h1>
          <p className="text-xs text-muted-foreground font-medium">Found {filtered.length} clinical assessments</p>
        </div>

        {isLoading ? (
          <div className="space-y-3">
             {[...Array(3)].map((_, i) => <div key={i} className="h-28 bg-card rounded-3xl animate-pulse border border-border/40" />)}
          </div>
        ) : filtered.length > 0 ? (
          <div className="space-y-3">
            {filtered.map((a, i) => (
              <motion.div
                key={a.id}
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Link to={`/results?id=${a.id}`}>
                  <Card className="p-4 rounded-3xl border border-border/40 shadow-sm bg-card flex items-center gap-4 active:scale-[0.98] transition-all">
                    <div className="w-16 h-16 rounded-2xl bg-primary/5 flex items-center justify-center overflow-hidden border border-border/20">
                      {a.image_url ? (
                        <img src={a.image_url} className="w-full h-full object-cover" alt="Scan" />
                      ) : (
                        <ScanFace className="w-6 h-6 text-primary/40" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-0.5">{formatDateSafe(a.created_at)}</p>
                      <h3 className="text-lg font-black leading-tight capitalize">{a.skin_condition.replace('_', ' ')}</h3>
                      <div className="flex items-center gap-2 mt-1">
                         <Badge className={`text-[9px] px-2 py-0 border-0 ${severityColors[a.severity] || 'bg-muted'}`}>
                            {a.severity?.toUpperCase() || 'NORMAL'}
                         </Badge>
                         <span className="text-[10px] font-bold text-muted-foreground">{a.confidence}% Confidence</span>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground/30" />
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="py-20 text-center space-y-4">
             <ScanFace className="w-12 h-12 mx-auto text-muted-foreground/20" />
             <p className="text-sm font-bold text-muted-foreground">No scans in your history yet.</p>
             <Link to="/scanner">
                <Button className="rounded-full bg-primary text-primary-foreground font-black px-8">START SCAN</Button>
             </Link>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-8 pb-24 lg:pb-8 bg-slate-50/30 min-h-screen">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="font-heading text-2xl lg:text-3xl font-bold text-foreground flex items-center gap-2">
              <HistoryIcon className="w-7 h-7 text-primary" />
              Analysis History
            </h1>
            <p className="text-sm text-muted-foreground mt-1">Found {filtered.length} recent scans</p>
          </div>

          <div className="flex gap-3 items-center w-full sm:w-auto">
            <Select value={conditionFilter} onValueChange={setConditionFilter}>
              <SelectTrigger className="w-full sm:w-44 rounded-xl border-0 shadow-sm bg-white">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Filter results" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Conditions</SelectItem>
                {Object.entries(conditionLabels).map(([k, v]) => (
                  <SelectItem key={k} value={k}>{v}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* List */}
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="p-5 border-0 shadow-sm rounded-2xl"><Skeleton className="h-20 w-full" /></Card>
            ))}
          </div>
        ) : filtered.length > 0 ? (
          <div className="space-y-4">
            {filtered.map((a, i) => (
              <motion.div
                key={a.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Link to={`/results?id=${a.id}`}>
                  <Card className="p-5 border-0 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer rounded-2xl group relative overflow-hidden bg-white">
                    <div className="flex items-center gap-5 relative z-10">
                      <div className="w-20 h-20 rounded-2xl overflow-hidden bg-slate-100 flex items-center justify-center border border-slate-50 flex-shrink-0 shadow-inner">
                        {a.image_url ? (
                          <img
                            src={a.image_url}
                            alt="Skin Result"
                            className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-500"
                            loading="lazy"
                            onError={(e) => {
                              console.warn("History image failed to load:", a.image_url);
                              e.target.src = FALLBACK_IMAGE;
                            }}
                          />
                        ) : (
                          <ImageIcon className="w-8 h-8 text-slate-300" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-2">
                           <span className="font-bold text-slate-800 text-lg capitalize">
                              {conditionLabels[a.skin_condition] || a.skin_condition}
                           </span>
                           <Badge variant="outline" className="text-[10px] text-slate-400 font-normal border-slate-100">
                              #{a.id.slice(-4)}
                           </Badge>
                        </div>

                        <div className="flex flex-wrap items-center gap-3">
                           {a.severity && a.severity !== 'none' && (
                              <Badge className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-md shadow-none ${severityColors[a.severity]}`}>
                                {a.severity}
                              </Badge>
                           )}
                           <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                              <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                              {a.confidence || 0}% Accuracy
                           </div>
                           <div className="flex items-center gap-1.5 text-xs text-slate-400">
                              <Calendar className="w-3.5 h-3.5" />
                              {formatDateSafe(a.created_at)}
                           </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        ) : (
          <Card className="p-16 text-center border-0 shadow-sm rounded-3xl bg-white">
            <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
               <ImageIcon className="w-10 h-10 text-slate-300" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">No Records Yet</h3>
            <p className="text-slate-500 mb-2 max-w-xs mx-auto text-sm leading-relaxed">
              Your diagnostic history will appear here once you complete your first clinical skin scan.
            </p>
            <p className="text-[10px] text-slate-300 mb-8">
              User ID: {user?.uid || 'Not Logged In'}
            </p>
            <Link to="/scanner">
              <Button className="rounded-full px-8 h-12 shadow-lg shadow-primary/20">
                <ScanFace className="w-5 h-5 mr-2" />
                START FIRST SCAN
              </Button>
            </Link>
          </Card>
        )}
      </div>
    </div>
  );
}
