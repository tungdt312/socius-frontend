"use client"
import React, {createContext, useContext, useEffect, useRef, useState} from 'react'
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

    const [storedTheme, setStoredTheme] = useState<Theme>(() => {
        if (typeof window === "undefined") {
            return defaultTheme;
        }
        try {
            const savedTheme = localStorage.getItem(storageThemeKey);
            const savedColor = localStorage.getItem(storageColorKey);
            if (savedTheme && savedColor) {
                return { mode: savedTheme as ThemeModes, color: savedColor as ThemeColors };
            }
        } catch (e) {
            console.warn("Lỗi đọc theme từ localStorage", e);
        }
        return defaultTheme;
    });

    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const [systemMode, setSystemMode] = useState<"light" | "dark">("light");

    useEffect(() => {
        if (typeof window === "undefined") return;
        localStorage.setItem(storageThemeKey, storedTheme.mode);
        localStorage.setItem(storageColorKey, storedTheme.color);
    }, [storedTheme, storageThemeKey, storageColorKey]);

    useEffect(() => {
        if (storedTheme.mode === "system" && typeof window !== "undefined") {
            const dark = window.matchMedia("(prefers-color-scheme: dark)").matches;
            setSystemMode(dark ? "dark" : "light");

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

    const themeMode = storedTheme.mode === "system" ? systemMode : storedTheme.mode;

    const serverRenderMode = defaultTheme.mode === 'system' ? 'light' : defaultTheme.mode;
    const effectiveMode = isMounted ? themeMode : serverRenderMode;
    const effectiveColor = isMounted ? storedTheme.color : defaultTheme.color;

    return (
        <ThemeProviderContext.Provider {...props} value={value}>
            <div data-theme={`${effectiveColor}-${effectiveMode}`} className={effectiveMode}>
                {children}
            </div>
        </ThemeProviderContext.Provider>
    );
}

export const useTheme = () => {
    const context = useContext(ThemeProviderContext);
    if (context === undefined) throw new Error('useTheme must be used within a ThemeProvider');
    return context;
};
