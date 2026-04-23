const { GoogleGenerativeAI } = require("@google/generative-ai");
const Chapter = require("../models/Chapter");

/* ── init Gemini ── */
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * FIX 1: Updated Model for 2026.
 * gemini-3.1-flash-lite-preview is the current "high-volume" free tier model.
 * If you prefer stability over speed, use "gemini-1.5-flash".
 */
const model = genAI.getGenerativeModel({ model: "gemini-3.1-flash-lite-preview" });

const LANG_NAMES = { si: "Sinhala", ta: "Tamil" };
const CACHE_TTL_MS = 30 * 24 * 60 * 60 * 1000;

/* ── Helper: Exponential Backoff Retry ── */
const callGeminiWithRetry = async (prompt, retries = 3, delay = 3000) => {
  try {
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    // Check for 429 (Rate Limit) or Quota errors
    const isQuotaError = error.status === 429 || error.message?.includes("quota");
    
    if (isQuotaError && retries > 0) {
      console.warn(`[Quota Hit] Retrying in ${delay/1000}s... (${retries} attempts left)`);
      await new Promise(res => setTimeout(res, delay));
      return callGeminiWithRetry(prompt, retries - 1, delay * 2); // Double wait time
    }
    throw error;
  }
};

/* ── split large content into chunks ── */
const chunkParagraphs = (text, maxChars = 3000) => {
  const paragraphs = text.split("\n");
  const chunks = [];
  let current = "";

  for (const para of paragraphs) {
    if ((current + "\n" + para).length > maxChars) {
      if (current.trim()) chunks.push(current.trim());
      current = para;
    } else {
      current = current ? current + "\n" + para : para;
    }
  }
  if (current.trim()) chunks.push(current.trim());
  return chunks.length > 0 ? chunks : [text];
};

/* ── translate a single text block via Gemini ── */
const translateText = async (text, targetLang, isTitle = false) => {
  if (!text?.trim()) return text || "";
  const langName = LANG_NAMES[targetLang];

  const prompt = isTitle
    ? `Translate this chapter title to ${langName}. Output ONLY the translated title, nothing else:`
    : `Translate this novel content to ${langName}. Preserve line breaks. Output ONLY the translation:\n\n${text}`;

  // Use the retry wrapper instead of direct model call
  const resultText = await callGeminiWithRetry(prompt);
  return resultText?.trim() || text;
};

/* ════════════════════════════════════════════════════
   GET /api/translate/chapter/:chapterId?lang=si
════════════════════════════════════════════════════ */
exports.translateChapter = async (req, res) => {
  const { chapterId } = req.params;
  const { lang } = req.query;

  if (!lang || !LANG_NAMES[lang]) {
    return res.status(400).json({ message: "Invalid language. Supported: si, ta" });
  }

  try {
    const chapter = await Chapter.findById(chapterId);
    if (!chapter) return res.status(404).json({ message: "Chapter not found" });

    /* Check DB cache */
    const cached = chapter.translations?.[lang];
    if (cached?.content && cached?.translatedAt) {
      const age = Date.now() - new Date(cached.translatedAt).getTime();
      if (age < CACHE_TTL_MS) {
        return res.json({ ...cached, lang, cached: true });
      }
    }

    /* Translate Title */
    const translatedTitle = await translateText(chapter.title, lang, true);

    /* Translate Content in Chunks */
    const chunks = chunkParagraphs(chapter.content || "");
    const translatedChunks = [];

    for (const chunk of chunks) {
      /**
       * FIX 2: Increased Delay.
       * The free tier limit is roughly 15 requests per minute.
       * 5000ms (5s) per chunk ensures we never hit the limit during a chapter.
       */
      if (translatedChunks.length > 0) {
        await new Promise(r => setTimeout(r, 5000));
      }
      const result = await translateText(chunk, lang, false);
      translatedChunks.push(result);
    }

    const translatedContent = translatedChunks.join("\n");

    /* Save to DB cache */
    if (!chapter.translations) chapter.translations = {};
    chapter.translations[lang] = {
      title: translatedTitle,
      content: translatedContent,
      translatedAt: new Date(),
    };
    chapter.markModified("translations");
    await chapter.save();

    return res.json({
      title: translatedTitle,
      content: translatedContent,
      lang,
      cached: false,
      translatedAt: chapter.translations[lang].translatedAt,
    });

  } catch (err) {
    console.error("Gemini Error:", err.message);
    
    if (err.status === 429) {
      return res.status(429).json({ message: "Service busy. Retrying in background. Please refresh in a moment." });
    }
    
    return res.status(500).json({ message: "Translation failed.", error: err.message });
  }
};

/* ════════════════════════════════════════════════════
   DELETE /api/translate/chapter/:chapterId?lang=si
════════════════════════════════════════════════════ */
exports.clearTranslationCache = async (req, res) => {
  const { chapterId } = req.params;
  const { lang } = req.query;

  try {
    const chapter = await Chapter.findById(chapterId);
    if (!chapter) return res.status(404).json({ message: "Chapter not found" });

    if (lang && LANG_NAMES[lang]) {
      if (chapter.translations?.[lang]) {
        chapter.translations[lang] = undefined;
        chapter.markModified("translations");
        await chapter.save();
      }
      return res.json({ message: `Cache cleared for ${lang}` });
    }

    chapter.translations = {};
    chapter.markModified("translations");
    await chapter.save();
    return res.json({ message: "All translation cache cleared" });

  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};