'use client'

import { useState, useEffect, useCallback, useRef } from 'react'

// ─── Types ──────────────────────────────────────────────────────────────────

type Screen = 'landing' | 'bankid' | 'onboarding' | 'dashboard'
type Tab = 'overview' | 'subscriptions' | 'loans' | 'savings' | 'spending' | 'agent'
type AgentAction = {
  id: string
  type: 'opportunity' | 'warning' | 'action' | 'done'
  title: string
  description: string
  saving?: string
  cta?: string
  ctaSecondary?: string
  impact: 'high' | 'medium' | 'low'
  category: string
  modal?: 'savings' | 'mortgage' | 'cancel-sub' | 'refinance'
}
type Toast = { id: string; message: string; type: 'success' | 'warning' | 'error' }
type ModalType = null | 'savings' | 'mortgage' | 'cancel-sub' | 'refinance' | 'bankid-confirm' | 'onboarding'

// ─── Data ────────────────────────────────────────────────────────────────────

const SUBSCRIPTIONS = [
  { id: 's1', name: 'Netflix', amount: 179, freq: '/mo', logo: '🎬', category: 'Entertainment', since: '2021-03', active: true, canOptimize: false },
  { id: 's2', name: 'Spotify Family', amount: 219, freq: '/mo', logo: '🎵', category: 'Entertainment', since: '2020-06', active: true, canOptimize: true },
  { id: 's3', name: 'Adobe CC', amount: 679, freq: '/mo', logo: '🎨', category: 'Software', since: '2022-01', active: true, canOptimize: true },
  { id: 's4', name: 'iCloud 200GB', amount: 29, freq: '/mo', logo: '☁️', category: 'Storage', since: '2023-04', active: true, canOptimize: false },
  { id: 's5', name: 'LinkedIn Premium', amount: 449, freq: '/mo', logo: '💼', category: 'Professional', since: '2023-01', active: true, canOptimize: true },
  { id: 's6', name: 'Storytel', amount: 179, freq: '/mo', logo: '📚', category: 'Entertainment', since: '2022-09', active: true, canOptimize: true },
  { id: 's7', name: 'Microsoft 365', amount: 99, freq: '/mo', logo: '📊', category: 'Software', since: '2021-07', active: true, canOptimize: false },
]

const LOANS = [
  { id: 'l1', name: 'Bolån – SEB', bank: 'SEB', type: 'mortgage', amount: 2_850_000, rate: 4.62, monthly: 14_200, remaining: 24, logo: '🏠' },
  { id: 'l2', name: 'Billån – Volkswagen', bank: 'VW Financial', type: 'car', amount: 180_000, rate: 6.9, monthly: 3_450, remaining: 38, logo: '🚗' },
  { id: 'l3', name: 'Privatlån – Nordea', bank: 'Nordea', type: 'personal', amount: 45_000, rate: 9.5, monthly: 1_240, remaining: 42, logo: '💰' },
]

const SAVINGS = [
  { id: 'sv1', name: 'SEB Sparkonto', bank: 'SEB', balance: 85_000, rate: 1.4, type: 'savings', logo: '🏦' },
  { id: 'sv2', name: 'Handelsbanken ISK', bank: 'Handelsbanken', balance: 42_000, rate: 0, type: 'isk', logo: '📈' },
  { id: 'sv3', name: 'Avanza Aktier', bank: 'Avanza', balance: 68_000, rate: 0, type: 'stocks', logo: '📊' },
]

const BEST_SAVINGS = [
  { bank: 'Klarna', product: 'Sparkonto+', rate: 3.8, minAmount: 0, maxAmount: 1_000_000, openFee: 0, logo: '💎' },
  { bank: 'Collector Bank', product: 'Sparkonto', rate: 3.65, minAmount: 0, maxAmount: 5_000_000, openFee: 0, logo: '🏛️' },
  { bank: 'Hoist Finance', product: 'Sparkonto', rate: 3.55, minAmount: 1_000, maxAmount: 2_000_000, openFee: 0, logo: '🔒' },
]

const MORTGAGE_OFFERS = [
  { bank: 'Länsförsäkringar', rate: 2.1, saving: 7_140, monthly: 14_200 - 7_140/12, logo: '🌿', badge: 'Bäst just nu' },
  { bank: 'Skandiabanken', rate: 2.35, saving: 5_820, monthly: 13_715, logo: '🔵', badge: '' },
  { bank: 'SBAB', rate: 2.48, saving: 4_990, monthly: 13_385, logo: '🟡', badge: '' },
]

const AGENT_ACTIONS: AgentAction[] = [
  {
    id: 'a1',
    type: 'opportunity',
    title: 'Flytta ditt bolån — spara 7 140 kr/mån',
    description: 'Länsförsäkringar erbjuder nu 2,1% ränta på bolån. Din nuvarande ränta hos SEB är 4,62%. Vi kan hantera hela flytten åt dig.',
    saving: '85 680 kr/år',
    cta: 'Flytta bolån',
    ctaSecondary: 'Se erbjudanden',
    impact: 'high',
    category: 'mortgage',
    modal: 'mortgage',
  },
  {
    id: 'a2',
    type: 'opportunity',
    title: 'Bättre sparkonto för dina 85 000 kr',
    description: 'Du tjänar 1,4% hos SEB. Klarna Sparkonto+ ger 3,8% — det är 2 040 kr mer per år utan någon risk.',
    saving: '2 040 kr/år',
    cta: 'Flytta sparpengar',
    ctaSecondary: 'Jämför konton',
    impact: 'high',
    category: 'savings',
    modal: 'savings',
  },
  {
    id: 'a3',
    type: 'warning',
    title: 'LinkedIn Premium — används sällan',
    description: 'Du har öppnat LinkedIn 3 gånger senaste månaden men betalar 449 kr/mån. Vill du pausa eller avsluta?',
    saving: '5 388 kr/år',
    cta: 'Avsluta prenumeration',
    ctaSecondary: 'Behåll',
    impact: 'medium',
    category: 'subscription',
    modal: 'cancel-sub',
  },
  {
    id: 'a4',
    type: 'opportunity',
    title: 'Refinansiera privatlånet',
    description: 'Ditt privatlån hos Nordea ligger på 9,5%. Vi hittade Marginalen Bank med 6,2% — spara 1 440 kr/mån.',
    saving: '17 280 kr/år',
    cta: 'Refinansiera',
    ctaSecondary: 'Läs mer',
    impact: 'high',
    category: 'loan',
    modal: 'refinance',
  },
  {
    id: 'a5',
    type: 'warning',
    title: 'Adobe CC dubbeldubbleras',
    description: 'Spotify-familjeplan inkluderar redan 3 månader Adobe Express. Du betalar potentiellt för överlappande tjänster.',
    saving: '2 400 kr/år',
    cta: 'Granska',
    ctaSecondary: 'Ignorera',
    impact: 'medium',
    category: 'subscription',
  },
]

