const { GoogleGenerativeAI } = require("@google/generative-ai");
const Chapter = require("../models/Chapter");

/* ── init Gemini inside function so dotenv is loaded first ── */
const getModel = () => {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  return genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
};

const LANG_NAMES  = { si: "Sinhala", ta: "Tamil" };
const CACHE_TTL_MS = 30 * 24 * 60 * 60 * 1000;

/* ── Exponential backoff retry ── */
const callGeminiWithRetry = async (prompt, retries = 3, delay = 3000) => {
  try {
    const model  = getModel();
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    const isQuotaError = error.status === 429 || error.message?.includes("quota");
    if (isQuotaError && retries > 0) {
      console.warn(`[Quota Hit] Retrying in ${delay / 1000}s… (${retries} left)`);
      await new Promise(res => setTimeout(res, delay));
      return callGeminiWithRetry(prompt, retries - 1, delay * 2);
    }
    throw error;
  }
};

/* ── split large content into chunks ── */
const chunkParagraphs = (text, maxChars = 3000) => {
  const paragraphs = text.split("\n");
  const chunks = [];
  let current  = "";

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
    ? `Translate this chapter title to ${langName}. Output ONLY the translated title, nothing else:\n\n${text}`
    : `Translate this novel content to ${langName}. Preserve line breaks. Output ONLY the translation:\n\n${text}`;

  const resultText = await callGeminiWithRetry(prompt);
  return resultText?.trim() || text;
};

/* ════════════════════════════════════════════════════
   GET /api/translate/chapter/:chapterId?lang=si|ta
════════════════════════════════════════════════════ */
exports.translateChapter = async (req, res) => {
  const { chapterId } = req.params;
  const { lang }      = req.query;

  if (!lang || !LANG_NAMES[lang]) {
    return res.status(400).json({ message: "Invalid language. Supported: si, ta" });
  }

  try {
    const chapter = await Chapter.findById(chapterId);
    if (!chapter) return res.status(404).json({ message: "Chapter not found" });

    /* ── check DB cache ── */
    const cached = chapter.translations?.[lang];
    if (cached?.content && cached?.translatedAt) {
      const age = Date.now() - new Date(cached.translatedAt).getTime();
      if (age < CACHE_TTL_MS) {
        console.log(`[Translation] Cache hit — ${chapterId} (${lang})`);
        return res.json({ ...cached, lang, cached: true });
      }
    }

    console.log(`[Translation] Translating chapter ${chapterId} to ${lang}…`);

    /* ── translate title ── */
    const translatedTitle = await translateText(chapter.title, lang, true);

    /* ── translate content in chunks ── */
    const chunks           = chunkParagraphs(chapter.content || "");
    const translatedChunks = [];

    for (const chunk of chunks) {
      if (translatedChunks.length > 0) {
        await new Promise(r => setTimeout(r, 5000));
      }
      const result = await translateText(chunk, lang, false);
      translatedChunks.push(result);
    }

    const translatedContent = translatedChunks.join("\n");
    const translatedAt      = new Date();

    /* ── save to DB cache using findByIdAndUpdate
         runValidators: false → skips required field checks
         this fixes "author is required" validation error ── */
    await Chapter.findByIdAndUpdate(
      chapterId,
      {
        $set: {
          [`translations.${lang}.title`]:        translatedTitle,
          [`translations.${lang}.content`]:      translatedContent,
          [`translations.${lang}.translatedAt`]: translatedAt,
        },
      },
      { runValidators: false }
    );

    console.log(`[Translation] ✓ Done — ${chapterId} (${lang})`);

    return res.json({
      title:       translatedTitle,
      content:     translatedContent,
      lang,
      cached:      false,
      translatedAt,
    });

  } catch (err) {
    console.error("Gemini Error:", err.message);

    if (err.status === 429) {
      return res.status(429).json({
        message: "Service busy. Please try again in a moment.",
      });
    }

    return res.status(500).json({
      message: "Translation failed.",
      error:   err.message,
    });
  }
};

/* ════════════════════════════════════════════════════
   DELETE /api/translate/chapter/:chapterId?lang=si|ta
════════════════════════════════════════════════════ */
exports.clearTranslationCache = async (req, res) => {
  const { chapterId } = req.params;
  const { lang }      = req.query;

  try {
    const chapter = await Chapter.findById(chapterId);
    if (!chapter) return res.status(404).json({ message: "Chapter not found" });

    if (lang && LANG_NAMES[lang]) {
      /* ── clear single language cache ── */
      await Chapter.findByIdAndUpdate(
        chapterId,
        { $unset: { [`translations.${lang}`]: "" } },
        { runValidators: false }
      );
      return res.json({ message: `Cache cleared for ${lang}` });
    }

    /* ── clear all translation cache ── */
    await Chapter.findByIdAndUpdate(
      chapterId,
      { $set: { translations: {} } },
      { runValidators: false }
    );
    return res.json({ message: "All translation cache cleared" });

  } catch (err) {
    console.error("clearTranslationCache error:", err.message);
    return res.status(500).json({ message: err.message });
  }
};