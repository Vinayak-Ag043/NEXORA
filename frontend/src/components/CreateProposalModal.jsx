import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, AlertCircle } from "lucide-react";
import { useNexora } from "../hooks/useNexora";
import NexoraMark from "./NexoraMark";

function CreateProposalModal({ isOpen, onClose, groups }) {
  const { createProposal, actionLoading, error } = useNexora();
  const [groupId, setGroupId] = useState(groups[0]?.id || 1);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [durationMinutes, setDurationMinutes] = useState(60);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      const durationSeconds = durationMinutes * 60;
      await createProposal(Number(groupId), title.trim(), description.trim(), durationSeconds);
      setTitle("");
      setDescription("");
      onClose();
    } catch (err) {
      console.error(err);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-white/10 bg-slate-900 p-7 shadow-2xl backdrop-blur-xl"
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute right-5 top-5 text-slate-400 transition hover:text-white"
          >
            <X size={20} />
          </button>

          {/* Header */}
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-500/10 border border-cyan-400/20">
              <NexoraMark size={26} showGlow />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Create On-Chain Proposal</h3>
              <p className="text-sm text-slate-400">Submit a proposal to your group for voting.</p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                Select Target Group *
              </label>
              <select
                value={groupId}
                onChange={(e) => setGroupId(e.target.value)}
                className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950/70 px-4 py-3 text-white outline-none focus:border-cyan-400/50"
              >
                {groups.map((g) => (
                  <option key={g.id} value={g.id} className="bg-slate-900 text-white">
                    Group #{g.id}: {g.name} ({g.memberCount} members)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                Proposal Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={128}
                required
                placeholder="e.g. Approve Developer Grant"
                className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950/70 px-4 py-3 text-white outline-none placeholder:text-slate-600 focus:border-cyan-400/50"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength={2048}
                rows={3}
                placeholder="Detailed proposal specifications..."
                className="mt-2 w-full resize-none rounded-xl border border-white/10 bg-slate-950/70 px-4 py-3 text-white outline-none placeholder:text-slate-600 focus:border-cyan-400/50"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                Voting Duration (Minutes) *
              </label>
              <input
                type="number"
                min={5}
                max={43200}
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(e.target.value)}
                required
                className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950/70 px-4 py-3 text-white outline-none focus:border-cyan-400/50"
              />
              <p className="mt-1 text-xs text-slate-500">Must be between 5 minutes and 30 days (43,200 mins).</p>
            </div>

            {error && (
              <div className="flex items-center gap-2 rounded-xl border border-red-400/20 bg-red-400/5 p-3 text-sm text-red-300">
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-white/10 bg-white/5 px-5 py-3 font-medium text-slate-300 transition hover:bg-white/10"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!title.trim() || actionLoading}
                className="rounded-xl bg-cyan-600 px-6 py-3 font-semibold text-white transition hover:bg-cyan-500 disabled:opacity-40"
              >
                {actionLoading ? "Submitting..." : "Submit Proposal"}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

export default CreateProposalModal;
