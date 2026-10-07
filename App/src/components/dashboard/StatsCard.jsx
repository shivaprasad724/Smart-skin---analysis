import { Card } from '@/components/ui/card';
import { motion } from 'framer-motion';

export default function StatsCard({ title, value, icon: Icon, color, subtitle }) {
  return (
    <motion.div
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      whileTap={{ scale: 0.98 }}
    >
      <Card className="p-4 rounded-3xl border border-border/50 shadow-sm hover:shadow-md transition-all duration-300 bg-card/60 backdrop-blur-md">
        <div className="flex justify-between items-start gap-2">
          <div className="space-y-1 flex-1 min-w-0">
            <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider truncate">{title}</p>
            <p className="text-xl font-heading font-black text-foreground tracking-tight truncate">{value}</p>
            {subtitle && (
              <span className="inline-block text-[10px] text-muted-foreground font-medium truncate">
                {subtitle}
              </span>
            )}
          </div>
          <div className={`p-2.5 rounded-2xl flex-shrink-0 flex items-center justify-center shadow-sm ${color}`}>
            <Icon className="w-4 h-4" />
          </div>
        </div>
      </Card>
    </motion.div>
  );
}