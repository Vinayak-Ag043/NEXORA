import React from "react";
import { WalletProvider } from "./context/WalletContext";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Pillars from "./components/Pillars";
import HowItWorks from "./components/HowItWorks";
import WalletConnect from "./components/WalletConnect";
import WorkspaceDashboard from "./components/WorkspaceDashboard";
import NexoraMark from "./components/NexoraMark";

function App() {
  return (
    <WalletProvider>
      <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-violet-500 selection:text-white">
        {/* Fixed Navigation Header */}
        <Navbar />

        {/* Hero Section */}
        <Hero />

        {/* Features & Pillars */}
        <Pillars />

        {/* Cryptographic Verification & How It Works */}
        <HowItWorks />

        {/* Wallet Connection & Self-Sovereign Identity */}
        <WalletConnect />

        {/* Interactive DApp Workspace (Groups, Proposals, Voting, Provenance Logs) */}
        <WorkspaceDashboard />

        {/* Footer */}
        <footer className="border-t border-white/10 bg-slate-950 py-10 text-center text-xs text-slate-500">
          <div className="mx-auto max-w-7xl px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <NexoraMark size={20} />
              <span className="font-bold text-white tracking-wider">NEXORA</span>
              <span>• Decentralized Coordination Layer</span>
            </div>
            <p>© 2026 Nexora. All smart contract execution powered by Ethereum.</p>
          </div>
        </footer>
      </div>
    </WalletProvider>
  );
}

export default App;
