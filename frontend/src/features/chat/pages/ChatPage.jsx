import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import Button from '../../../components/common/Button';
import { useChat } from '../../../hooks/useChat';
import { useDocuments } from '../../../hooks/useDocuments';
import { docId, docName } from '../../documents/documentService';
import ChatWindow from '../components/ChatWindow';

export default function ChatPage() {
  const [params, setParams] = useSearchParams();
  const selected = params.get('document') || '';
  const { documents } = useDocuments({ poll: false });
  const readyDocs = useMemo(() => documents.filter((d) => d.status === 'ready'), [documents]);

  const documentIds = useMemo(() => (selected ? [selected] : []), [selected]);
  const { messages, sending, error, send, reset } = useChat({ documentIds });

  const onSelect = (e) => {
    const value = e.target.value;
    setParams(value ? { document: value } : {});
    reset();
  };

  return (
    <div className="chat-page">
      <div className="chat-toolbar">
        <h1>Ask AI</h1>
        <select className="input select" value={selected} onChange={onSelect}>
          <option value="">All documents</option>
          {readyDocs.map((d) => (
            <option key={docId(d)} value={docId(d)}>{docName(d)}</option>
          ))}
        </select>
        <Button variant="secondary" onClick={reset} disabled={!messages.length}>New chat</Button>
      </div>
      <ChatWindow messages={messages} sending={sending} error={error} onSend={send} />
    </div>
  );
}
