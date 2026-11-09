const LABELS = {
  uploaded: 'Queued',
  processing: 'Processing',
  ready: 'Ready',
  failed: 'Failed',
};

export default function DocumentStatus({ status }) {
  return <span className={`badge badge-${status || 'uploaded'}`}>{LABELS[status] || status || 'Unknown'}</span>;
}
