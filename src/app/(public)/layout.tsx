import { PublicHeader } from "@/components/layout/PublicHeader"

export default function PublicLayout({ children }: { children: React.ReactNode }) {
    return (
        <>
            <PublicHeader />
            <main className="flex-grow pt-[145px] pb-20 px-4 sm:px-6 lg:px-8 max-w-[1440px] mx-auto w-full">
                {children}
            </main>

            {/* Floating Action WhatsApp Support */}
            <a
                href="https://wa.me/1234567890"
                target="_blank"
                rel="noreferrer"
                className="fixed bottom-8 right-8 z-50 group drop-shadow-2xl"
            >
                <span className="absolute right-full mr-4 top-1/2 -translate-y-1/2 bg-surface border border-surface-highlight text-text-main text-xs px-3 py-1.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-glass">
                    Soporte WhatsApp
                </span>
                <div className="w-14 h-14 bg-primary rounded-full flex items-center justify-center shadow-neon hover:scale-110 transition-transform cursor-pointer text-black">
                    <svg className="w-8 h-8 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.36 3.45 16.86L2.05 22L7.3 20.62C8.75 21.41 10.38 21.83 12.04 21.83C17.5 21.83 21.95 17.38 21.95 11.92C21.95 9.27 20.92 6.78 19.05 4.91C17.18 3.03 14.69 2 12.04 2ZM12.05 20.16C10.57 20.16 9.12 19.76 7.85 19.01L7.55 18.83L4.43 19.65L5.26 16.61L4.97 16.15C4.08 14.73 3.61 13.08 3.61 11.42C3.61 6.77 7.4 2.98 12.05 2.98C14.31 2.98 16.43 3.86 18.03 5.46C19.63 7.06 20.51 9.18 20.51 11.44C20.51 16.1 16.72 20.16 12.05 20.16ZM16.39 14.24C16.15 14.12 14.98 13.54 14.76 13.46C14.54 13.38 14.38 13.34 14.22 13.58C14.06 13.82 13.6 14.36 13.46 14.52C13.32 14.68 13.18 14.7 12.94 14.58C12.33 14.28 11.55 13.9 10.74 13.18C10.1 12.61 9.67 11.91 9.43 11.51C9.19 11.11 9.4 10.89 9.52 10.77C9.63 10.66 9.77 10.48 9.89 10.34C10.01 10.2 10.05 10.1 10.13 9.94C10.21 9.78 10.17 9.64 10.11 9.52C10.05 9.4 9.59 8.26 9.4 7.8C9.21 7.34 9.02 7.4 8.88 7.4H8.48C8.34 7.4 8.1 7.46 7.9 7.68C7.7 7.9 7.14 8.42 7.14 9.48C7.14 10.54 7.91 11.56 8.02 11.7C8.13 11.84 9.53 14 11.67 14.93C13.15 15.57 13.73 15.53 14.47 15.42C15.29 15.3 16.15 14.84 16.33 14.34C16.51 13.84 16.51 13.42 16.45 13.32C16.39 13.22 16.23 13.18 16.02 13.08H16.39V14.24Z" />
                    </svg>
                </div>
            </a>
        </>
    )
}
