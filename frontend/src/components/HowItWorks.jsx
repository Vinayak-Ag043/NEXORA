import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldCheck,
  Layers,
  CheckCircle2,
  XCircle,
  Copy,
  Check,
  RefreshCw,
  AlertTriangle,
  Sparkles,
  Edit3
} from "lucide-react";
import NexoraMark from "./NexoraMark";

async function generateHash(text) {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

function HowItWorks() {
  const [inputText, setInputText] = useState("");
  const [verifyText, setVerifyText] = useState("");
  const [proof, setProof] = useState("");
  const [verificationHash, setVerificationHash] = useState("");
  const [verificationResult, setVerificationResult] = useState(null); // null | "verified" | "tampered"
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    if (!inputText.trim()) return;
    setLoading(true);
    setVerificationResult(null);
    setVerificationHash("");

    const hash = await generateHash(inputText);
    setProof(hash);
    setVerifyText(inputText); // Initially populate verification input with exact original content
    setLoading(false);
  };

  const handleVerify = async () => {
    if (!verifyText.trim() || !proof) return;
    setLoading(true);

    const currentHash = await generateHash(verifyText);
    setVerificationHash(currentHash);

    if (currentHash === proof) {
      setVerificationResult("verified");
    } else {
      setVerificationResult("tampered");
    }
    setLoading(false);
  };

  const handleSimulateTampering = () => {
    if (!verifyText) return;
    // Alter the payload slightly to demonstrate instant tamper detection
    setVerifyText((prev) => prev + " [MODIFIED]");
    setVerificationResult(null);
    setVerificationHash("");
  };

  const handleReset = () => {
    setInputText("");
    setVerifyText("");
    setProof("");
    setVerificationHash("");
    setVerificationResult(null);
    setCopied(false);
  };

  const copyProof = async () => {
    if (!proof) return;
    try {
      await navigator.clipboard.writeText(proof);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <section
      id="how-it-works"
      className="relative overflow-hidden bg-slate-950 px-6 py-28"
    >
      {/* Ambient Lighting */}
      <div className="pointer-events-none absolute left-1/2 top-1/3 h-96 w-96 -translate-x-1/2 rounded-full bg-cyan-600/10 blur-3xl" />

      <div className="mx-auto max-w-6xl">
        {/* Section Heading */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mx-auto max-w-3xl text-center"
        >
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">
            <NexoraMark size={16} />
            Cryptographic Integrity & Tamper Detection
          </div>

          <h2 className="mt-2 text-4xl font-bold text-white sm:text-5xl">
            Don't Trust.
            <br />
            <span className="bg-gradient-to-r from-violet-400 via-cyan-400 to-teal-300 bg-clip-text text-transparent">
              Verify On-Chain Provenance.
            </span>
          </h2>

          <p className="mt-5 text-base leading-7 text-slate-400">
            Interactive Tamper-Detection Sandbox: Generate a SHA-256 fingerprint for proposal content, edit even a single character, and observe how cryptographic hashes immediately detect unauthorized alterations.
          </p>

          <p className="mt-3 text-xs italic text-slate-500">
            * Local cryptographic demonstration — Nexora's actual proposals and voting records are stored and verified on Ethereum Sepolia.
          </p>
        </motion.div>

        {/* Control Bar: Reset */}
        {(proof || inputText || verifyText) && (
          <div className="mt-8 flex justify-end">
            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-medium text-slate-400 transition hover:bg-white/10 hover:text-white"
            >
              <RefreshCw size={14} /> Reset Sandbox
            </button>
          </div>
        )}

        {/* Interactive Cards Grid */}
        <div className="mt-6 grid gap-8 lg:grid-cols-2">
          {/* CARD 1: Original Proposal & Fingerprint Generation */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="flex flex-col justify-between rounded-3xl border border-white/10 bg-white/[0.03] p-7 backdrop-blur-xl"
          >
            <div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-500/10 border border-violet-400/20">
                    <Layers className="text-violet-300" size={22} />
                  </div>
                  <div>
                    <p className="font-semibold text-white">1. Original Proposal Payload</p>
                    <p className="text-xs text-slate-400">Enter source content to generate fingerprint</p>
                  </div>
                </div>
                <span className="rounded-full bg-violet-500/10 px-3 py-1 text-[10px] font-semibold text-violet-300 border border-violet-400/20">
                  STEP 1
                </span>
              </div>

              <textarea
                value={inputText}
                onChange={(e) => {
                  setInputText(e.target.value);
                }}
                placeholder="e.g. Proposal #1 — Allocate 10 ETH for Community Developer Grants"
                className="mt-6 h-32 w-full resize-none rounded-2xl border border-white/10 bg-slate-900/80 p-4 text-sm text-white outline-none placeholder:text-slate-600 focus:border-violet-400/50 font-sans"
              />

              <button
                onClick={handleGenerate}
                disabled={!inputText.trim() || loading}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-violet-600 px-5 py-3.5 text-sm font-semibold text-white shadow-lg shadow-violet-600/20 transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Sparkles size={16} />
                {loading ? "Computing Hash..." : "Generate Cryptographic Fingerprint"}
              </button>

              {/* Display Generated Fingerprint */}
              {proof && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6 rounded-2xl border border-violet-400/20 bg-slate-900/90 p-4"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-violet-400">
                      Original Fingerprint (SHA-256)
                    </span>
                    <button
                      onClick={copyProof}
                      className="flex items-center gap-1 text-xs text-slate-400 transition hover:text-white"
                      title="Copy Hash"
                    >
                      {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                      <span>{copied ? "Copied" : "Copy"}</span>
                    </button>
                  </div>
                  <p className="mt-2 break-all font-mono text-xs leading-5 text-cyan-300">
                    {proof}
                  </p>
                </motion.div>
              )}
            </div>
          </motion.div>

          {/* CARD 2: Tamper Verification Sandbox */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className={`flex flex-col justify-between rounded-3xl border p-7 backdrop-blur-xl transition-all duration-300 ${
              proof
                ? "border-cyan-400/30 bg-white/[0.03]"
                : "border-white/10 bg-white/[0.01] opacity-60"
            }`}
          >
            <div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-500/10 border border-cyan-400/20">
                    <ShieldCheck className="text-cyan-300" size={22} />
                  </div>
                  <div>
                    <p className="font-semibold text-white">2. Tamper Detection Sandbox</p>
                    <p className="text-xs text-slate-400">Verify content against original hash</p>
                  </div>
                </div>
                <span className="rounded-full bg-cyan-500/10 px-3 py-1 text-[10px] font-semibold text-cyan-300 border border-cyan-400/20">
                  STEP 2
                </span>
              </div>

              {!proof ? (
                <div className="mt-6 flex h-48 flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 bg-slate-900/40 p-6 text-center text-slate-500">
                  <Edit3 size={28} className="mb-2 text-slate-600" />
                  <p className="text-sm">Generate a fingerprint in Step 1 to unlock the verification sandbox.</p>
                </div>
              ) : (
                <>
                  <textarea
                    value={verifyText}
                    onChange={(e) => {
                      setVerifyText(e.target.value);
                      setVerificationResult(null);
                      setVerificationHash("");
                    }}
                    placeholder="Content to verify..."
                    className="mt-6 h-32 w-full resize-none rounded-2xl border border-white/10 bg-slate-900/80 p-4 text-sm text-white outline-none placeholder:text-slate-600 focus:border-cyan-400/50 font-sans"
                  />

                  {/* Tamper Demo Helper Button */}
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-[11px] text-slate-400">
                      Tip: Edit text above or simulate tampering to test detection.
                    </span>
                    <button
                      onClick={handleSimulateTampering}
                      className="flex items-center gap-1.5 text-xs font-medium text-amber-400 transition hover:text-amber-300"
                    >
                      <AlertTriangle size={13} />
                      Simulate Tampering
                    </button>
                  </div>

                  <button
                    onClick={handleVerify}
                    disabled={!verifyText.trim() || loading}
                    className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-cyan-400/30 bg-cyan-400/10 px-5 py-3.5 text-sm font-semibold text-cyan-300 transition hover:bg-cyan-400/20 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <ShieldCheck size={16} />
                    {loading ? "Hashing Content..." : "Verify Proof Integrity"}
                  </button>
                </>
              )}
            </div>
          </motion.div>
        </div>

        {/* VERIFICATION RESULTS & COMPARISON DISPLAY */}
        <AnimatePresence>
          {verificationResult && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.98 }}
              className={`mt-10 overflow-hidden rounded-3xl border p-8 backdrop-blur-xl ${
                verificationResult === "verified"
                  ? "border-emerald-400/30 bg-emerald-500/[0.06]"
                  : "border-rose-500/40 bg-rose-500/[0.08]"
              }`}
            >
              {/* Outcome Header Banner */}
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                  <div
                    className={`flex h-14 w-14 items-center justify-center rounded-2xl ${
                      verificationResult === "verified"
                        ? "bg-emerald-400/20 text-emerald-400 border border-emerald-400/30"
                        : "bg-rose-500/20 text-rose-400 border border-rose-500/30 animate-pulse"
                    }`}
                  >
                    {verificationResult === "verified" ? (
                      <CheckCircle2 size={32} />
                    ) : (
                      <XCircle size={32} />
                    )}
                  </div>
                  <div>
                    <h3
                      className={`text-2xl font-bold tracking-tight ${
                        verificationResult === "verified"
                          ? "text-emerald-300"
                          : "text-rose-300"
                      }`}
                    >
                      {verificationResult === "verified"
                        ? "✓ INTEGRITY VERIFIED"
                        : "✕ TAMPER DETECTED"}
                    </h3>
                    <p className="mt-1 text-sm text-slate-300">
                      {verificationResult === "verified"
                        ? "The content matches the original cryptographic fingerprint."
                        : "The content does not match the original fingerprint."}
                    </p>
                  </div>
                </div>
              </div>

              {/* Side-by-Side Fingerprint Hash Comparison */}
              <div className="mt-8 grid gap-4 md:grid-cols-2 pt-6 border-t border-white/10">
                <div className="rounded-2xl border border-white/10 bg-slate-950/80 p-4">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Original Fingerprint:
                  </p>
                  <p className="mt-2 break-all font-mono text-xs leading-5 text-violet-300">
                    {proof}
                  </p>
                </div>

                <div
                  className={`rounded-2xl border p-4 ${
                    verificationResult === "verified"
                      ? "border-emerald-400/20 bg-slate-950/80"
                      : "border-rose-400/30 bg-slate-950/80"
                  }`}
                >
                  <p
                    className={`text-[10px] font-bold uppercase tracking-wider ${
                      verificationResult === "verified"
                        ? "text-emerald-400"
                        : "text-rose-400"
                    }`}
                  >
                    Current Content Fingerprint:
                  </p>
                  <p
                    className={`mt-2 break-all font-mono text-xs leading-5 ${
                      verificationResult === "verified"
                        ? "text-emerald-300"
                        : "text-rose-300"
                    }`}
                  >
                    {verificationHash}
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}

export default HowItWorks;
