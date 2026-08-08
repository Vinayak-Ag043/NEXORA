import React, { useState } from "react";
import { Menu, X, Wallet, Check } from "lucide-react";
import { useWallet } from "../context/WalletContext";
import NexoraMark from "./NexoraMark";

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { account, connectWallet, isConnecting } = useWallet();

  const shortenAddress = (addr) => {
    if (!addr) return "";
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-slate-950/70 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        {/* Brand Logo with NexoraMark */}
        <a href="#" className="flex items-center gap-3 group">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-600/20 ring-1 ring-violet-400/30 transition group-hover:bg-violet-600/30">
            <NexoraMark size={24} showGlow />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-bold tracking-wide text-white">
              NEXORA
            </span>
            <span className="text-[10px] font-semibold tracking-widest text-violet-400 uppercase">
              Coordination Layer
            </span>
          </div>
        </a>

        {/* Desktop Links */}
        <div className="hidden items-center gap-8 md:flex">
          <a href="#features" className="text-sm text-slate-300 transition hover:text-white">
            Features
          </a>
          <a href="#how-it-works" className="text-sm text-slate-300 transition hover:text-white">
            How It Works
          </a>
          <a href="#identity" className="text-sm text-slate-300 transition hover:text-white">
            Wallet Identity
          </a>
          <a href="#workspace" className="text-sm text-slate-300 transition hover:text-white">
            DApp Workspace
          </a>
        </div>

        {/* Wallet Button */}
        <div className="hidden md:flex md:items-center">
          {!account ? (
            <button
              onClick={connectWallet}
              disabled={isConnecting}
              className="flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-600/20 transition hover:bg-violet-500 disabled:opacity-50"
            >
              <Wallet size={16} />
              {isConnecting ? "Connecting..." : "Connect Wallet"}
            </button>
          ) : (
            <div className="flex items-center gap-3 rounded-xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-2">
              <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
              <span className="font-mono text-sm text-emerald-300">
                {shortenAddress(account)}
              </span>
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="text-white md:hidden"
        >
          {menuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {menuOpen && (
        <div className="border-t border-white/10 bg-slate-950 px-6 py-6 md:hidden">
          <div className="flex flex-col gap-5">
            <a
              href="#features"
              onClick={() => setMenuOpen(false)}
              className="text-slate-300"
            >
              Features
            </a>
            <a
              href="#how-it-works"
              onClick={() => setMenuOpen(false)}
              className="text-slate-300"
            >
              How It Works
            </a>
            <a
              href="#identity"
              onClick={() => setMenuOpen(false)}
              className="text-slate-300"
            >
              Wallet Identity
            </a>
            <a
              href="#workspace"
              onClick={() => setMenuOpen(false)}
              className="text-slate-300"
            >
              DApp Workspace
            </a>
            {!account ? (
              <button
                onClick={() => {
                  connectWallet();
                  setMenuOpen(false);
                }}
                className="flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-5 py-3 font-semibold text-white"
              >
                <Wallet size={18} />
                Connect Wallet
              </button>
            ) : (
              <div className="flex items-center justify-center gap-2 rounded-xl border border-emerald-400/20 bg-emerald-500/10 py-3 font-mono text-sm text-emerald-300">
                <Check size={16} />
                {shortenAddress(account)}
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;
