import { Link } from 'react-router-dom';
import NexoraMark from '../components/NexoraMark';

export default function PlaceholderPage() {
  return (
    <main className="placeholder-page">
      <NexoraMark />
      <p className="eyebrow">Coordination workspace</p>
      <h1>Your group workspace is next.</h1>
      <p>Group creation, proposals, voting and verifiable activity will appear here once the on-chain coordination layer is integrated.</p>
      <Link className="button button--primary" to="/">Back to home</Link>
    </main>
  );
}
