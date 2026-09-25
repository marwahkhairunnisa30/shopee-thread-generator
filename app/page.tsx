"use client";

import { useState } from "react";

const FORMAT_OPTIONS = {
  id: [
    { value: "testimoni", label: "📣 Testimoni", desc: "Review jujur dari pengalaman pribadi" },
    { value: "curiosity", label: "🤔 Create Curiosity", desc: "Hook bikin penasaran, reveal belakangan" },
    { value: "pengalaman", label: "📖 Cerita Pengalaman", desc: "Personal journey, produk sebagai solusi" },
    { value: "ketemu_barang", label: "✨ Ketemu Barang Baru", desc: "Discovery story, tone excited tapi genuine" },
    { value: "viral", label: "🔥 Barang Viral", desc: "Honest take soal barang yang lagi hype" },
    { value: "tip_life", label: "💡 Tips Kehidupan", desc: "Tips/hack, produk sebagai enabler" },
  ],
  en: [
    { value: "testimoni", label: "📣 Testimonial", desc: "Honest review from personal experience" },
    { value: "curiosity", label: "🤔 Create Curiosity", desc: "Hook them first, reveal the product later" },
    { value: "pengalaman", label: "📖 Personal Story", desc: "Journey storytelling, product as the solution" },
    { value: "ketemu_barang", label: "✨ New Find", desc: "Discovery story, excited but genuine tone" },
    { value: "viral", label: "🔥 Viral Product", desc: "Honest take on something that's been hyped" },
    { value: "tip_life", label: "💡 Life Tips", desc: "Tips/hack, product as the enabler" },
  ],
};

const HOOK_OPTIONS = {
  id: [
    { value: "confession", label: "😬 Confession", example: "Aku udah buang 500rb buat beli [kategori] yang ga works. Baru nemu yang ini." },
    { value: "number", label: "🔢 Number Hook", example: "31 hari pakai ini, hasilnya literally beda banget dari bulan lalu." },
    { value: "controversy", label: "🔥 Controversy", example: "Produk mahal itu overrated. Ini yang 40rb ternyata menang jauh." },
    { value: "before_after", label: "✨ Before/After", example: "Dulu [masalah]. Sekarang [hasil]. Bedanya cuma satu barang." },
    { value: "curiosity_gap", label: "🤔 Curiosity Gap", example: "Kalian tau ga kenapa ibu-ibu komplek aku tiba-tiba pada punya [hasil yang sama]?" },
    { value: "relatability", label: "🫂 Relatability", example: "Capek beli produk karena FYP terus nyesel? Same. Tapi yang ini beda." },
    { value: "discovery", label: "🔍 Discovery", example: "Ga nyangka nemu ini di Shopee harga segini. Kenapa ga ada yang kasih tau dari dulu?" },
    { value: "social_proof", label: "👥 Social Proof", example: "Temen-temen aku udah pada reorder 3x. Aku yang terakhir nyoba, dan aku nyesel." },
    { value: "plot_twist", label: "😱 Plot Twist", example: "Ekspektasiku: biasa aja. Realitanya: reorder seminggu kemudian." },
    { value: "question", label: "❓ Question Hook", example: "Pernah ga beli sesuatu yang murah banget tapi ternyata jadi barang paling sering dipake?" },
  ],
  en: [
    { value: "confession", label: "😬 Confession", example: "I wasted $30 on [category] that didn't work. Then I found this." },
    { value: "number", label: "🔢 Number Hook", example: "31 days using this. The difference from last month is actually wild." },
    { value: "controversy", label: "🔥 Controversy", example: "Expensive products are overrated. This $8 thing beats them all." },
    { value: "before_after", label: "✨ Before/After", example: "Before: [problem]. Now: [result]. One product changed it." },
    { value: "curiosity_gap", label: "🤔 Curiosity Gap", example: "Why does everyone in my apartment suddenly have [same result]?" },
    { value: "relatability", label: "🫂 Relatability", example: "Tired of buying stuff from TikTok and regretting it? Same. But this one's different." },
    { value: "discovery", label: "🔍 Discovery", example: "Didn't expect to find this on Shopee at this price. Why did nobody tell me sooner?" },
    { value: "social_proof", label: "👥 Social Proof", example: "My friends have reordered this 3 times. I was the last one to try it. I regret waiting." },
    { value: "plot_twist", label: "😱 Plot Twist", example: "My expectation: it's fine. Reality: I reordered a week later." },
    { value: "question", label: "❓ Question Hook", example: "Ever bought something cheap that ended up being the thing you use every single day?" },
  ],
};

