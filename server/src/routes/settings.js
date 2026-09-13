const express = require('express');
const router = express.Router();
const { getLLMConfig, setLLMConfig, checkOllamaHealth } = require('../utils/llmClient');

/**
 * GET /api/settings/llm
 * Returns current LLM provider, Ollama connectivity status, and available models
 */
router.get('/llm', async (req, res) => {
  try {
    const config = getLLMConfig();
    const health = await checkOllamaHealth();
    return res.json({
      success: true,
      data: {
        provider: config.provider,
        ollamaModel: config.ollamaModel,
        ollamaBaseUrl: config.ollamaBaseUrl,
        ollamaStatus: health
      }
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/settings/llm
 * Updates LLM provider ('cloud' | 'ollama') and selected Ollama model
 */
router.post('/llm', async (req, res) => {
  try {
    const { provider, ollamaModel, ollamaBaseUrl } = req.body;
    const updated = setLLMConfig({ provider, ollamaModel, ollamaBaseUrl });
    const health = await checkOllamaHealth();
    return res.json({
      success: true,
      data: {
        ...updated,
        ollamaStatus: health
      }
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
