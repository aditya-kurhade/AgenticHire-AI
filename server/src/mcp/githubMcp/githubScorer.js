/**
 * GitHub Multi-Factor Code Scorer
 * 
 * Computes an independent, empirical Practical Coding Score (0-100%)
 * based on 4 key dimensions:
 * 1. Language Stack Alignment (40%)
 * 2. Commit Cadence & Recency (25%)
 * 3. Project Substance & Quality (20%)
 * 4. Contribution & Community Footprint (15%)
 */
class GitHubScorer {
  /**
   * Calculates the candidate's Practical Coding Score from repo data
   * @param {Array} repos - List of GitHub repository objects
   * @param {Array} requiredSkills - Array of required skill names from job spec
   * @param {Array} preferredSkills - Array of preferred skill names from job spec
   * @returns {object} Detailed score breakdown
   */
  static calculateScore(repos = [], requiredSkills = [], preferredSkills = []) {
    if (!Array.isArray(repos) || repos.length === 0) {
      return {
        coding_score: 0,
        breakdown: {
          language_alignment: 0,
          commit_recency: 0,
          project_quality: 0,
          contribution_footprint: 0
        },
        matched_languages: [],
        top_languages: [],
        total_repos: 0,
        total_stars: 0,
        fork_ratio: 0
      };
    }

    // Filter out forks vs original repos
    const originalRepos = repos.filter(r => !r.fork);
    const nonForkRatio = repos.length > 0 ? (originalRepos.length / repos.length) : 0;

    // 1. Language frequency & aggregation
    const languageCounts = {};
    let totalStars = 0;
    let totalForks = 0;
    let openIssues = 0;
    let hasRecentActivity = 0;

    const now = new Date();
    const sixMonthsAgo = new Date(now.getTime() - (180 * 24 * 60 * 60 * 1000));
    const oneYearAgo = new Date(now.getTime() - (365 * 24 * 60 * 60 * 1000));

    repos.forEach(repo => {
      totalStars += (repo.stargazers_count || 0);
      totalForks += (repo.forks_count || 0);
      openIssues += (repo.open_issues_count || 0);

      if (repo.language) {
        const lang = repo.language.trim();
        languageCounts[lang] = (languageCounts[lang] || 0) + 1;
      }

      const updatedAt = repo.pushed_at ? new Date(repo.pushed_at) : (repo.updated_at ? new Date(repo.updated_at) : null);
      if (updatedAt) {
        if (updatedAt > sixMonthsAgo) {
          hasRecentActivity += 2; // high recency weight
        } else if (updatedAt > oneYearAgo) {
          hasRecentActivity += 1;
        }
      }
    });

    const candidateLangs = Object.keys(languageCounts);
    const candidateLangsLower = candidateLangs.map(l => l.toLowerCase());

    // 1. Language Stack Alignment (40% Weight)
    // Matches candidate repos' languages against required/preferred skills
    const allTargetSkills = [...requiredSkills, ...preferredSkills];
    let matchedSkills = [];
    if (allTargetSkills.length > 0) {
      matchedSkills = allTargetSkills.filter(skill => {
        const s = skill.toLowerCase();
        return candidateLangsLower.some(lang => lang.includes(s) || s.includes(lang));
      });
    }

    let languageAlignmentScore = 0;
    if (allTargetSkills.length === 0) {
      // If no skills specified, evaluate diversity of languages
      languageAlignmentScore = Math.min(100, candidateLangs.length * 20);
    } else {
      const matchRatio = matchedSkills.length / Math.max(1, requiredSkills.length || allTargetSkills.length);
      languageAlignmentScore = Math.min(100, Math.round(matchRatio * 100));
    }

    // 2. Commit Cadence & Recency (25% Weight)
    // Points for active pushes in recent 6-12 months
    const maxRecencyPoints = Math.min(repos.length * 2, 20);
    const recencyRatio = maxRecencyPoints > 0 ? Math.min(1, hasRecentActivity / maxRecencyPoints) : 0;
    const commitRecencyScore = Math.round(recencyRatio * 100);

    // 3. Project Substance & Quality (20% Weight)
    // Non-fork ratio, documentation/description presence, average repo size
    let qualityPoints = 0;
    repos.forEach(repo => {
      if (repo.description && repo.description.length > 15) qualityPoints += 2;
      if (repo.has_pages) qualityPoints += 3;
      if (repo.homepage) qualityPoints += 2;
      if (repo.license) qualityPoints += 1;
    });
    const qualityTarget = Math.max(10, repos.length * 4);
    const projectQualityScore = Math.min(100, Math.round(
      (nonForkRatio * 50) + (Math.min(1, qualityPoints / qualityTarget) * 50)
    ));

    // 4. Contribution & Community Footprint (15% Weight)
    // Stars, forks, public engagement
    const starPoints = Math.min(60, totalStars * 10);
    const forkPoints = Math.min(25, totalForks * 5);
    const issuePoints = Math.min(15, openIssues * 2);
    const contributionFootprintScore = Math.min(100, starPoints + forkPoints + issuePoints + (repos.length >= 5 ? 15 : repos.length * 3));

    // Final Weighted Score (0 - 100)
    const finalCodingScore = Math.min(100, Math.round(
      (languageAlignmentScore * 0.40) +
      (commitRecencyScore * 0.25) +
      (projectQualityScore * 0.20) +
      (contributionFootprintScore * 0.15)
    ));

    // Sorted top languages
    const topLanguages = Object.entries(languageCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([lang]) => lang)
      .slice(0, 5);

    return {
      coding_score: finalCodingScore,
      breakdown: {
        language_alignment: languageAlignmentScore,
        commit_recency: commitRecencyScore,
        project_quality: projectQualityScore,
        contribution_footprint: contributionFootprintScore
      },
      matched_languages: matchedSkills,
      top_languages: topLanguages,
      total_repos: repos.length,
      original_repos: originalRepos.length,
      total_stars: totalStars,
      total_forks: totalForks,
      fork_ratio: Math.round((1 - nonForkRatio) * 100)
    };
  }
}

module.exports = GitHubScorer;

