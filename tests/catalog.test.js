'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { existsSync } = require('node:fs');
const { resolve } = require('node:path');
const { videos, filterVideos, readState, defaultState, customVideo } = require('../catalog.js');

test('search ignores accents and case, and matches every search term', () => {
  assert.deepEqual(filterVideos(videos, { query: 'PROGRAMACION JAVASCRIPT' }).map((video) => video.id), ['javascript']);
  assert.ok(filterVideos(videos, { query: 'musica' }).length > 0);
  assert.equal(filterVideos(videos, { query: 'javascript piano' }).length, 0);
});
test('category and search work together, including live and short videos', () => {
  assert.equal(filterVideos(videos, { query: 'css', category: 'Diseño' })[0].id, 'design');
  assert.equal(filterVideos(videos, { category: 'En directo' })[0].id, 'lofi');
  assert.equal(filterVideos(videos, { view: 'shorts' }).length, 3);
});
test('library filters use saved IDs and history preserves most recent first', () => {
  const state = { ...defaultState(), saved: ['python'], liked: ['lofi'], history: ['space', 'javascript'], subscriptions: ['Pixel Play'] };
  assert.deepEqual(filterVideos(videos, { view: 'saved' }, state).map((video) => video.id), ['python']);
  assert.deepEqual(filterVideos(videos, { view: 'liked' }, state).map((video) => video.id), ['lofi']);
  assert.deepEqual(filterVideos(videos, { view: 'history' }, state).map((video) => video.id), ['space', 'javascript']);
  assert.deepEqual(filterVideos(videos, { view: 'subscriptions' }, state).map((video) => video.id), ['gaming']);
  assert.equal(filterVideos(videos, { channel: 'Código con Andrés' }).length, 2);
});
test('corrupt or missing storage recovers without losing intentional empty subscriptions', () => {
  for (const raw of [null, 'null', '{bad json']) assert.deepEqual(readState(raw), defaultState());
  const state = readState(JSON.stringify({ saved: ['python', 'python', 12], subscriptions: [], theme: 'invalid', custom: [null, { id: 'bad' }] }));
  assert.deepEqual(state.saved, ['python']);
  assert.deepEqual(state.subscriptions, []);
  assert.deepEqual(state.custom, []);
  assert.equal(state.theme, 'dark');
});
test('custom cards sanitize their schema and cannot inject asset URLs or colors', () => {
  const input = { id: 'custom-one', title: ' Mi idea ', channel: 'Mi canal', category: 'Ciencia', image: 'https://untrusted.example/file', color: 'invalid', tags: null };
  const state = readState(JSON.stringify({ custom: [input, input] }));
  assert.equal(state.custom.length, 1);
  assert.equal(state.custom[0].title, 'Mi idea');
  assert.equal(state.custom[0].image, 'images/thumbnails/space.svg');
  assert.equal(customVideo({ title: '   ', channel: 'Test', category: 'Música' }, 'custom-test'), null);
});
test('all catalog assets are local and exist, and IDs are unique', () => {
  assert.equal(new Set(videos.map((video) => video.id)).size, videos.length);
  for (const video of videos) assert.ok(existsSync(resolve(__dirname, '..', video.image)), video.image);
});
