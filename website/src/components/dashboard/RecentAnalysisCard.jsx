import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format, isValid } from 'date-fns';
import { Link } from 'react-router-dom';
import { ChevronRight, Image as ImageIcon } from 'lucide-react';
import { motion } from 'framer-motion';

const conditionLabels = {
  acne: 'Acne',
  pimples: 'Pimples',
  dry_skin: 'Dry Skin',
  oily_skin: 'Oily Skin',
  dark_spots: 'Dark Spots',
  normal: 'Normal Skin',
};

const severityColors = {
  mild: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20 dark:bg-emerald-500/20',
  moderate: 'bg-amber-500/10 text-amber-500 border-amber-500/20 dark:bg-amber-500/20',
  severe: 'bg-rose-500/10 text-rose-500 border-rose-500/20 dark:bg-rose-500/20',
};

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1616391182219-e080b4d1043a?q=80&w=300&auto=format&fit=crop';

export default function RecentAnalysisCard({ analysis }) {
  const date = analysis.created_at || analysis.created_date;
  const formattedDate = date && isValid(new Date(date)) && new Date(date).getTime() > 0
    ? format(new Date(date), 'MMM d, yyyy')
    : '—';

  return (
    <motion.div
      whileHover={{ scale: 1.01, y: -2 }}
      whileTap={{ scale: 0.99 }}
      transition={{ duration: 0.2 }}
    >
      <Link to={`/results?id=${analysis.id}`}>
        <Card className="p-3.5 border border-border/50 hover:border-primary/30 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer rounded-2xl group bg-card/60 backdrop-blur-md">
          <div className="flex items-center gap-3.5">
            {/* Thumbnail preview */}
            <div className="w-14 h-14 rounded-2xl overflow-hidden bg-muted flex items-center justify-center border border-border/30 flex-shrink-0 relative">
              {analysis.image_url ? (
                <img
                  src={analysis.image_url}
                  alt="Skin Preview"
                  className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-500"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = FALLBACK_IMAGE;
                  }}
                />
              ) : (
                <ImageIcon className="w-5 h-5 text-muted-foreground/30" />
              )}
            </div>

            {/* Analysis details */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <p className="font-heading font-extrabold text-foreground text-sm truncate capitalize">
                  {conditionLabels[analysis.skin_condition] || analysis.skin_condition}
                </p>
                {analysis.severity && analysis.severity !== 'none' && (
                  <Badge variant="outline" className={`text-[9px] uppercase px-1.5 py-0.5 rounded-full font-extrabold border ${severityColors[analysis.severity] || ''}`}>
                    {analysis.severity}
                  </Badge>
                )}
              </div>

              <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-bold tracking-wide">
                <span className="text-primary">{analysis.confidence || 0}% Accuracy</span>
                <span>•</span>
                <span>{formattedDate}</span>
              </div>
            </div>

            {/* Navigation indicator */}
            <div className="w-7 h-7 rounded-full bg-muted/60 flex items-center justify-center group-hover:bg-primary/10 transition-all">
              <ChevronRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
          </div>
        </Card>
      </Link>
    </motion.div>
  );
}