// ─── Helpers ────────────────────────────────────────────────────────────────

const fmt = (n: number, dec = 0) =>
  n.toLocaleString('sv-SE', { minimumFractionDigits: dec, maximumFractionDigits: dec })

const fmtCurrency = (n: number) => `${fmt(n)} kr`

// ─── Sub-components ──────────────────────────────────────────────────────────

function AgentBadge({ active }: { active: boolean }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
      <div style={{
        width: 8, height: 8, borderRadius: '50%',
        background: active ? 'var(--accent)' : 'var(--text-muted)',
        boxShadow: active ? '0 0 6px var(--accent), 0 0 12px var(--accent-glow)' : 'none',
        animation: active ? 'pulse-glow 2s infinite' : 'none',
      }} />
      <span style={{ color: active ? 'var(--accent)' : 'var(--text-muted)', fontSize: '0.75rem', fontFamily: 'var(--font-display)', fontWeight: 600 }}>
        {active ? 'AGENT AKTIV' : 'AGENT OFFLINE'}
      </span>
    </div>
  )
}

function ImpactBar({ impact }: { impact: 'high' | 'medium' | 'low' }) {
  const map = { high: { color: 'var(--accent)', w: '100%', label: 'Hög' }, medium: { color: 'var(--warn)', w: '65%', label: 'Medel' }, low: { color: 'var(--info)', w: '35%', label: 'Låg' } }
  const { color, w, label } = map[impact]
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
      <div style={{ width: 48, height: 3, background: 'var(--bg-elevated)', borderRadius: 100, overflow: 'hidden' }}>
        <div style={{ width: w, height: '100%', background: color, borderRadius: 100 }} />
      </div>
      <span style={{ fontSize: '0.7rem', color, fontWeight: 600, fontFamily: 'var(--font-display)' }}>{label}</span>
    </div>
  )
}

// ─── Modals ──────────────────────────────────────────────────────────────────

