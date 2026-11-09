import { useRef, useState } from 'react';
import ErrorMessage from '../../../components/common/ErrorMessage';
import { formatFileSize } from '../../../utils/formatFileSize';

const MAX_SIZE = 20 * 1024 * 1024;
const ALLOWED_EXT = ['pdf', 'docx', 'txt', 'md'];

export default function DocumentUpload({ onUpload }) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const handleFile = async (file) => {
    if (!file) return;
    const ext = file.name.split('.').pop().toLowerCase();
    if (!ALLOWED_EXT.includes(ext)) {
      setError(`Unsupported file type. Allowed: ${ALLOWED_EXT.join(', ')}`);
      return;
    }
    if (file.size > MAX_SIZE) {
      setError(`File too large (${formatFileSize(file.size)}). Max ${formatFileSize(MAX_SIZE)}.`);
      return;
    }
    setError('');
    setUploading(true);
    try {
      await onUpload(file);
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  return (
    <div>
      <div
        className={`dropzone ${dragging ? 'dragging' : ''}`}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          handleFile(e.dataTransfer.files?.[0]);
        }}
      >
        <input
          ref={inputRef}
          type="file"
          hidden
          accept=".pdf,.docx,.txt,.md"
          onChange={(e) => handleFile(e.target.files?.[0])}
        />
        {uploading ? (
          <p>Uploading…</p>
        ) : (
          <>
            <p><strong>Click to upload</strong> or drag a file here</p>
            <small>PDF, DOCX, TXT, MD · up to {formatFileSize(MAX_SIZE)}</small>
          </>
        )}
      </div>
      <ErrorMessage message={error} />
    </div>
  );
}
