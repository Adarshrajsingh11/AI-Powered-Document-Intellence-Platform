// Returns pages: [{ page: number | null, text: string }]
async function extractPdf(buffer) {
  const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs');
  const doc = await pdfjs.getDocument({
    data: new Uint8Array(buffer),
    useSystemFonts: true,
    isEvalSupported: false,
    verbosity: 0,
  }).promise;
  try {
    const pages = [];
    for (let i = 1; i <= doc.numPages; i += 1) {
      const page = await doc.getPage(i);
      const content = await page.getTextContent();
      let text = '';
      for (const item of content.items) text += item.hasEOL ? `${item.str}\n` : item.str;
      pages.push({ page: i, text });
      page.cleanup();
    }
    return pages;
  } finally {
    await doc.destroy();
  }
}

async function extractDocx(buffer) {
  const mammoth = (await import('mammoth')).default;
  const { value } = await mammoth.extractRawText({ buffer });
  return [{ page: null, text: value }];
}

export async function extractText({ buffer, ext }) {
  let pages;
  switch (ext) {
    case '.pdf':
      pages = await extractPdf(buffer);
      break;
    case '.docx':
      pages = await extractDocx(buffer);
      break;
    case '.txt':
    case '.md':
      pages = [{ page: null, text: buffer.toString('utf8') }];
      break;
    default:
      throw new Error(`Unsupported file type: ${ext || 'unknown'}`);
  }
  const nonEmpty = pages.filter((p) => p.text && p.text.trim());
  if (!nonEmpty.length) {
    throw new Error('No extractable text found (scanned PDFs need OCR, which is not supported yet)');
  }
  return nonEmpty;
}
