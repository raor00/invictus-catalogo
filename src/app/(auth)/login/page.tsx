"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { useStore } from "@/lib/StoreContext"

export default function LoginPage() {
    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const router = useRouter()
    const { login } = useStore()

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault()
        const normalizedUser = username.trim().toLowerCase()
        if ((normalizedUser === "admin" || normalizedUser === "admin@invictus.com") && password === "admin123") {
            login()
            router.push("/dashboard")
        } else {
            setError("Credenciales inválidas. Usuario: admin / Contraseña: admin123")
        }
    }

    return (
        <div className="flex flex-1 min-h-[100dvh] w-full bg-background-light text-text-main font-body antialiased">
            {/* LEFT SIDE: Visuals / Branding */}
            <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-12 overflow-hidden bg-gradient-to-br from-[#f8f8f8] to-[#d8d8d8]">
                {/* Branding */}
                <div className="relative z-10">
                    <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-black text-4xl">bolt</span>
                        <div className="flex flex-col">
                            <span className="font-heading font-bold text-3xl tracking-tight leading-none text-black">INVICTUS</span>
                            <span className="font-mono text-black text-[10px] tracking-[0.3em] leading-none mt-1 font-bold">MAYORISTA</span>
                        </div>
                    </div>
                </div>

                {/* Central Visual Element */}
                <div className="relative z-10 flex flex-col justify-center h-full max-w-lg">
                    <h1 className="font-heading font-bold text-[80px] leading-[0.9] mb-6 text-black tracking-tighter">
                        SISTEMA <br />
                        <span className="text-[#999]">INTERNO</span>
                    </h1>
                    <div className="h-2 w-20 bg-black mb-8"></div>
                    <p className="text-[#666] text-xl font-medium leading-relaxed max-w-md">
                        Acceso exclusivo para gestión de inventario, control de precios y distribución mayorista.
                    </p>

                    <div className="mt-14 flex gap-6">
                        <div className="flex items-center gap-4 px-6 py-4 bg-white shadow-sm w-fit min-w-[160px]">
                            <span className="material-symbols-outlined text-black text-2xl">inventory_2</span>
                            <div className="flex flex-col">
                                <span className="text-[10px] text-[#999] font-bold uppercase tracking-wider mb-1">SKUS ACTIVOS</span>
                                <span className="font-mono text-black text-2xl font-bold leading-none">2,450+</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 px-6 py-4 bg-white shadow-sm w-fit min-w-[160px]">
                            <span className="material-symbols-outlined text-black text-2xl">update</span>
                            <div className="flex flex-col">
                                <span className="text-[10px] text-[#999] font-bold uppercase tracking-wider mb-1">ÚLTIMO SYNC</span>
                                <span className="font-mono text-black text-2xl font-bold leading-none">09:41 AM</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Metadata */}
                <div className="relative z-10 flex justify-between items-end">
                    <p className="font-mono text-[11px] uppercase font-bold text-[#999]">v2.8.4 - STABLE BUILD</p>
                    <p className="font-mono text-[11px] uppercase font-bold text-[#999]">SERVER: US-EAST-1</p>
                </div>
            </div>

            {/* RIGHT SIDE: Login Form */}
            <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-6 sm:p-12 lg:p-24 bg-[#000000] relative">
                {/* Mobile Logo */}
                <div className="lg:hidden absolute top-8 left-8 flex items-center gap-2 mb-12">
                    <span className="material-symbols-outlined text-white text-3xl">bolt</span>
                    <span className="font-heading font-bold text-2xl tracking-tight text-white">INVICTUS</span>
                </div>

                <div className="w-full max-w-md flex flex-col gap-10 z-10">
                    <div className="flex flex-col gap-3">
                        <h2 className="text-[44px] font-heading font-bold text-white tracking-tight leading-none">Bienvenido</h2>
                        <p className="text-[#666] text-lg">Ingrese sus credenciales de administrador.</p>
                    </div>

                    <form className="flex flex-col gap-6 mt-6" onSubmit={handleLogin}>
                        {/* Email Input Group */}
                        <div className="relative bg-white p-4">
                            <label
                                className="block text-[10px] text-[#999] font-mono font-bold uppercase tracking-[0.2em] mb-1"
                                htmlFor="username"
                            >
                                USUARIO
                            </label>
                            <input
                                className="w-full bg-white text-black font-mono text-base focus:outline-none placeholder-gray-300"
                                id="username"
                                name="username"
                                placeholder="admin"
                                required
                                type="text"
                                autoComplete="username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                            />
                        </div>

                        {/* Password Input Group */}
                        <div className="relative bg-white p-4">
                            <div className="flex justify-between items-end">
                                <div className="flex-1">
                                    <label
                                        className="block text-[10px] text-[#999] font-mono font-bold uppercase tracking-[0.2em] mb-1"
                                        htmlFor="password"
                                    >
                                        CONTRASEÑA
                                    </label>
                                    <input
                                        className="w-full bg-white text-black font-mono text-base focus:outline-none"
                                        id="password"
                                        name="password"
                                        required
                                        type={showPassword ? "text" : "password"}
                                        autoComplete="current-password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                    />
                                </div>
                                <button
                                    className="text-[#999] hover:text-black transition-colors focus:outline-none mb-1"
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    <span className="material-symbols-outlined text-[20px]">
                                        {showPassword ? "visibility" : "visibility_off"}
                                    </span>
                                </button>
                            </div>
                        </div>

                        {error && (
                            <p className="text-red-500 text-xs font-bold font-mono">
                                {error}
                            </p>
                        )}

                        {/* Actions */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <input
                                    className="w-4 h-4 accent-black cursor-pointer bg-white"
                                    id="remember"
                                    type="checkbox"
                                />
                                <label className="text-xs text-[#666] font-medium cursor-pointer select-none" htmlFor="remember">
                                    Recordar sesión
                                </label>
                            </div>
                            <a className="text-xs text-[#666] font-medium underline underline-offset-2" href="#">
                                ¿Olvidó su contraseña?
                            </a>
                        </div>

                        {/* Submit Button */}
                        <button
                            className="mt-4 w-full py-5 bg-black text-white border border-[#333] font-heading font-extrabold text-xl tracking-wider hover:bg-[#111] transition-all duration-300 active:scale-[0.99] flex items-center justify-center gap-2"
                            type="submit"
                        >
                            ACCEDER AL SISTEMA
                        </button>
                    </form>

                    <div className="mt-8">
                        <p className="text-[10px] text-[#333] font-mono leading-relaxed font-bold">
                            © 2024 INVICTUS DISTRIBUCIÓN. TODOS LOS DERECHOS RESERVADOS.
                            <br />ACCESO PROTEGIDO POR 2FA.
                        </p>
                    </div>
                </div>

                {/* Decorative corner accent */}
                <div className="absolute bottom-0 right-0 w-32 h-32 border-b-2 border-r-2 border-[#1a1a1a] opacity-50 pointer-events-none"></div>
                <div className="absolute top-0 left-0 w-32 h-32 border-t-2 border-l-2 border-[#1a1a1a] opacity-50 pointer-events-none lg:hidden"></div>
            </div>
        </div>
    )
}
