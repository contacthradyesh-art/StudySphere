"use client";
import { motion } from "framer-motion";
import { cn } from "@/utils/cn";

interface BarChartProps {
  data: Array<{ label: string; value: number; color?: string }>;
  maxValue?: number;
  height?: number;
  showLabels?: boolean;
  showValues?: boolean;
  className?: string;
}

export function BarChart({ data, maxValue, height = 120, showLabels = true, showValues = true, className }: BarChartProps) {
  const max = maxValue || Math.max(...data.map((d) => d.value), 1);
  return (
    <div className={cn("w-full", className)}>
      <div className="flex items-end gap-2" style={{ height }}>
        {data.map((item, index) => {
          const barHeight = (item.value / max) * 100;
          return (
            <div key={item.label} className="flex-1 flex flex-col items-center gap-1">
              {showValues && <span className="text-[10px] text-charcoal-400 font-medium">{item.value}</span>}
              <motion.div
                className="w-full rounded-t-md min-h-[4px]"
                style={{ backgroundColor: item.color || "#007edc" }}
                initial={{ height: 0 }} animate={{ height: `${barHeight}%` }}
                transition={{ duration: 0.6, delay: index * 0.05 }}
              />
            </div>
          );
        })}
      </div>
      {showLabels && (
        <div className="flex gap-2 mt-2">
          {data.map((item) => (
            <div key={item.label} className="flex-1 text-center">
              <span className="text-[10px] text-charcoal-500 truncate block">{item.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

interface DonutChartProps {
  segments: Array<{ label: string; value: number; color: string }>;
  size?: number;
  strokeWidth?: number;
  centerLabel?: string;
  centerValue?: string;
  className?: string;
}

export function DonutChart({ segments, size = 120, strokeWidth = 12, centerLabel, centerValue, className }: DonutChartProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const total = segments.reduce((sum, s) => sum + s.value, 0);
  let cumulativeOffset = 0;

  return (
    <div className={cn("relative inline-flex items-center justify-center", className)} style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="rgba(63, 65, 80, 0.3)" strokeWidth={strokeWidth} />
        {segments.map((segment, index) => {
          const segmentLength = total > 0 ? (segment.value / total) * circumference : 0;
          const rotation = (cumulativeOffset / total) * 360;
          cumulativeOffset += segment.value;
          return (
            <motion.circle
              key={segment.label} cx={size / 2} cy={size / 2} r={radius} fill="none"
              stroke={segment.color} strokeWidth={strokeWidth} strokeLinecap="round"
              strokeDasharray={`${segmentLength} ${circumference - segmentLength}`}
              style={{ transformOrigin: "center", transform: `rotate(${rotation}deg)` }}
              initial={{ strokeDasharray: `0 ${circumference}` }}
              animate={{ strokeDasharray: `${segmentLength} ${circumference - segmentLength}` }}
              transition={{ duration: 0.8, delay: index * 0.1 }}
            />
          );
        })}
      </svg>
      {(centerLabel || centerValue) && (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {centerValue && <span className="text-lg font-bold text-charcoal-50">{centerValue}</span>}
          {centerLabel && <span className="text-[10px] text-charcoal-400">{centerLabel}</span>}
        </div>
      )}
    </div>
  );
}

interface SparklineProps { data: number[]; color?: string; height?: number; className?: string; }

export function Sparkline({ data, color = "#007edc", height = 32, className }: SparklineProps) {
  if (data.length < 2) return null;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const width = 100;
  const step = width / (data.length - 1);
  const points = data.map((value, index) => {
    const x = index * step;
    const y = height - ((value - min) / range) * (height - 4) - 2;
    return `${x},${y}`;
  }).join(" ");

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className={cn("w-full", className)} style={{ height }} preserveAspectRatio="none">
      <polyline points={points} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
