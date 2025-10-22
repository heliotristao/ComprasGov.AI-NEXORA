import { create } from "zustand"
import { createJSONStorage, persist } from "zustand/middleware"

type UserInfo = Record<string, unknown> | null

interface AuthState {
  token: string | null
  user: UserInfo
  login: (token: string, user?: UserInfo) => void
  logout: () => void
}

const noopStorage = {
  getItem: () => null,
  setItem: () => undefined,
  removeItem: () => undefined,
  clear: () => undefined,
  key: () => null,
  get length() {
    return 0
  },
} as Storage

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      login: (token, user = null) => set({ token, user }),
      logout: () => set({ token: null, user: null }),
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() =>
        typeof window === "undefined" ? noopStorage : window.localStorage
      ),
      partialize: (state) => ({ token: state.token, user: state.user }),
    }
  )
)
