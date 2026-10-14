"use client";

import { useState, useRef, useEffect, useCallback } from "react";

// ── brand logo ────────────────────────────────────────────────
const MKLogo = ({ size = 28 }: { size?: number }) => (
  <svg viewBox="0 0 100 100" width={size} height={size} style={{ flexShrink: 0 }}>
    <rect width="100" height="100" fill="#EEE8DC" />
    <path d="M18 104 V20 L38 50 L58 20 V104 M58 50 L82 14 M60.5 40 L84 104" fill="none" stroke="#121B16" strokeWidth="10" />
    <rect width="100" height="16" fill="#EEE8DC" />
  </svg>
);

// ── content / hook data ────────────────────────────────────────
const TYPES = [
  { value: "Testimoni",         id: "Review jujur dari pengalaman pribadi",      en: "Honest review from personal use" },
  { value: "Create curiosity",  id: "Bikin penasaran, reveal belakangan",         en: "Tease first, reveal later" },
  { value: "Cerita pengalaman", id: "Personal journey, produk jadi solusi",       en: "Personal story, product as the fix" },
  { value: "Ketemu barang baru",id: "Discovery story, excited tapi genuine",      en: "Discovery, excited but genuine" },
  { value: "Barang viral",      id: "Honest take soal barang yang lagi hype",     en: "Honest take on a hyped item" },
  { value: "Tips kehidupan",    id: "Tips/hack, produk sebagai enabler",          en: "A life hack, product as enabler" },
];

const HOOKS = ["Auto","Confession","Number","Controversy","Before / After","Curiosity gap","Relatability","Discovery","Social proof","Plot twist","Question"];
const COUNTS = ["3","5","7","10"];
const CTAS   = { id: ["Link di bio","Inline link"], en: ["Link in bio","Inline link"] };

const T = {
  id: {
    idea:"Ide / cerita awal", ideaPh:"Baru pindah kos, kamarnya sempit banget. Akhirnya nemu rak lipat ini dan…",
    format:"Format konten", productPh:"Deskripsi produk utama — copas dari halaman Shopee",
    extraPh:"Produk complementary, mis. kotak penyimpanan kain",
    more:"Detail produk · opsional", go:"Generate thread", busy:"Menulis thread…",
    hint:"Tulis idemu, pilih format, lalu generate", min:"Ide minimal 20 karakter.",
    linkPh:"https://shope.ee/your-link",
    status:(n:number,type:string,count:string,isBusy:boolean)=>
      isBusy ? `Drafting · ${type}` : n ? `${n} tweets · ${type}` : `Preview · ${count} tweets`,
    copyAll:"Copy thread", copied:"Copied ✓", copyTweet:"Copy", statusDot:"",
  },
  en: {
    idea:"Idea / starting story", ideaPh:"Just moved into a tiny room. Then I found this folding rack and…",
    format:"Content format", productPh:"Main product description — paste from the Shopee page",
    extraPh:"Complementary product, e.g. fabric storage box",
    more:"Product details · optional", go:"Generate thread", busy:"Writing the thread…",
    hint:"Write your idea, pick a format, then generate", min:"Idea needs at least 20 characters.",
    linkPh:"https://shope.ee/your-link",
    status:(n:number,type:string,count:string,isBusy:boolean)=>
      isBusy ? `Drafting · ${type}` : n ? `${n} tweets · ${type}` : `Preview · ${count} tweets`,
    copyAll:"Copy thread", copied:"Copied ✓", copyTweet:"Copy", statusDot:"",
  },
};

