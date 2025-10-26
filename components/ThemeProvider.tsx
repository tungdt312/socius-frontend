"use client"
import React, {createContext, useContext, useEffect, useState} from 'react'
import {parseStringify} from "@/lib/utils";

const initialState: ThemeProviderState = {
    theme: { mode: 'light', color: 'blue' },
    setTheme: () => null
}
const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

export function ThemeProvider({
                                  children,
                                  defaultTheme = { mode: 'system', color: 'blue' },
                                  storageThemeKey = 'ui-theme',
                                  storageColorKey = 'ui-color',
                                  ...props
                              }: ThemeProviderProps) {
    const [storedTheme, setStoredTheme] = useState<Theme>(defaultTheme);
    const [systemMode, setSystemMode] = useState<"light" | "dark">("light");

    useEffect(() => {
        if (typeof window === "undefined") return;
        const savedTheme = localStorage.getItem(storageThemeKey);
        const savedColor = localStorage.getItem(storageColorKey);
        if (savedTheme && savedColor) {
            try {
                setStoredTheme(parseStringify({ mode: savedTheme , color: savedColor }));
            } catch {
                console.warn("Invalid theme data in localStorage");
            }
        }
    }, [storageThemeKey, storageColorKey]);

    // Lưu theme vào localStorage mỗi khi người dùng đổi theme
    useEffect(() => {
        if (typeof window === "undefined") return;
        localStorage.setItem(storageThemeKey, storedTheme.mode);
        localStorage.setItem(storageColorKey, storedTheme.color);
    }, [storedTheme, storageThemeKey, storageColorKey]);
    // chỉ chạy trên client sau khi mount
    useEffect(() => {
        if (storedTheme.mode === "system" && typeof window !== "undefined") {
            const dark = window.matchMedia("(prefers-color-scheme: dark)").matches;
            setSystemMode(dark ? "dark" : "light");

            // Nếu bạn muốn theme auto update khi hệ thống đổi màu
            const listener = (e: MediaQueryListEvent) => {
                setSystemMode(e.matches ? "dark" : "light");
            };
            const mq = window.matchMedia("(prefers-color-scheme: dark)");
            mq.addEventListener("change", listener);
            return () => mq.removeEventListener("change", listener);
        }
    }, [storedTheme.mode]);

    const value = {
        theme: storedTheme,
        setTheme: (theme: Theme) => setStoredTheme(theme),
    };

    const themeMode =
        storedTheme.mode === "system" ? systemMode : storedTheme.mode;
    return (
        <ThemeProviderContext.Provider {...props} value={value}>
            <div data-theme={`${storedTheme.color}-${themeMode}`} className={themeMode}>
                {children}
            </div>
        </ThemeProviderContext.Provider>
    );
}
/**
 * Hook to get and set new theme throughout application
 */
export const useTheme = () => {
    const context = useContext(ThemeProviderContext);

    if (context === undefined) throw new Error('useTheme must be used within a ThemeProvider');

    return context;
};

