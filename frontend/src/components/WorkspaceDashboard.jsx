import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Users,
  Vote,
  Plus,
  Copy,
  CheckCircle2,
  Clock,
  ThumbsUp,
  ThumbsDown,
  Check,
  Activity,
  AlertCircle
} from "lucide-react";
import { useWallet } from "../context/WalletContext";
import { useNexora } from "../hooks/useNexora";
import CreateGroupModal from "./CreateGroupModal";
import CreateProposalModal from "./CreateProposalModal";
import NexoraMark from "./NexoraMark";

function WorkspaceDashboard() {
  const { account, contractAddress } = useWallet();
  const {
    groups,
    proposals,
    events,
    loading,
    actionLoading,
    error,
    joinGroup,
    voteOnProposal,
    refreshAll,
  } = useNexora();

  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [isProposalModalOpen, setIsProposalModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const shortenAddress = (value) => {
    if (!value) return "";
    return `${value.slice(0, 6)}...${value.slice(-4)}`;
  };

  const copyAddress = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (e) {
      console.error(e);
    }
  };

  const formatDeadline = (deadlineTs) => {
    const nowSec = Math.floor(Date.now() / 1000);
    const diff = deadlineTs - nowSec;
    if (diff <= 0) return "Voting Ended";

    const mins = Math.floor(diff / 60);
    const hours = Math.floor(mins / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ${hours % 24}h remaining`;
    if (hours > 0) return `${hours}h ${mins % 60}m remaining`;
    return `${mins} mins remaining`;
  };

  return (
    <section id="workspace" className="relative overflow-hidden bg-slate-950 px-6 py-28">
      {/* Background Glow */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-600/10 blur-3xl" />

      <div className="relative mx-auto max-w-7xl">
        {/* Section Heading */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12 flex flex-col gap-4 md:flex-row md:items-end md:justify-between"
        >
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-violet-400">
              Nexora On-Chain DApp
            </p>
            <h2 className="mt-2 text-4xl font-bold text-white sm:text-5xl">
              Coordination Workspace
            </h2>
            <p className="mt-3 text-slate-400">
              Create groups, manage proposals, and vote on-chain with verifiable provenance.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setIsGroupModalOpen(true)}
              disabled={!account}
              className="flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-3 font-semibold text-white transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Plus size={18} />
              New Group
            </button>
            <button
              onClick={() => setIsProposalModalOpen(true)}
              disabled={!account || groups.length === 0}
              className="flex items-center gap-2 rounded-xl border border-cyan-400/20 bg-cyan-400/10 px-5 py-3 font-semibold text-cyan-300 transition hover:bg-cyan-400/20 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Plus size={18} />
              New Proposal
            </button>
          </div>
        </motion.div>

        {/* Dashboard Header Bar */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-8 overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-xl"
        >
          <div className="grid gap-6 md:grid-cols-4">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-500/10 border border-violet-400/20">
                <NexoraMark size={28} showGlow />
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider text-slate-500">Contract Address</p>
                <div className="mt-1 flex items-center gap-2">
                  <span className="font-mono text-sm font-medium text-cyan-300">
                    {shortenAddress(contractAddress)}
                  </span>
                  <button
                    onClick={() => copyAddress(contractAddress)}
                    className="text-slate-500 transition hover:text-white"
                  >
                    {copied ? <Check size={14} /> : <Copy size={14} />}
                  </button>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-4">
              <p className="text-xs uppercase tracking-wider text-slate-500">Active Groups</p>
              <p className="mt-1 text-2xl font-bold text-white">{groups.length}</p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-4">
              <p className="text-xs uppercase tracking-wider text-slate-500">Total Proposals</p>
              <p className="mt-1 text-2xl font-bold text-white">{proposals.length}</p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-4">
              <p className="text-xs uppercase tracking-wider text-slate-500">Wallet Status</p>
              <div className="mt-1 flex items-center gap-2">
                <span className={`h-2.5 w-2.5 rounded-full ${account ? "bg-emerald-400 animate-pulse" : "bg-amber-400"}`} />
                <span className="font-medium text-white text-sm">
                  {account ? shortenAddress(account) : "Not Connected"}
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Global Action Error Alert */}
        {error && (
          <div className="mb-8 flex items-center gap-3 rounded-2xl border border-red-400/20 bg-red-400/10 p-4 text-red-200">
            <AlertCircle size={20} className="shrink-0 text-red-400" />
            <p className="text-sm">{error}</p>
          </div>
        )}

        {/* SECTION 1: GROUPS */}
        <div className="mb-16">
          <div className="mb-6 flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-2xl font-bold text-white">
              <Users className="text-violet-400" size={24} />
              Active Coordination Groups
            </h3>
            <button
              onClick={refreshAll}
              className="text-xs text-slate-400 hover:text-white transition"
            >
              ↻ Refresh
            </button>
          </div>

          {loading ? (
            <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-12 text-center text-slate-400">
              Loading on-chain groups...
            </div>
          ) : groups.length === 0 ? (
            <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-12 text-center text-slate-400">
              No groups created yet. Click "New Group" above to create the first group!
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {groups.map((group) => (
                <motion.div
                  key={group.id}
                  whileHover={{ y: -4 }}
                  className="rounded-3xl border border-white/10 bg-slate-900/50 p-6 backdrop-blur-xl transition hover:border-violet-400/30 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="rounded-lg bg-violet-500/10 px-3 py-1 text-xs font-semibold text-violet-300 border border-violet-400/20">
                        Group #{group.id}
                      </span>
                      <span className="text-xs text-slate-500">
                        {group.memberCount} member{group.memberCount === 1 ? "" : "s"}
                      </span>
                    </div>

                    <h4 className="mt-4 text-xl font-bold text-white">{group.name}</h4>
                    <p className="mt-2 text-sm leading-6 text-slate-400 min-h-[48px]">
                      {group.description || "No description provided."}
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-slate-500">Creator</p>
                      <p className="font-mono text-xs text-cyan-300">{shortenAddress(group.creator)}</p>
                    </div>

                    {group.isMember ? (
                      <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 px-3.5 py-1.5 rounded-xl cursor-default select-none">
                        <CheckCircle2 size={14} /> ✓ Member
                      </span>
                    ) : (
                      <button
                        onClick={() => joinGroup(group.id)}
                        disabled={!account || actionLoading || group.isMember}
                        className="rounded-xl bg-violet-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-violet-500 disabled:opacity-40"
                      >
                        Join Group
                      </button>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* SECTION 2: PROPOSALS */}
        <div className="mb-16">
          <div className="mb-6 flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-2xl font-bold text-white">
              <Vote className="text-cyan-400" size={24} />
              On-Chain Proposals & Voting
            </h3>
          </div>

          {proposals.length === 0 ? (
            <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-12 text-center text-slate-400">
              No proposals submitted yet. Join a group and click "New Proposal" to start governance!
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2">
              {proposals.map((prop) => {
                const totalVotes = prop.yesCount + prop.noCount;
                const yesPct = totalVotes > 0 ? Math.round((prop.yesCount / totalVotes) * 100) : 0;
                const noPct = totalVotes > 0 ? Math.round((prop.noCount / totalVotes) * 100) : 0;

                // Status Badge styling
                let statusBadge = (
                  <span className="rounded-lg bg-emerald-400/10 border border-emerald-400/20 px-3 py-1 text-xs font-bold text-emerald-300 flex items-center gap-1">
                    <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" /> ACTIVE
                  </span>
                );
                if (prop.status === 1) {
                  statusBadge = (
                    <span className="rounded-lg bg-cyan-400/10 border border-cyan-400/20 px-3 py-1 text-xs font-bold text-cyan-300">
                      ✓ PASSED
                    </span>
                  );
                } else if (prop.status === 2) {
                  statusBadge = (
                    <span className="rounded-lg bg-rose-400/10 border border-rose-400/20 px-3 py-1 text-xs font-bold text-rose-300">
                      ✗ DEFEATED
                    </span>
                  );
                }

                return (
                  <motion.div
                    key={prop.id}
                    whileHover={{ y: -4 }}
                    className="rounded-3xl border border-white/10 bg-slate-900/50 p-6 backdrop-blur-xl transition hover:border-cyan-400/30 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-400">
                          Proposal #{prop.id} • Group #{prop.groupId}
                        </span>
                        {statusBadge}
                      </div>

                      <h4 className="mt-3 text-xl font-bold text-white">{prop.title}</h4>
                      <p className="mt-2 text-sm leading-6 text-slate-400 min-h-[48px]">
                        {prop.description || "No description provided."}
                      </p>

                      {/* Deadline Countdown */}
                      <div className="mt-4 flex items-center gap-2 text-xs text-slate-400">
                        <Clock size={14} className="text-cyan-400" />
                        <span>{formatDeadline(prop.deadline)}</span>
                      </div>

                      {/* Vote Progress Bars */}
                      <div className="mt-5 space-y-2">
                        <div className="flex justify-between text-xs font-medium">
                          <span className="text-emerald-400">YES: {prop.yesCount} ({yesPct}%)</span>
                          <span className="text-rose-400">NO: {prop.noCount} ({noPct}%)</span>
                        </div>
                        <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-slate-800">
                          <div
                            style={{ width: `${yesPct}%` }}
                            className="bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500"
                          />
                          <div
                            style={{ width: `${noPct}%` }}
                            className="bg-gradient-to-r from-rose-500 to-red-400 transition-all duration-500"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Action Voting Buttons */}
                    <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between">
                      <span className="text-xs text-slate-500">
                        Creator: <span className="font-mono text-cyan-300">{shortenAddress(prop.creator)}</span>
                      </span>

                      {prop.userHasVoted ? (
                        <span className="text-xs font-medium text-slate-400 bg-slate-800 px-3 py-1.5 rounded-xl">
                          ✓ Vote Recorded
                        </span>
                      ) : prop.status !== 0 ? (
                        <span className="text-xs font-medium text-slate-500">
                          Voting Closed
                        </span>
                      ) : (
                        <div className="flex gap-2">
                          <button
                            onClick={() => voteOnProposal(prop.id, true)}
                            disabled={!account || actionLoading}
                            className="flex items-center gap-1.5 rounded-xl bg-emerald-600/20 border border-emerald-400/30 px-3.5 py-1.5 text-xs font-semibold text-emerald-300 transition hover:bg-emerald-600/30 disabled:opacity-40"
                          >
                            <ThumbsUp size={14} /> Vote YES
                          </button>
                          <button
                            onClick={() => voteOnProposal(prop.id, false)}
                            disabled={!account || actionLoading}
                            className="flex items-center gap-1.5 rounded-xl bg-rose-600/20 border border-rose-400/30 px-3.5 py-1.5 text-xs font-semibold text-rose-300 transition hover:bg-rose-600/30 disabled:opacity-40"
                          >
                            <ThumbsDown size={14} /> Vote NO
                          </button>
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        {/* SECTION 3: VERIFIABLE EVENT PROVENANCE */}
        <div>
          <div className="mb-6 flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-2xl font-bold text-white">
              <Activity className="text-emerald-400" size={24} />
              Verifiable Provenance Log (On-Chain Events)
            </h3>
          </div>

          <div className="overflow-hidden rounded-3xl border border-white/10 bg-slate-900/50 backdrop-blur-xl">
            {events.length === 0 ? (
              <div className="p-8 text-center text-sm text-slate-500">
                No contract events logged yet. Perform transactions to record on-chain provenance!
              </div>
            ) : (
              <div className="divide-y divide-white/5">
                {events.slice(0, 10).map((evt, idx) => (
                  <div key={idx} className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between hover:bg-white/[0.02]">
                    <div className="flex items-center gap-3">
                      <span className="rounded-lg bg-violet-500/10 border border-violet-400/20 px-2.5 py-1 text-xs font-mono font-semibold text-violet-300">
                        {evt.type}
                      </span>
                      <span className="text-sm font-medium text-white">
                        {evt.type === "GroupCreated" && `Group #${evt.groupId} "${evt.name}" created by ${shortenAddress(evt.creator)}`}
                        {evt.type === "MemberJoined" && `Member ${shortenAddress(evt.member)} joined Group #${evt.groupId}`}
                        {evt.type === "ProposalCreated" && `Proposal #${evt.proposalId} "${evt.title}" created in Group #${evt.groupId}`}
                        {evt.type === "VoteCast" && `Voter ${shortenAddress(evt.voter)} voted ${evt.support ? "YES" : "NO"} on Proposal #${evt.proposalId}`}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 text-xs font-mono text-slate-500">
                      <span>Block #{evt.blockNumber}</span>
                      <span className="text-cyan-400">{shortenAddress(evt.txHash)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MODALS */}
      <CreateGroupModal
        isOpen={isGroupModalOpen}
        onClose={() => setIsGroupModalOpen(false)}
      />
      <CreateProposalModal
        isOpen={isProposalModalOpen}
        onClose={() => setIsProposalModalOpen(false)}
        groups={groups}
      />
    </section>
  );
}

export default WorkspaceDashboard;
