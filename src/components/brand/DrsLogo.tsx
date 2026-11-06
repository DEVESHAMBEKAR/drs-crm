import React from 'react';
import Image from 'next/image';

interface DrsLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'full' | 'icon' | 'badge';
  invertInDark?: boolean;
}

export const DrsLogo: React.FC<DrsLogoProps> = ({
  className = '',
  size = 'md',
  variant = 'full',
  invertInDark = true,
}) => {
  const sizeMap = {
    sm: { img: 28, text: 'text-sm', sub: 'text-[9px]' },
    md: { img: 38, text: 'text-lg', sub: 'text-[10px]' },
    lg: { img: 52, text: 'text-xl', sub: 'text-xs' },
    xl: { img: 68, text: 'text-2xl', sub: 'text-xs' },
  };

  const { img, text, sub } = sizeMap[size];

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* Official DRS Geometric Monogram Logo */}
      <div 
        className="relative flex items-center justify-center rounded-xl bg-white dark:bg-black p-1.5 border border-neutral-300 dark:border-neutral-800 shadow-sm shrink-0 overflow-hidden"
        style={{ width: img + 12, height: img + 12 }}
      >
        <img
          src="/assets/drs-logo.jpg"
          alt="Deep Root Studios (DRS) Official Logo"
          className={`w-full h-full object-contain ${
            invertInDark ? 'dark:invert' : ''
          }`}
        />
      </div>

      {variant !== 'icon' && (
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5 leading-tight">
            <span className={`font-black tracking-tight text-black dark:text-white ${text}`}>
              DEEP ROOT
            </span>
            <span className={`font-light tracking-widest text-neutral-600 dark:text-neutral-400 ${text}`}>
              STUDIOS
            </span>
            {variant === 'badge' && (
              <span className="ml-1 px-1.5 py-0.5 text-[9px] font-mono font-bold bg-neutral-200 dark:bg-neutral-800 text-black dark:text-white rounded border border-neutral-300 dark:border-neutral-700">
                OPS
              </span>
            )}
          </div>
          <span className={`font-mono tracking-wider uppercase text-neutral-500 dark:text-neutral-400 ${sub} mt-0.5`}>
            End-to-End AI Operations
          </span>
        </div>
      )}
    </div>
  );
};
