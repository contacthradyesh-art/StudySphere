import { create } from "zustand";

interface NavigationState {
  activeRoute: string;
  previousRoute: string | null;
  isMobileMenuOpen: boolean;
  setActiveRoute: (route: string) => void;
  toggleMobileMenu: () => void;
  closeMobileMenu: () => void;
}

export const useNavigationStore = create<NavigationState>()((set) => ({
  activeRoute: "/dashboard",
  previousRoute: null,
  isMobileMenuOpen: false,
  setActiveRoute: (route: string) =>
    set((state) => ({ activeRoute: route, previousRoute: state.activeRoute })),
  toggleMobileMenu: () => set((state) => ({ isMobileMenuOpen: !state.isMobileMenuOpen })),
  closeMobileMenu: () => set({ isMobileMenuOpen: false }),
}));
