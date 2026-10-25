'use client'
import { useState, useEffect, useRef, useCallback } from 'react'

// ─── Brand ───────────────────────────────────────────────────────────────────

const s = {
  base: '#081433', hero: '#052D8F', accent: '#E9F958', white: '#F7F9FC',
  sky: '#C1E5FB', blue: '#4990E8', border: 'rgba(193,229,251,.16)',
  dim: 'rgba(193,229,251,.08)', dimmer: 'rgba(193,229,251,.06)',
  dimHover: 'rgba(193,229,251,.16)', ph: 'rgba(193,229,251,.42)',
  mono: "'Geist Mono',monospace",
  ease: 'cubic-bezier(.2,0,0,1)',
} as const

// ─── Translations ─────────────────────────────────────────────────────────────

const T = {
  ID: {
    eyebrow: 'DIBUAT DENGAN AI · KONTEN',
    lede: 'Thread affiliate Shopee yang terasa seperti cerita, bukan iklan.',
    lede2: 'Tulis ide, pilih format, dapat thread.',
    demoHead: 'PRODUK SAMA, DICERITAKAN',
    f1: 'Ide / cerita awal',
    ideaPh: 'mis. Kulitku breakout berbulan-bulan sampai akhirnya ganti satu cleanser…',
    f2: 'Format konten', f3: 'Hook', tweets: 'Tweets', cta: 'CTA',
    detail: 'Detail produk · opsional', prodPh: 'Nama produk',
    detPh: 'Harga, kelebihan, hal yang perlu disebut',
    gen: 'Buat thread', regen: 'Buat ulang thread', busy: 'Menulis…',
    idle: 'IDLE · MENUNGGU IDE', writing: 'MENULIS THREAD', ready: 'SIAP · ',
    tw: ' TWEETS', error: 'ERROR · COBA LAGI', translating: 'MENERJEMAHKAN…',
    noteIdle: 'Tulis idemu, pilih format, lalu generate.',
    noteShort: 'Sedikit lagi. Minimal 20 karakter.',
    noteReady: 'Ide siap. Klik buat thread.',
    noteBusy: 'Menyusun cerita…',
    noteLimit: 'Jatah 3 thread hari ini sudah habis. Bisa dipakai lagi besok mulai jam 00:00 WIB.',
    limitBtn: 'Jatah hari ini habis',
    left: (n: number) => `Sisa ${n} dari 3 thread hari ini`,
    copy: 'Salin', copied: 'Tersalin', copyAll: 'Salin thread', copiedAll: 'Thread tersalin',
    errH: 'Thread-nya belum jadi.', errP: 'Generator tidak merespons. Coba lagi sebentar lagi.',
    out: 'natural, casual Bahasa Indonesia as spoken on Threads (bisa campur sedikit English)',
    ad: 'PROMO!! Serum terbaik, diskon 50%, checkout sekarang!!',
    story: [
      '3 tahun aku malu foto tanpa filter. Ternyata masalahnya bukan kulitku.',
      'Aku ganti satu hal kecil. Hari ke-14, temanku nanya: "kamu abis facial di mana?"',
      'Bukan sponsor. Aku cuma nggak mau kamu buang 3 tahun kayak aku. Linknya di bio.',
    ],
    adL: 'GAYA IKLAN', storyL: 'GAYA CERITA',
  },
  EN: {
    eyebrow: 'BUILT WITH AI · CONTENT',
    lede: 'Shopee affiliate threads that read like a real story, not an ad.',
    lede2: 'Write the idea, pick a format, get the thread.',
    demoHead: 'SAME PRODUCT, TOLD AS A STORY',
    f1: 'Idea / starting story',
    ideaPh: 'e.g. My skin broke out for months until I switched one cleanser…',
    f2: 'Content format', f3: 'Hook', tweets: 'Tweets', cta: 'CTA',
    detail: 'Product details · optional', prodPh: 'Product name',
    detPh: 'Price, key benefits, anything to mention',
    gen: 'Generate thread', regen: 'Regenerate thread', busy: 'Writing…',
    idle: 'IDLE · WAITING FOR AN IDEA', writing: 'WRITING THREAD', ready: 'READY · ',
    tw: ' TWEETS', error: 'ERROR · TRY AGAIN', translating: 'TRANSLATING…',
    noteIdle: 'Write your idea, pick a format, then generate.',
    noteShort: 'A few more words. 20 characters minimum.',
    noteReady: 'Idea ready. Hit generate.',
    noteBusy: 'Shaping the story…',
    noteLimit: 'You’ve used all 3 threads for today. Come back after midnight Jakarta time (WIB).',
    limitBtn: 'Daily limit reached',
    left: (n: number) => `${n} of 3 threads left today`,
    copy: 'Copy', copied: 'Copied', copyAll: 'Copy thread', copiedAll: 'Thread copied',
    errH: 'That thread didn\'t land.', errP: 'The generator didn\'t respond. Try again in a moment.',
    out: 'natural, casual English as written on Threads',
    ad: 'SALE!! Best serum ever, 50% off, check out now!!',
    story: [
      'For 3 years I hid from unfiltered photos. Turns out my skin wasn\'t the problem.',
      'I changed one small thing. Day 14, a friend asked: "where did you get your facial?"',
      'Not sponsored. I just don\'t want you to lose 3 years like I did. Link in bio.',
    ],
    adL: 'AD VOICE', storyL: 'STORY VOICE',
  },
}

