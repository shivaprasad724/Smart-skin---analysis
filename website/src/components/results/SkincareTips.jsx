import { Card } from '@/components/ui/card';
import { Lightbulb, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function SkincareTips({ tips }) {
  if (!tips || tips.length === 0) return null;

  return (
    <Card className="p-5 border border-border/50 bg-card/60 backdrop-blur-md rounded-[2rem] shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <div className="p-1.5 rounded-xl bg-amber-500/10 text-amber-500">
          <Lightbulb className="w-4 h-4 animate-pulse" />
        </div>
        <h3 className="font-heading font-black text-sm text-foreground tracking-tight">Clinical Routine Tips</h3>
      </div>
      <div className="space-y-3.5">
        {tips.map((tip, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.06 }}
            className="flex items-start gap-2.5"
          >
            <div className="text-primary flex-shrink-0 mt-0.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 fill-emerald-500/10" />
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed font-medium">{tip}</p>
          </motion.div>
        ))}
      </div>
    </Card>
  );
}