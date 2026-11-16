/**
 * LLM Client Helper
 * Pure, strict routing:
 * - 'cloud' => OpenRouter API exclusively
 * - 'ollama' => Local Ollama API exclusively
 * 
 * Absolutely zero fallbacks, zero synthetic mock data, zero cross-switching.
 */

// In-memory LLM state configuration (can be changed dynamically from settings API)
let currentConfig = {
  provider: process.env.DEFAULT_LLM_PROVIDER || 'cloud', // 'cloud' | 'ollama'
  ollamaBaseUrl: process.env.OLLAMA_BASE_URL || 'http://localhost:11434',
  ollamaModel: process.env.OLLAMA_MODEL || 'llama3.2:3b'
};

function getLLMConfig() {
  return { ...currentConfig };
}

function setLLMConfig(newConfig) {
  if (newConfig.provider) {
    currentConfig.provider = newConfig.provider === 'ollama' ? 'ollama' : 'cloud';
  }
  if (newConfig.ollamaModel) {
    currentConfig.ollamaModel = newConfig.ollamaModel;
  }
  if (newConfig.ollamaBaseUrl) {
    currentConfig.ollamaBaseUrl = newConfig.ollamaBaseUrl;
  }
  return { ...currentConfig };
}

async function checkOllamaHealth() {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);
    const res = await fetch(`${currentConfig.ollamaBaseUrl}/api/tags`, { signal: controller.signal });
    clearTimeout(timeoutId);
    if (res.ok) {
      const data = await res.json();
      return {
        online: true,
        models: (data.models || []).map(m => m.name)
      };
    }
    return { online: false, models: [] };
  } catch (err) {
    return { online: false, error: err.message, models: [] };
  }
}

async function callOllama(systemPrompt, userPrompt, jsonMode = false) {
  const startTime = Date.now();
  const model = currentConfig.ollamaModel || 'llama3.2:3b';
  console.log(`🤖 [Local Ollama Request] Dispatching prompt to Ollama (${model})...`);

  // Direct call to Ollama native /api/chat endpoint
  const response = await fetch(`${currentConfig.ollamaBaseUrl}/api/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      stream: false,
      format: jsonMode ? 'json' : undefined,
      options: {
        temperature: 0.1
      }
    })
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Ollama returned HTTP ${response.status}: ${errText}`);
  }

  const data = await response.json();
  const duration = Date.now() - startTime;
  const output = data.message?.content;

  if (!output) {
    throw new Error('Ollama returned an empty response content.');
  }

  console.log(`✨ [Ollama Response] Received in ${duration}ms from Local Ollama (${model})`);
  return output;
}

async function callOpenRouter(systemPrompt, userPrompt) {
  const openrouterKey = process.env.OPENROUTER_API_KEY;
  if (!openrouterKey || openrouterKey.trim() === '' || openrouterKey.includes('your_')) {
    throw new Error('OPENROUTER_API_KEY is not configured in server/.env');
  }

  const model = 'meta-llama/llama-3.3-70b-instruct';
  const startTime = Date.now();
  console.log(`🤖 [OpenRouter Cloud] Dispatching prompt to (${model})...`);

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openrouterKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://agentichire.ai',
      'X-Title': 'AgenticHire'
    },
    body: JSON.stringify({
      model: model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.1
    })
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`OpenRouter returned HTTP ${response.status}: ${errText}`);
  }

  const data = await response.json();
  const duration = Date.now() - startTime;
  const output = data.choices?.[0]?.message?.content;

  if (!output) {
    throw new Error('OpenRouter returned an empty choices payload.');
  }

  console.log(`✨ [OpenRouter Response] Received in ${duration}ms from (${model})`);
  return output;
}

/**
 * Universal LLM invocation entry point
 * Strictly dispatches to the active provider selected by the user
 */
async function callLLM(systemPrompt, userPrompt, jsonMode = false) {
  if (currentConfig.provider === 'ollama') {
    return await callOllama(systemPrompt, userPrompt, jsonMode);
  }

  if (currentConfig.provider === 'cloud') {
    return await callOpenRouter(systemPrompt, userPrompt);
  }

  throw new Error(`Unknown LLM provider configured: "${currentConfig.provider}". Expected 'ollama' or 'cloud'.`);
}

module.exports = {
  callLLM,
  callOllama,
  callOpenRouter,
  getLLMConfig,
  setLLMConfig,
  checkOllamaHealth
};
