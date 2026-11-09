function normalize(text) {
  return text
    .replace(/\r\n?/g, '\n')
    .replace(/[ \t]+/g, ' ')
    .split('\n')
    .map((line) => line.trim())
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function hardSplit(text, max) {
  const parts = [];
  for (let i = 0; i < text.length; i += max) parts.push(text.slice(i, i + max));
  return parts;
}

function splitLong(segment, max) {
  const sentences = segment.split(/(?<=[.!?।])\s+/);
  const out = [];
  let current = '';
  for (const sentence of sentences) {
    if (sentence.length > max) {
      if (current) out.push(current);
      current = '';
      out.push(...hardSplit(sentence, max));
    } else if (current && current.length + sentence.length + 1 > max) {
      out.push(current);
      current = sentence;
    } else {
      current = current ? `${current} ${sentence}` : sentence;
    }
  }
  if (current) out.push(current);
  return out;
}

function overlapTail(text, size) {
  if (size <= 0 || text.length <= size) return '';
  const tail = text.slice(-size);
  const firstSpace = tail.search(/\s/);
  return (firstSpace > 0 && firstSpace < tail.length - 1 ? tail.slice(firstSpace + 1) : tail).trim();
}

// Splits one block of text into overlapping chunks, preferring paragraph and sentence boundaries.
export function chunkText(text, { chunkSize = 1000, chunkOverlap = 150 } = {}) {
  const overlap = chunkOverlap >= chunkSize ? Math.floor(chunkSize / 5) : chunkOverlap;
  const clean = normalize(text ?? '');
  if (!clean) return [];

  const segments = clean
    .split(/\n{2,}/)
    .filter(Boolean)
    .flatMap((seg) => (seg.length > chunkSize ? splitLong(seg, chunkSize) : [seg]));

  const chunks = [];
  let current = '';
  for (const seg of segments) {
    if (current && current.length + seg.length + 2 > chunkSize) {
      chunks.push(current.trim());
      const tail = overlapTail(current, overlap);
      current = tail ? `${tail}\n\n${seg}` : seg;
    } else {
      current = current ? `${current}\n\n${seg}` : seg;
    }
  }
  if (current.trim()) chunks.push(current.trim());
  return chunks;
}

// pages: [{ page, text }] -> [{ index, page, text }]  (page numbers are preserved)
export function chunkPages(pages, options = {}) {
  const chunks = [];
  let index = 0;
  for (const p of pages) {
    for (const text of chunkText(p.text, options)) {
      chunks.push({ index, page: p.page ?? null, text });
      index += 1;
    }
  }
  return chunks;
}