// ── canvas animation ───────────────────────────────────────────
function useCanvas(busy: boolean, count: string) {
  const cvRef = useRef<HTMLCanvasElement>(null);
  const reduce = useRef(false);
  useEffect(() => { reduce.current = matchMedia("(prefers-reduced-motion: reduce)").matches; }, []);

  useEffect(() => {
    const t0 = performance.now();
    let raf: number;
    const paint = (now: number) => {
      const cv = cvRef.current; if (!cv) return;
      const W = cv.clientWidth, H = cv.clientHeight; if (!W || !H) { raf = requestAnimationFrame(paint); return; }
      const dpr = Math.min(devicePixelRatio || 1, 2);
      if (cv.width !== Math.round(W * dpr)) { cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr); }
      const ctx = cv.getContext("2d")!; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, W, H);
      const n = Math.min(+count, 5);
      const t = reduce.current ? 4 : (now - t0) / 1000 * (busy ? 2.4 : 1);
      const cw = Math.min(400, W - 64), cx = (W - cw) / 2;
      const rowH = Math.min(92, (H - 120) / n), top = Math.max(28, (H - rowH * n) / 2 - 24);
      const cyc = (t * 0.2) % 1, active = Math.floor(cyc * (n + 1)), local = (cyc * (n + 1)) % 1;
      for (let i = 0; i < n; i++) {
        const y = top + i * rowH, done = i < active, cur = i === active;
        ctx.fillStyle = done || cur ? "#EEE8DC" : "#1F2B24"; ctx.fillRect(cx, y, 32, 32);
        if (i < n - 1) {
          ctx.fillStyle = "#1F2B24"; ctx.fillRect(cx + 15, y + 38, 2, rowH - 44);
          if (done) { ctx.fillStyle = "#C9B48A"; ctx.fillRect(cx + 15, y + 38, 2, rowH - 44); }
        }
        ctx.font = '500 11px "IBM Plex Mono", monospace'; ctx.fillStyle = done || cur ? "#C9B48A" : "#4E5A51";
        ctx.textBaseline = "top"; ctx.textAlign = "left"; ctx.fillText(`${i+1}/${n}`, cx + 48, y + 2);
        [0.95, 0.82, 0.5].forEach((L, k) => {
          const full = (cw - 48) * L;
          const w = done ? full : cur ? Math.max(0, Math.min(full, (local * 3 - k) * full)) : 0;
          ctx.fillStyle = "#1A241F"; ctx.fillRect(cx + 48, y + 20 + k * 13, full, 6);
          ctx.fillStyle = cur ? "#4E5A51" : "#2E3B33"; ctx.fillRect(cx + 48, y + 20 + k * 13, w, 6);
          if (cur && w > 0 && w < full) { ctx.fillStyle = "#C9B48A"; ctx.fillRect(cx + 50 + w, y + 17 + k * 13, 2, 12); }
        });
      }
      raf = requestAnimationFrame(paint);
    };
    raf = requestAnimationFrame(paint);
    return () => cancelAnimationFrame(raf);
  }, [busy, count]);

  return cvRef;
}

