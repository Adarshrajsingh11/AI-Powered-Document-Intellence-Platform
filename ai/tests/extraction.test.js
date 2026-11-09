import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { extractText } from '../src/index.js';

const dir = path.join(path.dirname(fileURLToPath(import.meta.url)), 'fixtures');

test('PDF: text is extracted per page', async () => {
  const pages = await extractText({ buffer: await fs.readFile(path.join(dir, 'sample.pdf')), ext: '.pdf' });
  assert.equal(pages.length, 2);
  assert.match(pages[0].text, /invoices are due within 30 days/);
  assert.equal(pages[1].page, 2);
});

test('DOCX: text is extracted', async () => {
  const pages = await extractText({ buffer: await fs.readFile(path.join(dir, 'sample.docx')), ext: '.docx' });
  assert.match(pages[0].text, /warranty/);
});

test('corrupt PDF gives a catchable error, not a crash', async () => {
  await assert.rejects(extractText({ buffer: Buffer.from('not a pdf'), ext: '.pdf' }));
});
