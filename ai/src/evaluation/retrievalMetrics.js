// retrievedIds / relevantIds: arrays of ids (e.g. document ids)
export function hitRate(retrievedIds, relevantIds) {
  return retrievedIds.some((id) => relevantIds.includes(id)) ? 1 : 0;
}

export function recallAtK(retrievedIds, relevantIds, k = retrievedIds.length) {
  if (!relevantIds.length) return 0;
  const top = new Set(retrievedIds.slice(0, k));
  return relevantIds.filter((id) => top.has(id)).length / relevantIds.length;
}

export function precisionAtK(retrievedIds, relevantIds, k = retrievedIds.length) {
  const top = retrievedIds.slice(0, k);
  if (!top.length) return 0;
  return top.filter((id) => relevantIds.includes(id)).length / top.length;
}

// Mean reciprocal rank for a single query: 1 / rank of the first relevant result.
export function reciprocalRank(retrievedIds, relevantIds) {
  const idx = retrievedIds.findIndex((id) => relevantIds.includes(id));
  return idx === -1 ? 0 : 1 / (idx + 1);
}
