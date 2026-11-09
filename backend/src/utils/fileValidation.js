import path from 'node:path';

const ALLOWED = {
  '.pdf': ['application/pdf'],
  '.docx': ['application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  '.txt': ['text/plain'],
  '.md': ['text/markdown', 'text/x-markdown', 'text/plain'],
};
// Browsers often send these for files they do not recognise (for example .md)
const GENERIC_MIME = ['application/octet-stream', ''];

export const ALLOWED_EXTENSIONS = Object.keys(ALLOWED);

export const getExtension = (name) => path.extname(name || '').toLowerCase();

export function isAllowedFile(originalName, mimeType) {
  const mimes = ALLOWED[getExtension(originalName)];
  if (!mimes) return false;
  return mimes.includes(mimeType) || GENERIC_MIME.includes(mimeType || '');
}

// Multer decodes file names as latin1; convert back so non-English names look right.
export function fixFileName(name) {
  try {
    return Buffer.from(name, 'latin1').toString('utf8');
  } catch {
    return name;
  }
}
