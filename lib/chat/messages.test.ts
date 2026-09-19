import { strict as assert } from 'node:assert';
import { test } from 'node:test';

import { MAX_CHARS, MAX_MESSAGES, MAX_TOTAL_CHARS, parseMessages } from './messages';

function turn(role: 'user' | 'assistant', length: number) {
  return { role, content: 'a'.repeat(length) };
}

test('a well formed conversation passes through unchanged', () => {
  const raw = [turn('user', 10), turn('assistant', 20)];
  assert.deepEqual(parseMessages(raw), raw);
});

test('an empty or non-array body is refused', () => {
  assert.throws(() => parseMessages([]), /conversa vazia/);
  assert.throws(() => parseMessages(null), /conversa vazia/);
  assert.throws(() => parseMessages({ role: 'user' }), /conversa vazia/);
});

test('unknown roles and blank content are refused', () => {
  assert.throws(() => parseMessages([{ role: 'system', content: 'x' }]), /papel inválido/);
  assert.throws(() => parseMessages([{ role: 'user', content: '   ' }]), /mensagem vazia/);
  assert.throws(() => parseMessages([{ role: 'user', content: 42 }]), /mensagem vazia/);
});

test('the per-message and per-conversation ceilings are both enforced', () => {
  assert.throws(() => parseMessages([turn('user', MAX_CHARS + 1)]), /mensagem longa demais/);

  const many = Array.from({ length: MAX_MESSAGES + 1 }, () => turn('user', 1));
  assert.throws(() => parseMessages(many), /conversa longa demais/);
});

test('many messages under the per-message cap cannot add up past the total cap', () => {
  const chunk = Math.ceil(MAX_TOTAL_CHARS / 10) + 1;
  const raw = Array.from({ length: 11 }, () => turn('user', chunk));

  assert.ok(raw.length <= MAX_MESSAGES);
  assert.ok(chunk <= MAX_CHARS);
  assert.throws(() => parseMessages(raw), /comece uma nova/);
});
