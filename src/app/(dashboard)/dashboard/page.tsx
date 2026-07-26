"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

function Sparkline({ color = "#a78bfa", up = true }: { color?: string; up?: boolean }) {
  const pts = up ? "0,28 10,22 20,24 30,14 40,18 50,8 60,12" : "0,12 10,18 20,14 30,24 40,20 50,28 60,22";
  return (
    <svg width="60" height="32" viewBox="0 0 60 32" fill="none">
      <polyline points={pts} stroke={color} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function WeeklyChart() {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const vals = [1.5, 2.2, 1.8, 3.5, 2.8, 4.2, 3.0];
  const max = 5;
  const w = 420, h = 120, pad = 24;
  const xs = vals.map((_, i) => pad + (i / (vals.length - 1)) * (w - pad * 2));
  const ys = vals.map((v) => h - pad - (v / max) * (h - pad * 2));
  const pts = xs.map((x, i) => `${x},${ys[i]}`).join(" ");
  const area = `M${xs[0]},${ys[0]} ` + xs.slice(1).map((x, i) => `L${x},${ys[i + 1]}`).join(" ") + ` L${xs[xs.length - 1]},${h - pad} L${xs[0]},${h - pad} Z`;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full" style={{ height: 120 }}>
      <defs>
        <linearGradient id="cg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.02" />
        </linearGradient>
      </defs>
      {[0, 2, 4].map((v) => {
        const y = h - pad - (v / max) * (h - pad * 2);
        return (
          <g key={v}>
            <line x1={pad} y1={y} x2={w - pad} y2={y} stroke="#ffffff10" strokeWidth="1" />
            <text x={pad - 4} y={y + 4} fill="#555" fontSize="9" textAnchor="end">{v}h</text>
          </g>
        );
      })}
      <path d={area} fill="url(#cg)" />
      <polyline points={pts} fill="none" stroke="#8b5cf6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      {xs.map((x, i) => (
        <circle key={i} cx={x} cy={ys[i]} r="3.5" fill="#8b5cf6" stroke="#0d0d1a" strokeWidth="1.5" />
      ))}
      {days.map((d, i) => (
        <text key={d} x={xs[i]} y={h - 4} fill="#666" fontSize="9" textAnchor="middle">{d}</text>
      ))}
    </svg>
  );
}

const SUBJECTS = [
  { name: "Physics", pct: 78, color: "#3b82f6" },
  { name: "Mathematics", pct: 65, color: "#a855f7" },
  { name: "Chemistry", pct: 54, color: "#22c55e" },
  { name: "Biology", pct: 40, color: "#f97316" },
  { name: "English", pct: 30, color: "#eab308" },
];

const TOOLS = [
  { icon: "📅", title: "Smart Planner", desc: "AI powered study plan that adapts to you.", link: "/dashboard/planner", color: "#8b5cf6", cta: "Create Plan →" },
  { icon: "🔄", title: "Revision System", desc: "Spaced repetition & smart reminders.", link: "/dashboard/subjects", color: "#3b82f6", cta: "Start Revising →" },
  { icon: "📝", title: "Mock Tests", desc: "Chapter-wise & full length tests.", link: "/dashboard/mock-tests", color: "#22c55e", cta: "Attempt Test →" },
  { icon: "📚", title: "Question Bank", desc: "50000+ questions with solutions.", link: "/dashboard/question-bank", color: "#f97316", cta: "Explore →" },
  { icon: "🃏", title: "Flashcards", desc: "Quick revision with smart flashcards.", link: "/dashboard/flashcards", color: "#06b6d4", cta: "Open →" },
  { icon: "🤖", title: "AI Summarizer", desc: "Summarize notes & get key points.", link: "/dashboard/assistant", color: "#a855f7", cta: "Try Now →" },
];

const QUICK_ACTIONS = [
  { icon: "🎯", label: "Start Focus", sub: "Deep work timer", link: "/dashboard/focus", color: "#8b5cf6" },
  { icon: "📝", label: "Mock Test", sub: "Test your skills", link: "/dashboard/mock-tests", color: "#3b82f6" },
  { icon: "🔄", label: "Revision", sub: "Revise weak topics", link: "/dashboard/subjects", color: "#f97316" },
  { icon: "📒", label: "Notes", sub: "Create / View notes", link: "/dashboard/notes", color: "#22c55e" },
  { icon: "📚", label: "Question Bank", sub: "Practice questions", link: "/dashboard/question-bank", color: "#ef4444" },
  { icon: "🃏", label: "Flashcards", sub: "Smart revision", link: "/dashboard/flashcards", color: "#06b6d4" },
];

