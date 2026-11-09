import { Link } from 'react-router-dom';

export default function SourceCitation({ source, index }) {
  return (
    <div className="citation">
      <span className="citation-index">[{index + 1}]</span>
      <div>
        <div>
          {source.documentId ? (
            <Link to={`/documents/${source.documentId}`}>{source.documentName || 'Document'}</Link>
          ) : (
            source.documentName || 'Source'
          )}
          {source.page != null && <span className="muted"> · p. {source.page}</span>}
        </div>
        {source.snippet && <small className="muted">{source.snippet}</small>}
      </div>
    </div>
  );
}
