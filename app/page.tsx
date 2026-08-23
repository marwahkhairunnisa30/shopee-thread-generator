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
  ctaType: "bio" | "inline";
  affiliateLink: string;
}

export default function Home() {
  const [form, setForm] = useState<FormState>({
    format: "testimoni",
    hook: "",
    tweetCount: 5,
    idea: "",
    ctaType: "bio",
    affiliateLink: "",
  });
  const [tweets, setTweets] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState<number | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);

  const handleGenerate = async () => {
    if (form.idea.trim().length < 20) {
      setError("Ide minimal 20 karakter ya bestie 👀");
      return;
    }
    if (form.ctaType === "inline" && !form.affiliateLink.trim()) {
      setError("Masukin link afiliasi dulu buat inline CTA!");
      return;
    }

    setError("");
    setLoading(true);
    setTweets([]);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          format: form.format,
          hook: form.hook || undefined,
          tweetCount: form.tweetCount,
          idea: form.idea,
          ctaType: form.ctaType,
          affiliateLink: form.affiliateLink || undefined,
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
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-rose-50">
      {/* Header */}
      <header className="border-b border-orange-100 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-rose-500 rounded-xl flex items-center justify-center text-white font-bold text-sm shrink-0">
            S
          </div>
          <div>
            <h1 className="font-bold text-gray-900 text-sm leading-none">Shopee Thread Generator</h1>
            <p className="text-xs text-gray-500 mt-0.5">Bikin konten afiliasi yang ga keliatan iklan</p>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-3 py-4 space-y-4">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-5">

          {/* Format */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
              Jenis Konten
            </label>
            <div className="grid grid-cols-2 gap-1.5">
              {FORMAT_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setForm((f) => ({ ...f, format: opt.value }))}
                  className={`text-left p-2.5 rounded-xl border-2 transition-all ${
                    form.format === opt.value
                      ? "border-orange-400 bg-orange-50"
                      : "border-gray-100 bg-gray-50 active:bg-gray-100"
                  }`}
                >
                  <div className="text-xs font-semibold text-gray-800">{opt.label}</div>
                  <div className="text-xs text-gray-500 mt-0.5 leading-tight">{opt.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Hook */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
              Tipe Hook <span className="text-gray-400 font-normal normal-case">(opsional)</span>
            </label>
            <div className="grid grid-cols-2 gap-1.5 mb-2">
              {HOOK_OPTIONS.map((h) => (
                <button
                  key={h.value}
                  onClick={() => setForm((f) => ({ ...f, hook: f.hook === h.value ? "" : h.value }))}
                  className={`text-left px-3 py-2 rounded-xl border-2 text-xs font-medium transition-all ${
                    form.hook === h.value
                      ? "border-orange-400 bg-orange-50 text-orange-700"
                      : "border-gray-100 bg-gray-50 text-gray-700 active:bg-gray-100"
                  }`}
                >
                  {h.label}
                </button>
              ))}
            </div>
            {selectedHook && (
              <div className="bg-orange-50 border border-orange-100 rounded-xl px-3 py-2">
                <p className="text-xs text-orange-700 leading-relaxed">
                  <span className="font-semibold">Contoh: </span>
                  &ldquo;{selectedHook.example}&rdquo;
                </p>
              </div>
            )}
          </div>

          {/* Tweet Count */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
              Jumlah Tweet
            </label>
            <div className="flex gap-2">
              {TWEET_COUNTS.map((n) => (
                <button
                  key={n}
                  onClick={() => setForm((f) => ({ ...f, tweetCount: n }))}
                  className={`flex-1 py-2 rounded-xl border-2 text-sm font-semibold transition-all ${
                    form.tweetCount === n
                      ? "border-orange-400 bg-orange-400 text-white"
                      : "border-gray-100 bg-gray-50 text-gray-600 active:bg-gray-100"
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          {/* Idea */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
              Ide / Cerita Awal
            </label>
            <textarea
              value={form.idea}
              onChange={(e) => setForm((f) => ({ ...f, idea: e.target.value }))}
              placeholder="Ceritain produknya, pengalaman lo, atau angle yang mau lo pakai. Makin detail makin bagus hasilnya."
              rows={4}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-transparent resize-none"
            />
            <div className={`text-xs mt-1 text-right ${form.idea.length < 20 ? "text-rose-400" : "text-gray-400"}`}>
              {form.idea.length} karakter {form.idea.length < 20 && "(min 20)"}
            </div>
          </div>

          {/* CTA */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
              Call to Action
            </label>
            <div className="flex gap-2 mb-2">
              {(["bio", "inline"] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => setForm((f) => ({ ...f, ctaType: type }))}
                  className={`flex-1 py-2 rounded-xl border-2 text-sm font-medium transition-all ${
                    form.ctaType === type
                      ? "border-orange-400 bg-orange-50 text-orange-700"
                      : "border-gray-100 bg-gray-50 text-gray-600 active:bg-gray-100"
                  }`}
                >
                  {type === "bio" ? "🔗 Link di Bio" : "📎 Inline Link"}
                </button>
              ))}
            </div>
            {form.ctaType === "inline" && (
              <input
                type="url"
                value={form.affiliateLink}
                onChange={(e) => setForm((f) => ({ ...f, affiliateLink: e.target.value }))}
                placeholder="https://shope.ee/your-affiliate-link"
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-transparent"
              />
            )}
          </div>

          {/* Error */}
          {error && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs px-3 py-2.5 rounded-xl">
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            onClick={handleGenerate}
            disabled={loading}
            className="w-full py-3.5 bg-gradient-to-r from-orange-400 to-rose-500 text-white font-semibold rounded-xl transition-all active:opacity-80 disabled:opacity-60 disabled:cursor-not-allowed text-sm"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                Lagi nulis thread...
              </span>
            ) : (
              "✨ Generate Thread"
            )}
          </button>
        </div>

        {/* Results */}
        {tweets.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-gray-800 text-sm">
                Thread siap! {tweets.length} tweet 🎉
              </h2>
              <button
                onClick={copyAll}
                className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all ${
                  copiedAll ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600 active:bg-gray-200"
                }`}
              >
                {copiedAll ? "✓ Copied all!" : "Copy semua"}
              </button>
            </div>

            {tweets.map((tweet, idx) => {
              const chars = charCount(tweet);
              const over = chars > 280;
              return (
                <div key={idx} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-sm text-gray-800 leading-relaxed flex-1 whitespace-pre-wrap">{tweet}</p>
                    <button
                      onClick={() => copyTweet(tweet, idx)}
                      className={`shrink-0 text-xs px-2.5 py-1.5 rounded-lg font-medium transition-all ${
                        copied === idx ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500 active:bg-gray-200"
                      }`}
                    >
                      {copied === idx ? "✓" : "Copy"}
                    </button>
                  </div>
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-50">
                    <span className="text-xs text-gray-400">Tweet {idx + 1}</span>
                    <span className={`text-xs font-medium ${over ? "text-rose-500" : chars > 260 ? "text-amber-500" : "text-gray-400"}`}>
                      {chars}/280 {over && "⚠️"}
                    </span>
                  </div>
                </div>
              );
            })}

            <button
              onClick={handleGenerate}
              className="w-full py-3 border-2 border-dashed border-gray-200 text-gray-500 text-sm font-medium rounded-xl active:bg-gray-50 transition-all"
            >
              🔄 Generate ulang
            </button>
          </div>
        )}
      </main>

      <footer className="text-center text-xs text-gray-400 py-6 mt-2">
        Made for Shopee affiliates 🧡 · Powered by Claude
      </footer>
    </div>
  );
}
