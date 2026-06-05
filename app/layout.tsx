import type { Metadata, Viewport } from 'next'
import './globals.css'
import ThemeToggle from './components/ThemeToggle'

export const metadata: Metadata = {
  title: 'Kronokollen — Your Personal Economy Agent',
  description:
    'AI-powered personal finance agent. Monitors your subscriptions, loans, savings and acts on your behalf — with your permission.',
  keywords: ['personal finance', 'economy agent', 'savings', 'mortgage', 'subscriptions', 'BankID'],
  authors: [{ name: 'Kronokollen' }],
  robots: 'noindex',
  icons: {
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'><rect width='32' height='32' rx='8' fill='%23080b0f'/><path d='M8 22 L16 10 L24 22' stroke='%2300e5a0' stroke-width='2.5' fill='none' stroke-linecap='round' stroke-linejoin='round'/><circle cx='16' cy='10' r='2' fill='%2300e5a0'/></svg>",
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#080b0f',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      {/* Inline script to set initial theme before React hydrates, prevents flash */}
      <script
        dangerouslySetInnerHTML={{
          __html: `(function(){try{var t=localStorage.getItem('theme');if(t){document.documentElement.setAttribute('data-theme',t);}else if(window.matchMedia&&window.matchMedia('(prefers-color-scheme: light)').matches){document.documentElement.setAttribute('data-theme','light');}}catch(e){} })()`,
        }}
      />
      <body>
        <div style={{ position: 'fixed', top: 12, right: 12, zIndex: 9999 }}>
          <ThemeToggle />
        </div>
        {children}
      </body>
    </html>
  )
}