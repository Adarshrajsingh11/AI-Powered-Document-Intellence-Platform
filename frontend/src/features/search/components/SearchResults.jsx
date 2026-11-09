import { Link } from 'react-router-dom';
import EmptyState from '../../../components/feedback/EmptyState';

export default function SearchResults({ results }) {
  if (!results.length) {
    return <EmptyState title="No matches" description="Try rephrasing your query." />;
  }
  return (
    <div className="results">
      {results.map((r, i) => (
        <div key={r.chunkId ?? `${r.documentId}-${i}`} className="card result">
          <div className="result-head">
            <Link to={`/documents/${r.documentId}`}>{r.documentName || 'Document'}</Link>
            {r.page != null && <span className="muted">p. {r.page}</span>}
            {r.score != null && <span className="badge badge-ready">{(r.score * 100).toFixed(0)}% match</span>}
          </div>
          <p>{r.text ?? r.snippet}</p>
        </div>
      ))}
    </div>
  );
}
