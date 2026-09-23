"use client";

import { useState } from "react";

const FORMAT_OPTIONS = [
  { value: "testimoni", label: "📣 Testimoni", desc: "Review jujur dari pengalaman pribadi" },
  { value: "curiosity", label: "🤔 Create Curiosity", desc: "Hook bikin penasaran, reveal belakangan" },
  { value: "pengalaman", label: "📖 Cerita Pengalaman", desc: "Personal journey, produk sebagai solusi" },
  { value: "ketemu_barang", label: "✨ Ketemu Barang Baru", desc: "Discovery story, tone excited tapi genuine" },
  { value: "viral", label: "🔥 Barang Viral", desc: "Honest take soal barang yang lagi hype" },
  { value: "tip_life", label: "💡 Tips Kehidupan", desc: "Tips/hack, produk sebagai enabler" },
];

const HOOK_OPTIONS = [
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
];

const TWEET_COUNTS = [3, 5, 7, 10];

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
  });
  const [tweets, setTweets] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState<number | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);

  const set = (patch: Partial<FormState>) => setForm((f) => ({ ...f, ...patch }));

  const handleGenerate = async () => {
    if (form.idea.trim().length < 20) { setError("Ide minimal 20 karakter ya bestie 👀"); return; }
    if (form.ctaType === "inline" && !form.affiliateLink.trim()) { setError("Masukin link afiliasi dulu!"); return; }
    if (form.hasComplement && !form.complementLink.trim()) { setError("Masukin link produk complimentary-nya!"); return; }

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
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal generate thread");
      setTweets(data.tweets);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ada yang error, coba lagi");
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

  const selectedHook = HOOK_OPTIONS.find((h) => h.value === form.hook);

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-base)" }}>
      {/* Header */}
      <header style={{
        borderBottom: "1px solid var(--border)",
        background: "rgba(11,11,16,0.85)",
        backdropFilter: "blur(12px)",
        position: "sticky",
        top: 0,
        zIndex: 10,
      }}>
        <div style={{ maxWidth: 640, margin: "0 auto", padding: "12px 16px", display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 10,
            background: "linear-gradient(135deg, var(--accent) 0%, var(--accent-dark) 100%)",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "var(--text-primary)", fontWeight: 700, fontSize: 13, flexShrink: 0,
          }}>S</div>
          <div>
            <div style={{ fontWeight: 600, fontSize: 14, color: "var(--text-primary)", lineHeight: 1 }}>Shopee Thread Generator</div>
            <div style={{ fontSize: 11, color: "var(--text-45)", marginTop: 3 }}>Bikin konten afiliasi yang ga keliatan iklan</div>
          </div>
        </div>
      </header>

      <main style={{ maxWidth: 640, margin: "0 auto", padding: "16px 16px 40px" }}>
        <div style={{
          background: "var(--bg-l2)",
          border: "1px solid var(--border)",
          borderRadius: 20,
          padding: 20,
          display: "flex",
          flexDirection: "column",
          gap: 20,
        }}>

          {/* Format */}
          <Section label="Jenis Konten">
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {FORMAT_OPTIONS.map((opt) => (
                <button key={opt.value} onClick={() => set({ format: opt.value })} style={{
                  textAlign: "left", padding: "10px 12px", borderRadius: 14,
                  border: `1.5px solid ${form.format === opt.value ? "var(--accent)" : "var(--border)"}`,
                  background: form.format === opt.value ? "rgba(192,48,48,0.12)" : "var(--bg-l1)",
                  cursor: "pointer", transition: "all 0.2s",
                }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-primary)" }}>{opt.label}</div>
                  <div style={{ fontSize: 11, color: "var(--text-45)", marginTop: 2, lineHeight: 1.4 }}>{opt.desc}</div>
                </button>
              ))}
            </div>
          </Section>

          {/* Hook */}
          <Section label="Tipe Hook" sublabel="opsional">
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginBottom: 8 }}>
              {HOOK_OPTIONS.map((h) => (
                <button key={h.value} onClick={() => set({ hook: form.hook === h.value ? "" : h.value })} style={{
                  textAlign: "left", padding: "8px 12px", borderRadius: 12,
                  border: `1.5px solid ${form.hook === h.value ? "var(--accent)" : "var(--border)"}`,
                  background: form.hook === h.value ? "rgba(192,48,48,0.12)" : "var(--bg-l1)",
                  fontSize: 12, fontWeight: 500,
                  color: form.hook === h.value ? "var(--warm-mid)" : "var(--text-70)",
                  cursor: "pointer", transition: "all 0.2s",
                }}>{h.label}</button>
              ))}
            </div>
            {selectedHook && (
              <div style={{
                background: "rgba(192,48,48,0.08)", border: "1px solid rgba(192,48,48,0.2)",
                borderRadius: 12, padding: "10px 14px",
              }}>
                <span style={{ fontSize: 11, color: "var(--warm-mid)", lineHeight: 1.5 }}>
                  <strong>Contoh: </strong>&ldquo;{selectedHook.example}&rdquo;
                </span>
              </div>
            )}
          </Section>

          {/* Tweet Count */}
          <Section label="Jumlah Tweet">
            <div style={{ display: "flex", gap: 8 }}>
              {TWEET_COUNTS.map((n) => (
                <button key={n} onClick={() => set({ tweetCount: n })} style={{
                  flex: 1, padding: "9px 0", borderRadius: 12, fontSize: 14, fontWeight: 600,
                  border: `1.5px solid ${form.tweetCount === n ? "var(--accent)" : "var(--border)"}`,
                  background: form.tweetCount === n ? "var(--accent)" : "var(--bg-l1)",
                  color: form.tweetCount === n ? "#fff" : "var(--text-70)",
                  cursor: "pointer", transition: "all 0.2s",
                }}>{n}</button>
              ))}
            </div>
          </Section>

          {/* Idea */}
          <Section label="Ide / Cerita Awal">
            <textarea value={form.idea} onChange={(e) => set({ idea: e.target.value })}
              placeholder="Ceritain produknya, pengalaman lo, atau angle yang mau lo pakai. Makin detail makin bagus hasilnya."
              rows={3} style={{
                width: "100%", padding: "11px 14px", borderRadius: 14,
                border: "1.5px solid var(--border)", background: "var(--bg-l1)",
                color: "var(--text-primary)", fontSize: 13, lineHeight: 1.6,
                outline: "none", resize: "none", fontFamily: "inherit",
              }}
              onFocus={(e) => e.target.style.borderColor = "var(--accent)"}
              onBlur={(e) => e.target.style.borderColor = "var(--border)"}
            />
            <div style={{ fontSize: 11, textAlign: "right", marginTop: 4, color: form.idea.length < 20 ? "var(--warm-accent)" : "var(--text-35)" }}>
              {form.idea.length} karakter {form.idea.length < 20 && "(min 20)"}
            </div>
          </Section>

          {/* Product Desc */}
          <Section label="Deskripsi Produk Utama" sublabel="opsional — copas dari Shopee">
            <textarea value={form.productDesc} onChange={(e) => set({ productDesc: e.target.value })}
              placeholder="Copas deskripsi produk dari halaman Shopee di sini. AI akan baca keunggulan & fitur utamanya untuk dimasukkan ke thread."
              rows={4} style={{
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
          <Section label="CTA Produk Utama">
            <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
              {(["bio", "inline"] as const).map((type) => (
                <button key={type} onClick={() => set({ ctaType: type })} style={{
                  flex: 1, padding: "9px 0", borderRadius: 12, fontSize: 13, fontWeight: 500,
                  border: `1.5px solid ${form.ctaType === type ? "var(--accent)" : "var(--border)"}`,
                  background: form.ctaType === type ? "rgba(192,48,48,0.12)" : "var(--bg-l1)",
                  color: form.ctaType === type ? "var(--warm-mid)" : "var(--text-70)",
                  cursor: "pointer", transition: "all 0.2s",
                }}>{type === "bio" ? "🔗 Link di Bio" : "📎 Inline Link"}</button>
              ))}
            </div>
            {form.ctaType === "inline" && (
              <input type="url" value={form.affiliateLink} onChange={(e) => set({ affiliateLink: e.target.value })}
                placeholder="https://shope.ee/your-affiliate-link" style={{
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
              padding: "11px 14px", borderRadius: 14,
              border: `1.5px solid ${form.hasComplement ? "var(--accent)" : "var(--border)"}`,
              background: form.hasComplement ? "rgba(192,48,48,0.12)" : "var(--bg-l1)",
              color: form.hasComplement ? "var(--warm-mid)" : "var(--text-70)",
              fontSize: 13, fontWeight: 500, cursor: "pointer", transition: "all 0.2s",
            }}>
              <span>➕ Produk Complimentary</span>
              <span style={{ fontSize: 11, color: "var(--text-35)" }}>{form.hasComplement ? "Aktif" : "Opsional"}</span>
            </button>
            {form.hasComplement && (
              <div style={{
                marginTop: 8, padding: 14, borderRadius: 14,
                border: "1px solid rgba(192,48,48,0.2)", background: "rgba(192,48,48,0.06)",
                display: "flex", flexDirection: "column", gap: 8,
              }}>
                <p style={{ fontSize: 11, color: "var(--text-45)", margin: 0 }}>Produk ini akan di-mention secara natural sebagai pelengkap di thread.</p>
                <textarea value={form.complementDesc} onChange={(e) => set({ complementDesc: e.target.value })}
                  placeholder="Copas deskripsi produk complimentary dari Shopee (opsional)"
                  rows={3} style={{
                    width: "100%", padding: "11px 14px", borderRadius: 12,
                    border: "1.5px solid var(--border)", background: "var(--bg-l1)",
                    color: "var(--text-primary)", fontSize: 13, lineHeight: 1.6,
                    outline: "none", resize: "none", fontFamily: "inherit",
                  }}
                  onFocus={(e) => e.target.style.borderColor = "var(--accent)"}
                  onBlur={(e) => e.target.style.borderColor = "var(--border)"}
                />
                <input type="url" value={form.complementLink} onChange={(e) => set({ complementLink: e.target.value })}
                  placeholder="Link afiliasi produk complimentary (wajib)" style={{
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
            width: "100%", padding: "14px 0",
            background: loading ? "var(--bg-l3)" : "linear-gradient(135deg, var(--accent) 0%, var(--accent-dark) 100%)",
            border: "none", borderRadius: 14, color: "#fff",
            fontSize: 14, fontWeight: 600, cursor: loading ? "not-allowed" : "pointer",
            transition: "opacity 0.2s", opacity: loading ? 0.7 : 1, fontFamily: "inherit",
          }}>
            {loading ? (
              <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                <svg style={{ animation: "spin 1s linear infinite", width: 16, height: 16 }} viewBox="0 0 24 24" fill="none">
                  <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                Lagi nulis thread...
              </span>
            ) : "✨ Generate Thread"}
          </button>
        </div>

        {/* Results */}
        {tweets.length > 0 && (
          <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 4px" }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>
                Thread siap! {tweets.length} tweet 🎉
              </span>
              <button onClick={copyAll} style={{
                fontSize: 11, padding: "6px 12px", borderRadius: 8, fontWeight: 500, cursor: "pointer",
                border: "1px solid var(--border)",
                background: copiedAll ? "rgba(34,197,94,0.12)" : "var(--bg-l1)",
                color: copiedAll ? "#4ade80" : "var(--text-70)",
                transition: "all 0.2s", fontFamily: "inherit",
              }}>{copiedAll ? "✓ Copied all!" : "Copy semua"}</button>
            </div>

            {tweets.map((tweet, idx) => {
              const chars = charCount(tweet);
              const over = chars > 280;
              return (
                <div key={idx} style={{
                  background: "var(--bg-l2)", border: "1px solid var(--border)",
                  borderRadius: 18, padding: 16,
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
                    }}>{copied === idx ? "✓" : "Copy"}</button>
                  </div>
                  <div style={{
                    display: "flex", justifyContent: "space-between", marginTop: 12,
                    paddingTop: 12, borderTop: "1px solid var(--border-faint)",
                  }}>
                    <span style={{ fontSize: 11, color: "var(--text-35)" }}>Tweet {idx + 1}</span>
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
            }}>🔄 Generate ulang</button>
          </div>
        )}
      </main>

      <footer style={{ textAlign: "center", fontSize: 11, color: "var(--text-35)", paddingBottom: 24 }}>
        Made for Shopee affiliates 🧡 · Powered by Claude
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
