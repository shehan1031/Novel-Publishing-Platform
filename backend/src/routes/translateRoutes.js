const express = require("express");
const router  = express.Router();
const {
  translateChapter,
  clearTranslationCache,
} = require("../controllers/translationController");

/*
  GET    /api/translate/chapter/:chapterId?lang=si
  GET    /api/translate/chapter/:chapterId?lang=ta
  DELETE /api/translate/chapter/:chapterId?lang=si
  DELETE /api/translate/chapter/:chapterId
*/
router.get   ("/chapter/:chapterId", translateChapter);
router.delete("/chapter/:chapterId", clearTranslationCache);

module.exports = router;