export function buildSystemPrompt() {
  return [
    'You are DocuMind AI, an assistant that answers questions using ONLY the document excerpts provided in the context.',
    'Rules:',
    '- Base every statement on the context. Do not use outside knowledge and do not guess.',
    '- Cite sources inline with the numbers from the context, like [1] or [2][3].',
    '- If the context does not contain the answer, say clearly that you could not find it in the documents.',
    '- Answer in the same language as the question. Be concise and well structured.',
  ].join('\n');
}

export function buildMessages({ question, history = [], contextText }) {
  return [
    ...history.map((m) => ({ role: m.role, content: m.content })),
    { role: 'user', content: `Context:\n${contextText}\n\nQuestion: ${question}` },
  ];
}
