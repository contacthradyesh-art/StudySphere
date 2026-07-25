"use client";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/utils/cn";
import { NAV_ITEMS, APP_NAME, APP_TAGLINE } from "@/utils/constants";
import { useThemeStore } from "@/stores/useThemeStore";
import { useNavigationStore } from "@/stores/useNavigationStore";
import { useUserStore } from "@/stores/useUserStore";
import { useAuthStore } from "@/stores/useAuthStore";
import { signOutUser } from "@/lib/firebase/auth";
import { useIsMobile } from "@/hooks/useMediaQuery";
import { iconMap, MenuIcon, ChevronLeftIcon, BellIcon, FlameIcon, ZapIcon } from "@/components/shared/icons";
import { showToast } from "@/components/shared/Toast";

function Sidebar() {
  const pathname = usePathname();
  const { sidebarCollapsed, toggleSidebar } = useThemeStore();
  const isMobile = useIsMobile();
  const { isMobileMenuOpen, closeMobileMenu } = useNavigationStore();
  const isOpen = isMobile ? isMobileMenuOpen : !sidebarCollapsed;

  return (
    <>
      <AnimatePresence>
        {isMobile && isMobileMenuOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden" onClick={closeMobileMenu} />
        )}
      </AnimatePresence>

      <motion.aside
        className={cn("fixed top-0 left-0 h-full z-50 glass border-r border-white/[0.06] flex flex-col", isMobile ? "w-64" : sidebarCollapsed ? "w-[72px]" : "w-64")}
        initial={false}
        animate={{ x: isMobile && !isMobileMenuOpen ? -280 : 0, width: isMobile ? 256 : sidebarCollapsed ? 72 : 256 }}
        transition={{ type: "spring", bounce: 0.15, duration: 0.4 }}
      >
        <div className="flex items-center gap-3 px-4 h-16 border-b border-white/[0.06]">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-electric to-neon flex items-center justify-center flex-shrink-0">
            <ZapIcon size={18} className="text-white" />
          </div>
          <AnimatePresence>
            {isOpen && (
              <motion.div initial={{ opacity: 0, width: 0 }} animate={{ opacity: 1, width: "auto" }} exit={{ opacity: 0, width: 0 }} className="overflow-hidden whitespace-nowrap">
                <h1 className="text-base font-bold text-charcoal-50">{APP_NAME}</h1>
                <p className="text-[10px] text-charcoal-500 -mt-0.5">{APP_TAGLINE}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1 no-scrollbar">
          {NAV_ITEMS.map((item) => {
            const Icon = iconMap[item.icon];
            const isActive = pathname === item.href;
            return (
              <Link key={item.id} href={item.href} onClick={() => isMobile && closeMobileMenu()}
                className={cn("flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative",
                  isActive ? "bg-electric/15 text-electric-300" : "text-charcoal-400 hover:text-charcoal-200 hover:bg-charcoal-800/50")}>
                {isActive && (
                  <motion.div layoutId="sidebar-active" className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 rounded-r-full bg-electric" transition={{ type: "spring", bounce: 0.2, duration: 0.4 }} />
                )}
                {Icon && <Icon size={20} className="flex-shrink-0" />}
                <AnimatePresence>
                  {isOpen && (
                    <motion.span initial={{ opacity: 0, width: 0 }} animate={{ opacity: 1, width: "auto" }} exit={{ opacity: 0, width: 0 }} className="text-sm font-medium overflow-hidden whitespace-nowrap">
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </Link>
            );
          })}
        </nav>

        {!isMobile && (
          <div className="p-2 border-t border-white/[0.06]">
            <button onClick={toggleSidebar} className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-charcoal-400 hover:text-charcoal-200 hover:bg-charcoal-800/50 transition-colors">
              <ChevronLeftIcon size={18} className={cn("transition-transform duration-300", sidebarCollapsed && "rotate-180")} />
              <AnimatePresence>
                {!sidebarCollapsed && <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-xs">Collapse</motion.span>}
              </AnimatePresence>
            </button>
          </div>
        )}
      </motion.aside>
    </>
  );
}

function TopBar() {
  const { sidebarCollapsed } = useThemeStore();
  const { toggleMobileMenu } = useNavigationStore();
  const { currentStreak, totalXp, level } = useUserStore();
  const { user } = useAuthStore();
  const isMobile = useIsMobile();

  const handleSignOut = async () => {
    try {
      await signOutUser();
      showToast("Signed out", "info");
    } catch (error) {
      console.error("Sign-out error:", error);
    }
  };

  return (
    <header className={cn("fixed top-0 right-0 h-16 z-30 glass border-b border-white/[0.06] flex items-center justify-between px-4 md:px-6 transition-all duration-300", isMobile ? "left-0" : sidebarCollapsed ? "left-[72px]" : "left-64")}>
      <div className="flex items-center gap-3">
        {isMobile && (
          <button onClick={toggleMobileMenu} className="p-2 rounded-lg text-charcoal-400 hover:text-charcoal-200 hover:bg-charcoal-800/50 transition-colors">
            <MenuIcon size={20} />
          </button>
        )}
      </div>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-charcoal-800/50 border border-charcoal-700/30">
          <FlameIcon size={16} className="text-orange-400" />
          <span className="text-sm font-medium text-charcoal-200">{currentStreak}</span>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-charcoal-800/50 border border-charcoal-700/30">
          <ZapIcon size={16} className="text-neon" />
          <span className="text-sm font-medium text-charcoal-200">{totalXp} XP</span>
        </div>
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-electric/10 border border-electric/20">
          <span className="text-sm font-bold text-electric-300">Lv.{level}</span>
        </div>
        <button className="p-2 rounded-lg text-charcoal-400 hover:text-charcoal-200 hover:bg-charcoal-800/50 transition-colors relative">
          <BellIcon size={20} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-electric" />
        </button>
        {user && (
          <button onClick={handleSignOut} className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-lg hover:bg-charcoal-800/50 transition-colors" title="Sign out">
            {user.photoURL ? (
              <img src={user.photoURL} alt={user.displayName ?? "User"} className="w-7 h-7 rounded-full" referrerPolicy="no-referrer" />
            ) : (
              <div className="w-7 h-7 rounded-full bg-electric/20 flex items-center justify-center text-xs font-bold text-electric-300">
                {(user.displayName ?? "U")[0]}
              </div>
            )}
          </button>
        )}
      </div>
    </header>
  );
}

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const { sidebarCollapsed } = useThemeStore();
  const isMobile = useIsMobile();

  return (
    <div className="min-h-screen bg-charcoal-950">
      <Sidebar />
      <TopBar />
      <main className={cn("pt-16 min-h-screen transition-all duration-300", isMobile ? "pl-0" : sidebarCollapsed ? "pl-[72px]" : "pl-64")}>
        <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
