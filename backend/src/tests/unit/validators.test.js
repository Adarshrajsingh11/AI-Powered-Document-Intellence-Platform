import test from 'node:test';
import assert from 'node:assert/strict';
import { registerSchema, loginSchema } from '../../validators/auth.validator.js';
import { sendMessageSchema, searchSchema } from '../../validators/chat.validator.js';
import { isAllowedFile, getExtension } from '../../utils/fileValidation.js';

test('register: normalises email and enforces password length', () => {
  const ok = registerSchema.parse({ name: ' Adarsh ', email: ' ADARSH@Example.COM ', password: 'longenough1' });
  assert.equal(ok.email, 'adarsh@example.com');
  assert.equal(ok.name, 'Adarsh');
  assert.throws(() => registerSchema.parse({ name: 'Ad', email: 'a@b.co', password: 'short' }));
  assert.throws(() => registerSchema.parse({ name: 'Ad', email: 'not-an-email', password: 'longenough1' }));
});

test('login requires email and password', () => {
  assert.throws(() => loginSchema.parse({ email: 'a@b.co' }));
});

test('chat: accepts the exact payload the frontend sends (null conversationId)', () => {
  const parsed = sendMessageSchema.parse({ message: 'hi', conversationId: null, documentIds: [] });
  assert.equal(parsed.conversationId, null);
  assert.throws(() => sendMessageSchema.parse({ message: '   ' }));
  assert.throws(() => sendMessageSchema.parse({ message: 'x', documentIds: ['nope'] }));
});

test('search: defaults and limits', () => {
  assert.equal(searchSchema.parse({ query: 'q', documentIds: [] }).topK, 8);
  assert.throws(() => searchSchema.parse({ query: '' }));
});

test('file validation allows only supported types', () => {
  assert.equal(isAllowedFile('a.pdf', 'application/pdf'), true);
  assert.equal(isAllowedFile('notes.md', 'application/octet-stream'), true);
  assert.equal(isAllowedFile('virus.exe', 'application/octet-stream'), false);
  assert.equal(isAllowedFile('a.pdf', 'image/png'), false);
  assert.equal(getExtension('Report.PDF'), '.pdf');
});
