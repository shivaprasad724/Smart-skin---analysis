import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { useQuery } from '@tanstack/react-query';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowLeft, ScanFace, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';
import ConditionCard from '@/components/results/ConditionCard';
import ProductRecommendation from '@/components/results/ProductRecommendation';
import AnalysisDetails from '@/components/results/AnalysisDetails';
import SkincareTips from '@/components/results/SkincareTips';
import { motion } from 'framer-motion';
import { format, isValid } from 'date-fns';

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1512290923902-8a9f81dc2069?q=80&w=1000&auto=format&fit=crop';

export default function Results() {
  const [searchParams] = useSearchParams();
  const analysisId = searchParams.get('id');

  const { data: analysis, isLoading } = useQuery({
    queryKey: ['analysis', analysisId],
    queryFn: async () => {
      if (!analysisId) return null;
      try {
        const docRef = doc(db, "SkinAnalysis", analysisId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          let date = new Date(0);
          if (data.created_at) {
            date = typeof data.created_at.toDate === 'function' ? data.created_at.toDate() : new Date(data.created_at);
          }
          return {
            id: docSnap.id,
            ...data,
            created_at: date
          };
        }
      } catch (err) {
        console.error("Results: Fetch error", err);
      }
      return null;
    },
    enabled: !!analysisId,
  });

  const formatDateSafe = (dateVal) => {
    if (!dateVal || !isValid(new Date(dateVal)) || new Date(dateVal).getTime() <= 0) return '—';
    return format(new Date(dateVal), 'MMMM d, yyyy • h:mm a');
  };

  if (isLoading) {
    return (
      <div className="p-4 lg:p-8 max-w-3xl mx-auto space-y-6 pb-24 lg:pb-8">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-48 w-full rounded-xl" />
        <Skeleton className="h-32 w-full rounded-xl" />
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="p-4 lg:p-8 flex flex-col items-center justify-center min-h-[60vh]">
        <ScanFace className="w-16 h-16 text-muted-foreground mb-4" />
        <h2 className="font-heading text-xl font-semibold text-foreground mb-2">Analysis Not Found</h2>
        <p className="text-muted-foreground mb-6 text-sm">The analysis you're looking for doesn't exist.</p>
        <Link to="/scanner">
          <Button className="rounded-full">
            <ScanFace className="w-4 h-4 mr-2" />
            New Scan
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-8 pb-28 lg:pb-8 flex-1 bg-background select-none font-body flex justify-center">
      <div className="w-full max-w-3xl space-y-6">
        {/* Header navigation bar */}
        <div className="flex items-center justify-between">
          <Link to="/history" className="inline-flex items-center gap-1 text-xs font-bold text-muted-foreground hover:text-primary transition-colors uppercase tracking-wider">
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to history
          </Link>
          <span className="inline-block bg-muted/60 text-muted-foreground text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
            Report: {formatDateSafe(analysis.created_at)}
          </span>
        </div>

        <div className="space-y-1">
          <span className="text-[10px] font-bold text-primary uppercase tracking-widest">Dermatology analysis</span>
          <h1 className="font-heading text-xl lg:text-2xl font-black text-foreground tracking-tight">Clinical Diagnosis</h1>
        </div>

        {/* Image & Condition Card side by side */}
        <div className="grid md:grid-cols-2 gap-6">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
            <Card className="overflow-hidden aspect-square bg-muted border border-border/50 rounded-[2rem] shadow-sm relative flex items-center justify-center">
              <img
                src={analysis.image_url || FALLBACK_IMAGE}
                alt="Analyzed skin"
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = FALLBACK_IMAGE;
                }}
              />
              {/* Scan target viewfinder element overlay */}
              <div className="absolute inset-4 rounded-[1.5rem] border border-white/20 pointer-events-none" />
            </Card>
          </motion.div>

          <div className="space-y-4">
            <ConditionCard
              condition={analysis.skin_condition}
              confidence={analysis.confidence}
              severity={analysis.severity}
            />
            <AnalysisDetails details={analysis.analysis_details} />
          </div>
        </div>

        {/* Product Recommendations Section */}
        {analysis.recommended_products?.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="space-y-3">
            <h3 className="font-heading font-black text-sm text-foreground tracking-tight uppercase tracking-wider">
              Recommended Routine Compounds
            </h3>
            <div className="grid sm:grid-cols-2 gap-3">
              {analysis.recommended_products.map((p, i) => (
                <ProductRecommendation key={i} product={p} index={i} />
              ))}
            </div>
          </motion.div>
        )}

        {/* Clinical Tips */}
        <SkincareTips tips={analysis.skincare_tips} />

        {/* Actions panel */}
        <div className="flex gap-3 pt-2">
          <Link to="/scanner" className="flex-1">
            <Button variant="outline" className="w-full rounded-2xl h-12 text-xs font-bold border-border/60 hover:bg-muted shadow-sm active:scale-95 transition-all">
              <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
              New scan
            </Button>
          </Link>
          <Link to="/" className="flex-1">
            <Button className="w-full rounded-2xl h-12 text-xs font-bold bg-primary text-white hover:bg-primary/95 shadow-md shadow-primary/10 active:scale-95 transition-all">
              Go to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