function SavingsModal({ onClose, onConfirm }: { onClose: () => void; onConfirm: () => void }) {
  const [step, setStep] = useState<'compare' | 'confirm' | 'bankid' | 'done'>('compare')
  const [chosen, setChosen] = useState(0)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    if (step === 'bankid') {
      let p = 0
      const iv = setInterval(() => {
        p += Math.random() * 12
        if (p >= 100) { p = 100; clearInterval(iv); setTimeout(() => setStep('done'), 600) }
        setProgress(Math.min(p, 100))
      }, 200)
      return () => clearInterval(iv)
    }
  }, [step])

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        {step === 'compare' && (
          <>
            <div style={{ marginBottom: '1.5rem' }}>
              <span className="badge badge-green" style={{ marginBottom: '0.75rem' }}>💰 Sparoptimering</span>
              <h2 style={{ fontSize: '1.4rem', marginBottom: '0.5rem' }}>Bästa sparkontot för 85 000 kr</h2>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>Jag hittade dessa alternativ med högre ränta än ditt nuvarande SEB-konto (1,4%).</p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
              {BEST_SAVINGS.map((s, i) => (
                <div key={i} onClick={() => setChosen(i)} style={{
                  padding: '1rem',
                  borderRadius: 'var(--radius-md)',
                  border: `1px solid ${chosen === i ? 'var(--accent)' : 'var(--border)'}`,
                  background: chosen === i ? 'var(--accent-dim)' : 'var(--bg-elevated)',
                  cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: '1rem',
                  transition: 'all 0.15s',
                }}>
                  <span style={{ fontSize: '1.5rem' }}>{s.logo}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700 }}>{s.bank}</span>
                      {i === 0 && <span className="badge badge-green" style={{ fontSize: '0.65rem' }}>Bäst</span>}
                    </div>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>{s.product}</span>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.2rem', color: 'var(--accent)' }}>{s.rate}%</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                      +{fmtCurrency(Math.round(85000 * (s.rate - 1.4) / 100))}/år mer
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ background: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)', padding: '1rem', marginBottom: '1.5rem' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Vad agenten gör åt dig:</div>
              {['Öppnar nytt konto hos ' + BEST_SAVINGS[chosen].bank, 'Överför 85 000 kr automatiskt', 'Stänger ditt SEB Sparkonto'].map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem', fontSize: '0.82rem' }}>
                  <span style={{ color: 'var(--accent)' }}>✓</span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button className="btn btn-secondary" style={{ flex: 1 }} onClick={onClose}>Avbryt</button>
              <button className="btn btn-primary" style={{ flex: 2 }} onClick={() => setStep('confirm')}>
                Ja, gör detta åt mig →
              </button>
            </div>
          </>
        )}

        {step === 'confirm' && (
          <>
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>🔐</div>
              <h2 style={{ marginBottom: '0.5rem' }}>Bekräfta med BankID</h2>
              <p style={{ color: 'var(--text-secondary)' }}>Signera för att ge Kronokollen tillstånd att flytta dina 85 000 kr till {BEST_SAVINGS[chosen].bank}.</p>
            </div>
            <div style={{ background: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)', padding: '1rem', marginBottom: '1.5rem', fontFamily: 'var(--font-body)', fontSize: '0.82rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Från</span>
                <span>SEB Sparkonto · 85 000 kr</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Till</span>
                <span>{BEST_SAVINGS[chosen].bank} · {BEST_SAVINGS[chosen].product}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Ny ränta</span>
                <span style={{ color: 'var(--accent)' }}>{BEST_SAVINGS[chosen].rate}%</span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setStep('compare')}>Tillbaka</button>
              <button className="btn btn-primary" style={{ flex: 2 }} onClick={() => setStep('bankid')}>
                ✍️ Signera med BankID
              </button>
            </div>
          </>
        )}

        {step === 'bankid' && (
          <div style={{ textAlign: 'center', padding: '1rem 0' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📱</div>
            <h2 style={{ marginBottom: '0.75rem' }}>Öppna BankID</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>Bekräfta i din BankID-app för att fortsätta.</p>
            <div style={{ marginBottom: '1rem' }}>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${progress}%` }} />
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <div className="agent-typing">
                <span /><span /><span />
              </div>
            </div>
          </div>
        )}

        {step === 'done' && (
          <div style={{ textAlign: 'center', padding: '1rem 0' }}>
            <div style={{ fontSize: '3.5rem', marginBottom: '1rem', animation: 'scaleIn 0.4s cubic-bezier(0.34,1.56,0.64,1)' }}>✅</div>
            <h2 style={{ marginBottom: '0.5rem', color: 'var(--accent)' }}>Klart!</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
              85 000 kr är nu på väg till ditt nya {BEST_SAVINGS[chosen].bank}-konto.<br />
              Du tjänar nu <strong style={{ color: 'var(--accent)' }}>{fmtCurrency(Math.round(85000 * (BEST_SAVINGS[chosen].rate - 1.4) / 100))} mer per år</strong>.
            </p>
            <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => { onConfirm(); onClose() }}>Perfekt!</button>
          </div>
        )}
      </div>
    </div>
  )
}

function MortgageModal({ onClose, onConfirm }: { onClose: () => void; onConfirm: () => void }) {
  const [step, setStep] = useState<'offers' | 'confirm' | 'bankid' | 'done'>('offers')
  const [chosen, setChosen] = useState(0)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    if (step === 'bankid') {
      let p = 0
      const iv = setInterval(() => {
        p += Math.random() * 8
        if (p >= 100) { p = 100; clearInterval(iv); setTimeout(() => setStep('done'), 600) }
        setProgress(Math.min(p, 100))
      }, 300)
      return () => clearInterval(iv)
    }
  }, [step])

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 560 }} onClick={e => e.stopPropagation()}>
        {step === 'offers' && (
          <>
            <div style={{ marginBottom: '1.5rem' }}>
              <span className="badge badge-green" style={{ marginBottom: '0.75rem' }}>🏠 Bolåneflytt</span>
              <h2 style={{ fontSize: '1.4rem', marginBottom: '0.5rem' }}>Bättre bolåneränta hittad</h2>
              <p style={{ color: 'var(--text-secondary)' }}>Baserat på ditt bolån på 2 850 000 kr hittade jag dessa erbjudanden:</p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
              {MORTGAGE_OFFERS.map((o, i) => (
                <div key={i} onClick={() => setChosen(i)} style={{
                  padding: '1rem 1.25rem',
                  borderRadius: 'var(--radius-md)',
                  border: `1px solid ${chosen === i ? 'var(--accent)' : 'var(--border)'}`,
                  background: chosen === i ? 'var(--accent-dim)' : 'var(--bg-elevated)',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span style={{ fontSize: '1.4rem' }}>{o.logo}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700 }}>{o.bank}</span>
                        {o.badge && <span className="badge badge-green" style={{ fontSize: '0.65rem' }}>{o.badge}</span>}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Rörlig ränta 3 mån</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.3rem', color: 'var(--accent)' }}>{o.rate}%</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>spara {fmtCurrency(o.saving)}/år</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="action-card" style={{ marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Månatlig besparing</div>
                  <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.8rem', color: 'var(--accent)' }}>
                    {fmtCurrency(Math.round(MORTGAGE_OFFERS[chosen].saving / 12))}/mån
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Per år</div>
                  <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.2rem' }}>{fmtCurrency(MORTGAGE_OFFERS[chosen].saving)}</div>
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button className="btn btn-secondary" style={{ flex: 1 }} onClick={onClose}>Avbryt</button>
              <button className="btn btn-primary" style={{ flex: 2 }} onClick={() => setStep('confirm')}>
                Flytta bolån till {MORTGAGE_OFFERS[chosen].bank} →
              </button>
            </div>
          </>
        )}

        {step === 'confirm' && (
          <>
            <div style={{ marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.3rem', marginBottom: '0.75rem' }}>Bekräfta bolåneflytt</h2>
              <p style={{ color: 'var(--text-secondary)' }}>Kronokollen hanterar hela processen, inklusive kontakt med banker och pappersarbete.</p>
            </div>
            <div style={{ background: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)', padding: '1rem', marginBottom: '1.5rem' }}>
              {[
                ['Från', `SEB · 4,62% · ${fmtCurrency(14200)}/mån`],
                ['Till', `${MORTGAGE_OFFERS[chosen].bank} · ${MORTGAGE_OFFERS[chosen].rate}%`],
                ['Ny månadsbetalning', `${fmtCurrency(Math.round(MORTGAGE_OFFERS[chosen].monthly))}/mån`],
                ['Besparing', `${fmtCurrency(Math.round(MORTGAGE_OFFERS[chosen].saving / 12))}/mån`],
              ].map(([label, val]) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.82rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>{label}</span>
                  <span style={label === 'Besparing' ? { color: 'var(--accent)' } : undefined}>{val}</span>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setStep('offers')}>Tillbaka</button>
              <button className="btn btn-primary" style={{ flex: 2 }} onClick={() => setStep('bankid')}>✍️ Signera med BankID</button>
            </div>
          </>
        )}

        {step === 'bankid' && (
          <div style={{ textAlign: 'center', padding: '1rem 0' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📱</div>
            <h2 style={{ marginBottom: '0.75rem' }}>BankID</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>Signera bolåneflytten i BankID-appen.</p>
            <div className="progress-bar" style={{ marginBottom: '1.5rem' }}>
              <div className="progress-fill" style={{ width: `${progress}%` }} />
            </div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Ansluter till {MORTGAGE_OFFERS[chosen].bank}…</div>
          </div>
        )}

        {step === 'done' && (
          <div style={{ textAlign: 'center', padding: '1rem 0' }}>
            <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>🎉</div>
            <h2 style={{ marginBottom: '0.5rem', color: 'var(--accent)' }}>Bolånet är flytt!</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
              Din ansökan hos {MORTGAGE_OFFERS[chosen].bank} är inskickad.<br />
              Vänta 2–3 bankdagar för slutlig bekräftelse.<br />
              Du sparar <strong style={{ color: 'var(--accent)' }}>{fmtCurrency(MORTGAGE_OFFERS[chosen].saving)} per år</strong>.
            </p>
            <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => { onConfirm(); onClose() }}>Fantastiskt!</button>
          </div>
        )}
      </div>
    </div>
  )
}

function CancelSubModal({ onClose, onConfirm }: { onClose: () => void; onConfirm: () => void }) {
  const [step, setStep] = useState<'confirm' | 'done'>('confirm')
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        {step === 'confirm' ? (
          <>
            <div style={{ marginBottom: '1.5rem' }}>
              <span className="badge badge-warn" style={{ marginBottom: '0.75rem' }}>💼 Prenumeration</span>
              <h2 style={{ fontSize: '1.3rem', marginBottom: '0.5rem' }}>Avsluta LinkedIn Premium?</h2>
              <p style={{ color: 'var(--text-secondary)' }}>Du sparar <strong style={{ color: 'var(--accent)' }}>449 kr/mån (5 388 kr/år)</strong>. Jag avslutar kontot åt dig direkt.</p>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button className="btn btn-secondary" style={{ flex: 1 }} onClick={onClose}>Behåll</button>
              <button className="btn btn-danger" style={{ flex: 1 }} onClick={() => setStep('done')}>Avsluta prenumeration</button>
            </div>
          </>
        ) : (
          <div style={{ textAlign: 'center', padding: '0.5rem 0' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✅</div>
            <h2 style={{ marginBottom: '0.5rem' }}>Avslutat!</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>LinkedIn Premium avslutas efter din nuvarande faktureringsperiod.</p>
            <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => { onConfirm(); onClose() }}>OK</button>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Landing + BankID screens ─────────────────────────────────────────────────

function LandingScreen({ onStart }: { onStart: () => void }) {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem', position: 'relative', overflow: 'hidden' }}>
      {/* Grid background */}
      <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)', backgroundSize: '60px 60px', opacity: 0.4 }} />
      {/* Glow */}
      <div style={{ position: 'absolute', top: '20%', left: '50%', transform: 'translateX(-50%)', width: 'min(600px, 100%)', height: 'min(600px, 100%)', borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,229,160,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />
      
      <div style={{ position: 'relative', textAlign: 'center', maxWidth: 640, animation: 'fadeUp 0.7s ease' }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', marginBottom: '2.5rem' }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 24px var(--accent-glow)', fontSize: '1.2rem', fontWeight: 900, color: '#080b0f', fontFamily: 'var(--font-display)' }}>K</div>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.4rem', letterSpacing: '-0.04em' }}>kronokollen</span>
          <AgentBadge active />
        </div>

        <h1 style={{ fontSize: 'clamp(2.4rem, 6vw, 4rem)', fontWeight: 800, letterSpacing: '-0.04em', marginBottom: '1.25rem', lineHeight: 1.1 }}>
          Din personliga<br />
          <span style={{ color: 'var(--accent)', fontStyle: 'italic', fontFamily: 'var(--font-serif)' }}>ekonomiagent</span>
        </h1>
        <p style={{ fontSize: '1.05rem', color: 'var(--text-secondary)', maxWidth: 480, margin: '0 auto 2.5rem', lineHeight: 1.7 }}>
          Kronokollen övervakar dina prenumerationer, lån och sparkonton — och agerar på dina vägnar. Flytta bolån, optimera sparande, avsluta abonnemang. Automatiskt.
        </p>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', justifyContent: 'center', marginBottom: '2.5rem' }}>
          {['🏠 Bolåneflytt', '💰 Sparoptimering', '📱 Prenumerationer', '📊 Låneflytt', '🔐 BankID-säkert'].map(item => (
            <span key={item} className="chip" style={{ cursor: 'default' }}>{item}</span>
          ))}
        </div>

        <button className="btn btn-primary" style={{ fontSize: '1rem', padding: '0.85rem 2.5rem', borderRadius: 'var(--radius-lg)' }} onClick={onStart}>
          Kom igång gratis →
        </button>

        <p style={{ marginTop: '1.25rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          Logga in med BankID · Ingen manuell inmatning · Alltid under din kontroll
        </p>
      </div>
    </div>
  )
}

function BankIDScreen({ onComplete }: { onComplete: () => void }) {
  const [step, setStep] = useState<'start' | 'scanning' | 'syncing'>('start')
  const [progress, setProgress] = useState(0)
  const [syncMsg, setSyncMsg] = useState('Ansluter till banker...')

  const syncMessages = ['Ansluter till banker...', 'Hämtar transaktioner...', 'Analyserar prenumerationer...', 'Beräknar besparingar...', 'Identifierar möjligheter...']

  useEffect(() => {
    if (step === 'scanning') {
      let p = 0
      const iv = setInterval(() => {
        p += Math.random() * 14
        if (p >= 100) { p = 100; clearInterval(iv); setTimeout(() => setStep('syncing'), 400) }
        setProgress(Math.min(p, 100))
      }, 200)
      return () => clearInterval(iv)
    }
    if (step === 'syncing') {
      let i = 0
      setSyncMsg(syncMessages[0])
      const iv = setInterval(() => {
        i++
        if (i >= syncMessages.length) { clearInterval(iv); setTimeout(onComplete, 600) }
        else setSyncMsg(syncMessages[i])
      }, 700)
      return () => clearInterval(iv)
    }
  }, [step])

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div style={{ width: 'min(440px, 100%)', animation: 'fadeUp 0.5s ease' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, color: '#080b0f', fontFamily: 'var(--font-display)', fontSize: '1rem' }}>K </div>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, letterSpacing: '-0.04em' }}>kronokollen</span>
          </div>
        </div>

        <div className="card" style={{ padding: '2rem', textAlign: 'center' }}>
          {step === 'start' && (
            <>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔐</div>
              <h2 style={{ fontSize: '1.4rem', marginBottom: '0.75rem' }}>Logga in med BankID</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '1.75rem', lineHeight: 1.6 }}>
                Kronokollen använder BankID för att säkert koppla ihop med dina banker och automatiskt analysera din ekonomi.
              </p>
              <div style={{ background: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)', padding: '1rem', marginBottom: '1.75rem', fontSize: '0.82rem', textAlign: 'left' }}>
                {['✓ Läsbehörighet till dina konton', '✓ Säker krypterad anslutning (PSD2)', '✓ Du godkänner varje åtgärd', '✓ Vi säljer aldrig din data'].map(i => (
                  <div key={i} style={{ color: 'var(--text-secondary)', marginBottom: '0.4rem' }}><span style={{ color: 'var(--accent)' }}>✓</span> {i.slice(2)}</div>
                ))}
              </div>
              <button className="btn btn-primary" style={{ width: '100%', fontSize: '1rem', padding: '0.85rem' }} onClick={() => setStep('scanning')}>
                📱 Öppna BankID
              </button>
            </>
          )}

          {step === 'scanning' && (
            <>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📲</div>
              <h2 style={{ marginBottom: '0.75rem' }}>Bekräfta i BankID-appen</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>Öppna BankID och godkänn anslutningen till Kronokollen.</p>
              <div className="progress-bar" style={{ marginBottom: '0.5rem' }}>
                <div className="progress-fill" style={{ width: `${progress}%` }} />
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textAlign: 'right' }}>{Math.round(progress)}%</div>
            </>
          )}

          {step === 'syncing' && (
            <>
              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ width: 48, height: 48, border: '3px solid var(--border)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 1rem' }} />
                <h2 style={{ marginBottom: '0.5rem' }}>Synkroniserar</h2>
                <p style={{ color: 'var(--accent)', fontFamily: 'var(--font-body)', fontSize: '0.85rem' }}>{syncMsg}</p>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                {['🏦 SEB', '🏛️ Nordea', '💙 Handelsbanken', '🟠 Swedbank'].map(b => (
                  <span key={b} className="chip" style={{ fontSize: '0.72rem', cursor: 'default' }}>{b}</span>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

function Sidebar({ tab, setTab, collapsed, setCollapsed }: { tab: Tab; setTab: (t: Tab) => void; collapsed: boolean; setCollapsed: (v: boolean) => void }) {
  const items: { id: Tab; icon: string; label: string; badge?: number }[] = [
    { id: 'overview', icon: '◈', label: 'Översikt' },
    { id: 'agent', icon: '⚡', label: 'Agent', badge: 5 },
    { id: 'subscriptions', icon: '📱', label: 'Prenumerationer' },
    { id: 'loans', icon: '🏦', label: 'Lån & Bolån' },
    { id: 'savings', icon: '💰', label: 'Sparande' },
    { id: 'spending', icon: '📊', label: 'Utgifter' },
  ]

  return (
    <aside className="dashboard-sidebar" style={{
      width: collapsed ? 64 : 240,
      background: 'var(--bg-surface)',
      borderRight: '1px solid var(--border)',
      display: 'flex',
      flexDirection: 'column',
      padding: '1.25rem 0.75rem',
      transition: 'width 0.25s cubic-bezier(0.4,0,0.2,1)',
      flexShrink: 0,
      position: 'relative',
      zIndex: 10,
      overflowX: 'hidden',
    }}>
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0 0.25rem', marginBottom: '2rem', overflow: 'hidden' }}>
        <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, color: '#080b0f', fontFamily: 'var(--font-display)', fontSize: '1rem', flexShrink: 0 }}>K</div>
        {!collapsed && <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.1rem', letterSpacing: '-0.04em' }}>kronokollen</span>}
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
        {items.map(item => (
          <button key={item.id} className={`nav-item${tab === item.id ? ' active' : ''}`} onClick={() => setTab(item.id)}
            style={{ justifyContent: collapsed ? 'center' : 'flex-start', padding: collapsed ? '0.65rem' : '0.65rem 1rem' }}>
            <span className="nav-icon" style={{ fontSize: '1rem', textAlign: 'center' }}>{item.icon}</span>
            {!collapsed && (
              <>
                <span style={{ flex: 1, textAlign: 'left' }}>{item.label}</span>
                {item.badge && <span style={{ background: 'var(--accent)', color: '#080b0f', borderRadius: 100, padding: '0.1rem 0.45rem', fontSize: '0.7rem', fontWeight: 700 }}>{item.badge}</span>}
              </>
            )}
          </button>
        ))}
      </nav>

      {/* Agent status */}
      {!collapsed && (
        <div className="agent-status" style={{ padding: '0.75rem', background: 'var(--accent-dim)', border: '1px solid var(--accent-glow)', borderRadius: 'var(--radius-md)', marginTop: '1rem' }}>
          <AgentBadge active />
          <div style={{ marginTop: '0.4rem', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>5 möjligheter identifierade</div>
        </div>
      )}

      {/* Collapse toggle */}
      <button className="sidebar-toggle" onClick={() => setCollapsed(!collapsed)} style={{ marginTop: '1rem', padding: '0.5rem', background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {collapsed ? '→' : '←'}
      </button>
    </aside>
  )
}

function OverviewTab({ setModal, dismissedActions, onDismiss }: { setModal: (m: ModalType) => void; dismissedActions: string[]; onDismiss: (id: string) => void }) {
  const totalSub = SUBSCRIPTIONS.reduce((s, x) => s + x.amount, 0)
  const totalLoans = LOANS.reduce((s, x) => s + x.monthly, 0)
  const totalSavings = SAVINGS.reduce((s, x) => s + x.balance, 0)
  const potentialSaving = 7140 + 170 + 449 + 1440

  return (
    <div style={{ padding: '2rem', animation: 'fadeUp 0.4s ease' }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
          <h1 style={{ fontSize: '1.75rem' }}>God morgon, Anna 👋</h1>
        </div>
        <p style={{ color: 'var(--text-secondary)' }}>Jag hittade sätt att spara <strong style={{ color: 'var(--accent)' }}>{fmtCurrency(potentialSaving)}/mån</strong> i dag.</p>
      </div>

      {/* Stats grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        {[
          { label: 'Totalt sparande', value: fmtCurrency(totalSavings), color: 'var(--accent)', sub: '+2,3% denna månaden' },
          { label: 'Månadsutgifter', value: fmtCurrency(totalSub + totalLoans), color: 'var(--text-primary)', sub: `${SUBSCRIPTIONS.length} prenumerationer` },
          { label: 'Lånekostnad', value: fmtCurrency(totalLoans), color: 'var(--warn)', sub: `${LOANS.length} aktiva lån` },
          { label: 'Möjlig besparing', value: fmtCurrency(potentialSaving) + '/mån', color: 'var(--accent)', sub: '5 åtgärder tillgängliga' },
        ].map(stat => (
          <div key={stat.label} className="card" style={{ padding: '1.25rem' }}>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.35rem', color: stat.color, letterSpacing: '-0.03em', marginBottom: '0.25rem' }}>{stat.value}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.2rem', fontFamily: 'var(--font-display)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{stat.label}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{stat.sub}</div>
          </div>
        ))}
      </div>

      {/* Top agent actions */}
      <div style={{ marginBottom: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h2 style={{ fontSize: '1.1rem' }}>Agent-rekommendationer</h2>
        <span className="badge badge-green">5 nya</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {AGENT_ACTIONS.filter(a => !dismissedActions.includes(a.id)).slice(0, 3).map(action => (
          <div key={action.id} className="action-card">
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
              <div>
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
                  <span className={`badge ${action.type === 'opportunity' ? 'badge-green' : 'badge-warn'}`}>{action.type === 'opportunity' ? '💡 Möjlighet' : '⚠️ Varning'}</span>
                  <ImpactBar impact={action.impact} />
                </div>
                <h3 style={{ fontSize: '1rem', marginBottom: '0.4rem' }}>{action.title}</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '0.75rem', lineHeight: 1.5 }}>{action.description}</p>
                <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap', alignItems: 'center' }}>
                  {action.saving && <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--accent)', fontSize: '0.95rem' }}>+{action.saving}</span>}
                  {action.cta && action.modal && (
                    <button className="btn btn-primary" style={{ padding: '0.45rem 1rem', fontSize: '0.82rem' }} onClick={() => setModal(action.modal!)}>
                      {action.cta}
                    </button>
                  )}
                  {action.ctaSecondary && (
                    <button className="btn btn-ghost" style={{ padding: '0.45rem 0.85rem', fontSize: '0.82rem' }} onClick={() => onDismiss(action.id)}>
                      {action.ctaSecondary}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function AgentTab({ setModal, dismissedActions, onDismiss, doneActions }: { setModal: (m: ModalType) => void; dismissedActions: string[]; onDismiss: (id: string) => void; doneActions: string[] }) {
  const active = AGENT_ACTIONS.filter(a => !dismissedActions.includes(a.id) && !doneActions.includes(a.id))
  const done = AGENT_ACTIONS.filter(a => doneActions.includes(a.id))
  const totalSaving = active.reduce((s, a) => {
    const match = a.saving?.match(/[\d\s]+/)
    if (!match) return s
    return s + parseInt(match[0].replace(/\s/g, ''))
  }, 0)

  return (
    <div style={{ padding: '2rem', animation: 'fadeUp 0.4s ease' }}>
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.75rem' }}>
          <h1 style={{ fontSize: '1.75rem' }}>Agent-centrum</h1>
          <AgentBadge active />
        </div>
        <p style={{ color: 'var(--text-secondary)' }}>
          {active.length} aktiva möjligheter · Potentiell besparing: <strong style={{ color: 'var(--accent)' }}>~{fmtCurrency(totalSaving)}/år</strong>
        </p>
      </div>

      {active.map((action, i) => (
        <div key={action.id} className="action-card" style={{ marginBottom: '1rem', animationDelay: `${i * 0.08}s`, opacity: 0, animation: `fadeUp 0.4s ease ${i * 0.08}s forwards` }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                <span className={`badge ${action.type === 'opportunity' ? 'badge-green' : 'badge-warn'}`}>
                  {action.type === 'opportunity' ? '💡' : '⚠️'} {action.type === 'opportunity' ? 'Möjlighet' : 'Varning'}
                </span>
                <span className="badge badge-muted">{action.category}</span>
                <ImpactBar impact={action.impact} />
              </div>
              <h3 style={{ fontSize: '1.05rem', marginBottom: '0.4rem' }}>{action.title}</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '0.85rem', lineHeight: 1.6 }}>{action.description}</p>
              <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap', alignItems: 'center' }}>
                {action.saving && (
                  <div style={{ padding: '0.3rem 0.75rem', background: 'var(--accent-dim)', border: '1px solid var(--accent-glow)', borderRadius: 100, fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--accent)', fontSize: '0.85rem' }}>
                    Sparar {action.saving}
                  </div>
                )}
                {action.modal && action.cta && (
                  <button className="btn btn-primary" style={{ padding: '0.45rem 1rem', fontSize: '0.82rem' }} onClick={() => setModal(action.modal!)}>
                    {action.cta}
                  </button>
                )}
                <button className="btn btn-ghost" style={{ padding: '0.45rem 0.75rem', fontSize: '0.78rem' }} onClick={() => onDismiss(action.id)}>
                  Ignorera
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}

      {done.length > 0 && (
        <>
          <div style={{ marginTop: '2rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <h2 style={{ fontSize: '1.1rem' }}>Genomförda åtgärder</h2>
            <span className="badge badge-green">{done.length}</span>
          </div>
          {done.map(action => (
            <div key={action.id} className="card" style={{ marginBottom: '0.75rem', opacity: 0.6 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span style={{ color: 'var(--accent)', fontSize: '1.2rem' }}>✓</span>
                <div>
                  <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600 }}>{action.title}</div>
                  {action.saving && <div style={{ fontSize: '0.8rem', color: 'var(--accent)' }}>Sparar {action.saving}</div>}
                </div>
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  )
}

function SubscriptionsTab({ setModal }: { setModal: (m: ModalType) => void }) {
  const total = SUBSCRIPTIONS.reduce((s, x) => s + x.amount, 0)
  return (
    <div style={{ padding: '2rem', animation: 'fadeUp 0.4s ease' }}>
      <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', marginBottom: '0.25rem' }}>Prenumerationer</h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            {SUBSCRIPTIONS.length} aktiva · <span style={{ color: 'var(--warn)' }}>{fmtCurrency(total)}/mån</span>
          </p>
        </div>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '2rem', color: 'var(--warn)' }}>{fmtCurrency(total * 12)}/år</div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {SUBSCRIPTIONS.map(sub => (
          <div key={sub.id} className="card" style={{ padding: '1rem 1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <span style={{ fontSize: '1.5rem', width: 40, textAlign: 'center' }}>{sub.logo}</span>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700 }}>{sub.name}</span>
                  {sub.canOptimize && <span className="badge badge-warn" style={{ fontSize: '0.65rem' }}>Kan optimeras</span>}
                </div>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{sub.category} · sedan {sub.since}</span>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1rem' }}>{fmtCurrency(sub.amount)}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{sub.freq}</div>
              </div>
              {sub.canOptimize && (
                <button className="btn btn-ghost" style={{ padding: '0.4rem 0.75rem', fontSize: '0.78rem' }} onClick={() => setModal('cancel-sub')}>
                  Hantera
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="action-card" style={{ marginTop: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: '0.3rem' }}>⚡ Agenten kan spara dig {fmtCurrency(5388 + 2400)}/år</div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>LinkedIn Premium används sällan. Adobe CC kan ha överlapp med andra tjänster.</p>
          </div>
          <button className="btn btn-primary" style={{ marginLeft: '1rem', whiteSpace: 'nowrap', padding: '0.5rem 1rem', fontSize: '0.82rem' }} onClick={() => setModal('cancel-sub')}>
            Optimera
          </button>
        </div>
      </div>
    </div>
  )
}

function LoansTab({ setModal }: { setModal: (m: ModalType) => void }) {
  return (
    <div style={{ padding: '2rem', animation: 'fadeUp 0.4s ease' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', marginBottom: '0.25rem' }}>Lån & Bolån</h1>
        <p style={{ color: 'var(--text-secondary)' }}>3 aktiva lån · <span style={{ color: 'var(--warn)' }}>Potentiell besparing: {fmtCurrency(7140 + 1440)}/mån</span></p>
      </div>

      <div className="action-card" style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <span className="badge badge-green" style={{ marginBottom: '0.5rem' }}>🔥 Hög prioritet</span>
            <h3 style={{ fontSize: '1.05rem', marginBottom: '0.3rem' }}>Länsförsäkringar erbjuder 2,1% bolåneränta</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Din nuvarande ränta hos SEB är 4,62%. Spara {fmtCurrency(7140)}/mån.</p>
          </div>
          <button className="btn btn-primary" style={{ padding: '0.6rem 1.25rem' }} onClick={() => setModal('mortgage')}>Flytta bolån →</button>
        </div>
      </div>

      {LOANS.map(loan => (
        <div key={loan.id} className="card" style={{ marginBottom: '0.75rem', padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
            <span style={{ fontSize: '1.6rem' }}>{loan.logo}</span>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <div>
                  <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1rem' }}>{loan.name}</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{loan.bank}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.2rem', color: loan.rate > 7 ? 'var(--danger)' : loan.rate > 4 ? 'var(--warn)' : 'var(--accent)' }}>{loan.rate}%</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>ränta</div>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
                {[
                  ['Skuld', fmtCurrency(loan.amount)],
                  ['Månadsbet.', fmtCurrency(loan.monthly)],
                  ['Löptid', `${loan.remaining} mån`],
                ].map(([label, val]) => (
                  <div key={label}>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '0.2rem', fontFamily: 'var(--font-display)', fontWeight: 600, textTransform: 'uppercase' }}>{label}</div>
                    <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.9rem' }}>{val}</div>
                  </div>
                ))}
              </div>
              {loan.type === 'mortgage' && (
                <div style={{ marginTop: '0.75rem' }}>
                  <button className="btn btn-secondary" style={{ fontSize: '0.78rem', padding: '0.4rem 0.85rem' }} onClick={() => setModal('mortgage')}>
                    Se bättre erbjudanden
                  </button>
                </div>
              )}
              {loan.type === 'personal' && (
                <div style={{ marginTop: '0.75rem' }}>
                  <button className="btn btn-secondary" style={{ fontSize: '0.78rem', padding: '0.4rem 0.85rem' }} onClick={() => setModal('refinance')}>
                    Refinansiera till 6,2%
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

function SavingsTab({ setModal }: { setModal: (m: ModalType) => void }) {
  const total = SAVINGS.reduce((s, x) => s + x.balance, 0)
  return (
    <div style={{ padding: '2rem', animation: 'fadeUp 0.4s ease' }}>
      <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', marginBottom: '0.25rem' }}>Sparande</h1>
          <p style={{ color: 'var(--text-secondary)' }}>{SAVINGS.length} konton · Totalt {fmtCurrency(total)}</p>
        </div>
      </div>

      <div className="action-card" style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <span className="badge badge-green" style={{ marginBottom: '0.5rem' }}>💰 Sparoptimering</span>
            <h3 style={{ marginBottom: '0.3rem' }}>Klarna Sparkonto+ ger 3,8% — du tjänar 1,4%</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Jag kan öppna konto, flytta pengarna och stänga SEB åt dig — med ett klick.</p>
          </div>
          <button className="btn btn-primary" style={{ padding: '0.6rem 1.25rem', whiteSpace: 'nowrap' }} onClick={() => setModal('savings')}>
            Flytta 85 000 kr →
          </button>
        </div>
      </div>

      {SAVINGS.map(acc => (
        <div key={acc.id} className="card" style={{ marginBottom: '0.75rem', padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span style={{ fontSize: '1.5rem' }}>{acc.logo}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700 }}>{acc.name}</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{acc.bank} · {acc.type}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.2rem' }}>{fmtCurrency(acc.balance)}</div>
              {acc.rate > 0 && <div style={{ fontSize: '0.78rem', color: acc.rate < 2 ? 'var(--warn)' : 'var(--accent)' }}>{acc.rate}% ränta</div>}
              {acc.rate === 0 && <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Ingen ränta</div>}
            </div>
          </div>
          {acc.type === 'savings' && acc.rate < 2 && (
            <div style={{ marginTop: '0.75rem', padding: '0.5rem 0.75rem', background: 'var(--warn-dim)', borderRadius: 'var(--radius-sm)', fontSize: '0.78rem', color: 'var(--warn)' }}>
              ⚠️ Låg ränta — du kan tjäna {fmtCurrency(Math.round(acc.balance * (3.8 - acc.rate) / 100))} mer/år
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

function SpendingTab() {
  const cats = [
    { name: 'Boende & Lån', amount: 17640, color: 'var(--info)', pct: 52 },
    { name: 'Prenumerationer', amount: 1833, color: 'var(--accent)', pct: 14 },
    { name: 'Mat & Handel', amount: 4200, color: 'var(--warn)', pct: 18 },
    { name: 'Transport', amount: 1800, color: '#a855f7', pct: 8 },
    { name: 'Övrigt', amount: 1800, color: 'var(--text-muted)', pct: 8 },
  ]
  const total = cats.reduce((s, c) => s + c.amount, 0)

  return (
    <div style={{ padding: '2rem', animation: 'fadeUp 0.4s ease' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', marginBottom: '0.25rem' }}>Utgiftsöversikt</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Maj 2025 · Totalt {fmtCurrency(total)}</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
        {cats.map(cat => (
          <div key={cat.name} className="card" style={{ padding: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-display)', fontWeight: 600 }}>{cat.name}</span>
              <span style={{ fontSize: '0.82rem', color: cat.color, fontWeight: 700 }}>{cat.pct}%</span>
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.2rem', marginBottom: '0.5rem' }}>{fmtCurrency(cat.amount)}</div>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${cat.pct}%`, background: cat.color }} />
            </div>
          </div>
        ))}
      </div>

      <div className="card">
        <h3 style={{ marginBottom: '1rem' }}>Senaste transaktioner</h3>
        {[
          { name: 'ICA Maxi', date: 'Idag', amount: -842, cat: 'Mat' },
          { name: 'Netflix', date: 'Igår', amount: -179, cat: 'Prenumeration' },
          { name: 'SL månadskortet', date: '2 dagar', amount: -900, cat: 'Transport' },
          { name: 'Löneutbetalning', date: '25 maj', amount: +38000, cat: 'Inkomst' },
          { name: 'SEB Bolån', date: '1 maj', amount: -14200, cat: 'Lån' },
        ].map((tx, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', padding: '0.65rem 0', borderBottom: i < 4 ? '1px solid var(--border)' : 'none' }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '0.9rem' }}>{tx.name}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{tx.date} · {tx.cat}</div>
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: tx.amount > 0 ? 'var(--accent)' : 'var(--text-primary)' }}>
              {tx.amount > 0 ? '+' : ''}{fmtCurrency(Math.abs(tx.amount))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Dashboard wrapper ────────────────────────────────────────────────────────

function Dashboard() {
  const [tab, setTab] = useState<Tab>('overview')
  const [collapsed, setCollapsed] = useState(false)
  const [modal, setModal] = useState<ModalType>(null)
  const [dismissedActions, setDismissedActions] = useState<string[]>([])
  const [doneActions, setDoneActions] = useState<string[]>([])
  const [toasts, setToasts] = useState<Toast[]>([])

  const addToast = useCallback((message: string, type: Toast['type'] = 'success') => {
    const id = Math.random().toString(36).slice(2)
    setToasts(t => [...t, { id, message, type }])
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 4000)
  }, [])

  const handleDone = useCallback((actionId: string, message: string) => {
    setDoneActions(d => [...d, actionId])
    addToast(message)
  }, [addToast])

  return (
    <div className="dashboard-wrapper" style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <Sidebar tab={tab} setTab={setTab} collapsed={collapsed} setCollapsed={setCollapsed} />
      <main className="dashboard-main" style={{ flex: 1, overflow: 'auto', background: 'var(--bg-base)' }}>
        {tab === 'overview' && <OverviewTab setModal={setModal} dismissedActions={dismissedActions} onDismiss={id => setDismissedActions(d => [...d, id])} />}
        {tab === 'agent' && <AgentTab setModal={setModal} dismissedActions={dismissedActions} doneActions={doneActions} onDismiss={id => setDismissedActions(d => [...d, id])} />}
        {tab === 'subscriptions' && <SubscriptionsTab setModal={setModal} />}
        {tab === 'loans' && <LoansTab setModal={setModal} />}
        {tab === 'savings' && <SavingsTab setModal={setModal} />}
        {tab === 'spending' && <SpendingTab />}
      </main>

      {/* Modals */}
      {modal === 'savings' && (
        <SavingsModal onClose={() => setModal(null)} onConfirm={() => handleDone('a2', '✅ Sparpengar flyttade till Klarna — +2 040 kr/år')} />
      )}
      {modal === 'mortgage' && (
        <MortgageModal onClose={() => setModal(null)} onConfirm={() => handleDone('a1', '🏠 Bolån flytt initierat — du sparar 85 680 kr/år')} />
      )}
      {modal === 'cancel-sub' && (
        <CancelSubModal onClose={() => setModal(null)} onConfirm={() => handleDone('a3', '✅ LinkedIn Premium avslutat — sparar 5 388 kr/år')} />
      )}
      {modal === 'refinance' && (
        <div className="modal-backdrop" onClick={() => setModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div style={{ textAlign: 'center', padding: '0.5rem' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔄</div>
              <h2 style={{ marginBottom: '0.5rem' }}>Refinansiering pågår</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>Agenten kontaktar Marginalen Bank för att refinansiera ditt privatlån från 9,5% till 6,2%.</p>
              <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => { handleDone('a4', '💰 Refinansiering initierat — sparar 17 280 kr/år'); setModal(null) }}>
                ✍️ Signera med BankID
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toasts */}
      <div className="toast-container">
        {toasts.map(toast => (
          <div key={toast.id} className={`toast ${toast.type}`}>
            <span>{toast.message}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Root page ────────────────────────────────────────────────────────────────

export default function Home() {
  const [screen, setScreen] = useState<Screen>('landing')

  return (
    <>
      {screen === 'landing' && <LandingScreen onStart={() => setScreen('bankid')} />}
      {screen === 'bankid' && <BankIDScreen onComplete={() => setScreen('dashboard')} />}
      {screen === 'dashboard' && <Dashboard />}
    </>
  )
}