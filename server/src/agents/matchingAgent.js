const { callLLM } = require('../utils/llmClient');
const EmbeddingAgent = require('./embeddingAgent');
const specLoader = require('../utils/specLoader');

/**
 * Matching Agent
 * Evaluates candidates against job specifications, leveraging RAG context.
 */
class MatchingAgent {
  /**
   * Evaluates candidate skills & experience against job specifications.
   * @param {object} parsedResume - Parsed resume details from ResumeParserAgent.
   * @param {object} jobSpec - The Job Mongoose document or specification object.
   * @returns {Promise<object>} Match evaluation results.
   */
  static async evaluate(parsedResume, jobSpec) {
    if (!parsedResume || !jobSpec) {
      throw new Error('Missing parsed resume data or job specification for matching.');
    }

    // 1. Fetch RAG settings from spec loader
    const ragSettings = specLoader.loadRagSettings();
    const topK = ragSettings.search?.top_k || 5;
    const minSimilarity = ragSettings.search?.min_similarity || 0.75;

    // 2. Perform RAG context retrieval from policies collection
    // (e.g. searching for specific hiring policy terms related to the job title)
    const searchQuery = `${jobSpec.title} hiring guidelines requirements`;
    const retrievedDocs = await EmbeddingAgent.searchSimilarity('policies', searchQuery, topK, minSimilarity);
    const ragContext = retrievedDocs.map(doc => doc.payload?.text || '').join('\n');

    // 3. Match against the job's saved required and preferred skills
    const requiredSkills = jobSpec.required_skills || [];
    const preferredSkills = jobSpec.preferred_skills || [];
    const candidateSkills = parsedResume.skills || [];
    const thresholds = specLoader.loadShortlistingThresholds();
    const shortlistMin = thresholds.shortlist;
    const holdMin = thresholds.hold;

    if (typeof shortlistMin !== 'number' || typeof holdMin !== 'number') {
      throw new Error('Invalid shortlisting threshold spec: shortlist and hold must be numbers.');
    }

    // Local basic scoring for accuracy/fallback calculation
    const matchedRequired = requiredSkills.filter(skill =>
      candidateSkills.some(cSkill => cSkill.toLowerCase().includes(skill.toLowerCase()))
    );
    const matchedPreferred = preferredSkills.filter(skill =>
      candidateSkills.some(cSkill => cSkill.toLowerCase().includes(skill.toLowerCase()))
    );

    const missingRequired = requiredSkills.filter(skill => !matchedRequired.includes(skill));
    const missingPreferred = preferredSkills.filter(skill => !matchedPreferred.includes(skill));

    // Load prompt rules
    const promptRules = specLoader.loadPromptRules();

    // 4. Construct prompt for LLM evaluation
    const systemPrompt = `${promptRules.system_instruction || "You are a professional recruitment assistant."}
Evaluate how well the candidate fits the job specification based on the parsed resume, required/preferred skills, and organizational guidelines.
Respond ONLY with a valid JSON object matching the following structure:
{
  "match_score": 85, // Compatibility score (0-100)
  "missing_skills": ["SkillA", "SkillB"], // Key required or preferred skills candidate lacks
  "recommendation": "Shortlist" // "Shortlist", "Hold", or "Reject"
}`;

    const userPrompt = `Job Title: ${jobSpec.title}
Required Skills: ${JSON.stringify(requiredSkills)}
Preferred Skills: ${JSON.stringify(preferredSkills)}
Candidate Skills: ${JSON.stringify(candidateSkills)}
Candidate Experience: ${parsedResume.experience} years
Candidate Education: ${parsedResume.education}
RAG Organizational Context:
${ragContext || "No additional guidelines found in vector database."}

Evaluate the compatibility score and identify missing skills.`;

    try {
      const llmResponse = await callLLM(systemPrompt, userPrompt, true);
      const jsonStart = llmResponse.indexOf('{');
      const jsonEnd = llmResponse.lastIndexOf('}') + 1;
      const cleanJson = llmResponse.slice(jsonStart, jsonEnd);
      const evaluationResult = JSON.parse(cleanJson);

      // Verify and blend local deterministic matching with LLM result
      const score = evaluationResult.match_score || 0;
      return {
        success: true,
        data: {
          match_score: score,
          missing_skills: evaluationResult.missing_skills || missingRequired,
          matched_required_skills: matchedRequired,
          matched_preferred_skills: matchedPreferred,
          recommendation: evaluationResult.recommendation || (score >= shortlistMin ? 'Shortlist' : score >= holdMin ? 'Hold' : 'Reject')
        }
      };
    } catch (error) {
      console.error('MatchingAgent LLM evaluation error:', error.message);
      // Fallback matching logic
      const totalSkillsCount = requiredSkills.length + preferredSkills.length;
      const matchedCount = matchedRequired.length + matchedPreferred.length;
      const localScore = totalSkillsCount > 0 ? Math.round((matchedCount / totalSkillsCount) * 100) : 50;

      return {
        success: true,
        data: {
          match_score: localScore,
          missing_skills: missingRequired.concat(missingPreferred),
          matched_required_skills: matchedRequired,
          matched_preferred_skills: matchedPreferred,
          recommendation: localScore >= shortlistMin ? 'Shortlist' : localScore >= holdMin ? 'Hold' : 'Reject'
        }
      };
    }
  }
}

module.exports = MatchingAgent;
