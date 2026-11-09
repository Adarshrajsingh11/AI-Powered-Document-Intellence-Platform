import SourceCitation from './SourceCitation';

export default function ChatMessage({ message }) {
  const isUser = message.role === 'user';
  return (
    <div className={`msg ${isUser ? 'msg-user' : 'msg-assistant'}`}>
      <div className="msg-bubble">{message.content}</div>
      {!isUser && message.sources?.length > 0 && (
        <div className="citations">
          <div className="muted">Sources</div>
          {message.sources.map((s, i) => (
            <SourceCitation key={`${s.documentId}-${i}`} source={s} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}
