import React, { useState } from "react";
import { motion } from "framer-motion";
import { ShieldCheck, Layers, CheckCircle2, XCircle, Copy } from "lucide-react";

async function generateHash(text) {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

function HowItWorks() {
  const [inputText, setInputText] = useState("");
  const [proof, setProof] = useState("");
  const [verified, setVerified] = useState(null);
  const [loading, setLoading] = useState(false);

  const createProof = async () => {
    if (!inputText.trim()) return;
    setLoading(true);
    setVerified(null);
    const hash = await generateHash(inputText);
    setProof(hash);
    setLoading(false);
  };

  const verifyProof = async () => {
    if (!inputText.trim() || !proof) return;
    setLoading(true);
    const currentHash = await generateHash(inputText);
    setVerified(currentHash === proof);
    setLoading(false);
  };

  const copyProof = async () => {
    if (proof) {
      await navigator.clipboard.writeText(proof);
    }
  };

  return (
    <section
      id="how-it-works"
      className="relative overflow-hidden bg-slate-950 px-6 py-28"
    >
      <div className="mx-auto max-w-6xl">
        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mx-auto max-w-3xl text-center"
        >
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-cyan-400">
            Cryptographic Verification & Provenance
          </p>

          <h2 className="mt-4 text-4xl font-bold text-white sm:text-5xl">
            Don't Trust.
            <br />
            <span className="bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">
              Verify On-Chain.
            </span>
          </h2>

          <p className="mt-6 text-lg leading-8 text-slate-400">
            Nexora records immutable smart contract logs on Ethereum. Test proposal data integrity below using cryptographic hashing.
          </p>
        </motion.div>

        {/* Interactive Cards */}
        <div className="mt-16 grid gap-6 lg:grid-cols-[1fr_auto_1fr] lg:items-center">
          {/* Input Card */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="rounded-3xl border border-white/10 bg-white/[0.03] p-7 backdrop-blur-xl"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-500/10">
                <Layers className="text-violet-300" />
              </div>

              <div>
                <p className="font-semibold text-white">Proposal Content</p>
                <p className="text-sm text-slate-500">Enter title or payload</p>
              </div>
            </div>

            <textarea
              value={inputText}
              onChange={(e) => {
                setInputText(e.target.value);
                setVerified(null);
              }}
              placeholder="Example: Proposal #1 — Allocate 10 ETH for Community Treasury"
              className="mt-6 h-32 w-full resize-none rounded-2xl border border-white/10 bg-slate-900/70 p-4 text-white outline-none placeholder:text-slate-600 focus:border-violet-400/50"
            />

            <button
              onClick={createProof}
              disabled={!inputText.trim() || loading}
              className="mt-4 w-full rounded-xl bg-violet-600 px-5 py-3 font-semibold text-white transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {loading ? "Generating..." : "Generate Cryptographic Fingerprint"}
            </button>
          </motion.div>

          {/* Arrow */}
          <div className="hidden text-3xl text-violet-400 lg:block">→</div>

          {/* Proof Card */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="rounded-3xl border border-white/10 bg-white/[0.03] p-7 backdrop-blur-xl"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-500/10">
                <ShieldCheck className="text-cyan-300" />
              </div>

              <div>
                <p className="font-semibold text-white">SHA-256 Provenance Proof</p>
                <p className="text-sm text-slate-500">Immutable hash</p>
              </div>
            </div>

            <div className="mt-6 min-h-32 rounded-2xl border border-white/10 bg-slate-900/70 p-4">
              {proof ? (
                <div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-xs uppercase tracking-wider text-slate-500">
                      SHA-256
                    </span>
                    <button
                      onClick={copyProof}
                      className="text-slate-500 transition hover:text-white"
                      title="Copy proof"
                    >
                      <Copy size={16} />
                    </button>
                  </div>
                  <p className="mt-4 break-all font-mono text-sm leading-6 text-cyan-300">
                    {proof}
                  </p>
                </div>
              ) : (
                <div className="flex h-full min-h-24 items-center justify-center text-center text-sm text-slate-600">
                  Your cryptographic proof will appear here.
                </div>
              )}
            </div>

            <button
              onClick={verifyProof}
              disabled={!proof || loading}
              className="mt-4 w-full rounded-xl border border-cyan-400/20 bg-cyan-400/10 px-5 py-3 font-semibold text-cyan-300 transition hover:bg-cyan-400/20 disabled:cursor-not-allowed disabled:opacity-30"
            >
              Verify Proof Integrity
            </button>
          </motion.div>
        </div>

        {/* Verification Result */}
        {verified !== null && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mx-auto mt-8 flex max-w-2xl items-center gap-4 rounded-2xl border p-5 ${
              verified
                ? "border-emerald-400/20 bg-emerald-400/5"
                : "border-red-400/20 bg-red-400/5"
            }`}
          >
            {verified ? (
              <CheckCircle2 className="text-emerald-400" />
            ) : (
              <XCircle className="text-red-400" />
            )}

            <div>
              <p
                className={`font-semibold ${
                  verified ? "text-emerald-300" : "text-red-300"
                }`}
              >
                {verified ? "Proof Verified Intact" : "Verification Failed"}
              </p>

              <p className="mt-1 text-sm text-slate-400">
                {verified
                  ? "The proposal content matches the registered cryptographic hash."
                  : "The proposal content has been modified. Its fingerprint no longer matches."}
              </p>
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
}

export default HowItWorks;
