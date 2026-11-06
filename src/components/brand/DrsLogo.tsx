import React from 'react';

interface DrsLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'full' | 'icon' | 'badge';
  theme?: 'dark' | 'light' | 'auto';
}

export const DrsLogo: React.FC<DrsLogoProps> = ({
  className = '',
  size = 'md',
  variant = 'full',
}) => {
  const sizeMap = {
    sm: { icon: 24, text: 'text-base', sub: 'text-[9px]' },
    md: { icon: 32, text: 'text-xl', sub: 'text-[11px]' },
    lg: { icon: 44, text: 'text-2xl', sub: 'text-xs' },
    xl: { icon: 60, text: 'text-3xl', sub: 'text-sm' },
  };

  const { icon, text, sub } = sizeMap[size];

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* High-tech DRS Neural Root Emblem */}
      <div 
        className="relative flex items-center justify-center rounded-xl bg-gradient-to-br from-teal-950 via-slate-900 to-black p-2 border border-teal-500/30 shadow-lg shadow-teal-500/10 group"
        style={{ width: icon + 16, height: icon + 16 }}
      >
        <svg
          width={icon}
          height={icon}
          viewBox="0 0 64 64"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="transition-transform duration-300 group-hover:scale-105"
        >
          <defs>
            <linearGradient id="drs-emerald-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#2dd4bf" />
              <stop offset="50%" stopColor="#14b8a6" />
              <stop offset="100%" stopColor="#0f766e" />
            </linearGradient>
            <linearGradient id="drs-glow-grad" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#5eead4" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#0d9488" stopOpacity="0.2" />
            </linearGradient>
          </defs>
          
          {/* Deep Root Network: Algorithmic tree roots */}
          <path
            d="M32 6V26M32 26C26 26 20 30 18 36C16 42 12 46 6 48M32 26C38 26 44 30 46 36C48 42 52 46 58 48M32 34V58M24 38L16 58M40 38L48 58"
            stroke="url(#drs-emerald-grad)"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Neural nodes on root branches */}
          <circle cx="32" cy="14" r="3.5" fill="#2dd4bf" className="animate-pulse" />
          <circle cx="32" cy="26" r="4.5" fill="#5eead4" />
          <circle cx="18" cy="36" r="3" fill="#2dd4bf" />
          <circle cx="46" cy="36" r="3" fill="#2dd4bf" />
          <circle cx="6" cy="48" r="2.5" fill="#14b8a6" />
          <circle cx="58" cy="48" r="2.5" fill="#14b8a6" />
          <circle cx="32" cy="58" r="3" fill="#0d9488" />
          <circle cx="16" cy="58" r="2.5" fill="#0d9488" />
          <circle cx="48" cy="58" r="2.5" fill="#0d9488" />
        </svg>
      </div>

      {variant !== 'icon' && (
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className={`font-black tracking-tight text-slate-900 dark:text-white ${text}`}>
              DEEP ROOT
            </span>
            <span className={`font-black tracking-tight text-teal-600 dark:text-teal-400 ${text}`}>
              STUDIOS
            </span>
            {variant === 'badge' && (
              <span className="ml-1.5 px-1.5 py-0.5 text-[10px] font-semibold bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20 rounded">
                OPS
              </span>
            )}
          </div>
          <span className={`font-medium tracking-wider uppercase text-slate-500 dark:text-slate-400 ${sub}`}>
            AI Operations & Automation
          </span>
        </div>
      )}
    </div>
  );
};

