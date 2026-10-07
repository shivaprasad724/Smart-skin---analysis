import React from "react";
import { Fingerprint } from "lucide-react";

export default function AuthLayout({ icon: Icon, title, subtitle, footer, children }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-mesh-gradient-light dark:bg-mesh-gradient px-4 font-body transition-colors duration-500 select-none">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          {/* Logo container */}
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-[1.8rem] bg-gradient-to-tr from-primary to-sky-500 text-primary-foreground shadow-lg shadow-primary/20 animate-pulse-glow">
            <Icon className="w-7 h-7" aria-hidden="true" />
          </div>
          <div className="space-y-0.5">
            <h1 className="text-2xl font-black font-heading tracking-tight text-foreground">{title}</h1>
            {subtitle && <p className="text-xs text-muted-foreground font-semibold">{subtitle}</p>}
          </div>
        </div>

        {/* Input container overlay */}
        <div className="bg-card/55 backdrop-blur-xl border border-border/40 dark:border-slate-800/40 rounded-[2.5rem] shadow-2xl p-6 md:p-8 space-y-5">
          {children}

          {/* Premium biometric visual indicator */}
          <div className="flex flex-col items-center justify-center pt-4 border-t border-border/30 gap-2">
            <button className="w-12 h-12 rounded-full border border-border/60 dark:border-slate-800/60 flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/50 transition-all active:scale-95">
              <Fingerprint className="w-6 h-6 animate-pulse" />
            </button>
            <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Or Use Biometric ID</span>
          </div>
        </div>

        {footer && (
          <p className="text-center text-xs text-muted-foreground font-bold tracking-wide">{footer}</p>
        )}
      </div>
    </div>
  );
}

