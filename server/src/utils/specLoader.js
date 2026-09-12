const fs = require('fs');
const path = require('path');

/**
 * Resolves the path to a spec file and reads/parses it.
 * @param {string} category - The subfolder in specs (e.g. 'system', 'workflow', 'evaluation', 'prompts', 'email', 'hiring')
 * @param {string} name - The name of the file without extension (e.g. 'retry-policy')
 * @returns {object} The parsed JSON object.
 */
function loadSpec(category, name) {
  try {
    // specs is located at the project root.
    // server/src/utils is located at server/src/utils.
    // Therefore, absolute path is root/specs/category/name.json
    const filePath = path.resolve(__dirname, '..', '..', '..', 'specs', category, `${name}.json`);
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error loading spec at category: ${category}, name: ${name}`, error);
    throw new Error(`Failed to load spec: ${category}/${name}.json. Details: ${error.message}`);
  }
}

/**
 * Loads the default hiring workflow specification.
 */
function loadWorkflowSpec(name = 'default-hiring-workflow') {
  return loadSpec('workflow', name);
}

/**
 * Loads the system retry policy.
 */
function loadRetryPolicy() {
  return loadSpec('system', 'retry-policy');
}

/**
 * Loads the workflow node visualization colors.
 */
function loadNodeColors() {
  return loadSpec('system', 'node-colors');
}

/**
 * Loads the shortlisting candidate thresholds.
 */
function loadShortlistingThresholds() {
  return loadSpec('evaluation', 'shortlisting-thresholds');
}

/**
 * Loads the system RAG configuration.
 */
function loadRagSettings() {
  return loadSpec('system', 'rag-settings');
}

/**
 * Loads the LLM prompt rules.
 */
function loadPromptRules() {
  return loadSpec('prompts', 'rules');
}

/**
 * Loads the email templates.
 */
function loadEmailTemplates() {
  return loadSpec('email', 'templates');
}

module.exports = {
  loadSpec,
  loadWorkflowSpec,
  loadRetryPolicy,
  loadNodeColors,
  loadShortlistingThresholds,
  loadRagSettings,
  loadPromptRules,
  loadEmailTemplates
};
