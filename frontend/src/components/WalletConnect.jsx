import React, { useState } from "react";
import { Wallet, Copy, Check } from "lucide-react";
import { useWallet } from "../context/WalletContext";
import NexoraMark from "./NexoraMark";

function WalletConnect() {
  const { account, connectWallet, isConnecting, chainId } = useWallet();
  const [copied, setCopied] = useState(false);

  const shortenAddress = (value) => {
    if (!value) return "Wallet not connected";
    return `${value.slice(0, 6)}...${value.slice(-4)}`;
  };

  const copyAddress = async () => {
    if (!account) return;
    await navigator.clipboard.writeText(account);
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 1500);
  };

  return (
    <section id="identity" className="bg-slate-950 px-6 py-28">
      <div className="mx-auto max-w-4xl">
        <div className="rounded-3xl border border-violet-400/20 bg-violet-500/[0.04] p-8 text-center backdrop-blur-xl sm:p-12">
          {/* Icon with NexoraMark */}
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-500/10 border border-violet-400/20">
            <NexoraMark size={36} showGlow />
          </div>

          {/* Heading */}
          <p className="mt-6 text-sm font-semibold uppercase tracking-[0.25em] text-cyan-400">
            Permissionless Identity
          </p>

          <h2 className="mt-4 text-4xl font-bold text-white sm:text-5xl">
            Your Identity.
            <br />
            <span className="bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">
              Your Wallet.
            </span>
          </h2>

          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-400">
            Connect your Web3 wallet to manage groups, submit proposals, and vote on-chain.
            Nexora never relies on usernames, passwords, or centralized databases.
          </p>

          {/* Not Connected */}
          {!account ? (
            <button
              onClick={connectWallet}
              disabled={isConnecting}
              className="mt-8 rounded-xl bg-violet-600 px-8 py-4 font-semibold text-white shadow-lg shadow-violet-600/20 transition hover:bg-violet-500 disabled:opacity-50"
            >
              {isConnecting ? "Connecting Wallet..." : "Connect Wallet"}
            </button>
          ) : (
            /* Connected */
            <div className="mx-auto mt-8 max-w-md rounded-2xl border border-emerald-400/20 bg-emerald-400/5 p-5">
              <div className="flex items-center justify-center gap-2 text-emerald-300">
                <Check size={18} />
                <span className="font-semibold">Wallet Connected</span>
              </div>

              <div className="mt-4 flex items-center justify-between rounded-xl border border-white/10 bg-slate-900/70 p-4">
                <span className="font-mono text-sm text-cyan-300">
                  {shortenAddress(account)}
                </span>

                <button
                  onClick={copyAddress}
                  className="text-slate-500 transition hover:text-white"
                  title="Copy wallet address"
                >
                  {copied ? <Check size={17} /> : <Copy size={17} />}
                </button>
              </div>

              <p className="mt-4 text-sm text-slate-500">
                Network Chain ID: {chainId || "Connected"} • Ready to interact on-chain
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default WalletConnect;
