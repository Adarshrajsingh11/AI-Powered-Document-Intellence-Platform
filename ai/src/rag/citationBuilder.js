// Keep only the sources the answer actually cites ([1], [2]...). If none are cited, return all used sources.
export function buildCitations(answer, sources) {
  const cited = new Set([...answer.matchAll(/\[(\d+)\]/g)].map((m) => Number(m[1])));
  const picked = sources.filter((_, i) => cited.has(i + 1));
  return picked.length ? picked : sources;
}
