export const STOPWORDS = new Set([
  'a', 'an', 'the', 'and', 'or', 'of', 'to', 'in', 'on', 'for', 'with', 'is', 'are', 'was', 'were', 'be', 'been',
  'it', 'this', 'that', 'these', 'those', 'as', 'at', 'by', 'from', 'what', 'which', 'who', 'how', 'why', 'when',
  'do', 'does', 'did', 'can', 'could', 'should', 'would', 'about', 'into', 'than', 'then', 'there', 'their',
  'i', 'you', 'we', 'they', 'he', 'she', 'my', 'your', 'our', 'me', 'us', 'not', 'no', 'if', 'so', 'but',
]);

export function tokenize(text = '') {
  return text.toLowerCase().match(/[\p{L}\p{N}]+/gu) ?? [];
}

// Rough estimate (~4 characters per token). Good enough for budgeting context size.
export function estimateTokens(text = '') {
  return Math.ceil(text.length / 4);
}
