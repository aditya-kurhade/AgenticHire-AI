/**
 * GitHub MCP Connector
 * 
 * Implements the Model Context Protocol (MCP) tool standard to query
 * candidates' GitHub profiles. Integrates with the official @modelcontextprotocol/sdk
 * client transport with automatic, resilient fallback to direct GitHub REST API.
 */

const GitHubScorer = require('./githubScorer');

class GitHubMCPConnector {
  constructor() {
    this.client = null;
    this.isConnected = false;
    this.sdkAvailable = false;

    // Check if MCP SDK is present
    try {
      this.mcpSdk = require("@modelcontextprotocol/sdk/client/index.js");
      this.mcpTransport = require("@modelcontextprotocol/sdk/client/stdio.js");
      this.sdkAvailable = true;
    } catch {
      this.sdkAvailable = false;
    }
  }

  /**
   * Initializes MCP Stdio transport connection if available
   */
  async connect() {
    if (this.isConnected) return;
    if (!this.sdkAvailable) {
      console.log("ℹ️ [MCP] @modelcontextprotocol/sdk not loaded; using direct REST MCP client mode.");
      return;
    }

    try {
      const { StdioClientTransport } = this.mcpTransport;
      const { Client } = this.mcpSdk;

      const transport = new StdioClientTransport({
        command: "npx",
        args: ["-y", "@modelcontextprotocol/server-github"],
        env: {
          GITHUB_PERSONAL_ACCESS_TOKEN: process.env.GITHUB_TOKEN || process.env.GITHUB_PAT || ""
        }
      });

      this.client = new Client(
        { name: "agentic-hire-github-client", version: "1.0.0" },
        { capabilities: {} }
      );

      await this.client.connect(transport);
      this.isConnected = true;
      console.log("✅ [MCP] Successfully connected to GitHub MCP Server over stdio.");
    } catch (err) {
      console.warn("⚠️ [MCP] Stdio GitHub MCP server initialization skipped, running HTTP MCP fallback:", err.message);
      this.isConnected = false;
    }
  }

  /**
   * Extract username from URL or handle string (e.g., https://github.com/torvalds -> torvalds)
   */
  static cleanUsername(input) {
    if (!input || typeof input !== 'string') return null;
    let trimmed = input.trim();
    // Remove trailing slashes
    trimmed = trimmed.replace(/\/+$/, '');
    // If it's a full URL
    const urlMatch = trimmed.match(/github\.com\/([a-zA-Z0-9_\-]+)/i);
    if (urlMatch && urlMatch[1]) {
      return urlMatch[1];
    }
    // If it's @handle
    if (trimmed.startsWith('@')) {
      return trimmed.slice(1);
    }
    // If it contains only valid github handle characters
    if (/^[a-zA-Z0-9_\-]+$/.test(trimmed)) {
      return trimmed;
    }
    return null;
  }

  /**
   * Fetches candidate repositories via MCP tool or REST API
   * @param {string} username - GitHub username
   */
  async fetchRepositories(username) {
    const cleanUser = GitHubMCPConnector.cleanUsername(username);
    if (!cleanUser) return [];

    // Try MCP tool call if connected
    if (this.isConnected && this.client) {
      try {
        const response = await this.client.callTool({
          name: "search_repositories",
          arguments: { query: `user:${cleanUser}` }
        });
        if (response && response.content) {
          return response.content;
        }
      } catch (err) {
        console.warn(`[MCP] Tool call search_repositories failed for ${cleanUser}, falling back to REST:`, err.message);
      }
    }

    // Direct REST API (with or without GITHUB_TOKEN)
    try {
      const headers = {
        "User-Agent": "AgenticHire-AI-MCP-Scorer"
      };
      const token = process.env.GITHUB_TOKEN || process.env.GITHUB_PAT;
      if (token) {
        headers["Authorization"] = `token ${token}`;
      }

      const res = await fetch(`https://api.github.com/users/${encodeURIComponent(cleanUser)}/repos?per_page=50&sort=pushed`, {
        headers
      });

      if (!res.ok) {
        console.warn(`[MCP GitHub] Fetch repos for "${cleanUser}" returned HTTP ${res.status}`);
        return [];
      }

      return await res.json();
    } catch (err) {
      console.error(`[MCP GitHub] Error fetching repos for "${cleanUser}":`, err.message);
      return [];
    }
  }

  /**
   * Evaluates candidate repositories against job requirements
   * Computes the dual Practical Coding Score (0 - 100%)
   * 
   * @param {string} usernameOrUrl - GitHub username or URL
   * @param {Array} requiredSkills - Skills required by the job spec
   * @param {Array} preferredSkills - Preferred skills from the job spec
   * @returns {Promise<object>}
   */
  async analyzeDeveloperProfile(usernameOrUrl, requiredSkills = [], preferredSkills = []) {
    const username = GitHubMCPConnector.cleanUsername(usernameOrUrl);
    if (!username) {
      return {
        has_github: false,
        coding_score: null,
        reason: "No valid GitHub handle or URL provided in application"
      };
    }

    console.log(`🐙 [MCP GitHub] Analyzing developer profile: '${username}' against required skills [${requiredSkills.join(', ')}]...`);

    const repos = await this.fetchRepositories(username);

    if (!Array.isArray(repos) || repos.length === 0) {
      return {
        has_github: true,
        username,
        coding_score: 15, // minimum baseline for having an empty/unreachable profile
        total_repos: 0,
        total_stars: 0,
        matched_skills: [],
        top_languages: [],
        breakdown: {
          language_alignment: 0,
          commit_recency: 0,
          project_quality: 0,
          contribution_footprint: 0
        },
        verified_at: new Date(),
        note: "Candidate has a GitHub profile but 0 public repositories were accessible."
      };
    }

    // Compute multi-factor coding score
    const scoreResult = GitHubScorer.calculateScore(repos, requiredSkills, preferredSkills);

    console.log(`💻 [MCP GitHub] Practical Coding Score computed for @${username}: ${scoreResult.coding_score}%`);

    return {
      has_github: true,
      username,
      coding_score: scoreResult.coding_score,
      breakdown: scoreResult.breakdown,
      matched_skills: scoreResult.matched_languages,
      top_languages: scoreResult.top_languages,
      total_repos: scoreResult.total_repos,
      original_repos: scoreResult.original_repos,
      total_stars: scoreResult.total_stars,
      total_forks: scoreResult.total_forks,
      fork_ratio: scoreResult.fork_ratio,
      verified_at: new Date()
    };
  }
}

module.exports = new GitHubMCPConnector();

