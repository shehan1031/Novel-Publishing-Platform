import API from "./api";

/* session memory cache — switching back is instant */
const SESSION_CACHE = new Map();

/* ════════════════════════════════════════════
   translateChapter
   Calls GET /api/translate/chapter/:id?lang=si
   onProgress(done, total, message) — optional
════════════════════════════════════════════ */
export const translateChapter = async (
  chapterId,
  targetLang,
  onProgress = () => {}
) => {
  if (targetLang === "en") {
    return { lang: "en", cached: false };
  }

  /* check session cache first */
  const cacheKey = `${chapterId}:${targetLang}`;
  if (SESSION_CACHE.has(cacheKey)) {
    onProgress(1, 1, "Loaded from cache");
    return { ...SESSION_CACHE.get(cacheKey), cached: true };
  }

  onProgress(0, 1, "Connecting to translation service…");

  try {
    const res = await API.get(
      `/translate/chapter/${chapterId}`,
      { params: { lang: targetLang } }
    );

    const result = {
      title:        res.data.title,
      content:      res.data.content,
      lang:         targetLang,
      cached:       res.data.cached,
      translatedAt: res.data.translatedAt,
    };

    SESSION_CACHE.set(cacheKey, result);
    onProgress(1, 1, res.data.cached ? "Loaded from cache" : "Translation complete");
    return result;

  } catch (err) {
    const msg =
      err.response?.data?.message ||
      err.message ||
      "Translation failed. Please try again.";
    throw new Error(msg);
  }
};

/* clear session cache when chapter changes */
export const clearTranslationCache = (chapterId) => {
  for (const key of SESSION_CACHE.keys()) {
    if (key.startsWith(`${chapterId}:`)) {
      SESSION_CACHE.delete(key);
    }
  }
};