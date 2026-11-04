const fs = require('fs');
const filePath = 'client/src/components/dashboard/WorkflowsTab.jsx';
let content = fs.readFileSync(filePath, 'utf8');

// 1. Add import
if (!content.includes('GitHubScoreTooltip')) {
  content = content.replace(
    "import { Button } from '../ui/Button';",
    "import { Button } from '../ui/Button';\r\nimport { GitHubScoreTooltip } from './GitHubScoreTooltip';"
  );
}

// 2. Enhance the GitHub MCP card in the Execution Graph with hover tooltip
const oldCard = `{/* Polished Professional GitHub MCP Card */}
                      {showGitHubBranch && (
                        <div className="ml-12 mr-1 my-1.5 p-3 rounded-xl border border-border bg-card shadow-xs transition-all">
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className="w-7 h-7 rounded-lg bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 flex items-center justify-center shrink-0 shadow-xs">
                                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                                  <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
                                </svg>
                              </div>
                              <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-semibold text-foreground tracking-tight">GitHub MCP Protocol</span>
                                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-secondary text-muted-foreground font-mono font-medium border border-border">
                                    JSON-RPC
                                  </span>
                                </div>
                                <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground mt-0.5 truncate">
                                  <span className="font-medium text-foreground">@{selectedCandidate.github_username || 'candidate'}</span>
                                  <span>&bull;</span>
                                  <span>Empirical Code Verification</span>
                                </div>
                              </div>
                            </div>
                            <div className="text-right shrink-0">
                              <div className="text-sm font-bold text-foreground tabular-nums">
                                {selectedCandidate.coding_score != null ? \`\${selectedCandidate.coding_score}%\` : '—'}
                              </div>
                              <span className="text-[9px] uppercase font-semibold text-muted-foreground tracking-wider block">
                                Coding Score
                              </span>
                            </div>
                          </div>
                        </div>
                      )}`.replace(/\n/g, '\r\n');

const newCard = `{/* Polished Professional GitHub MCP Card with Hover Breakdown */}
                      {showGitHubBranch && (
                        <div className="relative group ml-12 mr-1 my-1.5 p-3 rounded-xl border border-border bg-card shadow-xs hover:border-primary/40 hover:bg-accent/30 transition-all cursor-help">
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className="w-7 h-7 rounded-lg bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 flex items-center justify-center shrink-0 shadow-xs">
                                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                                  <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
                                </svg>
                              </div>
                              <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-semibold text-foreground tracking-tight">GitHub MCP Protocol</span>
                                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-secondary text-muted-foreground font-mono font-medium border border-border">
                                    JSON-RPC
                                  </span>
                                </div>
                                <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground mt-0.5 truncate">
                                  <span className="font-medium text-foreground">@{selectedCandidate.github_username || 'candidate'}</span>
                                  <span>&bull;</span>
                                  <span>Empirical Code Verification</span>
                                </div>
                              </div>
                            </div>
                            <div className="text-right shrink-0">
                              <div className="text-sm font-bold text-foreground tabular-nums">
                                {selectedCandidate.coding_score != null ? \`\${selectedCandidate.coding_score}%\` : '—'}
                              </div>
                              <span className="text-[9px] uppercase font-semibold text-muted-foreground tracking-wider block">
                                Coding Score (Hover for Breakdown)
                              </span>
                            </div>
                          </div>

                          {/* Hover Tooltip Breakdown */}
                          <div className="absolute right-0 bottom-full mb-2 hidden group-hover:block z-50 pointer-events-none transition-opacity duration-150 animate-in fade-in zoom-in-95">
                            <GitHubScoreTooltip
                              codingScore={selectedCandidate.coding_score}
                              username={selectedCandidate.github_username}
                              metrics={selectedCandidate.github_metrics}
                            />
                          </div>
                        </div>
                      )}`.replace(/\n/g, '\r\n');

if (content.includes(oldCard)) {
  content = content.replace(oldCard, newCard);
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('WorkflowsTab Execution Graph updated with hover breakdown tooltip!');
} else {
  console.log('Old card not found in WorkflowsTab');
}

