import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { Sparkles, Sun, Moon, Star } from 'lucide-react';

export default function ProductRecommendation({ product, index }) {
  const isNight = product.usage?.toLowerCase().includes('night');
  const isMorning = product.usage?.toLowerCase().includes('morning') || product.usage?.toLowerCase().includes('daily') || product.usage?.toLowerCase().includes('twice');

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
      whileHover={{ y: -3 }}
      whileTap={{ scale: 0.98 }}
    >
      <Card className="p-4 border border-border/50 shadow-sm hover:shadow-md transition-all duration-300 rounded-[1.5rem] bg-card/50 backdrop-blur-md flex flex-col justify-between h-full relative overflow-hidden">
        <div className="space-y-3">
          {/* Header block with timing and type */}
          <div className="flex justify-between items-start gap-2">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
              <Sparkles className="w-5 h-5 animate-pulse" />
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
              {product.type && (
                <Badge variant="secondary" className="text-[9px] uppercase px-1.5 py-0.5 rounded-full font-bold shadow-none">
                  {product.type}
                </Badge>
              )}
            </div>
          </div>

          {/* Product details */}
          <div className="space-y-1">
            <h4 className="font-heading font-black text-foreground text-sm tracking-tight">{product.name}</h4>
            <div className="flex items-center gap-0.5 text-amber-500">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-3 h-3 fill-current" />
              ))}
              <span className="text-[10px] text-muted-foreground font-semibold ml-1">4.9 (Clinical check)</span>
            </div>
            {product.description && (
              <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3 pt-1">
                {product.description}
              </p>
            )}
          </div>
        </div>

        {/* Footer usage guideline */}
        {product.usage && (
          <div className="border-t border-border/50 pt-2.5 mt-3">
            <p className="text-[10px] text-primary/80 font-bold uppercase tracking-wider italic">
              Routine: {product.usage}
            </p>
          </div>
        )}
      </Card>
    </motion.div>
  );
}