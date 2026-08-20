export function formatDate(date: Date, style: "short" | "long" | "relative" = "short"): string {
  if (style === "relative") return getRelativeTime(date);
  const options: Intl.DateTimeFormatOptions =
    style === "long"
      ? { year: "numeric", month: "long", day: "numeric" }
      : { year: "numeric", month: "short", day: "numeric" };
  return new Intl.DateTimeFormat("en-IN", options).format(date);
}

export function getRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = date.getTime() - now.getTime();
  const diffSecs = Math.round(diffMs / 1000);
  const diffMins = Math.round(diffSecs / 60);
  const diffHours = Math.round(diffMins / 60);
  const diffDays = Math.round(diffHours / 24);

  if (Math.abs(diffSecs) < 60) return "just now";
  if (Math.abs(diffMins) < 60) return diffMins > 0 ? `in ${diffMins}m` : `${Math.abs(diffMins)}m ago`;
  if (Math.abs(diffHours) < 24) return diffHours > 0 ? `in ${diffHours}h` : `${Math.abs(diffHours)}h ago`;
  if (Math.abs(diffDays) < 30) return diffDays > 0 ? `in ${diffDays}d` : `${Math.abs(diffDays)}d ago`;
  return formatDate(date, "short");
}

export function formatPercentage(value: number, decimals: number = 0): string {
  return `${value.toFixed(decimals)}%`;
}

export function formatDuration(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const pad = (n: number) => n.toString().padStart(2, "0");
  if (hours > 0) return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  return `${pad(minutes)}:${pad(seconds)}`;
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat("en-IN").format(num);
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + "...";
}
