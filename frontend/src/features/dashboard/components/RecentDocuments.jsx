import { Link } from 'react-router-dom';
import DocumentStatus from '../../documents/components/DocumentStatus';
import EmptyState from '../../../components/feedback/EmptyState';
import { docId, docName } from '../../documents/documentService';
import { formatDate } from '../../../utils/formatDate';

export default function RecentDocuments({ documents }) {
  if (!documents.length) {
    return <EmptyState title="Nothing here yet" description="Upload a document to see it here." action={<Link to="/documents" className="btn btn-primary">Upload document</Link>} />;
  }
  return (
    <div className="card">
      <h3>Recent documents</h3>
      <ul className="list">
        {documents.slice(0, 5).map((d) => (
          <li key={docId(d)}>
            <Link to={`/documents/${docId(d)}`}>{docName(d)}</Link>
            <span className="muted">{formatDate(d.createdAt)}</span>
            <DocumentStatus status={d.status} />
          </li>
        ))}
      </ul>
    </div>
  );
}
