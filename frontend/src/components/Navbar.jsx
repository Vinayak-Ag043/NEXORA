import { Link } from 'react-router-dom';
import NexoraMark from './NexoraMark';

export default function Navbar({ onConnect, account, connecting }) {
  const label = connecting ? 'Connecting…' : account ? `${account.slice(0, 6)}…${account.slice(-4)}` : 'Connect wallet';
  return (
    <header className="nav-shell">
      <nav className="nav" aria-label="Primary navigation">
        <Link className="brand" to="/" aria-label="Nexora home"><NexoraMark /> NEXORA</Link>
        <div className="nav-links"><a href="#principles">Principles</a><a href="#how-it-works">How it works</a><a href="#privacy">Privacy</a></div>
        <button className="button button--quiet wallet-button" onClick={onConnect} disabled={connecting}>{label} <span>↗</span></button>
      </nav>
    </header>
  );
}
