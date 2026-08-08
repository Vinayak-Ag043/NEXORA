import React from "react";

/**
 * NexoraMark - Minimalist Web3-native Logo Component
 * Combines 3 Core Concepts:
 * 1. Shield (Security & Protection)
 * 2. Fingerprint (Verifiable Identity & Provenance)
 * 3. Interconnected Chain Links (Decentralized Coordination)
 */
export default function NexoraMark({
  size = 32,
  className = "",
  showGlow = false,
  ariaLabel = "Nexora Logo",
}) {
  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      {showGlow && (
        <div className="absolute inset-0 rounded-full bg-violet-500/30 blur-md pointer-events-none" />
      )}
      <svg
        width={size}
        height={size}
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-label={ariaLabel}
        className="relative shrink-0"
      >
        {/* Outer Shield Geometry */}
        <path
          d="M16 3L27 7V16.5C27 22.8 22.3 27.7 16 29.5C9.7 27.7 5 22.8 5 16.5V7L16 3Z"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-violet-400"
        />

        {/* Inner Fingerprint Provenance Arcs */}
        <path
          d="M16 8C13.2 8 11 10.2 11 13V17.5"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          className="text-cyan-300"
        />
        <path
          d="M16 11.5C14.6 11.5 13.5 12.6 13.5 14V19"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          className="text-violet-300"
        />

        {/* Interconnected Coordination Chain Loops */}
        <path
          d="M16 15.5C17.4 15.5 18.5 16.6 18.5 18V21.5"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          className="text-cyan-300"
        />
        <path
          d="M21 13V17.5C21 20.3 18.8 22.5 16 22.5"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          className="text-teal-300"
        />

        {/* Central Provenance Node */}
        <circle cx="16" cy="16" r="1.5" fill="currentColor" className="text-emerald-400 animate-pulse" />
      </svg>
    </div>
  );
}
