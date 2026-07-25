import { cn } from "@/utils/cn";

interface SkeletonProps {
  className?: string;
  variant?: "text" | "circular" | "rectangular" | "card";
  width?: string | number;
  height?: string | number;
  lines?: number;
}

function SkeletonBase({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return <div className={cn("animate-pulse bg-charcoal-700/40 rounded-lg", className)} style={style} />;
}

export function Skeleton({ className, variant = "text", width, height, lines = 1 }: SkeletonProps) {
  const style: React.CSSProperties = { width: width || undefined, height: height || undefined };

  if (variant === "circular") {
    return <SkeletonBase className={cn("rounded-full", className)} style={{ width: width || 40, height: height || 40 }} />;
  }
  if (variant === "card") {
    return (
      <div className={cn("glass rounded-2xl p-4 md:p-6 space-y-4", className)}>
        <SkeletonBase className="h-4 w-3/4" />
        <SkeletonBase className="h-3 w-full" />
        <SkeletonBase className="h-3 w-5/6" />
        <div className="flex gap-2 pt-2">
          <SkeletonBase className="h-8 w-20 rounded-lg" />
          <SkeletonBase className="h-8 w-20 rounded-lg" />
        </div>
      </div>
    );
  }
  if (variant === "rectangular") return <SkeletonBase className={className} style={style} />;

  return (
    <div className={cn("space-y-2", className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <SkeletonBase key={i} className="h-3" style={{ width: i === lines - 1 && lines > 1 ? "75%" : "100%" }} />
      ))}
    </div>
  );
}
