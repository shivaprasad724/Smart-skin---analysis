import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';

const conditionInfo = {
  acne: { label: 'Acne Dermal flare', emoji: '🔴', color: 'text-rose-500', stroke: 'stroke-rose-500' },
  pimples: { label: 'Pimples/Blemishes', emoji: '⚫', color: 'text-orange-500', stroke: 'stroke-orange-500' },
  dry_skin: { label: 'Dehydrated Skin', emoji: '🏜️', color: 'text-amber-600', stroke: 'stroke-amber-500' },
  oily_skin: { label: 'Sebaceous Excess', emoji: '💧', color: 'text-blue-500', stroke: 'stroke-blue-500' },
  dark_spots: { label: 'Melanin Spots', emoji: '🟤', color: 'text-purple-600', stroke: 'stroke-purple-500' },
  normal: { label: 'Healthy/Normal Dermis', emoji: '✨', color: 'text-emerald-500', stroke: 'stroke-emerald-500' },
};

const severityColors = {
  mild: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20 dark:bg-emerald-500/20',
  moderate: 'bg-amber-500/10 text-amber-500 border-amber-500/20 dark:bg-amber-500/20',
  severe: 'bg-rose-500/10 text-rose-500 border-rose-500/20 dark:bg-rose-500/20',
};

export default function ConditionCard({ condition, confidence, severity }) {
  const info = conditionInfo[condition] || { label: condition, emoji: '🔬', color: 'text-primary', stroke: 'stroke-primary' };

  // Circular gauge config
  const radius = 50;
  const strokeWidth = 8;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (confidence / 100) * circumference;

  return (
    <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}>
      <Card className="p-6 text-center border border-border/50 bg-card/60 backdrop-blur-md rounded-[2rem] flex flex-col items-center">
        {/* SVG Circular Gauge */}
        <div className="relative w-36 h-36 flex items-center justify-center mb-4">
          <svg className="w-full h-full transform -rotate-90">
            {/* Background Track */}
            <circle
              cx="72"
              cy="72"
              r={radius}
              className="stroke-muted fill-transparent"
              strokeWidth={strokeWidth}
            />
            {/* Colored Active Arc */}
            <motion.circle
              cx="72"
              cy="72"
              r={radius}
              className={`fill-transparent ${info.stroke}`}
              strokeWidth={strokeWidth}
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset }}
              transition={{ duration: 1.2, ease: 'easeOut' }}
              strokeLinecap="round"
            />
          </svg>
          
          {/* Inner circle contents */}
          <div className="absolute flex flex-col items-center justify-center">
            <span className="text-3xl">{info.emoji}</span>
            <span className="text-xl font-black text-foreground mt-1">{confidence}%</span>
            <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">Accuracy</span>
          </div>
        </div>

        {/* Condition Label */}
        <div className="space-y-1">
          <h2 className={`text-lg font-heading font-black tracking-tight ${info.color}`}>{info.label}</h2>
          {severity && severity !== 'none' && (
            <Badge variant="outline" className={`text-[9px] uppercase font-extrabold tracking-wider px-2 py-0.5 rounded-full border ${severityColors[severity] || ''}`}>
              Severity: {severity}
            </Badge>
          )}
        </div>
      </Card>
    </motion.div>
  );
}