const REVISION_ALERTS = [
  { topic: "Chemical Bonding", priority: "High", color: "#ef4444", when: "Due today" },
  { topic: "Vectors", priority: "Medium", color: "#f97316", when: "Due tomorrow" },
  { topic: "Thermodynamics", priority: "Low", color: "#22c55e", when: "Due in 2 days" },
];

const ACHIEVEMENTS_LIST = [
  { icon: "🌅", title: "Early Bird", desc: "Study before 7 AM" },
  { icon: "🎯", title: "Focus Master", desc: "50 Deep Focus Sessions" },
  { icon: "⚔️", title: "Week Warrior", desc: "7 Day Streak" },
];

const AI_SUGGESTIONS = ["Explain photosynthesis", "Solve this integral", "Newton's 3rd law", "Basic concepts of EMI"];

const INITIAL_TASKS = [
  { id: 1, title: "Physics: Laws of Motion", time: "45m", done: true },
  { id: 2, title: "Maths: Trigonometry", time: "60m", done: true },
  { id: 3, title: "Chemistry: Chemical Bonding", time: "45m", done: false },
  { id: 4, title: "Biology: Plant Kingdom", time: "30m", done: false },
];

export default function DashboardPage() {
  const router = useRouter();
  const [aiQuery, setAiQuery] = useState("");
  const [tasks, setTasks] = useState(INITIAL_TASKS);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good Morning" : hour < 17 ? "Good Afternoon" : "Good Evening";

  // persist task state
  useEffect(() => {
    const saved = localStorage.getItem("ss_today_tasks");
    if (saved) setTasks(JSON.parse(saved));
  }, []);

  const toggleTask = (id: number) => {
    const updated = tasks.map((t) => t.id === id ? { ...t, done: !t.done } : t);
    setTasks(updated);
    localStorage.setItem("ss_today_tasks", JSON.stringify(updated));
  };

  const doneTasks = tasks.filter((t) => t.done).length;
  const pct = Math.round((doneTasks / tasks.length) * 100);

  const handleAiSubmit = () => {
    if (!aiQuery.trim()) return;
    router.push(`/dashboard/assistant?q=${encodeURIComponent(aiQuery)}`);
  };

  return (
    <div className="min-h-screen bg-[#0d0d1a] text-white">
      <div className="p-4 md:p-6 max-w-[1400px] mx-auto space-y-5">

        {/* ── HEADER ── */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <p className="text-gray-400 text-sm">{greeting},</p>
            <h1 className="text-2xl md:text-3xl font-bold text-white">
              Hraydesh! <span>👋</span>
            </h1>
            <p className="text-gray-500 text-sm mt-0.5">Consistency today, success tomorrow.</p>
          </div>
          <button
            onClick={() => router.push("/dashboard/planner")}
            className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 active:scale-95 text-white px-4 py-2.5 rounded-xl font-medium text-sm transition-all shadow-lg shadow-violet-900/40"
          >
            <span>+</span> Quick Add
          </button>
        </div>

        {/* ── STAT CARDS ── */}
        <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-hide">
          {[
            { icon: "⏱️", label: "Study Time Today", value: "2h 45m", sub: "↑ 28% vs yesterday", c: "text-green-400" },
            { icon: "🔥", label: "Streak", value: "12 Days", sub: "Keep it going!", c: "text-orange-400" },
            { icon: "⚡", label: "Focus Score", value: "82/100", sub: "Excellent! 🔥", c: "text-violet-400" },
            { icon: "✅", label: "Tasks Done", value: `${doneTasks}/${tasks.length}`, sub: "Keep pushing!", c: "text-blue-400" },
            { icon: "⭐", label: "XP Today", value: "220 XP", sub: "Total XP: 3250", c: "text-yellow-400" },
          ].map((s) => (
            <div key={s.label} className="bg-white/5 border border-white/10 rounded-2xl p-4 flex-1 min-w-[140px]">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">{s.icon}</span>
                <span className="text-xs text-gray-400 truncate">{s.label}</span>
              </div>
              <p className="text-xl font-bold text-white">{s.value}</p>
              <p className={`text-xs mt-1 ${s.c}`}>{s.sub}</p>
            </div>
          ))}
        </div>

        {/* ── CHART + SUBJECTS + AI TUTOR ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

          {/* Study Overview */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-1">
              <h2 className="font-semibold text-white">Study Overview</h2>
              <span className="text-xs bg-white/10 text-gray-300 px-2 py-1 rounded-lg">This Week</span>
            </div>
            <p className="text-2xl font-bold text-white mt-1">18h 30m</p>
            <p className="text-xs text-green-400 mb-3">↑ 32% vs last week</p>
            <WeeklyChart />
          </div>

          {/* Subjects Progress */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-white">Subjects Progress</h2>
              <span className="text-violet-400 font-semibold text-sm">68%</span>
            </div>
            <div className="mb-4">
              <div className="flex justify-between text-xs text-gray-400 mb-1">
                <span>Overall Progress</span><span>68%</span>
              </div>
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full rounded-full bg-gradient-to-r from-violet-500 to-blue-500" style={{ width: "68%" }} />
              </div>
            </div>
            {SUBJECTS.map((s) => (
              <div key={s.name} className="mb-3">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-300">{s.name}</span>
                  <span className="text-gray-400">{s.pct}%</span>
                </div>
                <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${s.pct}%`, background: s.color }} />
                </div>
              </div>
            ))}
          </div>

          {/* AI Tutor */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5 flex flex-col">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-violet-600 flex items-center justify-center text-xl">🤖</div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-semibold text-white">AI Tutor</h2>
                  <span className="text-xs bg-violet-600 text-white px-2 py-0.5 rounded-full">New</span>
                </div>
                <p className="text-xs text-gray-400">Ask anything. Get instant explanations.</p>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-white/8 border border-white/10 rounded-xl px-3 py-2 mb-3">
              <input
                value={aiQuery}
                onChange={(e) => setAiQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAiSubmit()}
                placeholder="Ask a question..."
                className="flex-1 bg-transparent text-sm text-white placeholder-gray-500 outline-none"
              />
              <button
                onClick={handleAiSubmit}
                className="w-7 h-7 bg-violet-600 rounded-lg flex items-center justify-center text-xs hover:bg-violet-700 active:scale-95 transition-all"
              >➤</button>
            </div>

            <div className="grid grid-cols-2 gap-2 mb-4">
              {AI_SUGGESTIONS.map((s) => (
                <button key={s} onClick={() => { setAiQuery(s); router.push(`/dashboard/assistant?q=${encodeURIComponent(s)}`); }}
                  className="text-xs bg-white/8 hover:bg-white/15 text-gray-300 px-2 py-1.5 rounded-lg text-left transition-colors border border-white/10 truncate">
                  {s}
                </button>
              ))}
            </div>

            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Quick Actions</p>
            <div className="grid grid-cols-3 gap-2">
              {QUICK_ACTIONS.map((q) => (
                <Link key={q.label} href={q.link}
                  className="flex flex-col items-center gap-1.5 p-2 rounded-xl bg-white/5 hover:bg-white/12 border border-white/10 hover:border-white/20 transition-all group text-center">
                  <span className="text-xl">{q.icon}</span>
                  <p className="text-xs font-medium text-gray-300 group-hover:text-white leading-tight">{q.label}</p>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* ── STUDY TOOLS ── */}
        <div>
          <h2 className="font-bold text-white text-lg mb-3">Powerful Study Tools</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {TOOLS.map((t) => (
              <Link key={t.title} href={t.link}
                className="bg-white/5 border border-white/10 rounded-2xl p-4 hover:border-violet-500/50 hover:bg-white/8 transition-all group block">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl mb-3" style={{ background: t.color + "22" }}>
                  {t.icon}
                </div>
                <p className="font-semibold text-white text-sm mb-1">{t.title}</p>
                <p className="text-xs text-gray-500 mb-3 leading-relaxed">{t.desc}</p>
                <span className="text-xs font-medium text-violet-400 group-hover:text-violet-300 transition-colors">{t.cta}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* ── BOTTOM GRID ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

          {/* Today's Plan */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold text-white">Today's Plan</h2>
              <Link href="/dashboard/planner" className="text-xs text-violet-400 hover:text-violet-300">View Planner</Link>
            </div>
            <div className="space-y-2.5">
              {tasks.map((t) => (
                <button key={t.id} onClick={() => toggleTask(t.id)}
                  className="flex items-center gap-3 w-full text-left group hover:bg-white/5 rounded-lg px-1 py-0.5 transition-colors">
                  <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all ${t.done ? "bg-green-500 border-green-500" : "border-gray-600 group-hover:border-violet-400"}`}>
                    {t.done && <span className="text-white text-xs">✓</span>}
                  </div>
                  <span className={`text-sm flex-1 truncate ${t.done ? "text-gray-500 line-through" : "text-gray-200"}`}>{t.title}</span>
                  <span className="text-xs text-gray-500 flex-shrink-0">{t.time}</span>
                </button>
              ))}
            </div>
            <div className="mt-4">
              <div className="flex justify-between text-xs text-gray-400 mb-1">
                <span>{doneTasks}/{tasks.length} tasks completed</span>
                <span>{pct}%</span>
              </div>
              <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full rounded-full bg-gradient-to-r from-violet-500 to-blue-500 transition-all duration-500" style={{ width: `${pct}%` }} />
              </div>
            </div>
          </div>

          {/* Performance Analytics */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-white">Performance Analytics</h2>
              <span className="text-xs bg-white/10 text-gray-300 px-2 py-1 rounded-lg">This Month</span>
            </div>
            <div className="grid grid-cols-3 gap-3 mb-4">
              {[
                { label: "Accuracy", value: "78%", change: "+8%", color: "#8b5cf6" },
                { label: "Speed", value: "42 Q/h", change: "+12%", color: "#22c55e" },
                { label: "Consistency", value: "85%", change: "+15%", color: "#3b82f6" },
              ].map((m) => (
                <div key={m.label} className="text-center">
                  <p className="text-xs text-gray-400 mb-1">{m.label}</p>
                  <p className="text-base font-bold text-white">{m.value}</p>
                  <div className="flex justify-center mt-1"><Sparkline color={m.color} /></div>
                  <p className="text-xs text-green-400">{m.change}</p>
                </div>
              ))}
            </div>
            <Link href="/dashboard/subjects"
              className="block text-center text-xs text-violet-400 hover:text-violet-300 border border-white/10 hover:border-violet-500/40 rounded-lg py-2 transition-colors">
              View Detailed Analytics →
            </Link>
          </div>

          {/* Revision Alert */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold text-white">Revision Alert</h2>
              <Link href="/dashboard/subjects" className="text-xs text-violet-400 hover:text-violet-300">View All</Link>
            </div>
            <div className="space-y-3">
              {REVISION_ALERTS.map((r) => (
                <Link key={r.topic} href="/dashboard/subjects"
                  className="flex items-center gap-3 p-2.5 rounded-xl bg-white/5 hover:bg-white/10 transition-colors cursor-pointer block">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm flex-shrink-0" style={{ background: r.color + "22" }}>📖</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{r.topic}</p>
                    <p className="text-xs text-gray-500">{r.when}</p>
                  </div>
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full flex-shrink-0" style={{ background: r.color + "22", color: r.color }}>
                    {r.priority}
                  </span>
                </Link>
              ))}
            </div>
          </div>

          {/* Achievements */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold text-white">Achievements</h2>
              <Link href="/dashboard/achievements" className="text-xs text-violet-400 hover:text-violet-300">View All</Link>
            </div>
            <div className="space-y-3">
              {ACHIEVEMENTS_LIST.map((a) => (
                <Link key={a.title} href="/dashboard/achievements"
                  className="flex items-center gap-3 p-2.5 rounded-xl bg-white/5 hover:bg-white/10 transition-colors block">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-600 to-blue-600 flex items-center justify-center text-lg flex-shrink-0">
                    {a.icon}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{a.title}</p>
                    <p className="text-xs text-gray-500">{a.desc}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* ── BOTTOM STATS BAR ── */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            {[
              { icon: "🎯", label: "Daily Goal", value: "2h 45m / 4h", link: "/dashboard/focus" },
              { icon: "📖", label: "Syllabus Progress", value: "53%", link: "/dashboard/subjects" },
              { icon: "📝", label: "Tests Taken", value: "12", link: "/dashboard/mock-tests" },
              { icon: "✅", label: "Accuracy", value: "78%", link: "/dashboard/mock-tests" },
              { icon: "🏆", label: "Rank", value: "#142", sub: "In leaderboard", link: "/dashboard/achievements" },
            ].map((s) => (
              <Link key={s.label} href={s.link} className="flex items-center gap-3 flex-1 min-w-[120px] group hover:opacity-80 transition-opacity">
                <span className="text-2xl">{s.icon}</span>
                <div>
                  <p className="text-xs text-gray-400">{s.label}</p>
                  <p className="font-bold text-white group-hover:text-violet-300 transition-colors">{s.value}</p>
                  {s.sub && <p className="text-xs text-gray-500">{s.sub}</p>}
                </div>
              </Link>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}