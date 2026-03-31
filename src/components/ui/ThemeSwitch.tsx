"use client"

import React from "react"
import { useTheme } from "@/lib/ThemeContext"
import { Sun, Moon } from "@phosphor-icons/react"

export function ThemeSwitch() {
    const { theme, toggleTheme } = useTheme()
    const isDark = theme === "dark"

    return (
        <button
            onClick={toggleTheme}
            aria-label={isDark ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
            title={isDark ? "Modo claro" : "Modo oscuro"}
            className={`
                relative flex items-center gap-1.5 px-2 py-1.5 rounded-full border transition-all duration-300 group
                ${isDark
                    ? "bg-surface-highlight-dark border-primary/40 hover:border-primary"
                    : "bg-surface-highlight border-surface-highlight hover:border-primary/50"
                }
            `}
        >
            {/* Track */}
            <div className={`
                relative w-9 h-5 rounded-full transition-colors duration-300
                ${isDark ? "bg-primary" : "bg-surface-highlight"}
                border ${isDark ? "border-primary" : "border-surface-highlight"}
            `}>
                {/* Thumb */}
                <span className={`
                    absolute top-0.5 h-4 w-4 rounded-full shadow transition-all duration-300 flex items-center justify-center
                    ${isDark
                        ? "translate-x-4 bg-black"
                        : "translate-x-0.5 bg-white"
                    }
                `}>
                    {isDark
                        ? <Moon size={10} weight="fill" className="text-primary" />
                        : <Sun size={10} weight="fill" className="text-amber-500" />
                    }
                </span>
            </div>

            {/* Label */}
            <span className={`text-[10px] font-mono font-bold tracking-widest uppercase select-none transition-colors duration-300 ${
                isDark ? "text-primary" : "text-text-muted"
            }`}>
                {isDark ? "Dark" : "Light"}
            </span>
        </button>
    )
}
