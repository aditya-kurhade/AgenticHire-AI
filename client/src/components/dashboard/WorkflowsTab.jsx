import { PageHeader } from '../ui/PageHeader';
import { Badge } from '../ui/Badge';
import { EmptyState } from '../ui/EmptyState';
import { Button } from '../ui/Button';
import {
  GitFork,
  Database,
  FileText,
  GitCompare,
  CheckSquare,
  UserCheck,
  MessageSquare,
  Mail,
  RotateCw,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Play,
  Terminal,
  Clock
} from 'lucide-react';

const STEP_ICONS = {
  resume_parser: FileText,
  embedding_agent: Database,
  matching_agent: GitCompare,
  shortlisting_agent: CheckSquare,
  human_approval: UserCheck,
  interview_agent: MessageSquare,
  email_agent: Mail
};

export default function WorkflowsTab({
  candidates,
  selectedCandidateId,
  setSelectedCandidateId,
  selectedWorkflow,
  workflowLogs = [],
  workflowActionLoading,
  handleApproveWorkflow,
  handleRetryWorkflow,
  llmSettings,
  nodeColorsSpec
}) {
  const statusLabel = selectedWorkflow
    ? selectedWorkflow.status.replace(/_/g, ' ')
    : 'No workflow';

  return (
    <div className="space-y-6">
      <PageHeader
        title="Orchestration Engine"
        description="Monitor pipeline execution, checkpoints, and human review points."
        actions={
          <div className="flex items-center gap-2">
            <div className="bg-card border border-border px-3 py-1.5 rounded-lg shadow-xs">
              <span className="text-[10px] uppercase font-semibold text-muted-foreground block leading-tight">Workflow Status</span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <div className={`w-2 h-2 rounded-full ${
                  selectedWorkflow?.status === 'running' ? 'bg-blue-500 animate-pulse' :
                  selectedWorkflow?.status === 'paused_approval' ? 'bg-amber-500 animate-pulse' :
                  selectedWorkflow?.status === 'success' ? 'bg-emerald-500' :
                  selectedWorkflow?.status === 'failed' ? 'bg-destructive' : 'bg-muted-foreground/40'
                }`} />
                <span className="text-xs font-semibold text-foreground uppercase">{statusLabel}</span>
              </div>
            </div>
            <div className="bg-card border border-border px-3 py-1.5 rounded-lg shadow-xs hidden sm:block">
              <span className="text-[10px] uppercase font-semibold text-muted-foreground block leading-tight">Checkpointer</span>
              <span className="text-primary text-xs font-semibold flex items-center gap-1 mt-0.5">
                <Database className="w-3.5 h-3.5" /> MongoDB
              </span>
            </div>
          </div>
        }
      />

      {candidates.length === 0 ? (
        <EmptyState
          icon={GitFork}
          title="No candidates to orchestrate"
          description="Applications will appear here with live workflow graphs once candidates apply."
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          <div className="lg:col-span-3 bg-card border border-border rounded-xl p-4 flex flex-col gap-3 shadow-xs">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-semibold text-foreground">Select Candidate</h3>
              <Badge variant="secondary">{candidates.length}</Badge>
            </div>
            <div className="space-y-1.5 overflow-y-auto max-h-[520px] pr-1">
              {candidates.map((c) => (
                <button
                  key={c._id}
                  type="button"
                  onClick={() => setSelectedCandidateId(c._id)}
                  className={`w-full text-left p-3 rounded-lg border transition-all ${
                    selectedCandidateId === c._id
                      ? 'bg-primary/10 border-primary text-primary font-semibold shadow-xs'
                      : 'border-border hover:bg-accent text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <p className="text-sm font-semibold truncate text-foreground">{c.name}</p>
                  <div className="flex justify-between items-center mt-1.5 gap-2">
                    <span className="text-[10px] bg-secondary px-1.5 py-0.5 rounded truncate max-w-[120px] text-muted-foreground">
                      {c.job_id?.title || 'Applicant'}
                    </span>
                    <span className="text-[10px] uppercase font-bold tracking-wider shrink-0 text-foreground tabular-nums">
                      {c.match_score != null ? `${c.match_score}%` : c.status}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="lg:col-span-6 space-y-5">
            <div className="bg-card border border-border rounded-xl p-5 shadow-xs">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
                  <GitFork className="w-4 h-4 text-primary" />
                  Execution Graph
                </h3>
              </div>

              <div className="relative bg-secondary/30 rounded-xl p-4 border border-border flex flex-col gap-3">
                {[
                  { key: 'resume_parser', title: 'Resume Parser', desc: 'PDF text extraction' },
                  { key: 'embedding_agent', title: 'Embedding Agent', desc: 'Vector ingest' },
                  { key: 'matching_agent', title: 'Matching Agent', desc: 'RAG compatibility' },
                  { key: 'shortlisting_agent', title: 'Shortlisting Agent', desc: 'Threshold check' },
                  { key: 'human_approval', title: 'Human Approval', desc: 'Manual review' },
                  { key: 'interview_agent', title: 'Interview Agent', desc: 'Tech assessment' },
                  { key: 'email_agent', title: 'Email Agent', desc: 'Notifications' }
                ].map((step, idx, arr) => {
                  const Icon = STEP_ICONS[step.key] || Play;
                  let stateColor = 'bg-card border-border text-muted-foreground opacity-70';
                  let badge = 'Pending';
                  let iconColor = 'bg-secondary text-muted-foreground border-border';

                  if (selectedWorkflow) {
                    const sequence = arr.map(a => a.key);
                    const currentIdx = sequence.indexOf(selectedWorkflow.current_state);
                    const nodeIdx = sequence.indexOf(step.key);

                    if (selectedWorkflow.status === 'success' || nodeIdx < currentIdx) {
                      stateColor = 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-medium';
                      iconColor = 'bg-emerald-600 text-white border-emerald-600';
                      badge = 'Done';
                    } else if (nodeIdx === currentIdx) {
                      if (selectedWorkflow.status === 'running') {
                        stateColor = 'bg-blue-500/10 border-blue-500/40 text-blue-600 dark:text-blue-400 font-semibold';
                        iconColor = 'bg-blue-600 text-white border-blue-600 animate-pulse';
                        badge = 'Running';
                      } else if (selectedWorkflow.status === 'paused_approval') {
                        stateColor = 'bg-amber-500/10 border-amber-500/40 text-amber-600 dark:text-amber-400 font-semibold';
                        iconColor = 'bg-amber-500 text-white border-amber-500';
                        badge = 'Review';
                      } else if (selectedWorkflow.status === 'failed') {
                        stateColor = 'bg-destructive/10 border-destructive/40 text-destructive font-semibold';
                        iconColor = 'bg-destructive text-white border-destructive';
                        badge = 'Failed';
                      }
                    }
                  }

                  return (
                    <div key={step.key} className="relative flex items-center gap-3">
                      {idx < arr.length - 1 && (
                        <div className="absolute left-5 top-11 w-0.5 h-4 bg-border" />
                      )}
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center border shadow-xs shrink-0 z-[1] ${iconColor}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className={`flex-1 border px-3.5 py-2.5 rounded-lg shadow-xs transition-all flex items-center justify-between gap-2 ${stateColor}`}>
                        <div className="min-w-0">
                          <span className="block text-xs font-semibold truncate text-foreground">{step.title}</span>
                          <span className="text-[10px] text-muted-foreground">{step.desc}</span>
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-wider shrink-0">{badge}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="lg:col-span-3 space-y-5">
            {selectedWorkflow && (
              <div className="bg-card border border-border rounded-xl p-4 shadow-xs">
                <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-primary" />
                  Actions
                </h3>

                {selectedWorkflow.status === 'paused_approval' && (
                  <div className="space-y-3">
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Paused for manual review. Approve or reject this candidate to continue pipeline execution.
                    </p>
                    <div className="flex gap-2">
                      <Button
                        className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                        onClick={() => handleApproveWorkflow('approve')}
                        loading={workflowActionLoading}
                      >
                        Approve
                      </Button>
                      <Button
                        variant="destructive"
                        className="flex-1"
                        onClick={() => handleApproveWorkflow('reject')}
                        loading={workflowActionLoading}
                      >
                        Reject
                      </Button>
                    </div>
                  </div>
                )}

                {selectedWorkflow.status === 'failed' && (
                  <div className="space-y-3">
                    <p className="text-xs text-destructive">
                      Failed at <strong>{selectedWorkflow.current_state}</strong>.
                    </p>
                    <Button className="w-full flex items-center justify-center gap-1.5" onClick={handleRetryWorkflow} loading={workflowActionLoading}>
                      <RotateCw className="w-3.5 h-3.5" />
                      Retry Node
                    </Button>
                  </div>
                )}

                {selectedWorkflow.status === 'success' && (
                  <p className="text-xs text-emerald-600 bg-emerald-500/10 p-3 rounded-lg border border-emerald-500/20 font-medium flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    Workflow completed successfully.
                  </p>
                )}

                {selectedWorkflow.status === 'running' && (
                  <div className="flex items-center gap-2 bg-blue-500/10 p-3 rounded-lg border border-blue-500/20 text-blue-600 font-medium text-xs">
                    <Loader2 className="w-4 h-4 animate-spin text-blue-500 shrink-0" />
                    Agents are actively screening…
                  </div>
                )}
              </div>
            )}

            {/* Live Log Stream Terminal */}
            <div className="bg-slate-950 text-slate-100 rounded-xl shadow-md overflow-hidden flex flex-col h-[320px] border border-border/80">
              <div className="px-4 py-2.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Terminal className="w-3.5 h-3.5 text-slate-400" />
                  <h3 className="text-[11px] font-semibold uppercase tracking-wider text-slate-300">Live Log Stream</h3>
                </div>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              </div>
              <div className="flex-1 p-3.5 font-mono text-[11px] leading-relaxed overflow-y-auto space-y-2">
                {workflowLogs.length > 0 ? (
                  workflowLogs.map((log, idx) => (
                    <div key={log._id || idx} className="border-b border-slate-800/80 pb-2">
                      <div className="flex justify-between items-center text-[10px] opacity-75">
                        <span className="text-amber-400 font-semibold">{log.agent_name?.toUpperCase()}</span>
                        <span className={log.status === 'success' ? 'text-emerald-400' : 'text-red-400 font-semibold'}>
                          {log.status?.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-slate-300 whitespace-pre-wrap mt-0.5 break-all">
                        {log.status === 'success'
                          ? JSON.stringify(log.output?.data || log.output || {}, null, 1)
                          : log.error || 'Unknown Error'}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-center py-10 text-slate-500 italic">No execution logs yet.</p>
                )}
              </div>
            </div>

            <div className="bg-card border border-border rounded-xl p-4 shadow-xs">
              <h3 className="text-sm font-semibold text-foreground mb-3">System Config</h3>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between items-center py-2 border-b border-border/60 gap-2">
                  <span className="text-muted-foreground">LLM Provider</span>
                  <span className="font-medium bg-secondary px-2 py-0.5 rounded text-right text-foreground">
                    {llmSettings?.provider === 'ollama' ? `Ollama (${llmSettings?.ollamaModel})` : 'Groq'}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-border/60">
                  <span className="text-muted-foreground">Persistence</span>
                  <span className="font-medium bg-emerald-500/10 text-emerald-600 px-2 py-0.5 rounded">MongoDB</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-muted-foreground">Checkpoints</span>
                  <span className="font-medium text-foreground">Every step</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}