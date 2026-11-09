import { buildContext } from './contextBuilder.js';
import { buildMessages, buildSystemPrompt } from './promptBuilder.js';
import { buildCitations } from './citationBuilder.js';

const NOT_FOUND = "I couldn't find anything relevant in your documents. Try rephrasing, or upload a document that covers this.";

export function createRagPipeline({ retriever, llm, topK = 5, maxContextTokens = 3000, historyLimit = 6, minScore = 0 }) {
  // Short follow-ups ("and its price?") are searched together with the previous question.
  function retrievalQuery(question, history) {
    const lastUser = [...history].reverse().find((m) => m.role === 'user');
    return question.trim().split(/\s+/).length < 6 && lastUser ? `${lastUser.content} ${question}` : question;
  }

  return {
    async retrieve({ query, ownerId, documentIds = [], topK: k = topK }) {
      return retriever.retrieve({ query, ownerId, documentIds, topK: k });
    },

    async answer({ question, history = [], ownerId, documentIds = [] }) {
      const recent = history.slice(-historyLimit);
      const results = (await retriever.retrieve({
        query: retrievalQuery(question, recent),
        ownerId,
        documentIds,
        topK,
      })).filter((r) => r.score >= minScore);

      if (!results.length) return { answer: NOT_FOUND, sources: [] };

      const { contextText, sources } = buildContext(results, { maxTokens: maxContextTokens });
      const text = await llm.generate({
        system: buildSystemPrompt(),
        messages: buildMessages({ question, history: recent, contextText }),
      });
      const answer = text.trim();
      return { answer, sources: buildCitations(answer, sources) };
    },
  };
}
