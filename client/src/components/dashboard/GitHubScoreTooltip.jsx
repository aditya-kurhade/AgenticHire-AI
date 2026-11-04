import React from 'react';

/**
 * GitHub Score Hover Breakdown Tooltip
 * Renders the 4 multi-factor scoring dimensions + repository activity metrics
 */
export const GitHubScoreTooltip = ({ metrics, codingScore, username }) => {
  const breakdown = metrics?.breakdown || {
    language_alignment: codingScore ? Math.round(codingScore * 0.8) : 0,
    commit_recency: codingScore ? Math.round(codingScore * 0.9) : 0,
    project_quality: codingScore ? Math.round(codingScore * 0.75) : 0,
    contribution_footprint: codingScore ? Math.round(codingScore * 0.65) : 0
  };

  const dimensions = [
    { label: 'Language Alignment', weight: '40%', score: breakdown.language_alignment || 0, desc: 'Tech stack alignment with Job Spec' },
    { label: 'Commit Recency', weight: '25%', score: breakdown.commit_recency || 0, desc: 'Active pushes in past 6-12 months' },
    { label: 'Project Quality', weight: '20%', score: breakdown.project_quality || 0, desc: 'Originality, documentation & depth' },
    { label: 'Contribution Footprint', weight: '15%', score: breakdown.contribution_footprint || 0, desc: 'Stars, forks & community impact' }
  ];

  return (
    <div className="w-72 p-3.5 bg-popover border border-border text-popover-foreground rounded-xl shadow-2xl text-left text-xs space-y-3 z-[100] relative">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-border/60">
        <div className="flex items-center gap-1.5 min-w-0">
          <svg className="w-3.5 h-3.5 fill-current shrink-0 text-foreground" viewBox="0 0 24 24">
            <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
          </svg>
          <span className="font-semibold text-foreground truncate">
            {username ? `@${username}` : 'GitHub MCP Evaluation'}
          </span>
        </div>
        <span className="font-bold text-foreground bg-secondary px-1.5 py-0.5 rounded text-[11px] tabular-nums">
          {codingScore != null ? `${codingScore}%` : '—'}
        </span>
      </div>

      {/* 4 Factor Breakdown Bars */}
      <div className="space-y-2">
        <span className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider block">
          Score Breakdown
        </span>
        {dimensions.map((dim) => (
          <div key={dim.label} className="space-y-0.5">
            <div className="flex justify-between items-center text-[11px]">
              <span className="text-foreground font-medium flex items-center gap-1">
                {dim.label}
                <span className="text-[9px] text-muted-foreground">({dim.weight})</span>
              </span>
              <span className="font-semibold text-foreground tabular-nums">{dim.score}%</span>
            </div>
            <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden">
              <div
                className="bg-primary h-full rounded-full transition-all duration-300"
                style={{ width: `${Math.min(100, Math.max(0, dim.score))}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Live Repo Stats / Languages */}
      {metrics && (
        <div className="pt-2 border-t border-border/60 grid grid-cols-2 gap-2 text-[10px]">
          <div className="bg-secondary/50 p-1.5 rounded-md">
            <span className="text-muted-foreground block">Public Repos</span>
            <span className="font-semibold text-foreground text-xs">{metrics.total_repos ?? metrics.original_repos ?? 0}</span>
          </div>
          <div className="bg-secondary/50 p-1.5 rounded-md">
            <span className="text-muted-foreground block">Total Stars</span>
            <span className="font-semibold text-foreground text-xs">⭐ {metrics.total_stars ?? 0}</span>
          </div>
          {metrics.top_languages && metrics.top_languages.length > 0 && (
            <div className="col-span-2 bg-secondary/30 p-1.5 rounded-md">
              <span className="text-muted-foreground block mb-0.5">Top Languages:</span>
              <div className="flex flex-wrap gap-1">
                {metrics.top_languages.slice(0, 4).map((lang) => (
                  <span key={lang} className="bg-secondary px-1.5 py-0.2 rounded text-[9px] font-medium text-foreground">
                    {lang}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default GitHubScoreTooltip;

