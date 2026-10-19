// Render test for the extension-tab registry (registerAdminTabs).
//
// Embedding hosts (NexaHub) register their own settings sections instead of
// maintaining a parallel settings window. What only a render can show is the
// wiring: a registered tab appears in the rail under its group, its content
// renders when active, and it is findable through the panel's search box.
// Same loader hooks as AdminPanel.render.test.js: node --test cannot parse JSX,
// and react-i18next is stubbed so t() returns its key.

import { test, describe, before, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { registerHooks } from 'node:module';
import { JSDOM } from 'jsdom';
import { transform } from 'sucrase';

registerHooks({
  load(url, context, nextLoad) {
    if (url.endsWith('react-i18next/dist/es/index.js') || url.endsWith('/react-i18next')) {
      return { format: 'module', shortCircuit: true, source: [
        'export const useTranslation = () => ({ t: (k) => k, i18n: { language: "en", changeLanguage: () => {} } });',
        'export const initReactI18next = { type: "3rdParty", init: () => {} };',
        'export const Trans = ({ children }) => children ?? null;',
        'export const I18nextProvider = ({ children }) => children ?? null;',
        'export default { useTranslation, initReactI18next };',
      ].join('\n') };
    }
    if (url.endsWith('.json')) {
      return { format: 'module', shortCircuit: true, source: `export default ${readFileSync(new URL(url), 'utf8')}` };
    }
    const shimViteEnv = (code) => code.replaceAll('import.meta.env', 'globalThis.__VITE_ENV__');
    if (url.endsWith('.jsx')) {
      const out = transform(readFileSync(new URL(url), 'utf8'), { transforms: ['jsx'], jsxRuntime: 'automatic', filePath: url });
      return { format: 'module', shortCircuit: true, source: shimViteEnv(out.code) };
    }
    if (url.startsWith('file:') && url.endsWith('.js')) {
      const code = readFileSync(new URL(url), 'utf8');
      if (code.includes('import.meta.env')) return { format: 'module', shortCircuit: true, source: shimViteEnv(code) };
    }
    return nextLoad(url, context);
  },
});

const dom = new JSDOM('<div id="root"></div>', { url: 'https://mail.example.invalid', pretendToBeVisual: true });
Object.assign(globalThis, {
  window: dom.window, document: dom.window.document, localStorage: dom.window.localStorage,
  CustomEvent: dom.window.CustomEvent, Node: dom.window.Node, Element: dom.window.Element,
  HTMLElement: dom.window.HTMLElement, getComputedStyle: dom.window.getComputedStyle,
  matchMedia: () => ({ matches: false, addEventListener() {}, removeEventListener() {} }),
  ResizeObserver: class { observe() {} unobserve() {} disconnect() {} },
  IS_REACT_ACT_ENVIRONMENT: true,
});
dom.window.matchMedia = () => ({ matches: false, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} });
globalThis.__VITE_ENV__ = { MODE: 'test', DEV: false, PROD: true };
globalThis.fetch = async () => ({ ok: true, status: 200, json: async () => ({}), text: async () => '' });

const React = await import('react');
const { createRoot } = await import('react-dom/client');
const { useStore } = await import('../store/index.js');
const { api } = await import('../utils/api.js');
const AdminPanel = (await import('./AdminPanel.jsx')).default;
const { registerAdminTabs, unregisterAdminTab } = await import('./AdminPanel.jsx');

const DemoBody = () => React.createElement('div', { 'data-testid': 'ext-demo-body' }, 'host demo body');

describe('extension tabs (registerAdminTabs)', () => {
  let root;

  before(() => {
    api.admin.getSettings = async () => ({ settings: {} });
    api.getUnreadCounts = async () => ({});
    registerAdminTabs({
      id: 'ext-demo',
      label: 'Host Demo Section',
      group: 'preferences',
      keywords: ['hostdemo', 'host section'],
      icon: React.createElement('span', null, 'D'),
      component: DemoBody,
    });
  });
  afterEach(() => React.act(async () => root.unmount()));

  const click = (el) => React.act(async () => { el.dispatchEvent(new window.MouseEvent('click', { bubbles: true })); });

  async function renderPanel() {
    useStore.setState({ user: { id: 'u1' }, adminTab: 'accounts' });
    root = createRoot(document.getElementById('root'));
    await React.act(async () => { root.render(React.createElement(AdminPanel)); });
  }

  test('a registered tab renders in the rail with its literal label', async () => {
    await renderPanel();
    const railButton = [...document.querySelectorAll('button')]
      .find(b => b.textContent.includes('Host Demo Section'));
    assert.ok(railButton, 'the registered tab is in the settings rail');
  });

  test('clicking the registered tab renders the host component', async () => {
    await renderPanel();
    const railButton = [...document.querySelectorAll('button')]
      .find(b => b.textContent.includes('Host Demo Section'));
    await click(railButton);
    assert.ok(document.querySelector('[data-testid="ext-demo-body"]'), 'the host component renders when its tab is active');
  });

  test('the registered tab is findable through the search box', async () => {
    await renderPanel();
    const search = document.querySelector('input[placeholder="admin.search.placeholder"]');
    assert.ok(search, 'the panel has a search field');
    const setValue = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
    await React.act(async () => {
      setValue.call(search, 'hostdemo');
      search.dispatchEvent(new window.Event('input', { bubbles: true }));
    });
    const result = [...document.querySelectorAll('button')]
      .find(b => b.textContent.includes('Host Demo Section'));
    assert.ok(result, 'searching a keyword finds the registered section');
  });

  test('unregisterAdminTab removes the tab from the rail', async () => {
    unregisterAdminTab('ext-demo');
    await renderPanel();
    const railButton = [...document.querySelectorAll('button')]
      .find(b => b.textContent.includes('Host Demo Section'));
    assert.ok(!railButton, 'the tab is gone after unregistering');
    // re-register for any later assertions
    registerAdminTabs({
      id: 'ext-demo', label: 'Host Demo Section', group: 'preferences',
      keywords: ['hostdemo'], icon: React.createElement('span', null, 'D'), component: DemoBody,
    });
  });

  test('registerAdminTabs rejects a tab without a component', () => {
    assert.throws(() => registerAdminTabs({ id: 'ext-bad', label: 'No component' }),
      /needs a string id and a React component/);
  });
});
