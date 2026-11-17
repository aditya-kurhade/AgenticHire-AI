/**
 * LeetCode Multi-Factor DSA Scorer
 * 
 * Computes an independent, empirical Data Structures & Algorithms Score (0-100%)
 * based on 4 key dimensions:
 * 1. Problem Solving Volume & Difficulty Weight (40%)
 * 2. Contest Rating & Global Competitiveness (25%)
 * 3. Submission Accuracy & Acceptance Rate (20%)
 * 4. Practice Consistency & Badges (15%)
 */
class LeetCodeScorer {
  /**
   * Calculates the candidate's Algorithmic DSA Score
   * @param {object} profile - Raw LeetCode profile statistics
   * @param {object} jobSpec - Target job specification
   * @returns {object} Score breakdown and key metrics
   */
  static calculateScore(profile = {}, jobSpec = {}) {
    if (!profile || typeof profile !== 'object' || (!profile.totalSolved && !profile.ranking)) {
      return {
        dsa_score: 0,
        breakdown: {
          problem_volume: 0,
          contest_rating: 0,
          acceptance_rate: 0,
          consistency_badges: 0
        },
        total_solved: 0,
        easy_solved: 0,
        medium_solved: 0,
        hard_solved: 0,
        ranking: null,
        acceptance_rate: 0,
        contest_rating: 0,
        badges_count: 0
      };
    }

    const easy = profile.easySolved || profile.easy || 0;
    const medium = profile.mediumSolved || profile.medium || 0;
    const hard = profile.hardSolved || profile.hard || 0;
    const totalSolved = profile.totalSolved || (easy + medium + hard);
    const acceptanceRate = parseFloat(profile.acceptanceRate || profile.acRate || 0);
    const ranking = profile.ranking || profile.globalRanking || null;
    const contestRating = Math.round(profile.contestRating || profile.rating || 0);
    const badgesCount = (profile.badges && Array.isArray(profile.badges)) ? profile.badges.length : (profile.badgesCount || 0);

    // 1. Problem Solving Volume & Weighted Difficulty (40% Weight)
    // Formula: Easy * 1 + Medium * 2.5 + Hard * 5
    // Benchmark: 250 weighted points = 100%
    const weightedPoints = (easy * 1) + (medium * 2.5) + (hard * 5);
    const volumeScore = Math.min(100, Math.round((weightedPoints / 250) * 100));

    // 2. Contest Rating & Global Competitiveness (25% Weight)
    // Benchmark: 1500 is baseline, 1850+ is Knight/Guardian (100%), or top ranking
    let contestScore = 50; // default baseline for non-contestants with solved problems
    if (contestRating > 0) {
      if (contestRating >= 2100) contestScore = 100;
      else if (contestRating >= 1850) contestScore = 90;
      else if (contestRating >= 1650) contestScore = 75;
      else if (contestRating >= 1500) contestScore = 65;
      else contestScore = Math.max(30, Math.round((contestRating / 1500) * 60));
    } else if (ranking && ranking < 100000) {
      contestScore = ranking < 25000 ? 95 : ranking < 50000 ? 80 : 70;
    }

    // 3. Acceptance Rate (20% Weight)
    // High acceptance rate (45% - 75%) indicates clean, thought-out submissions
    let acScore = 50;
    if (acceptanceRate > 0) {
      if (acceptanceRate >= 50 && acceptanceRate <= 75) {
        acScore = 95;
      } else if (acceptanceRate > 75) {
        acScore = 80;
      } else if (acceptanceRate >= 35) {
        acScore = 70;
      } else {
        acScore = 50;
      }
    }

    // 4. Consistency & Badges (15% Weight)
    // 3+ badges or streaks indicate dedicated problem solvers
    let badgeScore = 40;
    if (badgesCount >= 5) badgeScore = 100;
    else if (badgesCount >= 3) badgeScore = 85;
    else if (badgesCount >= 1) badgeScore = 70;
    else if (totalSolved > 100) badgeScore = 60;

    // Weighted composite DSA score
    const dsaScore = Math.round(
      (volumeScore * 0.40) +
      (contestScore * 0.25) +
      (acScore * 0.20) +
      (badgeScore * 0.15)
    );

    return {
      dsa_score: Math.min(100, Math.max(0, dsaScore)),
      breakdown: {
        problem_volume: volumeScore,
        contest_rating: contestScore,
        acceptance_rate: acScore,
        consistency_badges: badgeScore
      },
      total_solved: totalSolved,
      easy_solved: easy,
      medium_solved: medium,
      hard_solved: hard,
      ranking: ranking,
      acceptance_rate: acceptanceRate,
      contest_rating: contestRating,
      badges_count: badgesCount
    };
  }
}

module.exports = LeetCodeScorer;
