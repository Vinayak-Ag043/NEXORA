import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useToast } from '../context/ToastContext';
import { useWallet } from '../context/WalletContext';

const principles = [
  ['01', 'Trustless collaboration', 'Coordinate tasks and decisions without a central administrator owning the group.'],
  ['02', 'Permissionless consensus', 'Members participate through their wallets under transparent, shared group rules.'],
  ['03', 'Verifiable provenance', 'Important coordination actions can be independently verified on Ethereum.'],
];

export default function LandingPage() {
  const { notify } = useToast();
  const { account, connecting, connect } = useWallet();

  async function handleConnect() {
    try {
      await connect();
      notify('Wallet connected. Nexora only uses your public wallet address.', 'success');
    } catch (error) {
      notify(error.message, 'error');
    }
  }

  return (
    <main>
      <Navbar onConnect={handleConnect} account={account} connecting={connecting} />
      <section className="hero" aria-labelledby="hero-title">
        <div className="hero-glow hero-glow--one" /><div className="hero-glow hero-glow--two" />
        <div className="hero-copy">
          <p className="eyebrow">Decentralized coordination layer</p>
          <h1 id="hero-title">Coordinate without<br /><em>surrendering control.</em></h1>
          <p className="hero-description">A permissionless coordination layer for groups to make decisions, manage tasks and establish verifiable on-chain provenance.</p>
          <div className="hero-actions">
            <Link className="button button--primary" to="/app">Launch Nexora <span>→</span></Link>
            <a className="button button--text" href="#how-it-works">Explore how it works <span>↓</span></a>
          </div>
        </div>
        <div className="coordination-orbit" aria-label="Nexora coordination flow">
          <div className="orbit-line orbit-line--a" /><div className="orbit-line orbit-line--b" />
          <div className="orbit-core"><span>NX</span><small>Consensus</small></div>
          <div className="orbit-node node-wallet"><b>01</b> Wallet</div>
          <div className="orbit-node node-group"><b>02</b> Group</div>
          <div className="orbit-node node-vote"><b>03</b> Vote</div>
          <div className="orbit-node node-proof"><b>04</b> Proof</div>
        </div>
      </section>
      <section className="process" id="how-it-works" aria-labelledby="process-title">
        <p className="eyebrow">A shared source of truth</p>
        <h2 id="process-title">From intent to evidence.</h2>
        <div className="process-grid">
          {['Connect', 'Coordinate', 'Vote', 'Verify'].map((item, index) => <div className="process-step" key={item}><span>0{index + 1}</span><strong>{item}</strong><i>→</i></div>)}
        </div>
      </section>
      <section className="principles" id="principles" aria-labelledby="principles-title">
        <div className="section-heading"><p className="eyebrow">Built for groups that value agency</p><h2 id="principles-title">The coordination layer,<br />not the gatekeeper.</h2></div>
        <div className="principle-list">
          {principles.map(([number, title, description]) => <article className="principle-card" key={number}><span>{number}</span><h3>{title}</h3><p>{description}</p><div className="card-arrow">↗</div></article>)}
        </div>
      </section>
      <section className="privacy" id="privacy">
        <div><p className="eyebrow">Privacy by design</p><h2>Your wallet is a participation key—not a profile.</h2></div>
        <p>Nexora avoids collecting names, email addresses, phone numbers, or government identity. Wallet activity is public and verifiable on Ethereum; your real-world identity does not need to be.</p>
      </section>
      <footer><span>© 2026 NEXORA</span><span>Built for decentralized coordination</span></footer>
    </main>
  );
}
