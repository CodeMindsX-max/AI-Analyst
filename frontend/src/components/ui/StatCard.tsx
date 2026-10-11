import React from 'react';
import { Card } from './Card';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface StatCardProps {
  label: string;
  value: string;
  changePct: number;
  changeType?: 'positive' | 'negative' | 'neutral';
  previousLabel?: string;
  sparkline?: number[];
  icon?: React.ReactNode;
}

export function StatCard({ label, value, changePct, changeType = 'positive', previousLabel, sparkline, icon }: StatCardProps) {
  const isPositive = changeType === 'positive';
  const isNegative = changeType === 'negative';

  return (
    <Card className="hover:border-slate-300 transition-all p-5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">{label}</span>
        {icon && <div className="text-slate-400">{icon}</div>}
      </div>

      <div className="mt-2 flex items-baseline justify-between">
        <span className="text-2xl font-bold tracking-tight text-slate-900">{value}</span>
      </div>

      <div className="mt-3 flex items-center justify-between text-xs">
        <div
          className={cn(
            'inline-flex items-center font-medium gap-0.5 rounded px-1.5 py-0.5',
            isPositive && 'text-emerald-700 bg-emerald-50',
            isNegative && 'text-red-700 bg-red-50',
            !isPositive && !isNegative && 'text-slate-600 bg-slate-100'
          )}
        >
          {isPositive ? <ArrowUpRight className="w-3.5 h-3.5" /> : isNegative ? <ArrowDownRight className="w-3.5 h-3.5" /> : <Minus className="w-3.5 h-3.5" />}
          <span>{Math.abs(changePct).toFixed(1)}%</span>
        </div>
        {previousLabel && <span className="text-slate-400 truncate ml-2">{previousLabel}</span>}
      </div>

      {sparkline && sparkline.length > 1 && (
        <div className="mt-3 flex items-end gap-1 h-6 pt-1 border-t border-slate-100">
          {sparkline.map((val, idx) => {
            const min = Math.min(...sparkline);
            const max = Math.max(...sparkline);
            const heightPct = max === min ? 50 : Math.max(15, Math.round(((val - min) / (max - min)) * 100));
            return (
              <div
                key={idx}
                className={cn(
                  'flex-1 rounded-t transition-all',
                  isNegative ? 'bg-red-200 hover:bg-red-300' : 'bg-blue-200 hover:bg-blue-300'
                )}
                style={{ height: `${heightPct}%` }}
                title={`${val}`}
              />
            );
          })}
        </div>
      )}
    </Card>
  );
}
