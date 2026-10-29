const { getLLMConfig, setLLMConfig, checkOllamaHealth } = require('../utils/llmClient');

/**
 * @desc    Get current LLM configuration and Ollama status
 * @route   GET /api/settings/llm
 * @access  Public / Config
 */
const getLLMSettings = async (req, res) => {
  try {
    const config = getLLMConfig();
    const health = await checkOllamaHealth();
    return res.status(200).json({
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
};

/**
 * @desc    Update LLM provider and local model settings
 * @route   POST /api/settings/llm
 * @access  Public / Config
 */
const updateLLMSettings = async (req, res) => {
  try {
    const { provider, ollamaModel, ollamaBaseUrl } = req.body;
    const updated = setLLMConfig({ provider, ollamaModel, ollamaBaseUrl });
    const health = await checkOllamaHealth();
    return res.status(200).json({
      success: true,
      data: {
        ...updated,
        ollamaStatus: health
      }
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

module.exports = {
  getLLMSettings,
  updateLLMSettings
};
