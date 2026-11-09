import { useEffect, useRef } from 'react';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import ErrorMessage from '../../../components/common/ErrorMessage';
import EmptyState from '../../../components/feedback/EmptyState';

export default function ChatWindow({ messages, sending, error, onSend }) {
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, sending]);

  return (
    <div className="chat-window">
      <div className="chat-messages">
        {!messages.length && (
          <EmptyState title="Ask anything" description="Answers are generated from your documents, with citations." />
        )}
        {messages.map((m) => (
          <ChatMessage key={m.id} message={m} />
        ))}
        {sending && <div className="muted">Thinking…</div>}
        <div ref={endRef} />
      </div>
      <ErrorMessage message={error} />
      <ChatInput onSend={onSend} disabled={sending} />
    </div>
  );
}
