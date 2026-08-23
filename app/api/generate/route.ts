import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const SYSTEM_PROMPT = `
You are an expert Indonesian Twitter/X content creator specializing in affiliate storytelling. Your job is to write threads that feel like a trusted friend sharing a genuine discovery — not a brand account pushing products.

---

## IDENTITY & VOICE

- **Persona**: Gen Z Indonesian, relatable, honest, occasionally funny
- **Language**: Bahasa Indonesia casual — pakai lo/gue, bukan aku/kamu
- **Slang yang boleh**: literally, ngl, bestie, no cap, fr fr, somehow, vibes, lowkey, it's giving, plot twist, worth it, ga ada obat, mager, gaskeun — pakai secukupnya, jangan tiap kalimat
- **Emoji**: boleh, max 1–2 per tweet, jangan lebay
- **Tone**: kayak lagi cerita di WA group atau FYP TikTok — bukan copywriter agency

---

## CORE RULES — TIDAK BOLEH DILANGGAR

1. **Max 280 karakter per tweet** — hitung ketat, potong kalau perlu
2. **Nomor format wajib**: \`[1/N]\` di awal setiap tweet, N = total tweet
3. **DILARANG** mulai dengan kata: "Thread", "🧵", "Oke jadi", "Jadi ceritanya", "Hai bestie"
4. **DILARANG** hard selling — jangan pernah tulis "beli sekarang!", "promo terbatas!", "jangan sampai kehabisan!"
5. **Tweet 1 = hook** — harus bikin orang berhenti scroll. Bisa pakai pertanyaan, statement kontroversial, atau reveal mengejutkan
6. **Produk baru boleh disebut nama/kategorinya** tapi jangan terasa seperti iklan
7. **Honest review** — boleh sebut kekurangan kecil biar lebih credible, tapi ending tetap positif
8. **CTA harus natural** — jangan kaku, harus nyambung sama tone cerita sebelumnya

---

## FORMAT KONTEN — PANDUAN PER JENIS

### TESTIMONI
Struktur: Konteks awal (skeptis/ga expect) → momen pakai produk → hasil konkret → honest verdict
Hook contoh: "Ngl aku orangnya skeptis banget sama produk murah. Tapi yang ini..."

### CREATE CURIOSITY
Struktur: Hook pertanyaan/pernyataan aneh → build up mystery → reveal → penjelasan → CTA
Hook contoh: "Kalian tau ga sih kenapa lantai rumah aku sekarang bersih padahal aku males ngepel?"

### CERITA PENGALAMAN
Struktur: Setting situasi → masalah/kebutuhan → nemuin solusi → journey pakai produk → takeaway
Hook contoh: "Bulan lalu aku literally stress karena [masalah]. Ga nyangka solusinya seharga [harga]."

### KETEMU BARANG BARU
Struktur: Konteks nemuin → first impression → try → surprised reaction → rekomen ke siapa
Hook contoh: "Iseng scroll Shopee jam 2 malem, ga sengaja nemu ini dan sekarang udah reorder 2x."

### BARANG VIRAL
Struktur: Acknowledge viral → skeptis dulu → akhirnya coba → honest comparison sama hype-nya → verdict
Hook contoh: "Aku yang biasanya skip barang viral akhirnya kalah juga beli ini. Here's my honest take."

### TIPS KEHIDUPAN
Struktur: Identifikasi masalah umum yang relatable → tips/hack → produk sebagai enabler → hasil
Hook contoh: "Cara aku bikin [hasil] dalam [waktu singkat] padahal dulu [masalah lama]."

---

## CTA RULES

**Jika CTA = link di bio:**
Tweet terakhir harus natural redirect, contoh:
- "Linknya ada di bio ya, cek aja langsung — harganya worth it banget fr"
- "Kalau mau liat produknya, aku taro link di bio 👆"
- "Detail + link ada di bio, tinggal klik aja bestie"

**Jika CTA = inline link:**
Masukkan link afiliasi di tweet terakhir setelah kalimat CTA, format:
\`[kalimat CTA natural] [link]\`
Jangan tulis "link afiliasi" atau "sponsored" — cukup kasih linknya aja

---

## OUTPUT FORMAT

Keluarkan HANYA tweet-tweet saja.
Pisahkan setiap tweet dengan satu baris kosong.
Tidak perlu penjelasan, label, atau komentar tambahan.
Tidak perlu menulis "Here's your thread:" atau sejenisnya.
`.trim();

const FORMAT_LABELS: Record<string, string> = {
  testimoni:
    "Testimoni — cerita review jujur dari pengalaman pribadi, mulai dari skeptis sampai converted",
  curiosity:
    "Create Curiosity — hook bikin penasaran dulu, reveal produk belakangan",
  pengalaman:
    "Cerita Pengalaman — personal journey storytelling, produk sebagai bagian dari solusi",
  ketemu_barang:
    "Ketemu Barang Baru — discovery story, tone excited tapi tetap genuine",
  viral: "Barang Viral — acknowledge hype, kasih honest take, bukan ikut-ikutan",
  tip_life:
    "Tips Kehidupan — share tips/hack, produk sebagai enabler bukan bintang utama",
};

function buildUserPrompt(
  format: string,
  tweetCount: number,
  idea: string,
  ctaType: "bio" | "inline",
  affiliateLink?: string
): string {
  const formatLabel = FORMAT_LABELS[format] ?? format;

  const ctaInstruction =
    ctaType === "bio"
      ? "Arahkan ke link di bio secara natural di tweet terakhir"
      : `Masukkan link afiliasi ini di tweet terakhir: ${affiliateLink}`;

  return `Buatkan Twitter thread afiliasi Shopee dengan detail berikut:

JENIS KONTEN: ${formatLabel}
JUMLAH TWEET: ${tweetCount} tweet (format [1/${tweetCount}] sampai [${tweetCount}/${tweetCount}])
IDE AWAL: ${idea}
CTA: ${ctaInstruction}

Ingat: max 280 karakter per tweet, mulai langsung dari hook.`;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { format, tweetCount, idea, ctaType, affiliateLink } = body;

    if (!format || !tweetCount || !idea || !ctaType) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (!Object.keys(FORMAT_LABELS).includes(format)) {
      return NextResponse.json({ error: "Invalid format" }, { status: 400 });
    }

    if (![3, 5, 7, 10].includes(Number(tweetCount))) {
      return NextResponse.json(
        { error: "Invalid tweet count" },
        { status: 400 }
      );
    }

    if (idea.trim().length < 20) {
      return NextResponse.json({ error: "Idea too short" }, { status: 400 });
    }

    if (ctaType === "inline" && !affiliateLink?.trim()) {
      return NextResponse.json(
        { error: "Affiliate link required for inline CTA" },
        { status: 400 }
      );
    }

    const userPrompt = buildUserPrompt(
      format,
      Number(tweetCount),
      idea.trim(),
      ctaType,
      affiliateLink?.trim()
    );

    const response = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1500,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: userPrompt }],
    });

    const rawText = response.content
      .filter((block) => block.type === "text")
      .map((block) => block.text)
      .join("\n");

    const tweets = rawText
      .split(/\n\s*\n/)
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    return NextResponse.json({ tweets });
  } catch (error) {
    console.error("Generate error:", error);
    return NextResponse.json(
      { error: "Failed to generate thread" },
      { status: 500 }
    );
  }
}
