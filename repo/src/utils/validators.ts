export function isNonEmpty(value: string): boolean {
  return value.trim().length > 0;
}

export function isInRange(value: number, min: number, max: number): boolean {
  return value >= min && value <= max;
}

export function isValidExamId(examId: string): boolean {
  const validIds = [
    "ssc-cgl", "ssc-chsl", "ibps-po", "ibps-clerk",
    "sbi-po", "sbi-clerk", "rrb-ntpc", "upsc-cse",
    "state-pcs", "upp-constable", "neet", "jee-main", "jee-advanced",
  ];
  return validIds.includes(examId);
}

export function isValidDateString(dateStr: string): boolean {
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(dateStr)) return false;
  const date = new Date(dateStr);
  return !isNaN(date.getTime());
}

export function sanitizeInput(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");
}
