const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const RETRYABLE = [429, 500, 502, 503, 504];

// POST JSON with timeout and retry/backoff for rate limits (429) and temporary server errors.
export async function postJson(url, { headers = {}, body, timeoutMs = 60000, retries = 3 } = {}) {
  let attempt = 0;
  for (;;) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...headers },
        body: JSON.stringify(body),
        signal: controller.signal,
      });
      const text = await res.text();
      let json = null;
      try {
        json = text ? JSON.parse(text) : null;
      } catch {
        json = null;
      }
      if (res.ok) return json;
      if (RETRYABLE.includes(res.status) && attempt < retries) {
        attempt += 1;
        await sleep(1000 * 2 ** attempt);
        continue;
      }
      const detail = json?.error?.message ?? json?.error ?? text.slice(0, 200);
      throw new Error(`Provider request failed (${res.status}): ${typeof detail === 'string' ? detail : JSON.stringify(detail)}`);
    } catch (err) {
      if (err.name === 'AbortError') throw new Error('Provider request timed out');
      throw err;
    } finally {
      clearTimeout(timer);
    }
  }
}