const TWEET_COUNTS = [3, 5, 7, 10];

const T = {
  id: {
    subtitle: "Bikin konten afiliasi yang ga keliatan iklan",
    contentType: "Jenis Konten",
    hookType: "Tipe Hook",
    optional: "opsional",
    tweetCount: "Jumlah Tweet",
    idea: "Ide / Cerita Awal",
    ideaPlaceholder: "Ceritain produknya, pengalaman lo, atau angle yang mau lo pakai. Makin detail makin bagus hasilnya.",
    ideaMin: "karakter (min 20)",
    productDesc: "Deskripsi Produk Utama",
    productDescSub: "opsional — copas dari Shopee",
    productDescPlaceholder: "Copas deskripsi produk dari halaman Shopee di sini. AI akan baca keunggulan & fitur utamanya untuk dimasukkan ke thread.",
    ctaLabel: "CTA Produk Utama",
    ctaBio: "🔗 Link di Bio",
    ctaInline: "📎 Inline Link",
    ctaLinkPlaceholder: "https://shope.ee/your-affiliate-link",
    complement: "➕ Produk Complimentary",
    complementActive: "Aktif",
    complementOptional: "Opsional",
    complementNote: "Produk ini akan di-mention secara natural sebagai pelengkap di thread.",
    complementDescPlaceholder: "Copas deskripsi produk complimentary dari Shopee (opsional)",
    complementLinkPlaceholder: "Link afiliasi produk complimentary (wajib)",
    generate: "✨ Generate Thread",
    generating: "Lagi nulis thread...",
    readyLabel: (n: number) => `Thread siap! ${n} tweet 🎉`,
    copyAll: "Copy semua",
    copiedAll: "✓ Copied all!",
    copy: "Copy",
    copied: "✓",
    tweetLabel: (i: number) => `Tweet ${i}`,
    regenerate: "🔄 Generate ulang",
    footer: "Made for Shopee affiliates 🧡 · Powered by Claude",
    hookExample: "Contoh:",
    errorMin: "Ide minimal 20 karakter ya bestie 👀",
    errorLink: "Masukin link afiliasi dulu!",
    errorCompLink: "Masukin link produk complimentary-nya!",
  },
  en: {
    subtitle: "Create affiliate content that doesn't feel like an ad",
    contentType: "Content Type",
    hookType: "Hook Type",
    optional: "optional",
    tweetCount: "Tweet Count",
    idea: "Your Idea / Story",
    ideaPlaceholder: "Describe the product, your experience, or the angle you want to take. The more detail, the better the output.",
    ideaMin: "characters (min 20)",
    productDesc: "Main Product Description",
    productDescSub: "optional — paste from Shopee",
    productDescPlaceholder: "Paste the product description from the Shopee page here. AI will extract the key highlights and features to weave into the thread.",
    ctaLabel: "Main Product CTA",
    ctaBio: "🔗 Link in Bio",
    ctaInline: "📎 Inline Link",
    ctaLinkPlaceholder: "https://shope.ee/your-affiliate-link",
    complement: "➕ Complementary Product",
    complementActive: "Active",
    complementOptional: "Optional",
    complementNote: "This product will be mentioned naturally as a complement within the thread.",
    complementDescPlaceholder: "Paste complementary product description from Shopee (optional)",
    complementLinkPlaceholder: "Complementary product affiliate link (required)",
    generate: "✨ Generate Thread",
    generating: "Writing your thread...",
    readyLabel: (n: number) => `Thread ready! ${n} tweets 🎉`,
    copyAll: "Copy all",
    copiedAll: "✓ Copied all!",
    copy: "Copy",
    copied: "✓",
    tweetLabel: (i: number) => `Tweet ${i}`,
    regenerate: "🔄 Regenerate",
    footer: "Made for Shopee affiliates 🧡 · Powered by Claude",
    hookExample: "Example:",
    errorMin: "Idea must be at least 20 characters 👀",
    errorLink: "Please enter your affiliate link!",
    errorCompLink: "Please enter the complementary product link!",
  },
};

interface FormState {
  format: string;
  hook: string;
  tweetCount: number;
  idea: string;
  productDesc: string;
  ctaType: "bio" | "inline";
  affiliateLink: string;
  hasComplement: boolean;
  complementDesc: string;
  complementLink: string;
  language: "id" | "en";
}

