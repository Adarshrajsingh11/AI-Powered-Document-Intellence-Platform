import { useCallback, useRef, useState } from 'react';
import { chatService } from '../features/chat/chatService';

export function useChat({ documentIds = [] } = {}) {
  const [messages, setMessages] = useState([]);
  const [conversationId, setConversationId] = useState(null);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const counter = useRef(0);
  const nextId = () => {
    counter.current += 1;
    return counter.current;
  };

  const send = useCallback(
    async (text) => {
      const content = text.trim();
      if (!content || sending) return;
      setError('');
      setMessages((prev) => [...prev, { id: nextId(), role: 'user', content }]);
      setSending(true);
      try {
        const data = await chatService.sendMessage({ message: content, conversationId, documentIds });
        const reply = data?.message ?? data ?? {};
        if (data?.conversationId) setConversationId(data.conversationId);
        setMessages((prev) => [
          ...prev,
          {
            id: nextId(),
            role: 'assistant',
            content: reply.content ?? data?.answer ?? '',
            sources: reply.sources ?? data?.sources ?? [],
          },
        ]);
      } catch (err) {
        setError(err.message);
      } finally {
        setSending(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [conversationId, sending, JSON.stringify(documentIds)],
  );

  const reset = useCallback(() => {
    setMessages([]);
    setConversationId(null);
    setError('');
  }, []);

  return { messages, sending, error, send, reset };
}
