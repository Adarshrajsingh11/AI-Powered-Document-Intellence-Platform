import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Button from '../../../components/common/Button';
import Spinner from '../../../components/common/Spinner';
import ErrorMessage from '../../../components/common/ErrorMessage';
import { useToast } from '../../../components/feedback/Toast';
import DocumentStatus from '../components/DocumentStatus';
import { documentService, docName } from '../documentService';
import { formatDate } from '../../../utils/formatDate';
import { formatFileSize } from '../../../utils/formatFileSize';

export default function DocumentDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { notify } = useToast();
  const [doc, setDoc] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    documentService
      .get(id)
      .then((d) => !cancelled && setDoc(d))
      .catch((err) => !cancelled && setError(err.message));
    return () => {
      cancelled = true;
    };
  }, [id]);

  const handleDelete = async () => {
    try {
      await documentService.remove(id);
      notify('Document deleted.', 'success');
      navigate('/documents');
    } catch (err) {
      notify(err.message, 'error');
    }
  };

  if (error) return <ErrorMessage message={error} />;
  if (!doc) return <Spinner label="Loading document…" />;

  return (
    <div>
      <p><Link to="/documents">← Back to documents</Link></p>
      <h1>{docName(doc)}</h1>
      <div className="card details">
        <dl>
          <dt>Status</dt><dd><DocumentStatus status={doc.status} /></dd>
          <dt>Size</dt><dd>{formatFileSize(doc.size)}</dd>
          <dt>Type</dt><dd>{doc.mimeType || '—'}</dd>
          <dt>Uploaded</dt><dd>{formatDate(doc.createdAt)}</dd>
          {doc.chunkCount != null && (<><dt>Chunks indexed</dt><dd>{doc.chunkCount}</dd></>)}
        </dl>
        {doc.status === 'failed' && <ErrorMessage message={doc.error || 'Processing failed for this document.'} />}
        <div className="row">
          {doc.status === 'ready' && (
            <Link to={`/chat?document=${id}`} className="btn btn-primary">Ask AI about this document</Link>
          )}
          <Button variant="danger" onClick={handleDelete}>Delete</Button>
        </div>
      </div>
    </div>
  );
}
