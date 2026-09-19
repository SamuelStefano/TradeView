import assert from 'node:assert/strict';
import { test } from 'node:test';
import { accessAllowed } from './allowlist';

test('accessAllowed recusa tudo quando a lista não foi definida', () => {
  delete process.env.TRADEVIEW_SIGNUP_ALLOWLIST;
  assert.equal(accessAllowed('qualquer@um.com'), false);
});

test('accessAllowed recusa tudo quando a lista está vazia', () => {
  process.env.TRADEVIEW_SIGNUP_ALLOWLIST = '  , ,';
  assert.equal(accessAllowed('qualquer@um.com'), false);
});

test('accessAllowed aceita apenas quem está na lista', () => {
  process.env.TRADEVIEW_SIGNUP_ALLOWLIST = 'dono@exemplo.com, outro@exemplo.com';
  assert.equal(accessAllowed('dono@exemplo.com'), true);
  assert.equal(accessAllowed('outro@exemplo.com'), true);
  assert.equal(accessAllowed('invasor@exemplo.com'), false);
});

test('accessAllowed ignora caixa e espaço em volta', () => {
  process.env.TRADEVIEW_SIGNUP_ALLOWLIST = 'Dono@Exemplo.com';
  assert.equal(accessAllowed('  dono@exemplo.COM  '), true);
});

test('accessAllowed não deixa passar por prefixo ou sufixo', () => {
  process.env.TRADEVIEW_SIGNUP_ALLOWLIST = 'dono@exemplo.com';
  assert.equal(accessAllowed('dono@exemplo.com.evil.io'), false);
  assert.equal(accessAllowed('xdono@exemplo.com'), false);
});
