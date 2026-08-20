export const APP_NAME = "StudySphere" as const;
export const APP_TAGLINE = "Exam Companion" as const;

export const SUPPORTED_EXAMS = [
  { id: "ssc-cgl", name: "SSC CGL", category: "SSC" },
  { id: "ssc-chsl", name: "SSC CHSL", category: "SSC" },
  { id: "ibps-po", name: "IBPS PO", category: "Banking" },
  { id: "ibps-clerk", name: "IBPS Clerk", category: "Banking" },
  { id: "sbi-po", name: "SBI PO", category: "Banking" },
  { id: "sbi-clerk", name: "SBI Clerk", category: "Banking" },
  { id: "rrb-ntpc", name: "RRB NTPC", category: "Railway" },
  { id: "upsc-cse", name: "UPSC CSE", category: "Civil Services" },
  { id: "state-pcs", name: "State PCS", category: "Civil Services" },
  { id: "upp-constable", name: "UPP Constable", category: "Police" },
  { id: "neet", name: "NEET", category: "Medical" },
  { id: "jee-main", name: "JEE Main", category: "Engineering" },
  { id: "jee-advanced", name: "JEE Advanced", category: "Engineering" },
] as const;

export const EXAM_CATEGORIES = [
  "SSC", "Banking", "Railway", "Civil Services", "Police", "Medical", "Engineering",
] as const;

export const NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard", icon: "LayoutDashboard", href: "/dashboard" },
  { id: "planner", label: "Planner", icon: "Calendar", href: "/planner" },
  { id: "mock-tests", label: "Mock Tests", icon: "FileCheck", href: "/mock-tests" },
  { id: "flashcards", label: "Flashcards", icon: "Layers", href: "/flashcards" },
  { id: "ai", label: "AI Doubt Solver", icon: "Bot", href: "/ai" },
  { id: "syllabus", label: "Syllabus", icon: "BookOpen", href: "/syllabus" },
  { id: "analytics", label: "Analytics", icon: "BarChart3", href: "/analytics" },
  { id: "journal", label: "Journal", icon: "BookMarked", href: "/journal" },
  { id: "wellbeing", label: "Wellbeing", icon: "Heart", href: "/wellbeing" },
] as const;

export const XP_REWARDS = {
  MOCK_COMPLETION: 50,
  MISTAKE_CORRECTION: 30,
  REVISION_SESSION: 20,
  MASTERY_ACHIEVED: 100,
  STREAK_MILESTONE: 25,
} as const;

export const BUFFER_DAYS_DEFAULT = 2;
export const STREAK_BUFFER_DAYS = 1;

export type SupportedExam = (typeof SUPPORTED_EXAMS)[number];
export type ExamCategory = (typeof EXAM_CATEGORIES)[number];
export type NavItem = (typeof NAV_ITEMS)[number];
