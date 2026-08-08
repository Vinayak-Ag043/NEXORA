import React from "react";
import { motion } from "framer-motion";
import { Users, Vote, Link2, ArrowRight } from "lucide-react";
import { useWallet } from "../context/WalletContext";
import NexoraMark from "./NexoraMark";

function Hero() {
  const { account, connectWallet } = useWallet();

  const scrollToWorkspace = () => {
    const el = document.getElementById("workspace");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative min-h-screen overflow-hidden bg-slate-950 pt-36 lg:pt-40">
      {/* Background Glow */}
      <div className="pointer-events-none absolute left-1/2 top-1/3 h-96 w-96 -translate-x-1/2 rounded-full bg-violet-600/20 blur-3xl" />

      <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-6 py-16 lg:min-h-[calc(100vh-88px)] lg:grid-cols-2">
        {/* LEFT COLUMN */}
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
        >
          {/* Badge */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-violet-400/20 bg-violet-500/10 px-4 py-2 text-sm text-violet-300">
            <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
            Decentralized Coordination Layer • Verifiable On-Chain Provenance
          </div>

          {/* Heading */}
          <h1 className="max-w-3xl text-5xl font-bold leading-tight tracking-tight text-white sm:text-6xl lg:text-7xl">
            Coordinate Your{" "}
            <span className="bg-gradient-to-r from-violet-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
              Groups.
            </span>
            <br />
            Govern Your{" "}
            <span className="bg-gradient-to-r from-cyan-400 to-teal-300 bg-clip-text text-transparent">
              Decisions.
            </span>
            <br />
            Preserve Your{" "}
            <span className="bg-gradient-to-r from-purple-400 to-violet-300 bg-clip-text text-transparent">
              Voice.
            </span>
          </h1>

          {/* Description */}
          <p className="mt-7 max-w-xl text-lg leading-8 text-slate-400">
            NEXORA gives groups a trustless coordination layer to create proposals,
            vote on-chain, and maintain tamper-proof decision history — without relying
            on a centralized administrator.
          </p>

          {/* Buttons */}
          <div className="mt-9 flex flex-wrap gap-4">
            <button
              onClick={scrollToWorkspace}
              className="group flex items-center gap-2 rounded-xl bg-violet-600 px-6 py-3.5 font-semibold text-white shadow-lg shadow-violet-600/20 transition hover:bg-violet-500"
            >
              Launch DApp Workspace
              <ArrowRight
                className="transition-transform group-hover:translate-x-1"
                size={18}
              />
            </button>

            {!account ? (
              <button
                onClick={connectWallet}
                className="rounded-xl border border-white/10 bg-white/5 px-6 py-3.5 font-semibold text-white backdrop-blur transition hover:bg-white/10"
              >
                Connect Wallet
              </button>
            ) : (
              <a
                href="#features"
                className="rounded-xl border border-white/10 bg-white/5 px-6 py-3.5 font-semibold text-white backdrop-blur transition hover:bg-white/10"
              >
                Explore Architecture
              </a>
            )}
          </div>

          {/* Trust indicators */}
          <div className="mt-10 flex flex-wrap gap-6 text-sm text-slate-500">
            <span className="flex items-center gap-2">
              <Users size={17} className="text-emerald-400" />
              Permissionless Groups
            </span>
            <span className="flex items-center gap-2">
              <Vote size={17} className="text-violet-400" />
              1-Wallet-1-Vote
            </span>
            <span className="flex items-center gap-2">
              <Link2 size={17} className="text-cyan-400" />
              Ethereum Verified
            </span>
          </div>
        </motion.div>

        {/* RIGHT COLUMN - VISUAL CARD */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1 }}
          className="relative flex items-center justify-center lg:-translate-y-6"
        >
          {/* Outer Glow */}
          <div className="absolute h-80 w-80 rounded-full bg-violet-600/20 blur-3xl" />

          {/* Rotating Ring */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{
              duration: 25,
              repeat: Infinity,
              ease: "linear",
            }}
            className="absolute h-80 w-80 rounded-full border border-dashed border-violet-400/30"
          />

          {/* Main Glass Card */}
          <div className="relative flex h-72 w-72 items-center justify-center rounded-[3rem] border border-white/10 bg-white/5 shadow-2xl shadow-violet-900/30 backdrop-blur-xl">
            {/* Inner Floating Nexora Mark Emblem */}
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="relative flex h-40 w-40 items-center justify-center rounded-[2.5rem] border border-violet-400/30 bg-violet-500/10 shadow-xl shadow-violet-600/20"
            >
              <NexoraMark size={88} showGlow />
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export default Hero;
