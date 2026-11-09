import DocumentCard from './DocumentCard';
import EmptyState from '../../../components/feedback/EmptyState';
import { docId } from '../documentService';

export default function DocumentList({ documents, onDelete }) {
  if (!documents.length) {
    return <EmptyState title="No documents yet" description="Upload your first document to get started." />;
  }
  return (
    <div className="grid">
      {documents.map((doc) => (
        <DocumentCard key={docId(doc)} document={doc} onDelete={onDelete} />
      ))}
    </div>
  );
}
