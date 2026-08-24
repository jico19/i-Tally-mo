import React, { useEffect, useState } from 'react';

export default function TotalBadge({ count = 0, size = 'md', className = '', variant = 'indigo' }) {
  const [bumping, setBumping] = useState(false);

  useEffect(() => {
    setBumping(true);
    const timer = setTimeout(() => setBumping(false), 220);
    return () => clearTimeout(timer);
  }, [count]);

  const sizeClasses = {
    sm: 'text-xs px-2.5 py-0.5 font-bold',
    md: 'text-sm px-3 py-1 font-bold',
    lg: 'text-lg px-4 py-1.5 font-black',
    hero: 'text-3xl sm:text-4xl px-5 py-2 font-black tracking-tight'
  };

  const variantClasses = {
    indigo: 'bg-indigo-50/80 text-indigo-700 border-indigo-200/80 ring-1 ring-indigo-500/10 shadow-xs',
    emerald: 'bg-emerald-50/80 text-emerald-700 border-emerald-200/80 ring-1 ring-emerald-500/10 shadow-xs',
    slate: 'bg-slate-100/90 text-slate-700 border-slate-200/80 shadow-xs',
    dark: 'bg-slate-900 text-white border-slate-800 shadow-md ring-1 ring-white/10'
  };

  return (
    <span
      className={`inline-flex items-center justify-center rounded-full border tabular-nums transition-transform duration-150 ${bumping ? 'scale-110' : 'scale-100'} ${sizeClasses[size] || sizeClasses.md} ${variantClasses[variant] || variantClasses.indigo} ${className}`}
    >
      {Number(count).toLocaleString()}
    </span>
  );
}
