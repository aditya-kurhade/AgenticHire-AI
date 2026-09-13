const specLoader = require('../utils/specLoader');

/**
 * Shortlisting Agent
 * Makes final automated recruitment decisions based on match score and spec thresholds.
 */
class ShortlistingAgent {
  /**
   * Evaluates candidate status based on score and thresholds spec.
   * @param {number} matchScore - Compatibility score computed by MatchingAgent.
   * @returns {object} Decision containing status and reasoning.
   */
  static evaluate(matchScore) {
    if (typeof matchScore !== 'number') {
      throw new Error('Invalid match score: Must be a number.');
    }

    // Load thresholds from spec file
    const thresholds = specLoader.loadShortlistingThresholds();
    const shortlistMin = thresholds.shortlist;
    const holdMin = thresholds.hold;

    if (typeof shortlistMin !== 'number' || typeof holdMin !== 'number') {
      throw new Error('Invalid shortlisting threshold spec: shortlist and hold must be numbers.');
    }

    console.log(`📜 [ShortlistingAgent] Loaded Spec Thresholds -> Shortlist: >= ${shortlistMin}%, Hold: >= ${holdMin}%, Reject: < ${holdMin}%`);

    let status = 'reject';
    let reasoning = '';

    if (matchScore >= shortlistMin) {
      status = 'shortlist';
      reasoning = `Score of ${matchScore}% meets or exceeds the shortlisting threshold of ${shortlistMin}%.`;
    } else if (matchScore >= holdMin) {
      status = 'hold';
      reasoning = `Score of ${matchScore}% meets the review threshold of ${holdMin}% but is below the shortlisting threshold of ${shortlistMin}%.`;
    } else {
      status = 'reject';
      reasoning = `Score of ${matchScore}% is below the minimum review threshold of ${holdMin}%.`;
    }

    console.log(`⚖️ [ShortlistingAgent] Evaluated Candidate: ${reasoning} -> Result: [${status.toUpperCase()}]`);

    return {
      success: true,
      data: {
        status,
        reasoning,
        thresholds: { shortlist: shortlistMin, hold: holdMin }
      }
    };
  }
}

module.exports = ShortlistingAgent;
