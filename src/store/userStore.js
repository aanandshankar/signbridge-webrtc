import { create } from 'zustand';

const useUserStore = create((set) => ({
    user: { id: "test", username: "Test User", email: "test@example.com" }, // User object: { id, name, email, ... }
    isLoading: false,

    // Action to set user (e.g., on login or hydration)
    setUser: (user) => set({ user }),

    // Action to clear user (e.g., on logout)
    logout: () => set({ user: null }),

    // Optionally handle loading state
    setIsLoading: (isLoading) => set({ isLoading }),
}));

export default useUserStore;
