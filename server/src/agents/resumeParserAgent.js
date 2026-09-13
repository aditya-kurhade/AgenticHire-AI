const { PDFParse } = require('pdf-parse');
const { callLLM } = require('../utils/llmClient');
const specLoader = require('../utils/specLoader');

/**
 * Resume Parser Agent
 * Parses candidate resume PDF files and extracts metadata.
 */
class ResumeParserAgent {
  /**
   * Run the parsing agent.
   * @param {Buffer} pdfBuffer - The raw binary buffer of the uploaded PDF file.
   * @returns {Promise<object>} Parsed candidate resume details.
   */
  static async parse(pdfBuffer) {
    if (!pdfBuffer || pdfBuffer.length === 0) {
      throw new Error('Invalid resume: Buffer is empty.');
    }

    // 1. Extract text from PDF using real PDF text extraction (pdf-parse)
    let rawText = '';
    try {
      console.log(`📑 [ResumeParserAgent] Extracting text buffer (${pdfBuffer.length} bytes)...`);
      const p = new PDFParse(new Uint8Array(pdfBuffer));
      const parsedPdf = await p.getText();
      rawText = parsedPdf.text || '';
      console.log(`📄 [ResumeParserAgent] Successfully extracted ${rawText.length} characters of raw text from resume.`);
    } catch (error) {
      console.error('Error during PDF extraction:', error);
      throw new Error(`Failed to extract text from PDF: ${error.message}`);
    }

    if (!rawText.trim()) {
      throw new Error('PDF extraction returned empty text.');
    }

    // Load prompt rules from spec to ensure deterministic settings
    const promptRules = specLoader.loadPromptRules();

    // 2. Call LLM to structure the raw text into clean JSON format
    const systemPrompt = `${promptRules.system_instruction || "You are a professional recruitment assistant."}
Extract candidate details from the provided resume text. Respond ONLY with a valid JSON object matching the following structure:
{
  "name": "Full Name",
  "email": "email@address.com",
  "phone": "+1-123-456-7890",
  "skills": ["Skill1", "Skill2", ...],
  "experience": 3,  // Total years of relevant experience as a number
  "education": "Degree details",
  "projects": [
    { "title": "Project Name", "description": "Project summary" }
  ]
}`;

    const userPrompt = `Resume text to extract:\n\n${rawText}`;

    try {
      console.log(`🤖 [ResumeParserAgent] Prompting LLM to extract structured entities (Skills, Experience, Education)...`);
      const llmResponse = await callLLM(systemPrompt, userPrompt, true);
      const jsonStart = llmResponse.indexOf('{');
      const jsonEnd = llmResponse.lastIndexOf('}') + 1;
      const cleanJson = llmResponse.slice(jsonStart, jsonEnd);

      const parsedData = JSON.parse(cleanJson);
      console.log(`✅ [ResumeParserAgent] Successfully structured candidate: ${parsedData.name} with ${parsedData.skills?.length || 0} skills.`);

      return {
        success: true,
        data: parsedData,
        rawText: rawText
      };
    } catch (error) {
      console.error('Error structuring text with LLM:', error);
      // Fallback parsing logic
      throw new Error(`Failed to structure resume data: ${error.message}`);
    }
  }
}

module.exports = ResumeParserAgent;
