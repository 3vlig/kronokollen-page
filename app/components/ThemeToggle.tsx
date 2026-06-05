"use client"

import { useEffect, useState } from 'react'

export default function ThemeToggle() {
  const [theme, setTheme] = useState<string | null>(null)

  useEffect(() => {
    try {
      const stored = localStorage.getItem('theme')
      if (stored) {
        setTheme(stored)
        document.documentElement.setAttribute('data-theme', stored)
      } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
        setTheme('light')
        document.documentElement.setAttribute('data-theme', 'light')
      } else {
        setTheme('dark')
        document.documentElement.removeAttribute('data-theme')
      }
    } catch (e) {
      // ignore
    }
  }, [])

  function toggle() {
    const next = theme === 'light' ? 'dark' : 'light'
    try {
      if (next === 'dark') {
        localStorage.setItem('theme', 'dark')
        document.documentElement.removeAttribute('data-theme')
      } else {
        localStorage.setItem('theme', 'light')
        document.documentElement.setAttribute('data-theme', 'light')
      }
    } catch (e) {
      // ignore
    }
    setTheme(next)
  }

  return (
    <button
      onClick={toggle}
      aria-label="Toggle theme"
      title={theme === 'light' ? 'Byt till mörkt tema' : 'Byt till ljust tema'}
      style={{
        border: '1px solid var(--border)',
        background: 'var(--bg-elevated)',
        color: 'var(--text-primary)',
        padding: '0.4rem 0.6rem',
        borderRadius: '999px',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.5rem',
      }}
    >
      {theme === 'light' ? (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 4V2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M12 22v-2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M4 12H2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M22 12h-2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M5 5l-1.5-1.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M19 19l-1.5-1.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M19 5l-1.5 1.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M6.5 18.5L5 20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ) : (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )}
      <span style={{ fontSize: '0.8rem', fontFamily: 'var(--font-display)', fontWeight: 600 }}>
        {theme === 'light' ? 'Ljus' : 'Mörk'}
      </span>
    </button>
  )
}
