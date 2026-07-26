import React from 'react';
import { motion } from 'framer-motion';

interface HeatmapProps {
  taskHistory: Record<string, number>; // Date string keys (YYYY-MM-DD) -> complete count
}

export const StudyHeatmap: React.FC<HeatmapProps> = ({ taskHistory }) => {
  // Generate tracking boxes for the last 12 weeks
  const totalDays = 84; 
  const days = Array.from({ length: totalDays }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (totalDays - 1 - i));
    const dateStr = d.toISOString().split('T')[0];
    const count = taskHistory[dateStr] || 0;
    return { date: d, dateStr, count };
  });

  const getColorClass = (count: number) => {
    if (count === 0) return 'bg-slate-100 dark:bg-slate-800/60';
    if (count <= 2) return 'bg-emerald-200 dark:bg-emerald-900/40 text-emerald-800';
    if (count <= 4) return 'bg-emerald-400 dark:bg-emerald-700/70';
    return 'bg-emerald-600 dark:bg-emerald-500';
  };

  return (
    <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 backdrop-blur-xl">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h4 className="text-sm font-semibold text-slate-900 dark:text-white">Consistency Matrix</h4>
          <p className="text-xs text-slate-400">Your daily target execution map</p>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
          <span>Less</span>
          <div className="w-2.5 h-2.5 rounded bg-slate-100 dark:bg-slate-800" />
          <div className="w-2.5 h-2.5 rounded bg-emerald-200 dark:bg-emerald-900/40" />
          <div className="w-2.5 h-2.5 rounded bg-emerald-400" />
          <div className="w-2.5 h-2.5 rounded bg-emerald-600" />
          <span>More</span>
        </div>
      </div>

      <div className="grid grid-flow-col grid-rows-7 gap-1.5 justify-start overflow-x-auto py-2 custom-scrollbar">
        {days.map((day, idx) => (
          <motion.div
            key={day.dateStr}
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: idx * 0.003 }}
            whileHover={{ scale: 1.3, zIndex: 10 }}
            className={`w-3.5 h-3.5 rounded-sm transition-colors duration-200 cursor-pointer ${getColorClass(day.count)}`}
            title={`${day.date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}: ${day.count} tasks completed`}
          />
        ))}
      </div>
    </div>
  );
};