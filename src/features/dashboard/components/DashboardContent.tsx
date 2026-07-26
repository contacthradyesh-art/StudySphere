"use client";
import { useMemo } from "react";
import { motion } from "framer-motion";
import { ReadinessScoreCard } from "./ReadinessScoreCard";
import { TodaysOneThingCard } from "./TodaysOneThingCard";
import { WeakTopicsCard } from "./WeakTopicsCard";
import { MistakeNotebookCard } from "./MistakeNotebookCard";
import { ExamOverlapCard } from "./ExamOverlapCard";
import { StreakCard } from "./StreakCard";
import { StudyStatsCard } from "./StudyStatsCard";
import { getMockDashboardData } from "../utils/mockDashboardData";
import { showToast } from "@/components/shared/Toast";
import { useUserStore } from "@/stores/useUserStore";
import { XP_REWARDS } from "@/utils/constants";

const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.08 } } };
const itemVariants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };

export function DashboardContent() {
  const dashboardData = useMemo(() => getMockDashboardData(), []);
  const addXp = useUserStore((s) => s.addXp);

  const handleCompleteOneThing = (id: string) => { showToast("Great work! Keep the momentum going.", "success"); };
  const handleResolveMistake = (id: string) => {
    addXp(XP_REWARDS.MISTAKE_CORRECTION);
    showToast(`Mistake resolved! +${XP_REWARDS.MISTAKE_CORRECTION} XP earned`, "success");
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      <motion.div variants={itemVariants}>
        <h2 className="text-2xl font-bold text-charcoal-50 mb-1">Dashboard</h2>
        <p className="text-charcoal-400 text-sm">Your exam preparation command center</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <motion.div variants={itemVariants} className="lg:col-span-2"><ReadinessScoreCard data={dashboardData.readiness} /></motion.div>
        <motion.div variants={itemVariants}><TodaysOneThingCard data={dashboardData.todaysOneThing} onComplete={handleCompleteOneThing} /></motion.div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <motion.div variants={itemVariants}><WeakTopicsCard topics={dashboardData.weakTopics} /></motion.div>
        <motion.div variants={itemVariants}><MistakeNotebookCard mistakes={dashboardData.recentMistakes} onResolve={handleResolveMistake} /></motion.div>
        <motion.div variants={itemVariants}><StreakCard streak={dashboardData.streak} bufferDays={dashboardData.bufferDays} /></motion.div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <motion.div variants={itemVariants}><ExamOverlapCard overlaps={dashboardData.examOverlaps} /></motion.div>
        <motion.div variants={itemVariants}><StudyStatsCard stats={dashboardData.studyStats} /></motion.div>
      </div>
    </motion.div>
  );
}
