import fs from 'node:fs/promises';
import path from 'node:path';

export async function loadDocument(filePath, { originalName, mimeType } = {}) {
  const buffer = await fs.readFile(filePath);
  const name = originalName || path.basename(filePath);
  return { buffer, ext: path.extname(name).toLowerCase(), mimeType, originalName: name };
}