const FORMATS = [
  { id: 'Testimoni', ID: ['Testimoni', 'Review jujur dari pengalaman pribadi'],      EN: ['Testimonial', 'Honest review from personal experience'] },
  { id: 'Curiosity', ID: ['Create curiosity', 'Bikin penasaran, reveal belakangan'],  EN: ['Create curiosity', 'Build intrigue, reveal later'] },
  { id: 'Cerita',    ID: ['Cerita pengalaman', 'Personal journey, produk jadi solusi'], EN: ['Personal story', 'Personal journey, product as the fix'] },
  { id: 'Baru',      ID: ['Ketemu barang baru', 'Discovery story, excited tapi genuine'], EN: ['New find', 'Discovery story, excited but genuine'] },
  { id: 'Viral',     ID: ['Barang viral', 'Honest take soal barang yang lagi hype'],  EN: ['Viral item', 'Honest take on what\'s trending'] },
  { id: 'Tips',      ID: ['Tips kehidupan', 'Tips/hack, produk sebagai enabler'],     EN: ['Life tips', 'Tips and hacks, product as the enabler'] },
]
const HOOKS = ['Auto','Confession','Number','Controversy','Before / After','Curiosity gap','Relatability','Discovery','Social proof','Plot twist','Question']
const COUNTS = [3, 5, 7, 10]
const CTAS = [{ id: 'bio', ID: 'Link di bio', EN: 'Link in bio' }, { id: 'inline', ID: 'Inline link', EN: 'Inline link' }]

// ─── Easing ───────────────────────────────────────────────────────────────────

function ease3(x: number) { return 1 - Math.pow(1 - Math.min(1, Math.max(0, x)), 3) }

// ─── Demo ─────────────────────────────────────────────────────────────────────

function Demo({ lang }: { lang: 'ID' | 'EN' }) {
  const [t, setT] = useState(0)
  const rafRef = useRef<number>(0)

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) { setT(8); return }
    const st = performance.now()
    const f = (now: number) => { setT(((now - st) / 1000) % 10); rafRef.current = requestAnimationFrame(f) }
    rafRef.current = requestAnimationFrame(f)
    return () => cancelAnimationFrame(rafRef.current)
  }, [])

  const L = T[lang]
  const mono = { fontFamily: s.mono, fontSize: 11, letterSpacing: '.08em' }
  const fade = t > 9.4 ? 1 - (t - 9.4) / .6 : 1
  const out = ease3((t - 1.4) / .7)
  const LIKES = [128, 342, 96]

  const heart = (n: number, hot: boolean) => (
    <span style={{ display: 'flex', alignItems: 'center', gap: 6, ...mono, color: hot ? s.accent : 'rgba(193,229,251,.6)' }}>
      <svg viewBox="0 0 24 24" style={{ width: 14, height: 14 }} fill={hot ? s.accent : 'none'} stroke="currentColor" strokeWidth={2}>
        <path d="M12 21s-7.5-4.6-9.5-9.2C1 8.3 3.4 4.5 7 4.5c2 0 3.5 1.1 5 2.9 1.5-1.8 3-2.9 5-2.9 3.6 0 6 3.8 4.5 7.3C19.5 16.4 12 21 12 21z" />
      </svg>
      {String(n)}
    </span>
  )

  const posts = L.story.map((text, i) => {
    const t0 = 2 + i * 1.9
    const show = ease3((t - t0) / .4)
    const typing = t > t0 && t < t0 + .7
    const txt = ease3((t - t0 - .7) / .4)
    const lk = Math.round(LIKES[i] * ease3((t - t0 - 1) / 1.4))
    return (
      <div key={i} style={{ display: 'grid', gridTemplateColumns: '32px minmax(0,1fr)', gap: 12, opacity: show, transform: `translateY(${(1 - show) * 18}px)` }}>
        <span style={{ width: 32, height: 32, borderRadius: '50%', background: s.accent, color: s.hero, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700 }}>K</span>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, minWidth: 0 }}>
          <span style={{ display: 'flex', justifyContent: 'space-between', gap: 8, ...mono, color: s.sky }}>
            <span>@kamu · {i + 1}/3</span>
            {lk > 0 ? heart(lk, true) : null}
          </span>
          {typing
            ? <span style={{ display: 'flex', gap: 5, height: 22, alignItems: 'center' }}>
                {[0, 1, 2].map(d => <span key={d} style={{ width: 7, height: 7, borderRadius: '50%', background: s.sky, animation: `mkpulse 900ms ${d * 150}ms ease-in-out infinite` }} />)}
              </span>
            : <span style={{ fontSize: 'clamp(15px,1.3vw,18px)', fontWeight: 500, letterSpacing: '-0.02em', lineHeight: 1.3, color: s.white, opacity: txt }}>{text}</span>
          }
        </div>
      </div>
    )
  })

  const total = LIKES.reduce((sum, v, i) => sum + Math.round(v * ease3((t - 3 - i * 1.9) / 1.4)), 0)

  return (
    <div style={{ position: 'relative', minHeight: 'clamp(230px,28vh,280px)', opacity: fade }}>
      {/* ad voice */}
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', gap: 10, padding: 18, borderRadius: 18, border: '1px dashed rgba(193,229,251,.3)', opacity: 1 - out, transform: `translateX(${-out * 40}px) rotate(${-out * 3}deg)`, pointerEvents: 'none' }}>
        <span style={{ ...mono, color: 'rgba(193,229,251,.6)' }}>{L.adL}</span>
        <span style={{ fontSize: 'clamp(18px,1.6vw,24px)', fontWeight: 600, letterSpacing: '-0.035em', lineHeight: 1.15, color: s.sky }}>{L.ad}</span>
        <span style={{ display: 'flex', gap: 16, marginTop: 'auto' }}>{heart(2, false)}<span style={{ ...mono, color: 'rgba(193,229,251,.6)' }}>0 REPLIES</span></span>
      </div>
      {/* story voice */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, opacity: ease3((t - 1.8) / .3) }}>
        <span style={{ display: 'flex', justifyContent: 'space-between', gap: 12, ...mono, color: s.accent }}>
          <span>{L.storyL}</span>
          <span>{total > 0 ? `+${total} ♥` : ''}</span>
        </span>
        {posts}
      </div>
    </div>
  )
}

