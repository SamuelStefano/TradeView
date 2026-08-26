import assert from 'node:assert/strict';
import { test } from 'node:test';
import { signupAllowed } from './allowlist';

test('signupAllowed recusa tudo quando a lista não foi definida', () => {
  delete process.env.TRADEVIEW_SIGNUP_ALLOWLIST;
  assert.equal(signupAllowed('qualquer@um.com'), false);
});

test('signupAllowed recusa tudo quando a lista está vazia', () => {
  process.env.TRADEVIEW_SIGNUP_ALLOWLIST = '  , ,';
  assert.equal(signupAllowed('qualquer@um.com'), false);
});

test('signupAllowed aceita apenas quem está na lista', () => {
  process.env.TRADEVIEW_SIGNUP_ALLOWLIST = 'dono@exemplo.com, outro@exemplo.com';
  assert.equal(signupAllowed('dono@exemplo.com'), true);
  assert.equal(signupAllowed('outro@exemplo.com'), true);
  assert.equal(signupAllowed('invasor@exemplo.com'), false);
});

test('signupAllowed ignora caixa e espaço em volta', () => {
  process.env.TRADEVIEW_SIGNUP_ALLOWLIST = 'Dono@Exemplo.com';
  assert.equal(signupAllowed('  dono@exemplo.COM  '), true);
});

test('signupAllowed não deixa passar por prefixo ou sufixo', () => {
  process.env.TRADEVIEW_SIGNUP_ALLOWLIST = 'dono@exemplo.com';
  assert.equal(signupAllowed('dono@exemplo.com.evil.io'), false);
  assert.equal(signupAllowed('xdono@exemplo.com'), false);
});
