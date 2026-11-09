import { Link } from 'react-router-dom';
import Button from '../../../components/common/Button';
import DocumentStatus from './DocumentStatus';
import { docId, docName } from '../documentService';
import { formatDate } from '../../../utils/formatDate';
import { formatFileSize } from '../../../utils/formatFileSize';

export default function DocumentCard({ document, onDelete }) {
  const id = docId(document);
  return (
    <div className="card document-card">
      <div className="document-card-head">
        <Link to={`/documents/${id}`} className="document-name">{docName(document)}</Link>
        <DocumentStatus status={document.status} />
      </div>
      <div className="muted">
        {formatFileSize(document.size)} · {formatDate(document.createdAt)}
      </div>
      <div className="row">
        <Link to={`/chat?document=${id}`} className={`btn btn-secondary ${document.status !== 'ready' ? 'disabled-link' : ''}`}>
          Ask AI
        </Link>
        <Button variant="ghost" onClick={() => onDelete(document)}>Delete</Button>
      </div>
    </div>
  );
}
