import { PageHeader } from '../ui/PageHeader';
import { Badge } from '../ui/Badge';
import { EmptyState } from '../ui/EmptyState';
import { Button } from '../ui/Button';

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
    <div className="ah-page">
      <PageHeader
        title="Orchestration Engine"
        description="Monitor pipeline execution, checkpoints, and human review points."
        actions={
          <>
            <div className="ah-surface px-3 py-2">
              <span className="text-[10px] uppercase font-bold text-on-surface-variant block mb-1">Workflow Status</span>
              <div className="flex items-center gap-1.5">
                <div className={`w-2 h-2 rounded-full ${
                  selectedWorkflow?.status === 'running' ? 'bg-blue-500 animate-pulse' :
                  selectedWorkflow?.status === 'paused_approval' ? 'bg-amber-500 animate-pulse' :
                  selectedWorkflow?.status === 'success' ? 'bg-emerald-500' :
                  selectedWorkflow?.status === 'failed' ? 'bg-red-500' : 'bg-gray-300'
                }`} />
                <span className="text-xs font-bold text-on-surface uppercase">{statusLabel}</span>
              </div>
            </div>
            <div className="ah-surface px-3 py-2 hidden sm:block">
              <span className="text-[10px] uppercase font-bold text-on-surface-variant block mb-1">Checkpointer</span>
              <span className="text-primary text-xs font-bold flex items-center gap-1">
                <span className="material-symbols-outlined text-[15px]">database</span> MongoDB
              </span>
            </div>
          </>
        }
      />

      {candidates.length === 0 ? (
        <EmptyState
          icon="account_tree"
          title="No candidates to orchestrate"
          description="Applications will appear here with live workflow graphs once candidates apply."
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          <div className="lg:col-span-3 ah-surface p-4 flex flex-col gap-3">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold text-on-surface">Select Candidate</h3>
              <Badge>{candidates.length}</Badge>
            </div>
            <div className="space-y-1.5 overflow-y-auto max-h-[480px] pr-1 ah-scrollbar">
              {candidates.map((c) => (
                <button
                  key={c._id}
                  type="button"
                  onClick={() => setSelectedCandidateId(c._id)}
                  className={`w-full text-left p-3 rounded-xl border transition-all ${
                    selectedCandidateId === c._id
                      ? 'bg-primary/10 border-primary text-primary font-bold shadow-xs'
                      : 'border-[#e8ded5] hover:bg-[#F8F5EF] text-on-surface-variant'
                  }`}
                >
                  <p className="text-sm font-semibold truncate">{c.name}</p>
                  <div className="flex justify-between items-center mt-1 gap-2">
                    <span className="text-[10px] bg-[#F8F5EF] px-1.5 py-0.5 rounded truncate max-w-[120px] text-on-surface-variant">
                      {c.job_id?.title || 'Applicant'}
                    </span>
                    <span className="text-[10px] uppercase font-bold tracking-wider shrink-0">
                      {c.match_score != null ? `${c.match_score}%` : c.status}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="lg:col-span-6 space-y-5">
            <div className="ah-surface p-5">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-base font-bold text-on-surface flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">account_tree</span>
                  Execution Graph
                </h3>
              </div>

              <div className="relative bg-[#F8F5EF] rounded-xl p-4 border border-dashed border-[#dcc1b1] flex flex-col gap-3">
                {[
                  { key: 'resume_parser', title: 'Resume Parser', icon: 'picture_as_pdf', desc: 'PDF text extraction' },
                  { key: 'embedding_agent', title: 'Embedding Agent', icon: 'database', desc: 'Vector ingest' },
                  { key: 'matching_agent', title: 'Matching Agent', icon: 'compare_arrows', desc: 'RAG compatibility' },
                  { key: 'shortlisting_agent', title: 'Shortlisting Agent', icon: 'rule', desc: 'Threshold check' },
                  { key: 'human_approval', title: 'Human Approval', icon: 'rate_review', desc: 'Manual review' },
                  { key: 'interview_agent', title: 'Interview Agent', icon: 'quiz', desc: 'Tech assessment' },
                  { key: 'email_agent', title: 'Email Agent', icon: 'mail', desc: 'Notifications' }
                ].map((step, idx, arr) => {
                  let stateColor = 'bg-white border-[#e8ded5] text-on-surface-variant opacity-70';
                  let badge = 'Pending';
                  let iconColor = 'bg-[#e8ded5] text-on-surface-variant';

                  if (selectedWorkflow) {
                    const sequence = arr.map(a => a.key);
                    const currentIdx = sequence.indexOf(selectedWorkflow.current_state);
                    const nodeIdx = sequence.indexOf(step.key);

                    if (selectedWorkflow.status === 'success') {
                      stateColor = 'bg-emerald-50 border-emerald-400 text-emerald-800 font-semibold';
                      iconColor = 'bg-emerald-500 text-white';
                      badge = 'Done';
                    } else if (nodeIdx < currentIdx) {
                      stateColor = 'bg-emerald-50 border-emerald-400 text-emerald-800 font-semibold';
                      iconColor = 'bg-emerald-500 text-white';
                      badge = 'Done';
                    } else if (nodeIdx === currentIdx) {
                      if (selectedWorkflow.status === 'running') {
                        stateColor = 'bg-blue-50 border-blue-400 text-blue-800 font-bold';
                        iconColor = 'bg-blue-500 text-white animate-pulse';
                        badge = 'Running';
                      } else if (selectedWorkflow.status === 'paused_approval') {
                        stateColor = 'bg-amber-50 border-amber-400 text-amber-800 font-bold';
                        iconColor = 'bg-amber-500 text-white';
                        badge = 'Review';
                      } else if (selectedWorkflow.status === 'failed') {
                        stateColor = 'bg-red-50 border-red-400 text-red-800 font-bold';
                        iconColor = 'bg-red-500 text-white';
                        badge = 'Failed';
                      }
                    }
                  }

                  return (
                    <div key={step.key} className="relative flex items-center gap-3">
                      {idx < arr.length - 1 && (
                        <div className="absolute left-5 top-11 w-0.5 h-4 bg-[#dcc1b1]" />
                      )}
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center border shadow-sm shrink-0 z-[1] ${iconColor}`}>
                        <span className="material-symbols-outlined text-[18px]">{step.icon}</span>
                      </div>
                      <div className={`flex-1 border px-3 py-2.5 rounded-xl shadow-xs transition-all flex items-center justify-between gap-2 ${stateColor}`}>
                        <div className="min-w-0">
                          <span className="block text-xs font-bold truncate">{step.title}</span>
                          <span className="text-[10px] opacity-80">{step.desc}</span>
                        </div>
                        <span className="text-[10px] font-extrabold uppercase tracking-wider shrink-0">{badge}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="lg:col-span-3 space-y-5">
            {selectedWorkflow && (
              <div className="bg-[#F8F5EF] border border-[#e8ded5] rounded-2xl p-4 shadow-xs">
                <h3 className="text-sm font-bold text-on-surface mb-3 flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">pending_actions</span>
                  Actions
                </h3>

                {selectedWorkflow.status === 'paused_approval' && (
                  <div className="space-y-2">
                    <p className="text-xs text-on-surface-variant mb-2 leading-relaxed">
                      Paused for manual review. Approve or reject this candidate to continue.
                    </p>
                    <div className="flex gap-2">
                      <Button
                        className="flex-1 !bg-emerald-600 hover:!brightness-110"
                        onClick={() => handleApproveWorkflow('approve')}
                        loading={workflowActionLoading}
                      >
                        Approve
                      </Button>
                      <Button
                        variant="danger"
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
                  <div className="space-y-2">
                    <p className="text-xs text-on-surface-variant mb-2">
                      Failed at <strong>{selectedWorkflow.current_state}</strong>.
                    </p>
                    <Button className="w-full" onClick={handleRetryWorkflow} loading={workflowActionLoading}>
                      <span className="material-symbols-outlined text-[16px]">replay</span>
                      Retry Node
                    </Button>
                  </div>
                )}

                {selectedWorkflow.status === 'success' && (
                  <p className="text-xs text-emerald-700 font-semibold bg-emerald-50 p-3 rounded-xl border border-emerald-200">
                    Workflow completed successfully.
                  </p>
                )}

                {selectedWorkflow.status === 'running' && (
                  <div className="flex items-center gap-2 bg-blue-50 p-3 rounded-xl border border-blue-200 text-blue-700 font-semibold text-xs">
                    <span className="material-symbols-outlined animate-spin text-blue-500 text-[18px]">sync</span>
                    Agents are running…
                  </div>
                )}
              </div>
            )}

            <div className="bg-[#121c2a] text-[#eff4ff] rounded-2xl shadow-lg overflow-hidden flex flex-col h-[320px]">
              <div className="px-4 py-3 border-b border-white/10 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                <h3 className="text-[11px] font-bold uppercase tracking-wider">Live Log Stream</h3>
              </div>
              <div className="flex-1 p-4 font-mono text-[11px] leading-relaxed overflow-y-auto ah-scrollbar">
                {workflowLogs.length > 0 ? (
                  workflowLogs.map((log, idx) => (
                    <div key={log._id || idx} className="mb-2 border-b border-white/5 pb-1.5">
                      <div className="flex justify-between items-center text-[10px] opacity-75">
                        <span className="text-amber-200">{log.agent_name?.toUpperCase()}</span>
                        <span className={log.status === 'success' ? 'text-emerald-400' : 'text-red-400'}>
                          {log.status?.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-white/90 whitespace-pre-wrap mt-0.5 break-all">
                        {log.status === 'success'
                          ? JSON.stringify(log.output?.data || log.output || {}, null, 1)
                          : log.error || 'Unknown Error'}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-center py-10 text-white/30 italic">No execution logs yet.</p>
                )}
              </div>
            </div>

            <div className="ah-surface p-4">
              <h3 className="text-sm font-bold text-on-surface mb-3">System Config</h3>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between items-center py-2 border-b border-[#f0e7df] gap-2">
                  <span className="text-on-surface-variant">LLM Provider</span>
                  <span className="font-bold bg-[#F8F5EF] px-2 py-0.5 rounded text-right">
                    {llmSettings?.provider === 'ollama' ? `Ollama (${llmSettings?.ollamaModel})` : 'Groq'}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-[#f0e7df]">
                  <span className="text-on-surface-variant">Persistence</span>
                  <span className="font-bold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded">MongoDB</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-on-surface-variant">Checkpoints</span>
                  <span className="font-bold text-on-surface">Every step</span>
                </div>
                {nodeColorsSpec && (
                  <div className="flex justify-between items-center py-2 border-t border-[#f0e7df]">
                    <span className="text-on-surface-variant">Approval color</span>
                    <span className="font-bold text-on-surface">{nodeColorsSpec.waiting_approval}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
