"use client"

import React, { createContext, useContext, useEffect, useState, useCallback } from "react"

type Theme = "light" | "dark"

interface ThemeContextValue {
    theme: Theme
    toggleTheme: () => void
    setTheme: (t: Theme) => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

const STORAGE_KEY = "invictus-theme"

function getInitialTheme(): Theme {
    // SSR guard
    if (typeof window === "undefined") return "light"
    const stored = localStorage.getItem(STORAGE_KEY) as Theme | null
    if (stored === "light" || stored === "dark") return stored
    // Fallback: OS preference
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [theme, setThemeState] = useState<Theme>(() => getInitialTheme())

    const applyTheme = useCallback((t: Theme) => {
        const html = document.documentElement
        html.classList.remove("light", "dark")
        html.classList.add(t)
    }, [])

    useEffect(() => {
        applyTheme(theme)

        // Listen for OS changes only if no manual override stored
        const mq = window.matchMedia("(prefers-color-scheme: dark)")
        const handler = (e: MediaQueryListEvent) => {
            if (!localStorage.getItem(STORAGE_KEY)) {
                const next: Theme = e.matches ? "dark" : "light"
                setThemeState(next)
                applyTheme(next)
            }
        }
        mq.addEventListener("change", handler)
        return () => mq.removeEventListener("change", handler)
    }, [applyTheme, theme])

    const setTheme = useCallback((t: Theme) => {
        setThemeState(t)
        applyTheme(t)
        localStorage.setItem(STORAGE_KEY, t)
    }, [applyTheme])

    const toggleTheme = useCallback(() => {
        setTheme(theme === "light" ? "dark" : "light")
    }, [theme, setTheme])

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
            {children}
        </ThemeContext.Provider>
    )
}

export function useTheme() {
    const ctx = useContext(ThemeContext)
    if (!ctx) throw new Error("useTheme must be used inside ThemeProvider")
    return ctx
}
