import { motion } from 'framer-motion';
import { ScanFace, Sparkles, FlaskConical, CheckCircle2 } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

const steps = [
  { label: 'Preprocessing Image', icon: ScanFace, description: 'Enhancing and normalizing...' },
  { label: 'AI Analysis', icon: FlaskConical, description: 'Running CNN model...' },
  { label: 'Generating Results', icon: Sparkles, description: 'Preparing recommendations...' },
  { label: 'Complete', icon: CheckCircle2, description: 'Analysis ready!' },
];

export default function AnalysisProgress({ progress }) {
  const currentStep = Math.min(Math.floor(progress / 25), 3);

  return (
    <div className="space-y-8 py-8">
      <div className="text-center space-y-3">
        <motion.div
          animate={{ rotate: progress < 100 ? 360 : 0 }}
          transition={{ repeat: progress < 100 ? Infinity : 0, duration: 2, ease: 'linear' }}
          className="w-20 h-20 mx-auto rounded-full bg-primary/10 flex items-center justify-center animate-pulse-glow"
        >
          <ScanFace className="w-9 h-9 text-primary" />
        </motion.div>
        <h3 className="font-heading font-semibold text-lg text-foreground">Analyzing Your Skin</h3>
        <p className="text-sm text-muted-foreground">Our AI is examining your skin...</p>
      </div>

      <Progress value={progress} className="h-2" />

      <div className="space-y-3">
        {steps.map((step, i) => {
          const done = i < currentStep;
          const active = i === currentStep;
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: i <= currentStep ? 1 : 0.4, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`flex items-center gap-3 p-3 rounded-xl transition-colors
                ${active ? 'bg-primary/5 border border-primary/20' : done ? 'bg-secondary/50' : ''}`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center
                ${done ? 'bg-primary text-primary-foreground' : active ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'}`}>
                <step.icon className="w-4 h-4" />
              </div>
              <div>
                <p className={`text-sm font-medium ${active ? 'text-foreground' : done ? 'text-foreground' : 'text-muted-foreground'}`}>
                  {step.label}
                </p>
                <p className="text-xs text-muted-foreground">{step.description}</p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}