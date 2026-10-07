import { useAuth } from '@/lib/AuthContext';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { ScanFace, Activity, ShoppingBag, TrendingUp, ArrowRight, Sparkles, ChevronRight, RefreshCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import StatsCard from '@/components/dashboard/StatsCard';
import RecentAnalysisCard from '@/components/dashboard/RecentAnalysisCard';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { format, isValid } from 'date-fns';
import { motion } from 'framer-motion';
import { useNativeApp } from '@/hooks/useNativeApp';

export default function Dashboard() {
  const { user } = useAuth();
  const { triggerHaptic, showToast } = useNativeApp();

  const { data: analyses, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['my-analyses', user?.uid],
    queryFn: async () => {
      if (!user?.uid) return [];
      try {
        const q = query(
          collection(db, "SkinAnalysis"),
          where("userId", "==", user.uid)
        );
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => {
          const d = doc.data();
          let date = new Date(0);
          if (d.created_at) {
            date = typeof d.created_at.toDate === 'function' ? d.created_at.toDate() : new Date(d.created_at);
          }
          return {
            id: doc.id,
            ...d,
            created_at: date
          };
        }).sort((a, b) => b.created_at.getTime() - a.created_at.getTime());
      } catch (err) {
        console.error("Dashboard: Fetch error", err);
        return [];
      }
    },
    initialData: [],
    enabled: !!user,
  });

  const handleRefresh = async () => {
    triggerHaptic();
    await refetch();
    showToast("Dashboard updated");
  };

  const totalScans = analyses.length;
  const avgConfidence = totalScans > 0
    ? Math.round(analyses.reduce((s, a) => s + (a.confidence || 0), 0) / totalScans)
    : 0;

  const conditionCounts = {};
  analyses.forEach(a => {
    if (a.skin_condition) {
      conditionCounts[a.skin_condition] = (conditionCounts[a.skin_condition] || 0) + 1;
    }
  });
  const mostCommon = Object.entries(conditionCounts).sort((a, b) => b[1] - a[1])[0];

  // Chart data: scans per month
  const chartData = [];
  const months = {};
  analyses.forEach(a => {
    if (isValid(a.created_at) && a.created_at.getTime() > 0) {
      const m = format(a.created_at, 'MMM yyyy');
      months[m] = (months[m] || 0) + 1;
    }
  });
  Object.entries(months).reverse().forEach(([month, count]) => {
    chartData.push({ month, scans: count });
  });

  const firstName = user?.displayName
    ? user.displayName.split(' ')[0]
    : user?.email?.split('@')[0]?.replace(/[0-9]/g, '')?.split(/[\._]/)[0] || 'there';

  const recentAnalyses = analyses.slice(0, 4);
  const latestResultId = analyses[0]?.id;

  const getGreeting = () => {
    const hrs = new Date().getHours();
    if (hrs < 12) return 'Good morning 🌅';
    if (hrs < 17) return 'Good afternoon ☀️';
    return 'Good evening 🌆';
  };

  if (typeof Capacitor !== 'undefined' && Capacitor?.isNativePlatform?.()) {
    return (
      <div className="p-4 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
        {/* Native App Dashboard Header */}
        <div className="flex justify-between items-center px-1">
          <div>
            <h1 className="text-2xl font-black text-foreground tracking-tight">
              {getGreeting().split(' ')[1]}, {firstName}
            </h1>
            <p className="text-xs text-muted-foreground font-medium">Your skin health summary</p>
          </div>
          <button
            onClick={handleRefresh}
            className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${isRefetching ? 'bg-primary/20 text-primary' : 'bg-card border border-border/50 shadow-sm text-muted-foreground'}`}
          >
            <RefreshCcw className={`w-5 h-5 ${isRefetching ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Native Featured Card */}
        <Card className="relative overflow-hidden border-0 bg-primary text-primary-foreground p-6 rounded-[2rem] shadow-xl shadow-primary/20">
          <div className="relative z-10 space-y-4">
             <div className="bg-white/20 w-fit px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest">
                AI Diagnostic Active
             </div>
             <h2 className="text-2xl font-black leading-tight">Ready for your daily skin check?</h2>
             <Link to="/scanner" className="block pt-2">
                <Button className="w-full h-14 rounded-2xl bg-white text-primary font-black shadow-lg">
                   START NEW SCAN
                </Button>
             </Link>
          </div>
          <Sparkles className="absolute -right-6 -bottom-6 w-32 h-32 opacity-10 rotate-12" />
        </Card>

        {/* Stats Grid - App Style */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-card border border-border/40 p-4 rounded-3xl space-y-1">
            <ScanFace className="w-5 h-5 text-primary mb-2" />
            <p className="text-2xl font-black">{totalScans}</p>
            <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-tighter">Total Scans</p>
          </div>
          <div className="bg-card border border-border/40 p-4 rounded-3xl space-y-1">
            <Activity className="w-5 h-5 text-emerald-500 mb-2" />
            <p className="text-2xl font-black">{avgConfidence}%</p>
            <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-tighter">AI Accuracy</p>
          </div>
        </div>

        {/* Recent Section - App Style */}
        <div className="space-y-4 pt-2">
          <div className="flex justify-between items-center px-1">
            <h3 className="font-black text-lg">Recent Reports</h3>
            <Link to="/history" className="text-primary text-xs font-bold uppercase tracking-widest">View All</Link>
          </div>

          {recentAnalyses.length > 0 ? (
            <div className="space-y-3">
              {recentAnalyses.map(a => (
                <RecentAnalysisCard key={a.id} analysis={a} />
              ))}
            </div>
          ) : (
            <div className="p-8 text-center bg-muted/30 rounded-3xl border border-dashed border-border/60">
              <p className="text-xs text-muted-foreground">No records saved yet.</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // WEBPAGE DASHBOARD (Remains the same as previous modern web design)
  return (
    <div className="p-4 lg:p-8 space-y-6 pb-28 lg:pb-8 flex-1 bg-background select-none font-body">
      {/* Dynamic Time Welcome Header */}
      <div className="flex justify-between items-center">
        <div>
          <span className="text-[10px] font-bold text-primary uppercase tracking-widest">{getGreeting()}</span>
          <h1 className="font-heading text-2xl lg:text-3xl font-black text-foreground tracking-tight mt-0.5">
            Hello, {firstName}
          </h1>
          <p className="text-muted-foreground text-xs mt-0.5">Here's your skin health status</p>
        </div>
        <button
          onClick={handleRefresh}
          className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${isRefetching ? 'bg-primary/20 text-primary' : 'bg-muted/40 text-muted-foreground hover:bg-muted/80'}`}
        >
          <RefreshCcw className={`w-4 h-4 ${isRefetching ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Main Hero Widget */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-blue-600 to-indigo-700 p-6 text-white shadow-xl shadow-primary/20">
          {/* Decorative shapes */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-44 h-44 bg-sky-400/20 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 space-y-4 max-w-md">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-[10px] font-bold tracking-wider uppercase text-sky-200">
              <Sparkles className="w-3.5 h-3.5 animate-pulse" />
              AI Skin Analysis Engine
            </div>
            
            <div className="space-y-1">
              <h2 className="text-xl font-black font-heading tracking-tight leading-tight">
                Scan & Recommendation
              </h2>
              <p className="text-xs text-sky-100 font-medium leading-relaxed">
                Take a quick selfie or upload a skin photo. The AI will scan your skin conditions and outline a tailored skincare routine.
              </p>
            </div>

            <Link to="/scanner" className="inline-block pt-1">
              <Button className="rounded-full bg-white text-primary hover:bg-sky-50 shadow-md font-bold text-xs px-5 py-5 active:scale-95 transition-all">
                <ScanFace className="w-4 h-4 mr-2" />
                Start Diagnostic Scan
              </Button>
            </Link>
          </div>
        </div>
      </motion.div>

      {/* Quick Access to Latest Scan */}
      {latestResultId && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ delay: 0.1 }}
          className="mb-2"
        >
          <Link to={`/results?id=${latestResultId}`}>
            <div className="bg-primary/5 dark:bg-primary/10 border border-primary/15 rounded-2xl p-3 flex items-center justify-between group hover:bg-primary/10 transition-all">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                  <ScanFace className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-foreground">View Latest Scan Results</p>
                  <p className="text-[10px] text-muted-foreground">
                    Analyzed on {format(analyses[0].created_at, 'MMM d, yyyy • h:mm a')}
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-primary group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        </motion.div>
      )}

      {/* Stats Section */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <h3 className="font-heading font-extrabold text-sm text-foreground tracking-tight">Health Metrics</h3>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="p-4 rounded-3xl"><Skeleton className="h-16 w-full" /></Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <StatsCard
              title="Total Diagnostics"
              value={totalScans}
              icon={ScanFace}
              color="bg-primary/10 text-primary dark:bg-primary/20"
              subtitle="All time scans"
            />
            <StatsCard
              title="Avg Confidence"
              value={`${avgConfidence}%`}
              icon={Activity}
              color="bg-secondary text-secondary-foreground dark:bg-emerald-500/20 dark:text-emerald-300"
              subtitle="AI assessment score"
            />
            <StatsCard
              title="Primary Condition"
              value={mostCommon ? mostCommon[0].replace('_', ' ') : '—'}
              icon={TrendingUp}
              color="bg-amber-500/10 text-amber-500 dark:bg-amber-500/20"
              subtitle={mostCommon ? `${mostCommon[1]} detections` : 'None'}
            />
            <StatsCard
              title="Routine Creams"
              value={analyses.reduce((s, a) => s + (a.recommended_products?.length || 0), 0)}
              icon={ShoppingBag}
              color="bg-indigo-500/10 text-indigo-500 dark:bg-indigo-500/20"
              subtitle="Total recommendations"
            />
          </div>
        )}
      </div>

      {/* Two Column Grid: Charts + History */}
      <div className="grid lg:grid-cols-5 gap-6">
        {/* Chart Card */}
        <Card className="lg:col-span-3 p-4 rounded-3xl border border-border/50 bg-card/40 backdrop-blur-md">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-4 h-4 text-primary" />
            <h3 className="font-heading font-extrabold text-sm text-foreground tracking-tight">Scan Activity History</h3>
          </div>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={chartData} margin={{ left: -25, right: 10, top: 10, bottom: 0 }}>
                <defs>
                  <linearGradient id="scanGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ fontSize: 11, borderRadius: 12 }} />
                <Area
                  type="monotone"
                  dataKey="scans"
                  stroke="hsl(var(--primary))"
                  fill="url(#scanGrad)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[200px] flex flex-col items-center justify-center text-muted-foreground text-xs gap-2">
              <Activity className="w-8 h-8 text-muted-foreground/30 animate-pulse" />
              <span>No diagnostics history found.</span>
            </div>
          )}
        </Card>

        {/* Recent Analyses list */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex justify-between items-center">
            <h3 className="font-heading font-extrabold text-sm text-foreground tracking-tight">Recent Diagnoses</h3>
            <Link to="/history" className="text-[10px] font-bold text-primary hover:underline flex items-center gap-0.5 uppercase tracking-wider">
              All <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {isLoading ? (
            <div className="space-y-2">
              {[...Array(3)].map((_, i) => (
                <Card key={i} className="p-4 rounded-2xl"><Skeleton className="h-12 w-full" /></Card>
              ))}
            </div>
          ) : recentAnalyses.length > 0 ? (
            <div className="space-y-2.5">
              {recentAnalyses.map(a => (
                <RecentAnalysisCard key={a.id} analysis={a} />
              ))}
            </div>
          ) : (
            <Card className="p-6 text-center rounded-3xl border border-dashed border-border/80 bg-card/20">
              <ScanFace className="w-8 h-8 mx-auto text-muted-foreground/40 mb-2" />
              <p className="text-xs text-muted-foreground mb-3 font-medium">No skin reports saved</p>
              <Link to="/scanner">
                <Button variant="outline" className="rounded-full text-xs h-9 px-4" size="sm">Start First Scan</Button>
              </Link>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

