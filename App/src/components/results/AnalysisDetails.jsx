import { Card } from '@/components/ui/card';
import { Droplets, Eye, Sun, Layers } from 'lucide-react';
import { motion } from 'framer-motion';

const detailIcons = {
  texture: Layers,
  hydration: Droplets,
  pores: Eye,
  pigmentation: Sun,
};

export default function AnalysisDetails({ details }) {
  if (!details) return null;

  const entries = Object.entries(details).filter(([, v]) => v);

  return (
    <div className="grid grid-cols-2 gap-3">
      {entries.map(([key, value], i) => {
        const Icon = detailIcons[key] || Layers;
        return (
          <motion.div
            key={key}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            whileHover={{ scale: 1.01 }}
          >
            <Card className="p-3.5 border border-border/50 bg-card/60 backdrop-blur-md rounded-2xl">
              <div className="flex items-center gap-1.5 mb-1.5">
                <div className="p-1 rounded-lg bg-primary/10 text-primary">
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                  {key}
                </span>
              </div>
              <p className="text-xs font-black text-foreground capitalize tracking-tight">{value}</p>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
}