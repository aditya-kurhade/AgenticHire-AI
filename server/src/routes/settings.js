const express = require('express');
const router = express.Router();
const {
  getLLMSettings,
  updateLLMSettings
} = require('../controllers/settingsController');

/**
 * GET /api/settings/llm
 * Returns current LLM provider, Ollama connectivity status, and available models
 */
router.get('/llm', getLLMSettings);

/**
 * POST /api/settings/llm
 * Updates LLM provider ('cloud' | 'ollama') and selected Ollama model
 */
router.post('/llm', updateLLMSettings);

module.exports = router;
