import { useState } from 'react';
import Modal from '../../../components/common/Modal';
import Button from '../../../components/common/Button';
import Spinner from '../../../components/common/Spinner';
import ErrorMessage from '../../../components/common/ErrorMessage';
import { useToast } from '../../../components/feedback/Toast';
import { useDocuments } from '../../../hooks/useDocuments';
import DocumentUpload from '../components/DocumentUpload';
import DocumentList from '../components/DocumentList';
import { docId, docName } from '../documentService';

export default function DocumentsPage() {
  const { documents, loading, error, upload, remove } = useDocuments();
  const { notify } = useToast();
  const [toDelete, setToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const handleUpload = async (file) => {
    await upload(file);
    notify('Document uploaded. Processing will start shortly.', 'success');
  };

  const confirmDelete = async () => {
    setDeleting(true);
    try {
      await remove(docId(toDelete));
      notify('Document deleted.', 'success');
      setToDelete(null);
    } catch (err) {
      notify(err.message, 'error');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div>
      <h1>Documents</h1>
      <DocumentUpload onUpload={handleUpload} />
      <ErrorMessage message={error} />
      {loading ? <Spinner label="Loading documents…" /> : <DocumentList documents={documents} onDelete={setToDelete} />}
      <Modal open={Boolean(toDelete)} title="Delete document?" onClose={() => setToDelete(null)}>
        <p>“{toDelete && docName(toDelete)}” and its indexed content will be permanently removed.</p>
        <div className="row">
          <Button variant="secondary" onClick={() => setToDelete(null)}>Cancel</Button>
          <Button variant="danger" loading={deleting} onClick={confirmDelete}>Delete</Button>
        </div>
      </Modal>
    </div>
  );
}