// ── main component ─────────────────────────────────────────────
export default function Home() {
  const [lang, setLang]       = useState<"id"|"en">("id");
  const [type, setType]       = useState("Testimoni");
  const [hook, setHook]       = useState("Auto");
  const [count, setCount]     = useState("5");
  const [cta, setCta]         = useState<string>("Link di bio");
  const [idea, setIdea]       = useState("");
  const [product, setProduct] = useState("");
  const [extra, setExtra]     = useState("");
  const [more, setMore]       = useState(false);
  const [busy, setBusy]       = useState(false);
  const [out, setOut]         = useState<string[]>([]);
  const [err, setErr]         = useState("");
  const [copied, setCopied]   = useState<number|"all"|null>(null);

  const ui = T[lang];
  const cvRef = useCanvas(busy, count);

  // sync CTA label when lang changes
  useEffect(() => { setCta(lang === "id" ? "Link di bio" : "Link in bio"); }, [lang]);

  const copy = useCallback((txt: string, idx: number|"all") => {
    navigator.clipboard.writeText(txt).catch(() => {});
    setCopied(idx);
    setTimeout(() => setCopied(null), 1500);
  }, []);

  const generate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (idea.trim().length < 20) { setErr(ui.min); return; }
    setErr(""); setBusy(true); setOut([]);

    const ctaInstruction = cta === "Link di bio" || cta === "Link in bio"
      ? (lang === "id" ? "arahkan ke link di bio di tweet terakhir" : "redirect to link in bio at the last tweet")
      : (lang === "id" ? "tulis [link] inline saat produk disebut" : "write [link] inline when product is mentioned");

    const t = TYPES.find(x => x.value === type);
    const typeDesc = t ? (lang === "id" ? t.id : t.en) : type;

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          format: type.toLowerCase().replace(/ /g, "_"),
          hook: hook === "Auto" ? undefined : hook,
          tweetCount: Number(count),
          idea,
          productDesc: product || undefined,
          complementDesc: extra || undefined,
          ctaType: (cta === "Link di bio" || cta === "Link in bio") ? "bio" : "inline",
          language: lang,
          typeLabel: `${type} — ${typeDesc}`,
          ctaInstruction,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error");
      setOut(data.tweets);
    } catch (e) {
      setErr(lang === "id" ? "Gagal generate — coba lagi." : "Couldn't generate — try again.");
    } finally {
      setBusy(false);
    }
  };

  const hasOut = !busy && out.length > 0;
  const showAnim = busy || !hasOut;

  const s = { /* shared inline style helpers */
    seam: { display:"flex" as const, gap:2, background:"#2E3B33" },
    mono11: { fontFamily:"var(--font-mono)", fontSize:11, color:"#A9B0A6" } as React.CSSProperties,
    gold: { color:"#C9B48A" },
  };

  return (
    <div style={{ fontFamily:"var(--font-sans)", background:"#121B16", color:"#EEE8DC", minHeight:"100vh", display:"flex", flexDirection:"column" }}>

      {/* nav */}
      <nav style={{ borderBottom:"1px solid #2E3B33" }}>
        <div style={{ maxWidth:1320, margin:"0 auto", padding:"14px clamp(20px,5vw,64px)", display:"flex", alignItems:"center", justifyContent:"space-between", gap:24, flexWrap:"wrap" }}>
          <div style={{ display:"flex", alignItems:"center", gap:12, fontSize:14 }}>
            <MKLogo size={28} />
            <span style={{ fontSize:15, fontWeight:500 }}>Marwah K</span>
            <span style={{ color:"#4E5A51" }}>/</span>
            <span style={{ color:"#A9B0A6" }}>Affiliate Threads</span>
          </div>
          <a href="https://marwahk-portfolio.vercel.app" style={{ fontSize:14, color:"#A9B0A6" }}>← Back to portfolio</a>
        </div>
      </nav>

      {/* header */}
      <header style={{ maxWidth:1320, width:"100%", boxSizing:"border-box", margin:"0 auto", padding:"clamp(40px,5vw,64px) clamp(20px,5vw,64px) 32px", display:"flex", justifyContent:"space-between", alignItems:"flex-end", gap:24, flexWrap:"wrap", opacity:0, animation:"mkFadeIn 600ms cubic-bezier(.2,.7,.2,1) 80ms forwards" }}>
        <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <span style={{ width:8, height:8, background:"#C9B48A", display:"inline-block", animation:"mkPulse 2.4s ease-in-out infinite" }} />
            <span style={{ fontFamily:"var(--font-mono)", fontSize:12, fontWeight:500, letterSpacing:"0.14em", textTransform:"uppercase", color:"#C9B48A" }}>Built with AI · Content</span>
          </div>
          <h1 style={{ fontWeight:500, fontSize:"clamp(40px,6vw,80px)", lineHeight:1, letterSpacing:"-0.05em" }}>Affiliate Threads</h1>
          <p style={{ fontSize:17, lineHeight:1.6, color:"#A9B0A6", maxWidth:540 }}>Shopee affiliate threads that read like a real story, not an ad. Write the idea, pick a format, get the thread.</p>
        </div>
        {/* lang toggle */}
        <div style={{ display:"flex", gap:2 }}>
          {(["ID","EN"] as const).map(l => (
            <button key={l} onClick={() => setLang(l.toLowerCase() as "id"|"en")} style={{ border:0, cursor:"pointer", padding:"9px 14px", fontFamily:"var(--font-mono)", fontSize:12, background: lang === l.toLowerCase() ? "#C9B48A" : "#1F2B24", color: lang === l.toLowerCase() ? "#121B16" : "#EEE8DC" }}>{l}</button>
          ))}
        </div>
      </header>

      {/* main grid */}
      <section style={{ maxWidth:1320, width:"100%", boxSizing:"border-box", margin:"0 auto", padding:`0 clamp(20px,5vw,64px) clamp(48px,6vw,80px)` }}>
        <div style={{ display:"flex", flexWrap:"wrap", gap:2, background:"#2E3B33", border:"1px solid #2E3B33" }}>

          {/* ── LEFT: form ── */}
          <form onSubmit={generate} style={{ flex:"1 1 420px", minWidth:0, background:"#121B16", display:"flex", flexDirection:"column" }}>

            {/* 01 idea */}
            <div style={{ padding:"clamp(20px,2.4vw,28px)", display:"flex", flexDirection:"column", gap:12, borderBottom:"1px solid #2E3B33" }}>
              <span style={{ display:"flex", justifyContent:"space-between", ...s.mono11 }}>
                <span><span style={s.gold}>01</span>  {ui.idea}</span>
                <span style={{ color: idea.trim().length >= 20 ? "#C9B48A" : "#6F7A70" }}>{idea.trim().length} / 20+</span>
              </span>
              <textarea value={idea} onInput={e => setIdea((e.target as HTMLTextAreaElement).value)}
                placeholder={ui.ideaPh} rows={4}
                style={{ background:"transparent", border:0, color:"#EEE8DC", padding:0, fontSize:"clamp(18px,1.6vw,22px)", lineHeight:1.45, letterSpacing:"-0.01em", resize:"none", minWidth:0, fontFamily:"var(--font-sans)" }}
              />
            </div>

            {/* 02 format */}
            <div style={{ padding:"clamp(20px,2.4vw,28px)", display:"flex", flexDirection:"column", gap:12, borderBottom:"1px solid #2E3B33" }}>
              <span style={s.mono11}><span style={s.gold}>02</span>  {ui.format}</span>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(min(100%,170px),1fr))", gap:2, background:"#2E3B33", border:"1px solid #2E3B33" }}>
                {TYPES.map(o => {
                  const on = type === o.value;
                  return (
                    <button key={o.value} type="button" onClick={() => setType(o.value)} style={{ border:0, cursor:"pointer", textAlign:"left", padding:14, display:"flex", flexDirection:"column", gap:6, background: on ? "#C9B48A" : "#121B16", color: on ? "#121B16" : "#EEE8DC", fontFamily:"var(--font-sans)", transition:"background 200ms" }}>
                      <span style={{ fontSize:15, fontWeight:600, letterSpacing:"-0.01em" }}>{o.value}</span>
                      <span style={{ fontSize:12, lineHeight:1.4, color: on ? "#2E3B33" : "#6F7A70" }}>{lang === "id" ? o.id : o.en}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 03 hook + count + cta */}
            <div style={{ padding:"clamp(20px,2.4vw,28px)", display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(min(100%,150px),1fr))", gap:16, borderBottom:"1px solid #2E3B33" }}>
              <label style={{ display:"flex", flexDirection:"column", gap:8 }}>
                <span style={s.mono11}><span style={s.gold}>03</span>  Hook</span>
                <select value={hook} onChange={e => setHook(e.target.value)} style={{ background:"#1F2B24", border:"1px solid #2E3B33", color:"#EEE8DC", padding:10, fontSize:14, borderRadius:0, fontFamily:"var(--font-sans)" }}>
                  {HOOKS.map(h => <option key={h} value={h}>{h}</option>)}
                </select>
              </label>
              <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                <span style={s.mono11}>Tweets</span>
                <div style={{ display:"flex", gap:2 }}>
                  {COUNTS.map(c => (
                    <button key={c} type="button" onClick={() => setCount(c)} style={{ flex:1, border:0, cursor:"pointer", padding:"10px 0", fontFamily:"var(--font-mono)", fontSize:13, background: count === c ? "#C9B48A" : "#1F2B24", color: count === c ? "#121B16" : "#EEE8DC" }}>{c}</button>
                  ))}
                </div>
              </div>
              <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                <span style={s.mono11}>CTA</span>
                <div style={{ display:"flex", gap:2 }}>
                  {CTAS[lang].map(c => (
                    <button key={c} type="button" onClick={() => setCta(c)} style={{ flex:1, border:0, cursor:"pointer", padding:"10px 8px", fontFamily:"var(--font-sans)", fontSize:13, fontWeight:500, background: cta === c ? "#C9B48A" : "#1F2B24", color: cta === c ? "#121B16" : "#EEE8DC", whiteSpace:"nowrap" }}>{c}</button>
                  ))}
                </div>
              </div>
            </div>

            {/* more / product details */}
            <div style={{ borderBottom:"1px solid #2E3B33" }}>
              <button type="button" onClick={() => setMore(m => !m)} style={{ width:"100%", border:0, background:"none", cursor:"pointer", padding:"16px clamp(20px,2.4vw,28px)", display:"flex", justifyContent:"space-between", color:"#A9B0A6", fontFamily:"var(--font-mono)", fontSize:12 }}>
                <span>{ui.more}</span><span>{more ? "−" : "+"}</span>
              </button>
              {more && (
                <div style={{ padding:"0 clamp(20px,2.4vw,28px) 20px", display:"flex", flexDirection:"column", gap:12 }}>
                  <textarea value={product} onInput={e => setProduct((e.target as HTMLTextAreaElement).value)}
                    placeholder={ui.productPh} rows={3}
                    style={{ background:"#1F2B24", border:"1px solid #2E3B33", color:"#EEE8DC", padding:12, fontSize:14, lineHeight:1.5, resize:"vertical", borderRadius:0, fontFamily:"var(--font-sans)" }}
                  />
                  <input value={extra} onInput={e => setExtra((e.target as HTMLInputElement).value)}
                    placeholder={ui.extraPh}
                    style={{ background:"#1F2B24", border:"1px solid #2E3B33", color:"#EEE8DC", padding:12, fontSize:14, borderRadius:0, fontFamily:"var(--font-sans)" }}
                  />
                </div>
              )}
            </div>

            {/* submit */}
            <div style={{ padding:"clamp(20px,2.4vw,28px)", display:"flex", flexDirection:"column", gap:10, marginTop:"auto" }}>
              <button type="submit" disabled={busy} style={{ border:0, cursor: busy ? "not-allowed" : "pointer", background: idea.trim().length >= 20 ? "#C9B48A" : "#A9B0A6", color:"#121B16", padding:"16px 22px", fontFamily:"var(--font-sans)", fontSize:15, fontWeight:600, display:"flex", justifyContent:"space-between", alignItems:"center", opacity: busy ? 0.7 : 1 }}>
                <span>{busy ? ui.busy : ui.go}</span>
                <span>{busy ? "…" : "→"}</span>
              </button>
              {err && <span style={{ fontFamily:"var(--font-mono)", fontSize:12, color:"#C9B48A" }}>{err}</span>}
            </div>
          </form>

          {/* ── RIGHT: output ── */}
          <div style={{ flex:"1.1 1 420px", minWidth:0, background:"#0E1511", display:"flex", flexDirection:"column", minHeight:620 }}>
            {/* status bar */}
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"12px 16px", borderBottom:"1px solid #2E3B33", fontFamily:"var(--font-mono)", fontSize:11, color:"#A9B0A6" }}>
              <span style={{ display:"flex", gap:8, alignItems:"center" }}>
                <span style={{ width:6, height:6, background:"#C9B48A", display:"inline-block", animation:"mkPulse 1.6s ease-in-out infinite" }} />
                {ui.status(out.length, type, count, busy)}
              </span>
              {hasOut && (
                <button onClick={() => copy(out.join("\n\n"), "all")} style={{ border:"1px solid #2E3B33", background:"none", color: copied === "all" ? "#C9B48A" : "#EEE8DC", cursor:"pointer", padding:"5px 10px", fontFamily:"var(--font-mono)", fontSize:11 }}>
                  {copied === "all" ? ui.copied : ui.copyAll}
                </button>
              )}
            </div>

            {/* canvas animation (idle / busy) */}
            {showAnim && (
              <div style={{ position:"relative", flex:1, minHeight:540 }}>
                <canvas ref={cvRef} style={{ position:"absolute", inset:0, width:"100%", height:"100%", display:"block" }} />
                <span style={{ position:"absolute", left:0, right:0, bottom:24, textAlign:"center", fontSize:14, color:"#A9B0A6" }}>{busy ? ui.busy : ui.hint}</span>
              </div>
            )}

            {/* tweets output */}
            {hasOut && (
              <div style={{ padding:"clamp(20px,2.4vw,28px)", display:"flex", flexDirection:"column" }}>
                {out.map((tx, i) => (
                  <div key={i} style={{ display:"grid", gridTemplateColumns:"40px minmax(0,1fr)", gap:14, opacity:0, animation:`mkFadeIn 500ms cubic-bezier(.2,.7,.2,1) ${i*100}ms forwards` }}>
                    {/* avatar + thread line */}
                    <div style={{ display:"flex", flexDirection:"column", alignItems:"center" }}>
                      <MKLogo size={40} />
                      <span style={{ flex:1, width:2, background: i < out.length - 1 ? "#2E3B33" : "transparent", margin:"6px 0" }} />
                    </div>
                    {/* tweet body */}
                    <div style={{ display:"flex", flexDirection:"column", gap:8, paddingBottom:24, minWidth:0 }}>
                      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", gap:12 }}>
                        <span style={{ display:"flex", gap:8, alignItems:"baseline", fontSize:14 }}>
                          <b style={{ fontWeight:600 }}>You</b>
                          <span style={{ fontFamily:"var(--font-mono)", fontSize:11, color:"#6F7A70" }}>{i+1}/{out.length}</span>
                        </span>
                        <button onClick={() => copy(tx, i)} style={{ border:0, background:"none", color: copied === i ? "#C9B48A" : "#A9B0A6", cursor:"pointer", padding:0, fontFamily:"var(--font-mono)", fontSize:11 }}>
                          {copied === i ? ui.copied : ui.copyTweet}
                        </button>
                      </div>
                      <p style={{ fontSize:15, lineHeight:1.6, color:"#EEE8DC", whiteSpace:"pre-wrap" }}>{tx}</p>
                      <span style={{ fontFamily:"var(--font-mono)", fontSize:11, color: tx.length > 280 ? "#C9B48A" : "#4E5A51" }}>{tx.length} / 280</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </section>

      {/* footer */}
      <footer style={{ borderTop:"1px solid #2E3B33", marginTop:"auto" }}>
        <div style={{ maxWidth:1320, margin:"0 auto", padding:"20px clamp(20px,5vw,64px)", display:"flex", justifyContent:"space-between", gap:16, flexWrap:"wrap", fontFamily:"var(--font-mono)", fontSize:12, color:"#6F7A70" }}>
          <span>© 2026 Marwah Khairunnisa · Personal project</span>
          <a href="https://wa.me/6285155343042" style={{ color:"#C9B48A" }}>Let&apos;s talk →</a>
        </div>
      </footer>
    </div>
  );
}
