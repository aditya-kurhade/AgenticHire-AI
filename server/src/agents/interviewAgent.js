const { callLLM } = require('../utils/llmClient');
const specLoader = require('../utils/specLoader');

/**
 * Interview Agent
 * Generates custom interview questions, coding tasks, and rubrics.
 */
class InterviewAgent {
  /**
   * Generates a tailored technical assessment.
   * @param {object} parsedResume - Clean candidate resume details.
   * @param {object} matchingResults - Results from MatchingAgent evaluation.
   * @param {string} jobTitle - Job title.
   * @returns {Promise<object>} Generated assessment content.
   */
  static async generateAssessment(parsedResume, matchingResults, jobTitle) {
    if (!parsedResume || !matchingResults) {
      throw new Error('Missing candidate or matching evaluation data.');
    }

    const missingSkills = matchingResults.missing_skills || [];
    const candidateSkills = parsedResume.skills || [];
    const promptRules = specLoader.loadPromptRules();

    const systemPrompt = `${promptRules.system_instruction || "You are a professional recruitment assistant."}
Generate custom interview questions, one coding task, and an evaluation rubric based on the candidate's skills, job title, and missing skills.
Respond in markdown format. Keep the questions focused on testing key technologies.`;

    const userPrompt = `Job Role: ${jobTitle}
Candidate Name: ${parsedResume.name}
Candidate Skills: ${JSON.stringify(candidateSkills)}
Missing/Lacking Skills identified: ${JSON.stringify(missingSkills)}

Generate tailored interview assessment.`;

    console.log(`📝 [InterviewAgent] Building custom assessment prompt for candidate "${parsedResume.name}" applying for "${jobTitle}"...`);
    console.log(`🎯 [InterviewAgent] Focusing questions on Candidate Skills [${candidateSkills.slice(0, 4).join(', ')}] & Identified Gaps [${missingSkills.join(', ') || 'None'}]...`);

    try {
      console.log(`🤖 [InterviewAgent] Requesting LLM to synthesize technical questions, coding task & evaluation rubric...`);
      const content = await callLLM(systemPrompt, userPrompt, false);
      console.log(`✅ [InterviewAgent] Successfully generated ${content.length} characters of assessment & interview rubric.`);
      return {
        success: true,
        data: {
          assessment: content
        }
      };
    } catch (error) {
      console.error('InterviewAgent generation error:', error.message);
      // Fallback rubric
      const fallbackAssessment = `### Technical Questions for ${jobTitle}
1. **Core Skills check**: Explain how you implemented projects using ${candidateSkills.slice(0, 3).join(', ')}.
2. **Growth Area Check**: Since the role uses ${missingSkills.join(', ') || 'additional tools'}, how would you approach learning or implementing them?

### Coding Challenge
Write a small application demonstrating standard error handling and responsive rendering.`;
      return {
        success: true,
        data: {
          assessment: fallbackAssessment
        }
      };
    }
  }
}

module.exports = InterviewAgent;
