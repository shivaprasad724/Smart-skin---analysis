import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ScanFace, Sparkles, ShieldCheck, TrendingUp, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

const features = [
  {
    icon: ScanFace,
    title: 'AI Skin Analysis',
    description: 'Advanced CNN-powered detection of 6 skin conditions with high accuracy',
  },
  {
    icon: Sparkles,
    title: 'Smart Recommendations',
    description: 'Personalized cream and product suggestions based on your skin type',
  },
  {
    icon: ShieldCheck,
    title: 'Secure & Private',
    description: 'Your data is encrypted and never shared with third parties',
  },
  {
    icon: TrendingUp,
    title: 'Track Progress',
    description: 'Monitor your skin health over time with detailed history',
  },
];

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative px-4 pt-12 pb-20 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/20 pointer-events-none" />
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <Sparkles className="w-4 h-4" />
              AI-Powered Skin Analysis
            </div>

            <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-extrabold text-foreground leading-tight mb-6">
              Your Smart{' '}
              <span className="text-primary">Skin Analyzer</span>
              <br />& Cream Recommendation
            </h1>

            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8 font-body">
              Upload or capture your skin photo and get instant AI-powered analysis
              with personalized skincare product recommendations.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/scanner">
                <Button size="lg" className="rounded-full px-8 text-base shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all">
                  <ScanFace className="w-5 h-5 mr-2" />
                  Start Skin Scan
                </Button>
              </Link>
              <Link to="/history">
                <Button variant="outline" size="lg" className="rounded-full px-8 text-base">
                  View History
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </motion.div>

          {/* Illustration */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="mt-16 relative"
          >
            <div className="mx-auto max-w-md bg-card rounded-3xl border border-border shadow-2xl shadow-primary/10 p-6 relative">
              <div className="aspect-[4/3] rounded-2xl bg-gradient-to-br from-primary/10 via-secondary/30 to-accent/20 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center animate-pulse-glow">
                    <ScanFace className="w-12 h-12 text-primary" />
                  </div>
                  <p className="text-sm text-muted-foreground">AI-Powered Detection</p>
                  <div className="flex gap-2 justify-center mt-3 flex-wrap">
                    {['Acne', 'Dry Skin', 'Oily Skin', 'Dark Spots'].map(c => (
                      <span key={c} className="px-3 py-1 rounded-full bg-card border border-border text-xs font-medium text-foreground">
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="px-4 py-16 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-heading text-2xl md:text-3xl font-bold text-foreground mb-3">How It Works</h2>
            <p className="text-muted-foreground">Advanced AI technology for your skincare needs</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * i }}
              >
                <Card className="p-6 text-center hover:shadow-lg transition-shadow duration-300 h-full">
                  <div className="w-14 h-14 mx-auto rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                    <f.icon className="w-7 h-7 text-primary" />
                  </div>
                  <h3 className="font-heading font-semibold text-foreground mb-2">{f.title}</h3>
                  <p className="text-sm text-muted-foreground">{f.description}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 py-16 lg:px-8">
        <div className="max-w-3xl mx-auto text-center bg-gradient-to-r from-primary/10 via-primary/5 to-secondary/10 rounded-3xl p-10 border border-primary/10">
          <h2 className="font-heading text-2xl md:text-3xl font-bold text-foreground mb-4">
            Ready to Know Your Skin?
          </h2>
          <p className="text-muted-foreground mb-6">
            Get a comprehensive skin analysis in under 30 seconds with our AI.
          </p>
          <Link to="/scanner">
            <Button size="lg" className="rounded-full px-8">
              <ScanFace className="w-5 h-5 mr-2" />
              Analyze Now
            </Button>
          </Link>
        </div>
      </section>

      {/* Spacer for mobile bottom nav */}
      <div className="h-20 lg:h-0" />
    </div>
  );
}