import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, AlertCircle } from "lucide-react";
import { useNexora } from "../hooks/useNexora";
import NexoraMark from "./NexoraMark";

function CreateGroupModal({ isOpen, onClose }) {
  const { createGroup, actionLoading, error } = useNexora();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      await createGroup(name.trim(), description.trim());
      setName("");
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
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute right-5 top-5 text-slate-400 transition hover:text-white"
          >
            <X size={20} />
          </button>

          {/* Header */}
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-500/10 border border-violet-400/20">
              <NexoraMark size={26} showGlow />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Create New Group</h3>
              <p className="text-sm text-slate-400">Initialize a trustless coordination group on-chain.</p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                Group Name *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={64}
                required
                placeholder="e.g. Ethereum Builders Guild"
                className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950/70 px-4 py-3 text-white outline-none placeholder:text-slate-600 focus:border-violet-400/50"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength={512}
                rows={3}
                placeholder="Brief purpose of this group..."
                className="mt-2 w-full resize-none rounded-xl border border-white/10 bg-slate-950/70 px-4 py-3 text-white outline-none placeholder:text-slate-600 focus:border-violet-400/50"
              />
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
                disabled={!name.trim() || actionLoading}
                className="rounded-xl bg-violet-600 px-6 py-3 font-semibold text-white transition hover:bg-violet-500 disabled:opacity-40"
              >
                {actionLoading ? "Deploying..." : "Create Group"}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

export default CreateGroupModal;
