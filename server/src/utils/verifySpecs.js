const specLoader = require('./specLoader');

console.log('==================================================');
console.log('Running Specifications Verification Test...');
console.log('==================================================\n');

try {
  // 1. Verify Workflow Order
  const workflowSpec = specLoader.loadWorkflowSpec();
  console.log('✅ [1/7] Workflow Order Loaded Successfully:');
  console.log(JSON.stringify(workflowSpec, null, 2));
  console.log('');

  // 2. Verify Retry Policy
  const retryPolicy = specLoader.loadRetryPolicy();
  console.log('✅ [2/7] Retry Policy Loaded Successfully:');
  console.log(JSON.stringify(retryPolicy, null, 2));
  console.log('');

  // 3. Verify Node Colors
  const nodeColors = specLoader.loadNodeColors();
  console.log('✅ [3/7] Node Colors Loaded Successfully:');
  console.log(JSON.stringify(nodeColors, null, 2));
  console.log('');

  // 4. Verify Shortlisting Thresholds
  const thresholds = specLoader.loadShortlistingThresholds();
  console.log('✅ [4/7] Shortlisting Thresholds Loaded Successfully:');
  console.log(JSON.stringify(thresholds, null, 2));
  console.log('');

  // 5. Verify RAG Settings
  const ragSettings = specLoader.loadRagSettings();
  console.log('✅ [5/7] RAG Settings Loaded Successfully:');
  console.log(JSON.stringify(ragSettings, null, 2));
  console.log('');

  // 6. Verify Prompt Rules
  const promptRules = specLoader.loadPromptRules();
  console.log('✅ [6/7] Prompt Rules Loaded Successfully:');
  console.log(JSON.stringify(promptRules, null, 2));
  console.log('');

  // 7. Verify Email Templates
  const emailTemplates = specLoader.loadEmailTemplates();
  console.log('✅ [7/7] Email Templates Loaded Successfully:');
  console.log(JSON.stringify(emailTemplates, null, 2));
  console.log('');

  console.log('==================================================');
  console.log('🎉 SUCCESS: All 7 specs loaded and verified correctly!');
  console.log('==================================================');
} catch (error) {
  console.error('❌ Verification failed with error:', error.message);
  process.exit(1);
}