export default function Home() {
  const [form, setForm] = useState<FormState>({
    format: "testimoni",
    hook: "",
    tweetCount: 5,
    idea: "",
    productDesc: "",
    ctaType: "bio",
    affiliateLink: "",
    hasComplement: false,
    complementDesc: "",
    complementLink: "",
    language: "id",
  });
  const [tweets, setTweets] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState<number | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);

  const set = (patch: Partial<FormState>) => setForm((f) => ({ ...f, ...patch }));
  const lang = form.language;
  const ui = T[lang];
  const formatOptions = FORMAT_OPTIONS[lang];
  const hookOptions = HOOK_OPTIONS[lang];

  const handleGenerate = async () => {
    if (form.idea.trim().length < 20) { setError(ui.errorMin); return; }
    if (form.ctaType === "inline" && !form.affiliateLink.trim()) { setError(ui.errorLink); return; }
    if (form.hasComplement && !form.complementLink.trim()) { setError(ui.errorCompLink); return; }

    setError(""); setLoading(true); setTweets([]);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          format: form.format,
          hook: form.hook || undefined,
          tweetCount: form.tweetCount,
          idea: form.idea,
          productDesc: form.productDesc || undefined,
          ctaType: form.ctaType,
          affiliateLink: form.affiliateLink || undefined,
          complementDesc: form.hasComplement ? form.complementDesc || undefined : undefined,
          complementLink: form.hasComplement ? form.complementLink || undefined : undefined,
          language: lang,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || (lang === "en" ? "Failed to generate thread" : "Gagal generate thread"));
      setTweets(data.tweets);
    } catch (err) {
      setError(err instanceof Error ? err.message : (lang === "en" ? "Something went wrong, try again" : "Ada yang error, coba lagi"));
    } finally {
      setLoading(false);
    }
  };

  const copyTweet = async (text: string, idx: number) => {
    await navigator.clipboard.writeText(text);
    setCopied(idx);
    setTimeout(() => setCopied(null), 2000);
  };

  const copyAll = async () => {
    await navigator.clipboard.writeText(tweets.join("\n\n"));
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  const charCount = (tweet: string) => {
    const match = tweet.match(/^\[\d+\/\d+\]\s*/);
    const prefix = match ? match[0] : "";
    return tweet.slice(prefix.length).length + prefix.length;
  };

  const selectedHook = hookOptions.find((h) => h.value === form.hook);

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-base)" }}>
      {/* Header */}
      <header style={{
        borderBottom: "1px solid var(--border)",
        background: "rgba(11,11,16,0.85)",
        backdropFilter: "blur(12px)",
        position: "sticky", top: 0, zIndex: 10,
      }}>
        <div style={{ maxWidth: 640, margin: "0 auto", padding: "12px 16px", display: "flex", alignItems: "center", gap: 12 }}>
          <a href="https://marwahk-portfolio.vercel.app" style={{
            display: "inline-flex", alignItems: "center", gap: 4,
            fontSize: 12, color: "var(--text-45)", textDecoration: "none",
            flexShrink: 0, transition: "color .2s",
          }} onMouseEnter={e => (e.currentTarget.style.color="var(--text-primary)")} onMouseLeave={e => (e.currentTarget.style.color="var(--text-45)")}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
            Back
          </a>
          <div style={{
            width: 32, height: 32, borderRadius: 10, flexShrink: 0,
            background: "linear-gradient(135deg, var(--accent) 0%, var(--accent-dark) 100%)",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "#fff", fontWeight: 700, fontSize: 13,
          }}>S</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 600, fontSize: 14, color: "var(--text-primary)", lineHeight: 1 }}>Shopee Thread Generator</div>
            <div style={{ fontSize: 11, color: "var(--text-45)", marginTop: 3 }}>{ui.subtitle}</div>
          </div>
          {/* Language toggle */}
          <div style={{
            display: "flex", gap: 2, padding: 3,
            background: "var(--bg-l3)", borderRadius: 10, border: "1px solid var(--border)",
          }}>
            {(["id", "en"] as const).map((l) => (
              <button key={l} onClick={() => set({ language: l })} style={{
                padding: "4px 10px", borderRadius: 7, fontSize: 11, fontWeight: 600,
                cursor: "pointer", border: "none", fontFamily: "inherit",
                background: lang === l ? "var(--accent)" : "transparent",
                color: lang === l ? "#fff" : "var(--text-45)",
                transition: "all 0.2s",
              }}>{l.toUpperCase()}</button>
            ))}
          </div>
        </div>
      </header>

      <main style={{ maxWidth: 640, margin: "0 auto", padding: "16px 16px 40px" }}>
        <div style={{
          background: "var(--bg-l2)", border: "1px solid var(--border)",
          borderRadius: 20, padding: 20, display: "flex", flexDirection: "column", gap: 20,
        }}>

          {/* Format */}
          <Section label={ui.contentType}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {formatOptions.map((opt) => (
                <button key={opt.value} onClick={() => set({ format: opt.value })} style={{
                  textAlign: "left", padding: "10px 12px", borderRadius: 14, cursor: "pointer",
                  border: `1.5px solid ${form.format === opt.value ? "var(--accent)" : "var(--border)"}`,
                  background: form.format === opt.value ? "rgba(192,48,48,0.12)" : "var(--bg-l1)",
                  transition: "all 0.2s",
                }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-primary)" }}>{opt.label}</div>
                  <div style={{ fontSize: 11, color: "var(--text-45)", marginTop: 2, lineHeight: 1.4 }}>{opt.desc}</div>
                </button>
              ))}
            </div>
          </Section>

          {/* Hook */}
          <Section label={ui.hookType} sublabel={ui.optional}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginBottom: 8 }}>
              {hookOptions.map((h) => (
                <button key={h.value} onClick={() => set({ hook: form.hook === h.value ? "" : h.value })} style={{
                  textAlign: "left", padding: "8px 12px", borderRadius: 12, cursor: "pointer",
                  border: `1.5px solid ${form.hook === h.value ? "var(--accent)" : "var(--border)"}`,
                  background: form.hook === h.value ? "rgba(192,48,48,0.12)" : "var(--bg-l1)",
                  fontSize: 12, fontWeight: 500,
                  color: form.hook === h.value ? "var(--warm-mid)" : "var(--text-70)",
                  transition: "all 0.2s",
                }}>{h.label}</button>
              ))}
            </div>
            {selectedHook && (
              <div style={{
                background: "rgba(192,48,48,0.08)", border: "1px solid rgba(192,48,48,0.2)",
                borderRadius: 12, padding: "10px 14px",
              }}>
                <span style={{ fontSize: 11, color: "var(--warm-mid)", lineHeight: 1.5 }}>
                  <strong>{ui.hookExample} </strong>&ldquo;{selectedHook.example}&rdquo;
                </span>
              </div>
            )}
          </Section>

          {/* Tweet Count */}
          <Section label={ui.tweetCount}>
            <div style={{ display: "flex", gap: 8 }}>
              {TWEET_COUNTS.map((n) => (
                <button key={n} onClick={() => set({ tweetCount: n })} style={{
                  flex: 1, padding: "9px 0", borderRadius: 12, fontSize: 14, fontWeight: 600, cursor: "pointer",
                  border: `1.5px solid ${form.tweetCount === n ? "var(--accent)" : "var(--border)"}`,
                  background: form.tweetCount === n ? "var(--accent)" : "var(--bg-l1)",
                  color: form.tweetCount === n ? "#fff" : "var(--text-70)",
                  transition: "all 0.2s",
                }}>{n}</button>
              ))}
            </div>
          </Section>

          {/* Idea */}
          <Section label={ui.idea}>
            <textarea value={form.idea} onChange={(e) => set({ idea: e.target.value })}
              placeholder={ui.ideaPlaceholder} rows={3} style={{
                width: "100%", padding: "11px 14px", borderRadius: 14,
                border: "1.5px solid var(--border)", background: "var(--bg-l1)",
                color: "var(--text-primary)", fontSize: 13, lineHeight: 1.6,
                outline: "none", resize: "none", fontFamily: "inherit",
              }}
              onFocus={(e) => e.target.style.borderColor = "var(--accent)"}
              onBlur={(e) => e.target.style.borderColor = "var(--border)"}
            />
            <div style={{ fontSize: 11, textAlign: "right", marginTop: 4, color: form.idea.length < 20 ? "var(--warm-accent)" : "var(--text-35)" }}>
              {form.idea.length} {ui.ideaMin}
            </div>
          </Section>

          {/* Product Desc */}
          <Section label={ui.productDesc} sublabel={ui.productDescSub}>
            <textarea value={form.productDesc} onChange={(e) => set({ productDesc: e.target.value })}
              placeholder={ui.productDescPlaceholder} rows={4} style={{
                width: "100%", padding: "11px 14px", borderRadius: 14,
                border: "1.5px solid var(--border)", background: "var(--bg-l1)",
                color: "var(--text-primary)", fontSize: 13, lineHeight: 1.6,
                outline: "none", resize: "none", fontFamily: "inherit",
              }}
              onFocus={(e) => e.target.style.borderColor = "var(--accent)"}
              onBlur={(e) => e.target.style.borderColor = "var(--border)"}
            />
          </Section>

          {/* CTA */}
          <Section label={ui.ctaLabel}>
            <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
              {(["bio", "inline"] as const).map((type) => (
                <button key={type} onClick={() => set({ ctaType: type })} style={{
                  flex: 1, padding: "9px 0", borderRadius: 12, fontSize: 13, fontWeight: 500, cursor: "pointer",
                  border: `1.5px solid ${form.ctaType === type ? "var(--accent)" : "var(--border)"}`,
                  background: form.ctaType === type ? "rgba(192,48,48,0.12)" : "var(--bg-l1)",
                  color: form.ctaType === type ? "var(--warm-mid)" : "var(--text-70)",
                  transition: "all 0.2s",
                }}>{type === "bio" ? ui.ctaBio : ui.ctaInline}</button>
              ))}
            </div>
            {form.ctaType === "inline" && (
              <input type="url" value={form.affiliateLink} onChange={(e) => set({ affiliateLink: e.target.value })}
                placeholder={ui.ctaLinkPlaceholder} style={{
                  width: "100%", padding: "11px 14px", borderRadius: 14,
                  border: "1.5px solid var(--border)", background: "var(--bg-l1)",
                  color: "var(--text-primary)", fontSize: 13, outline: "none", fontFamily: "inherit",
                }}
                onFocus={(e) => e.target.style.borderColor = "var(--accent)"}
                onBlur={(e) => e.target.style.borderColor = "var(--border)"}
              />
            )}
          </Section>

          {/* Complementary */}
          <div>
            <button onClick={() => set({ hasComplement: !form.hasComplement })} style={{
              width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "11px 14px", borderRadius: 14, cursor: "pointer",
              border: `1.5px solid ${form.hasComplement ? "var(--accent)" : "var(--border)"}`,
              background: form.hasComplement ? "rgba(192,48,48,0.12)" : "var(--bg-l1)",
              color: form.hasComplement ? "var(--warm-mid)" : "var(--text-70)",
              fontSize: 13, fontWeight: 500, transition: "all 0.2s",
            }}>
              <span>{ui.complement}</span>
              <span style={{ fontSize: 11, color: "var(--text-35)" }}>
                {form.hasComplement ? ui.complementActive : ui.complementOptional}
              </span>
            </button>
            {form.hasComplement && (
              <div style={{
                marginTop: 8, padding: 14, borderRadius: 14,
                border: "1px solid rgba(192,48,48,0.2)", background: "rgba(192,48,48,0.06)",
                display: "flex", flexDirection: "column", gap: 8,
              }}>
                <p style={{ fontSize: 11, color: "var(--text-45)", margin: 0 }}>{ui.complementNote}</p>
                <textarea value={form.complementDesc} onChange={(e) => set({ complementDesc: e.target.value })}
                  placeholder={ui.complementDescPlaceholder} rows={3} style={{
                    width: "100%", padding: "11px 14px", borderRadius: 12,
                    border: "1.5px solid var(--border)", background: "var(--bg-l1)",
                    color: "var(--text-primary)", fontSize: 13, lineHeight: 1.6,
                    outline: "none", resize: "none", fontFamily: "inherit",
                  }}
                  onFocus={(e) => e.target.style.borderColor = "var(--accent)"}
                  onBlur={(e) => e.target.style.borderColor = "var(--border)"}
                />
                <input type="url" value={form.complementLink} onChange={(e) => set({ complementLink: e.target.value })}
                  placeholder={ui.complementLinkPlaceholder} style={{
                    width: "100%", padding: "11px 14px", borderRadius: 12,
                    border: "1.5px solid var(--border)", background: "var(--bg-l1)",
                    color: "var(--text-primary)", fontSize: 13, outline: "none", fontFamily: "inherit",
                  }}
                  onFocus={(e) => e.target.style.borderColor = "var(--accent)"}
                  onBlur={(e) => e.target.style.borderColor = "var(--border)"}
                />
              </div>
            )}
          </div>

          {/* Error */}
          {error && (
            <div style={{
              background: "rgba(232,52,43,0.1)", border: "1px solid rgba(232,52,43,0.3)",
              borderRadius: 12, padding: "10px 14px", fontSize: 12, color: "var(--warm-mid)",
            }}>{error}</div>
          )}

          {/* Submit */}
          <button onClick={handleGenerate} disabled={loading} style={{
            width: "100%", padding: "14px 0", border: "none", borderRadius: 14,
            background: loading ? "var(--bg-l3)" : "linear-gradient(135deg, var(--accent) 0%, var(--accent-dark) 100%)",
            color: "#fff", fontSize: 14, fontWeight: 600,
            cursor: loading ? "not-allowed" : "pointer",
            opacity: loading ? 0.7 : 1, transition: "opacity 0.2s", fontFamily: "inherit",
          }}>
            {loading ? (
              <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                <svg style={{ animation: "spin 1s linear infinite", width: 16, height: 16 }} viewBox="0 0 24 24" fill="none">
                  <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                {ui.generating}
              </span>
            ) : ui.generate}
          </button>
        </div>

        {/* Results */}
        {tweets.length > 0 && (
          <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 4px" }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>
                {ui.readyLabel(tweets.length)}
              </span>
              <button onClick={copyAll} style={{
                fontSize: 11, padding: "6px 12px", borderRadius: 8, fontWeight: 500, cursor: "pointer",
                border: "1px solid var(--border)",
                background: copiedAll ? "rgba(34,197,94,0.12)" : "var(--bg-l1)",
                color: copiedAll ? "#4ade80" : "var(--text-70)",
                transition: "all 0.2s", fontFamily: "inherit",
              }}>{copiedAll ? ui.copiedAll : ui.copyAll}</button>
            </div>

            {tweets.map((tweet, idx) => {
              const chars = charCount(tweet);
              const over = chars > 280;
              return (
                <div key={idx} style={{
                  background: "var(--bg-l2)", border: "1px solid var(--border)", borderRadius: 18, padding: 16,
                }}>
                  <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                    <p style={{ flex: 1, fontSize: 13, color: "var(--text-primary)", lineHeight: 1.65, margin: 0, whiteSpace: "pre-wrap" }}>
                      {tweet}
                    </p>
                    <button onClick={() => copyTweet(tweet, idx)} style={{
                      flexShrink: 0, fontSize: 11, padding: "5px 10px", borderRadius: 8,
                      border: "1px solid var(--border)",
                      background: copied === idx ? "rgba(34,197,94,0.12)" : "var(--bg-l3)",
                      color: copied === idx ? "#4ade80" : "var(--text-50)",
                      cursor: "pointer", fontFamily: "inherit", fontWeight: 500,
                    }}>{copied === idx ? ui.copied : ui.copy}</button>
                  </div>
                  <div style={{
                    display: "flex", justifyContent: "space-between", marginTop: 12,
                    paddingTop: 12, borderTop: "1px solid var(--border-faint)",
                  }}>
                    <span style={{ fontSize: 11, color: "var(--text-35)" }}>{ui.tweetLabel(idx + 1)}</span>
                    <span style={{ fontSize: 11, fontWeight: 500, color: over ? "var(--warm-accent)" : chars > 260 ? "#f59e0b" : "var(--text-35)" }}>
                      {chars}/280 {over && "⚠️"}
                    </span>
                  </div>
                </div>
              );
            })}

            <button onClick={handleGenerate} style={{
              width: "100%", padding: "12px 0",
              border: "1.5px dashed var(--border)", borderRadius: 14,
              background: "transparent", color: "var(--text-45)",
              fontSize: 13, fontWeight: 500, cursor: "pointer", fontFamily: "inherit",
            }}>{ui.regenerate}</button>
          </div>
        )}
      </main>

      <footer style={{ textAlign: "center", fontSize: 11, color: "var(--text-35)", paddingBottom: 24 }}>
        {ui.footer}
      </footer>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

function Section({ label, sublabel, children }: { label: string; sublabel?: string; children: React.ReactNode }) {
  return (
    <div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 10 }}>
        <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--text-45)" }}>
          {label}
        </span>
        {sublabel && <span style={{ fontSize: 10, color: "var(--text-35)" }}>({sublabel})</span>}
      </div>
      {children}
    </div>
  );
}
