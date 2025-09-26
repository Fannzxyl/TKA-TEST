
import { GoogleGenAI, Type } from "@google/genai";
import { Question, QuestionType } from "../types";

const lastCallTimestamps: number[] = [];
const RATE_LIMIT_COUNT = 10;
const RATE_LIMIT_MINUTES = 5;

function checkRateLimit(): boolean {
  const now = Date.now();
  // Filter out timestamps older than RATE_LIMIT_MINUTES
  while (lastCallTimestamps.length > 0 && now - lastCallTimestamps[0] > RATE_LIMIT_MINUTES * 60 * 1000) {
    lastCallTimestamps.shift();
  }
  if (lastCallTimestamps.length >= RATE_LIMIT_COUNT) {
    return false; // Rate limit exceeded
  }
  return true;
}

export async function generateQuestionFromGemini(
  apiKey: string,
  type: QuestionType,
  tema: string = 'umum'
): Promise<Question | null> {

  if (!checkRateLimit()) {
    console.warn("Gemini API rate limit exceeded.");
    throw new Error(`Batas pemanggilan API tercapai. Maksimal ${RATE_LIMIT_COUNT} soal per ${RATE_LIMIT_MINUTES} menit.`);
  }

  const ai = new GoogleGenAI({ apiKey });
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

  const systemPrompt = `Anda adalah asisten yang membuat soal latihan Bahasa Jepang level pemula (A1/N5) untuk tes TKA di Indonesia.
Fokus pada penggunaan hiragana dan katakana. Hindari kanji yang rumit di luar N5.
Selalu berikan output dalam format JSON yang valid sesuai skema.
Penjelasan harus singkat dan dalam Bahasa Indonesia.`;

  const userPrompt = `Buat 1 soal Bahasa Jepang level A1.
Jenis soal: "${type}"
Tema: "${tema}"
Buat soal yang berbeda dari sebelumnya.`;

  try {
    // FIX: Corrected the `contents` parameter to be a simple string as per SDK guidelines.
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: userPrompt,
        config: {
            systemInstruction: systemPrompt,
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    stem: { type: Type.STRING, description: "Pertanyaan utama atau kalimat rumpang." },
                    passage: { type: Type.STRING, description: "Teks bacaan singkat (opsional, untuk tipe tf)." },
                    tokens: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Potongan kata/frasa untuk soal menyusun kalimat." },
                    choices: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Pilihan jawaban (maksimal 5)." },
                    correct_keys: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Array berisi jawaban yang benar." },
                    explanation_id: { type: Type.STRING, description: "Penjelasan singkat dalam Bahasa Indonesia (1 kalimat)." },
                    kana_question: { type: Type.STRING, description: "Pertanyaan kana (khusus tipe kana)." },
                    romaji_answer: { type: Type.STRING, description: "Jawaban romaji (khusus tipe kana)." },
                }
            }
        },
        // AbortSignal is not directly supported in the config object, but this is how you'd use it with fetch
    });
    
    clearTimeout(timeoutId);
    lastCallTimestamps.push(Date.now());

    let jsonStr = response.text.trim();
    const generated = JSON.parse(jsonStr);

    const newQuestion: Question = {
      id: `gemini-${Date.now()}`,
      type: type,
      stem: generated.stem,
      passage: generated.passage,
      tokens: generated.tokens,
      choices: generated.choices,
      correctKeys: generated.correct_keys,
      explain: generated.explanation_id,
      kana_question: generated.kana_question,
      romaji_answer: generated.romaji_answer,
      tema: [tema],
    };
    return newQuestion;

  } catch (error) {
    clearTimeout(timeoutId);
    console.error("Error generating question from Gemini:", error);
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error("Gagal menghubungi Gemini (timeout). Menggunakan soal lokal.");
    }
    throw new Error("Gagal membuat soal dari Gemini. Pastikan API Key valid dan coba lagi.");
  }
}

export async function testApiKey(apiKey: string): Promise<boolean> {
  try {
    const ai = new GoogleGenAI({ apiKey });
    // FIX: Added `thinkingConfig` to avoid issues with `maxOutputTokens` as per SDK guidelines.
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: "test",
        config: { 
            maxOutputTokens: 5,
            thinkingConfig: { thinkingBudget: 0 }
        }
    });
    return !!response.text;
  } catch (error) {
    console.error("API Key test failed:", error);
    return false;
  }
}
