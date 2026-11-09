import { useCallback, useEffect, useState } from 'react';
import { documentService, docId } from '../features/documents/documentService';

const PENDING = ['uploaded', 'processing'];

export function useDocuments({ poll = true } = {}) {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const refresh = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      setDocuments(await documentService.list());
      setError('');
    } catch (err) {
      setError(err.message);
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const hasPending = documents.some((d) => PENDING.includes(d.status));
  useEffect(() => {
    if (!poll || !hasPending) return undefined;
    const timer = setInterval(() => refresh(true), 4000);
    return () => clearInterval(timer);
  }, [poll, hasPending, refresh]);

  const upload = useCallback(async (file) => {
    const created = await documentService.upload(file);
    setDocuments((prev) => [created, ...prev]);
    return created;
  }, []);

  const remove = useCallback(async (id) => {
    await documentService.remove(id);
    setDocuments((prev) => prev.filter((d) => docId(d) !== id));
  }, []);

  return { documents, loading, error, refresh, upload, remove };
}