// ─── Rail ─────────────────────────────────────────────────────────────────────

const ROWH = 58, PASS = 1.1, PASSES = 3

function Rail({ n, loading }: { n: number; loading: boolean }) {
  const [t, setT] = useState(0)
  const rafRef = useRef<number>(0)

  useEffect(() => {
    if (!loading) { setT(0); return }
    const st = performance.now()
    const f = (now: number) => { setT((now - st) / 1000); rafRef.current = requestAnimationFrame(f) }
    rafRef.current = requestAnimationFrame(f)
    return () => cancelAnimationFrame(rafRef.current)
  }, [loading])

  const pass = Math.min(PASSES - 1, Math.floor(t / PASS))
  const p = loading ? Math.min(1, (t - pass * PASS) / PASS) : 0
  const ep = p < .5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2
  const y = ep * (n - 1) * ROWH
  const at = y / ROWH

  const colW = [92,78,86,70,88,74,90,66,84,76]
  const colW2 = [54,62,40,58,46,60,38,52,44,56]

  return (
    <div style={{ position: 'relative', display: 'flex', flexDirection: 'column' }}>
      <span style={{ position: 'absolute', left: 13, top: 14, height: (n - 1) * ROWH, width: 3, background: s.blue }} />
      {loading && <span style={{ position: 'absolute', left: 13, top: 14, height: y, width: 3, background: s.accent }} />}
      {Array.from({ length: n }, (_, i) => {
        const hit = loading && at >= i - .02
        return (
          <div key={i} style={{ height: ROWH, display: 'grid', gridTemplateColumns: '28px 52px minmax(0,1fr)', columnGap: 16, alignItems: 'start', animation: `tapop 420ms ${i * 40}ms ${s.ease} both` }}>
            <span style={{ position: 'relative', zIndex: 1, width: 28, height: 28, boxSizing: 'border-box', borderRadius: '50%', background: hit ? s.accent : s.hero, border: `3px solid ${hit ? s.accent : s.sky}`, transition: 'background 200ms, border-color 200ms' }} />
            <span style={{ fontFamily: s.mono, fontSize: 13, letterSpacing: '.08em', lineHeight: '28px', color: hit ? s.accent : s.sky }}>{i + 1}/{n}</span>
            <span style={{ display: 'flex', flexDirection: 'column', gap: 8, paddingTop: 6 }}>
              <span style={{ height: 8, borderRadius: 4, width: `${(colW[i] || 80)}%`, background: hit ? 'rgba(233,249,88,.7)' : 'rgba(193,229,251,.28)', transition: 'background 200ms' }} />
              <span style={{ height: 8, borderRadius: 4, width: `${(colW2[i] || 50)}%`, background: hit ? 'rgba(233,249,88,.45)' : 'rgba(193,229,251,.16)', transition: 'background 200ms' }} />
            </span>
          </div>
        )
      })}
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

type Status = 'idle' | 'loading' | 'done' | 'error'
type Lang = 'ID' | 'EN'

export default function Page() {
  const [idea, setIdea] = useState('')
  const [format, setFormat] = useState('Testimoni')
  const [hook, setHook] = useState('Auto')
  const [count, setCount] = useState(5)
  const [cta, setCta] = useState<'bio' | 'inline'>('bio')
  const [showDetail, setShowDetail] = useState(false)
  const [product, setProduct] = useState('')
  const [detail, setDetail] = useState('')
  const [lang, setLang] = useState<Lang>('ID')
  const [status, setStatus] = useState<Status>('idle')
  const [tweets, setTweets] = useState<string[]>([])
  const [tLang, setTLang] = useState<Lang>('ID')
  const [alt, setAlt] = useState<string[] | null>(null)
  const [altLang, setAltLang] = useState<Lang | null>(null)
  const [translating, setTranslating] = useState(false)
  const [copied, setCopied] = useState(-1)
  const [copiedAll, setCopiedAll] = useState(false)
  const [remaining, setRemaining] = useState<number | null>(null)

  // ── cursor
  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!matchMedia('(pointer:fine)').matches) return
    if ((window as unknown as Record<string, unknown>).__mkCursor) return
    ;(window as unknown as Record<string, unknown>).__mkCursor = true
    const st = document.createElement('style')
    st.textContent = 'html.mk-cur,html.mk-cur *{cursor:none!important}'
    document.head.appendChild(st)
    document.documentElement.classList.add('mk-cur')
    const ring = document.createElement('div'), dot = document.createElement('div')
    ring.style.cssText = 'position:fixed;left:0;top:0;z-index:9998;pointer-events:none;width:40px;height:40px;margin:-20px 0 0 -20px;border-radius:50%;border:1.5px solid #4990E8;transition:width 200ms cubic-bezier(.2,0,0,1),height 200ms cubic-bezier(.2,0,0,1),margin 200ms cubic-bezier(.2,0,0,1),background 200ms cubic-bezier(.2,0,0,1);transform:translate3d(-9999px,0,0)'
    dot.style.cssText = 'position:fixed;left:0;top:0;z-index:9999;pointer-events:none;width:10px;height:10px;margin:-5px 0 0 -5px;border-radius:50%;background:#E9F958;border:2px solid #052D8F;box-sizing:border-box;transform:translate3d(-9999px,0,0)'
    document.body.appendChild(ring); document.body.appendChild(dot)
    const m = { x: -9999, y: -9999 }, c = { x: -9999, y: -9999 }; let hot = false
    const onMove = (e: MouseEvent) => {
      m.x = e.clientX; m.y = e.clientY
      hot = !!(e.target instanceof Element && e.target.closest('a,button,[data-hover]'))
    }
    const onLeave = () => { m.x = m.y = -9999 }
    window.addEventListener('mousemove', onMove)
    document.addEventListener('mouseleave', onLeave)
    let raf: number
    const tick = () => {
      c.x += (m.x - c.x) * .2; c.y += (m.y - c.y) * .2
      dot.style.transform = `translate3d(${m.x}px,${m.y}px,0)`
      ring.style.transform = `translate3d(${c.x}px,${c.y}px,0)`
      const b = hot ? 72 : 40
      ring.style.width = ring.style.height = b + 'px'
      ring.style.margin = `${-b / 2}px 0 0 ${-b / 2}px`
      ring.style.background = hot ? 'rgba(73,144,232,.18)' : 'transparent'
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => { window.removeEventListener('mousemove', onMove); document.removeEventListener('mouseleave', onLeave); cancelAnimationFrame(raf) }
  }, [])

  // ── scroll header
  useEffect(() => {
    const hd = document.querySelector<HTMLElement>('[data-mk-header]')
    const bk = document.querySelector<HTMLElement>('[data-mk-book]')
    if (!hd) return
    let lastKey = ''
    const m = 'clamp(12px,2.5vw,32px)'
    const upd = () => {
      const gl = (document.scrollingElement || document.documentElement).scrollTop > 40
      const k = String(gl)
      if (k === lastKey) return; lastKey = k
      hd.style.color = '#F7F9FC'
      hd.style.top = gl ? '10px' : '0'; hd.style.left = hd.style.right = gl ? m : '0'
      hd.style.padding = gl ? `9px 10px 9px clamp(14px,2vw,22px)` : '20px clamp(20px,4vw,48px)'
      hd.style.borderRadius = gl ? '999px' : '0'
      hd.style.background = gl ? 'rgba(8,20,51,.82)' : 'transparent'
      hd.style.borderColor = gl ? 'rgba(193,229,251,.16)' : 'transparent'
      hd.style.boxShadow = gl ? '0 10px 40px rgba(0,0,0,.25), inset 0 1px 0 rgba(255,255,255,.08)' : 'none'
      hd.style.backdropFilter = gl ? 'blur(28px) saturate(1.8)' : 'none'
      ;(hd.style as unknown as Record<string, string>).webkitBackdropFilter = gl ? 'blur(28px) saturate(1.8)' : 'none'
      if (bk) { bk.style.top = gl ? '18px' : '14px'; bk.style.right = gl ? `calc(${m} + 9px)` : 'clamp(20px,4vw,48px)' }
    }
    window.addEventListener('scroll', upd, { passive: true })
    const int = setInterval(upd, 300)
    return () => { window.removeEventListener('scroll', upd); clearInterval(int) }
  }, [])

  // ── live clock
  useEffect(() => {
    const upd = () => {
      const t = new Date().toLocaleTimeString('en-GB', { timeZone: 'Asia/Jakarta', hour12: false })
      document.querySelectorAll<HTMLElement>('[data-mk-clock]').forEach(e => { e.textContent = t })
    }
    upd()
    const int = setInterval(upd, 1000)
    return () => clearInterval(int)
  }, [])

  // ── generate
  const generate = useCallback(async (e?: React.FormEvent) => {
    e?.preventDefault()
    if (idea.trim().length < 20 || status === 'loading') return
    setStatus('loading'); setTweets([]); setAlt(null); setAltLang(null); setTLang(lang); setCopied(-1); setCopiedAll(false)
    try {
      const [res] = await Promise.all([
        fetch('/api/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ idea, format, hook, count, cta, product, detail, language: lang }),
        }),
        new Promise(r => setTimeout(r, PASS * PASSES * 1000 + 150)),
      ])
      if (res.status === 429) {
        setRemaining(0); setStatus('idle'); return
      }
      if (!res.ok) { setStatus('error'); return }
      const data = await res.json()
      setTweets(data.tweets); setRemaining(data.remaining); setStatus('done')
    } catch { setStatus('error') }
  }, [idea, format, hook, count, cta, product, detail, lang, status])

  // ── lang switch (with translation)
  const switchLang = useCallback(async (newLang: Lang) => {
    if (newLang === lang) return
    setLang(newLang); setCopied(-1); setCopiedAll(false)
    if (status !== 'done' || tLang === newLang || altLang === newLang || translating) return
    setTranslating(true)
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ translateFrom: tweets, language: newLang }),
      })
      if (res.ok) {
        const data = await res.json()
        setAlt(data.tweets); setAltLang(newLang)
      }
    } finally { setTranslating(false) }
  }, [lang, status, tLang, altLang, translating, tweets])

  const t = T[lang]
  const len = idea.trim().length
  const ok = len >= 20 && status !== 'loading' && remaining !== 0
  const shown = altLang === lang && alt ? alt : tweets
  const n = status === 'done' ? shown.length : count
  const fmt = FORMATS.find(x => x.id === format)?.[lang][0] ?? format
  const ctaLabel = remaining === 0 ? t.limitBtn : status === 'loading' ? t.busy : status === 'done' ? t.regen : t.gen
  const statusLabel = translating ? t.translating : ({ idle: t.idle, loading: t.writing, done: t.ready + n + t.tw, error: t.error } as Record<string, string>)[status]
  const metaLabel = `${fmt} · ${hook}`.toUpperCase()
  const noteText = remaining === 0 ? t.noteLimit : status === 'loading' ? t.noteBusy : len >= 20 ? t.noteReady : len > 0 ? t.noteShort : t.noteIdle

  return (
    <div style={{ background: s.base, color: s.white, fontFamily: "'Geist',sans-serif", overflowX: 'clip' }}>

      {/* ── Header */}
      <header data-mk-header=""
        style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 40, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 20, padding: '20px clamp(20px,4vw,48px)', color: s.white, border: '1px solid transparent', borderRadius: 0, transition: `color 250ms ${s.ease},top 400ms ${s.ease},left 400ms ${s.ease},right 400ms ${s.ease},padding 400ms ${s.ease},border-radius 400ms ${s.ease},background 300ms ${s.ease},border-color 300ms ${s.ease},box-shadow 300ms ${s.ease}`, pointerEvents: 'none' }}>
        <a href="https://marwahk-portfolio.vercel.app" style={{ display: 'flex', alignItems: 'center', gap: 10, pointerEvents: 'auto', flex: 'none' }}>
          <svg viewBox="0 0 120 120" style={{ width: 40, height: 40, flex: 'none' }}>
            <polyline points="16,96 16,24 40,64 64,24 64,96" fill="none" stroke="currentColor" strokeWidth={9} strokeLinecap="square" />
            <line x1={82} y1={24} x2={82} y2={96} stroke="currentColor" strokeWidth={9} strokeLinecap="square" />
            <polyline points="104,24 82,64 104,96" fill="none" stroke="currentColor" strokeWidth={9} strokeLinecap="square" />
            <circle cx={104} cy={24} r={8} fill={s.accent} stroke={s.hero} strokeWidth={2.5} />
          </svg>
          <span style={{ fontSize: 22, fontWeight: 600, letterSpacing: '-0.05em', whiteSpace: 'nowrap' }}>Marwah K</span>
        </a>
        <nav style={{ display: 'flex', gap: 'clamp(14px,2vw,28px)', fontFamily: s.mono, fontSize: 12, letterSpacing: '.08em', marginRight: 190, overflowX: 'auto', pointerEvents: 'auto' }}>
          <a href="#brief" style={{ whiteSpace: 'nowrap' }}>01 TRY IT</a>
          <a href="#connect" style={{ whiteSpace: 'nowrap' }}>02 CONNECT</a>
        </nav>
      </header>

      {/* ── Book button */}
      <a data-mk-book="" href="https://calendar.app.google/3UR6RuZJCrFbpQkV8" target="_blank" rel="noopener noreferrer"
        style={{ position: 'fixed', top: 14, right: 'clamp(20px,4vw,48px)', zIndex: 41, background: s.accent, color: s.hero, borderRadius: 999, padding: '12px 18px', minHeight: 44, boxSizing: 'border-box', display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, fontWeight: 600, whiteSpace: 'nowrap', transition: `top 400ms ${s.ease},right 400ms ${s.ease},background 200ms ${s.ease}` }}>
        <span style={{ width: 7, height: 7, borderRadius: '50%', background: s.hero, animation: 'mkblink 1.2s steps(1) infinite' }} />
        Book 15 min
      </a>

      {/* ── Hero */}
      <section style={{ boxSizing: 'border-box', minHeight: 'min(86vh,820px)', padding: 'clamp(120px,16vh,170px) max(clamp(20px,4vw,48px),calc((100% - 1280px) / 2)) clamp(40px,6vh,64px)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,460px),1fr))', alignItems: 'end', gap: 'clamp(32px,5vw,72px)', background: s.hero, color: s.white }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(16px,2.6vh,24px)', minWidth: 0 }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 10, fontFamily: s.mono, fontSize: 12, letterSpacing: '.1em', color: s.accent, whiteSpace: 'nowrap', animation: `tafade 700ms ${s.ease} both` }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: s.accent, animation: 'mkpulse 1.6s ease-in-out infinite' }} />
            {t.eyebrow}
          </span>
          <h1 style={{ margin: 0, fontSize: 'clamp(60px,min(8.4vw,14vh),150px)', fontWeight: 600, letterSpacing: '-0.075em', lineHeight: .86, display: 'flex', flexDirection: 'column' }}>
            <span style={{ display: 'block', overflow: 'hidden', paddingBottom: '.06em' }}>
              <span style={{ display: 'block', animation: `tarup 900ms ${s.ease} both` }}>Affiliate</span>
            </span>
            <span style={{ display: 'block', overflow: 'hidden', paddingBottom: '.06em' }}>
              <span style={{ display: 'block', color: s.accent, animation: `tarup 900ms 140ms ${s.ease} both` }}>Threads</span>
            </span>
          </h1>
          <p style={{ margin: 0, maxWidth: 460, fontSize: 'clamp(17px,1.4vw,21px)', lineHeight: 1.4, color: s.sky, textWrap: 'pretty' as React.CSSProperties['textWrap'], animation: `tafade 700ms 380ms ${s.ease} both` }}>
            {t.lede} <span style={{ color: s.white }}>{t.lede2}</span>
          </p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', borderRadius: 28, background: s.base, overflow: 'hidden', minWidth: 0, animation: `tafade 900ms 300ms ${s.ease} both` }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, padding: '16px 22px', borderBottom: `1px solid ${s.border}`, fontFamily: s.mono, fontSize: 11, letterSpacing: '.1em', color: s.sky }}>
            <span>{t.demoHead}</span><span style={{ color: s.accent }}>LIVE</span>
          </div>
          <div style={{ padding: 22 }}>
            <Demo lang={lang} />
          </div>
        </div>
      </section>

      {/* ── Workspace */}
      <section id="brief" style={{ boxSizing: 'border-box', padding: 'clamp(48px,8vh,96px) max(clamp(16px,4vw,48px),calc((100% - 1280px) / 2))', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,480px),1fr))', gap: 'clamp(16px,2.4vw,32px)', alignItems: 'start', background: s.base }}>

        {/* Form */}
        <form onSubmit={generate} style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>

          {/* 01 Idea */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, paddingBottom: 32, borderBottom: `1px solid ${s.border}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 12 }}>
              <span style={{ display: 'flex', gap: 16, fontFamily: s.mono, fontSize: 14 }}>
                <span style={{ color: s.accent }}>01</span>
                <span style={{ color: s.sky }}>{t.f1}</span>
              </span>
              <span style={{ fontFamily: s.mono, fontSize: 12, letterSpacing: '.06em', color: len >= 20 ? s.accent : 'rgba(193,229,251,.6)' }}>{len} / 20+</span>
            </div>
            <textarea
              value={idea} onChange={e => setIdea(e.target.value)}
              placeholder={t.ideaPh} rows={4}
              style={{ boxSizing: 'border-box', width: '100%', resize: 'vertical', padding: '4px 0 16px', border: 0, borderBottom: '1px solid rgba(193,229,251,.28)', background: 'transparent', color: s.white, fontFamily: "'Geist',sans-serif", fontSize: 'clamp(22px,2.2vw,32px)', fontWeight: 500, letterSpacing: '-0.035em', lineHeight: 1.2, outline: 'none' }}
            />
          </div>

          {/* 02 Format */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20, padding: '32px 0', borderBottom: `1px solid ${s.border}` }}>
            <span style={{ display: 'flex', gap: 16, fontFamily: s.mono, fontSize: 14 }}>
              <span style={{ color: s.accent }}>02</span>
              <span style={{ color: s.sky }}>{t.f2}</span>
            </span>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,180px),1fr))', gap: 6 }}>
              {FORMATS.map(f => {
                const on = format === f.id
                const [label, desc] = f[lang]
                return (
                  <button key={f.id} type="button" onClick={() => setFormat(f.id)}
                    style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 6, textAlign: 'left', padding: 18, borderRadius: 12, border: `1px solid ${on ? s.accent : 'rgba(193,229,251,.2)'}`, background: on ? s.accent : 'transparent', color: on ? s.hero : s.white, cursor: 'pointer', transition: `border-color 200ms ${s.ease}` }}>
                    <span style={{ fontSize: 18, fontWeight: 600, letterSpacing: '-0.035em' }}>{label}</span>
                    <span style={{ fontSize: 13, lineHeight: 1.4, color: on ? s.hero : s.sky }}>{desc}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* 03 Hook */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20, padding: '32px 0', borderBottom: `1px solid ${s.border}` }}>
            <span style={{ display: 'flex', gap: 16, fontFamily: s.mono, fontSize: 14 }}>
              <span style={{ color: s.accent }}>03</span>
              <span style={{ color: s.sky }}>{t.f3}</span>
            </span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {HOOKS.map(h => {
                const on = hook === h
                return (
                  <button key={h} type="button" onClick={() => setHook(h)}
                    style={{ minHeight: 44, padding: '0 16px', borderRadius: 12, border: 0, background: on ? s.accent : s.dim, color: on ? s.hero : s.white, fontWeight: on ? 600 : 500, cursor: 'pointer', fontSize: 15, whiteSpace: 'nowrap', transition: `background 200ms ${s.ease}` }}>
                    {h}
                  </button>
                )
              })}
            </div>
          </div>

          {/* 04 Tweets + CTA */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,220px),1fr))', gap: '20px 24px', padding: '32px 0', borderBottom: `1px solid ${s.border}` }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20, minWidth: 0 }}>
              <span style={{ display: 'flex', gap: 16, fontFamily: s.mono, fontSize: 14 }}>
                <span style={{ color: s.accent }}>04</span>
                <span style={{ color: s.sky }}>{t.tweets}</span>
              </span>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,minmax(0,1fr))', gap: 6 }}>
                {COUNTS.map(c => {
                  const on = count === c
                  return (
                    <button key={c} type="button" onClick={() => setCount(c)}
                      style={{ minHeight: 56, padding: '0 14px', borderRadius: 12, border: 0, background: on ? s.accent : s.dim, color: on ? s.hero : s.white, fontWeight: on ? 600 : 500, cursor: 'pointer', fontSize: 17, whiteSpace: 'nowrap', transition: `background 200ms ${s.ease}` }}>
                      {c}
                    </button>
                  )
                })}
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20, minWidth: 0 }}>
              <span style={{ display: 'flex', gap: 16, fontFamily: s.mono, fontSize: 14 }}>
                <span style={{ color: s.sky }}>{t.cta}</span>
              </span>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(max-content,1fr))', gap: 6 }}>
                {CTAS.map(c => {
                  const on = cta === c.id
                  return (
                    <button key={c.id} type="button" onClick={() => setCta(c.id as 'bio' | 'inline')}
                      style={{ minHeight: 56, padding: '0 14px', borderRadius: 12, border: 0, background: on ? s.accent : s.dim, color: on ? s.hero : s.white, fontWeight: on ? 600 : 500, cursor: 'pointer', fontSize: 16, whiteSpace: 'nowrap', transition: `background 200ms ${s.ease}` }}>
                      {c[lang]}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Detail toggle */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: '24px 0', borderBottom: `1px solid ${s.border}` }}>
            <button type="button" onClick={() => setShowDetail(v => !v)}
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, minHeight: 44, padding: 0, border: 0, background: 'transparent', color: s.sky, fontFamily: s.mono, fontSize: 14, cursor: 'pointer', textAlign: 'left' }}>
              <span>{t.detail}</span>
              <span style={{ width: 32, height: 32, borderRadius: '50%', border: '1px solid rgba(193,229,251,.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, color: s.accent }}>{showDetail ? '−' : '+'}</span>
            </button>
            {showDetail && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <input value={product} onChange={e => setProduct(e.target.value)} placeholder={t.prodPh}
                  style={{ boxSizing: 'border-box', width: '100%', minHeight: 56, padding: '0 18px', borderRadius: 12, border: '1px solid rgba(193,229,251,.2)', background: s.dimmer, color: s.white, fontSize: 17, outlineColor: s.accent }} />
                <textarea value={detail} onChange={e => setDetail(e.target.value)} placeholder={t.detPh} rows={3}
                  style={{ boxSizing: 'border-box', width: '100%', resize: 'vertical', padding: '16px 18px', borderRadius: 12, border: '1px solid rgba(193,229,251,.2)', background: s.dimmer, color: s.white, fontFamily: "'Geist',sans-serif", fontSize: 17, lineHeight: 1.45, outlineColor: s.accent }} />
              </div>
            )}
          </div>

          {/* Submit */}
          <div style={{ paddingTop: 32 }}>
            {ok
              ? <button type="submit" style={{ width: '100%', minHeight: 72, padding: '0 32px', borderRadius: 12, border: 0, background: s.accent, color: s.hero, fontSize: 22, fontWeight: 600, letterSpacing: '-0.03em', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, transition: `background 200ms ${s.ease}` }}>
                  <span>{ctaLabel}</span><span>→</span>
                </button>
              : <button type="button" disabled style={{ width: '100%', minHeight: 72, padding: '0 32px', borderRadius: 12, border: 0, background: 'rgba(193,229,251,.14)', color: 'rgba(193,229,251,.6)', fontSize: 22, fontWeight: 600, letterSpacing: '-0.03em', cursor: 'not-allowed', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                  <span>{ctaLabel}</span><span>→</span>
                </button>
            }
            {remaining !== null && (
              <p style={{ margin: '14px 0 0', fontFamily: s.mono, fontSize: 12, letterSpacing: '.06em', color: remaining === 0 ? s.accent : 'rgba(193,229,251,.6)' }}>
                {remaining === 0 ? t.noteLimit : t.left(remaining)}
              </p>
            )}
          </div>
        </form>

        {/* Output panel */}
        <div style={{ position: 'sticky', top: 96, display: 'flex', flexDirection: 'column', gap: 14, minWidth: 0 }}>
          {/* Lang toggle */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            {(['ID', 'EN'] as Lang[]).map(code => {
              const on = lang === code
              return (
                <button key={code} type="button" onClick={() => switchLang(code)}
                  style={{ minWidth: 46, minHeight: 36, padding: '0 14px', borderRadius: 999, border: `1px solid ${on ? 'rgba(193,229,251,.35)' : s.sky}`, background: on ? s.hero : s.sky, color: on ? s.white : s.hero, fontFamily: s.mono, fontSize: 12, fontWeight: 600, letterSpacing: '.08em', cursor: 'pointer', transition: `background 200ms ${s.ease}` }}>
                  {code}
                </button>
              )
            })}
          </div>

          {/* Preview card */}
          <div id="preview" style={{ display: 'flex', flexDirection: 'column', borderRadius: 28, background: s.hero, color: s.white, overflow: 'hidden', minHeight: 'min(640px,calc(100vh - 170px))' }}>
            {/* Status bar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, padding: '18px 24px', borderBottom: `1px solid ${s.border}`, fontFamily: s.mono, fontSize: 11, letterSpacing: '.1em' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 10, color: s.accent, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                <span style={{ width: 8, height: 8, flex: 'none', borderRadius: '50%', background: s.accent, animation: 'mkpulse 1.6s ease-in-out infinite' }} />
                {statusLabel}
              </span>
              <span style={{ color: s.sky, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{metaLabel}</span>
            </div>

            {/* Rail / idle state */}
            {(status === 'idle' || status === 'loading') && (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 32, padding: 'clamp(28px,5vh,40px) clamp(20px,3vw,32px) clamp(24px,4vh,32px)' }}>
                <div style={{ position: 'relative' }}>
                  <Rail n={count} loading={status === 'loading'} key={count} />
                </div>
                <p style={{ margin: 0, fontSize: 'clamp(16px,1.4vw,20px)', lineHeight: 1.4, color: s.sky }}>{noteText}</p>
              </div>
            )}

            {/* Done — tweets */}
            {status === 'done' && (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 16, padding: '20px clamp(16px,2.4vw,24px) 24px' }}>
                <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <span style={{ position: 'absolute', left: 13, top: 16, bottom: 16, width: 3, background: s.accent }} />
                  {shown.map((text, i) => (
                    <div key={i} style={{ position: 'relative', display: 'grid', gridTemplateColumns: '28px minmax(0,1fr)', gap: 14, animation: `tarise 600ms ${s.ease} both` }}>
                      <span style={{ position: 'relative', zIndex: 1, width: 28, height: 28, marginTop: 14, boxSizing: 'border-box', borderRadius: '50%', background: s.accent, border: `3px solid ${s.accent}` }} />
                      <article style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: '16px 18px', borderRadius: 20, background: s.white, color: s.base, minWidth: 0 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, fontFamily: s.mono, fontSize: 11, letterSpacing: '.08em' }}>
                          <span style={{ color: s.blue }}>{i + 1}/{shown.length}</span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <span style={{ color: '#5B6B86' }}>{text.length} / 280</span>
                            <button type="button"
                              onClick={() => { navigator.clipboard?.writeText(text); setCopied(i) }}
                              style={{ minHeight: 32, padding: '0 12px', borderRadius: 999, border: '1px solid #D5DDEA', background: '#FFFFFF', color: s.hero, fontFamily: "'Geist',sans-serif", fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                              {copied === i ? t.copied : t.copy}
                            </button>
                          </span>
                        </div>
                        <p style={{ margin: 0, fontSize: 16, lineHeight: 1.5, whiteSpace: 'pre-line' }}>{text}</p>
                      </article>
                    </div>
                  ))}
                </div>
                <button type="button"
                  onClick={() => { navigator.clipboard?.writeText(shown.join('\n\n')); setCopiedAll(true) }}
                  style={{ alignSelf: 'flex-end', minHeight: 48, padding: '0 22px', borderRadius: 999, border: 0, background: s.accent, color: s.hero, fontSize: 15, fontWeight: 600, cursor: 'pointer', transition: `background 200ms ${s.ease}` }}>
                  {copiedAll ? t.copiedAll : t.copyAll}
                </button>
              </div>
            )}

            {/* Error */}
            {status === 'error' && (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 16, padding: 24 }}>
                <h2 style={{ margin: 0, fontSize: 40, fontWeight: 600, letterSpacing: '-0.06em', lineHeight: .95 }}>{t.errH}</h2>
                <p style={{ margin: 0, fontSize: 17, color: s.sky }}>{t.errP}</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── Connect */}
      <section id="connect" data-mk-light=""
        style={{ background: s.accent, color: s.hero, boxSizing: 'border-box', padding: 'clamp(64px,10vh,112px) max(clamp(20px,4vw,48px),calc((100% - 1280px) / 2)) clamp(24px,4vw,40px)', display: 'flex', flexDirection: 'column', gap: 'clamp(48px,8vh,96px)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,380px),1fr))', gap: 'clamp(28px,5vw,72px)', alignItems: 'end' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <span style={{ fontFamily: s.mono, fontSize: 12, letterSpacing: '.1em' }}>02 — CONNECT</span>
            <h2 style={{ margin: 0, fontSize: 'clamp(40px,5.6vw,88px)', fontWeight: 600, letterSpacing: '-0.07em', lineHeight: .92 }}>
              Content that sells <span style={{ color: s.blue }}>without the ad voice.</span>
            </h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <p style={{ margin: 0, fontSize: 'clamp(16px,1.3vw,19px)', lineHeight: 1.45 }}>Tell me the product. I&apos;ll shape the story.</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
              <a href="https://wa.me/6285155343042" target="_blank" rel="noopener noreferrer"
                style={{ background: s.hero, color: s.white, borderRadius: 999, padding: '0 24px', minHeight: 52, display: 'flex', alignItems: 'center', fontSize: 16, fontWeight: 600, whiteSpace: 'nowrap', transition: `background 200ms ${s.ease}` }}>
                Let&apos;s talk on WhatsApp
              </a>
              <a href="https://calendar.app.google/3UR6RuZJCrFbpQkV8" target="_blank" rel="noopener noreferrer"
                style={{ border: `1.5px solid ${s.hero}`, borderRadius: 999, padding: '0 24px', minHeight: 52, display: 'flex', alignItems: 'center', fontSize: 16, fontWeight: 600, whiteSpace: 'nowrap', transition: `background 200ms ${s.ease}` }}>
                Book 15 min
              </a>
            </div>
          </div>
        </div>

        {/* Footer bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px 32px', paddingTop: 20, borderTop: `1.5px solid ${s.hero}` }}>
          <div style={{ display: 'flex', gap: 10 }}>
            {/* LinkedIn */}
            <a href="https://linkedin.com/in/marwahkha" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn"
              style={{ width: 48, height: 48, borderRadius: '50%', background: s.hero, color: s.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: `transform 200ms ${s.ease}` }}>
              <svg viewBox="0 0 24 24" style={{ width: 20, height: 20 }} fill="currentColor">
                <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0z" />
              </svg>
            </a>
            {/* Email */}
            <a href="mailto:marwahkhairunnisa30@gmail.com" aria-label="Email"
              style={{ width: 48, height: 48, borderRadius: '50%', background: s.hero, color: s.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: `transform 200ms ${s.ease}` }}>
              <svg viewBox="0 0 24 24" style={{ width: 20, height: 20 }} fill="none" stroke="currentColor" strokeWidth={2} strokeLinejoin="round">
                <rect x="2.5" y="4.5" width="19" height="15" rx="2.5" />
                <path d="M3 6.5l9 6.5 9-6.5" />
              </svg>
            </a>
            {/* WhatsApp */}
            <a href="https://wa.me/6285155343042" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp"
              style={{ width: 48, height: 48, borderRadius: '50%', background: s.hero, color: s.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: `transform 200ms ${s.ease}` }}>
              <svg viewBox="0 0 24 24" style={{ width: 21, height: 21 }} fill="currentColor">
                <path d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.16-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.77-1.66-2.07-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48s1.06 2.88 1.21 3.08c.15.2 2.1 3.2 5.08 4.48.71.31 1.26.49 1.7.63.71.23 1.36.2 1.87.12.57-.09 1.76-.72 2.01-1.41.25-.7.25-1.29.17-1.41-.07-.13-.27-.2-.57-.35zM12.05 21.8h-.01a9.87 9.87 0 0 1-5.03-1.38l-.36-.21-3.74.98 1-3.65-.24-.37a9.86 9.86 0 0 1-1.51-5.26c0-5.45 4.44-9.88 9.89-9.88 2.64 0 5.12 1.03 6.99 2.9a9.82 9.82 0 0 1 2.89 6.99c0 5.45-4.44 9.88-9.88 9.88zm8.41-18.3A11.81 11.81 0 0 0 12.05 0C5.5 0 .16 5.34.16 11.89c0 2.1.55 4.14 1.59 5.95L.06 24l6.3-1.65a11.88 11.88 0 0 0 5.68 1.45h.01c6.55 0 11.89-5.34 11.89-11.89 0-3.18-1.24-6.16-3.48-8.41z" />
              </svg>
            </a>
          </div>
          <span style={{ fontFamily: s.mono, fontSize: 12, letterSpacing: '.1em', whiteSpace: 'nowrap' }}>
            © 2026 MARWAH K · JAKARTA <span data-mk-clock="">--:--:--</span>
          </span>
        </div>
      </section>

    </div>
  )
}
