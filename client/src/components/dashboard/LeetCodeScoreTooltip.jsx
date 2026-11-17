import React from 'react';
import { LeetCodeIcon } from '../ui/LeetCodeIcon';

/**
 * LeetCode Score Hover Breakdown Tooltip
 * Renders problem-solving difficulty breakdown + contest rating + acceptance stats
 */
export const LeetCodeScoreTooltip = ({ metrics, dsaScore, username }) => {
  const breakdown = metrics?.breakdown || {
    problem_volume: dsaScore ? Math.round(dsaScore * 0.85) : 0,
    contest_rating: dsaScore ? Math.round(dsaScore * 0.75) : 0,
    acceptance_rate: dsaScore ? Math.round(dsaScore * 0.9) : 0,
    consistency_badges: dsaScore ? Math.round(dsaScore * 0.7) : 0
  };

  const dimensions = [
    { label: 'Problem Volume (Weighted)', weight: '40%', score: breakdown.problem_volume || 0, desc: 'Hard (5x), Med (2.5x), Easy (1x)' },
    { label: 'Contest / Global Rank', weight: '25%', score: breakdown.contest_rating || 0, desc: 'Competitive contest rating' },
    { label: 'Acceptance Rate', weight: '20%', score: breakdown.acceptance_rate || 0, desc: 'Submission correctness ratio' },
    { label: 'Consistency & Badges', weight: '15%', score: breakdown.consistency_badges || 0, desc: 'Streak & community badges' }
  ];

  const total = metrics?.total_solved ?? 0;
  const easy = metrics?.easy_solved ?? 0;
  const medium = metrics?.medium_solved ?? 0;
  const hard = metrics?.hard_solved ?? 0;

  return (
    <div className="w-76 p-3.5 bg-popover border border-border text-popover-foreground rounded-xl shadow-2xl text-left text-xs space-y-3 z-[100] relative">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-border/60">
        <div className="flex items-center gap-1.5 min-w-0">
          <div className="w-4 h-4 rounded bg-zinc-900 dark:bg-zinc-100 flex items-center justify-center p-0.5 shrink-0">
            <LeetCodeIcon className="w-3 h-3" />
          </div>
          <span className="font-semibold text-foreground truncate">
            {username ? `@${username}` : 'LeetCode MCP Protocol'}
          </span>
        </div>
        <span className="font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.5 rounded text-[11px] tabular-nums">
          {dsaScore != null ? `${dsaScore}% DSA` : '—'}
        </span>
      </div>

      {/* Difficulty Breakdown Pills */}
      <div className="grid grid-cols-3 gap-1.5 text-center">
        <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-lg p-1.5">
          <span className="text-[10px] font-semibold block uppercase">Easy</span>
          <span className="text-xs font-bold tabular-nums">{easy}</span>
        </div>
        <div className="bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 rounded-lg p-1.5">
          <span className="text-[10px] font-semibold block uppercase">Medium</span>
          <span className="text-xs font-bold tabular-nums">{medium}</span>
        </div>
        <div className="bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 rounded-lg p-1.5">
          <span className="text-[10px] font-semibold block uppercase">Hard</span>
          <span className="text-xs font-bold tabular-nums">{hard}</span>
        </div>
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
                className="bg-amber-500 h-full rounded-full transition-all duration-300"
                style={{ width: `${Math.min(100, Math.max(0, dim.score))}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Additional Stats Strip */}
      <div className="pt-2 border-t border-border/60 grid grid-cols-2 gap-2 text-[10px]">
        <div className="bg-secondary/50 p-1.5 rounded-md">
          <span className="text-muted-foreground block">Total Solved</span>
          <span className="font-semibold text-foreground text-xs">{total} Questions</span>
        </div>
        <div className="bg-secondary/50 p-1.5 rounded-md">
          <span className="text-muted-foreground block">Acceptance Rate</span>
          <span className="font-semibold text-foreground text-xs">{metrics?.acceptance_rate ? `${metrics.acceptance_rate}%` : 'N/A'}</span>
        </div>
        {metrics?.contest_rating > 0 && (
          <div className="col-span-2 bg-secondary/30 p-1.5 rounded-md flex justify-between items-center">
            <span className="text-muted-foreground">Contest Rating:</span>
            <span className="font-semibold text-amber-500 font-mono text-xs">⭐ {metrics.contest_rating}</span>
          </div>
        )}
      </div>
    </div>
  );
};
