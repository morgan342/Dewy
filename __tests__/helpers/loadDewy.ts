/**
 * Loads design/dewy.html into the current jsdom document and drives it the
 * way a person would: real data-act clicks, real input events, real storage.
 *
 * Use from a test file that opts into the DOM environment:
 *   /** @jest-environment jsdom *\/
 *
 * The app exposes window.__dewy only when <html data-test="1">; nothing in
 * production reads that attribute, so the seam is inert for real users.
 */
import * as fs from 'fs';
import * as path from 'path';

export interface ClickTarget {
  act: string;
  id?: string;
  v?: string;
  key?: string;
}

export interface LoadOptions {
  /** Report prefers-reduced-motion as enabled. */
  reducedMotion?: boolean;
  /** Seed localStorage entries before the app boots (key -> raw string). */
  storage?: Record<string, string>;
  /** Keep whatever localStorage already holds (reload() sets this). */
  keepStorage?: boolean;
}

export interface DewyApp {
  /** window.__dewy: { S, PRODUCTS, ACTS, render, resolve, save, load } */
  api: any;
  view(): HTMLElement;
  text(): string;
  /** Current text of the polite live region (#live). */
  announce(): string;
  find(sel: string): HTMLElement | null;
  all(sel: string): HTMLElement[];
  click(target: string | ClickTarget): void;
  tab(name: string): void;
  type(id: string, value: string): void;
  key(id: string, key: string): void;
  /** Attach a File to a file input and fire its change event. */
  file(id: string, f: File): void;
  /** Poll until the predicate holds (real timers), up to `ms`. */
  until(pred: () => boolean, ms?: number): Promise<void>;
  storage(key?: string): any;
  reload(opts?: LoadOptions): DewyApp;
  destroy(): void;
}

interface Recorded {
  target: EventTarget;
  type: string;
  fn: EventListenerOrEventListenerObject;
  opts?: boolean | AddEventListenerOptions;
}

export const DEWY_HTML = path.resolve(__dirname, '../../design/dewy.html');
export const STORE_KEY = 'dewy.v3';

let cache: { markup: string; script: string } | null = null;

function parts(): { markup: string; script: string } {
  if (!cache) {
    const html = fs.readFileSync(DEWY_HTML, 'utf8');
    const markup = html.match(/<\/style>\s*([\s\S]*?)\s*<script>\n/);
    const script = html.match(/<script>\n([\s\S]*?)\n<\/script>/);
    if (!markup || !script) {
      throw new Error('design/dewy.html: could not find the page markup or the script block');
    }
    cache = { markup: markup[1], script: script[1] };
  }
  return cache;
}

function selectorFor(target: ClickTarget): string {
  let sel = `[data-act="${target.act}"]`;
  if (target.id) sel += `[data-id="${target.id}"]`;
  if (target.v) sel += `[data-v="${target.v}"]`;
  if (target.key) sel += `[data-key="${target.key}"]`;
  return sel;
}

export function loadDewy(opts: LoadOptions = {}): DewyApp {
  const { markup, script } = parts();
  const win = window as any;
  const doc = document;

  if (!opts.keepStorage) win.localStorage.clear();
  if (opts.storage) {
    for (const k of Object.keys(opts.storage)) win.localStorage.setItem(k, opts.storage[k]);
  }
  // The opening wordmark runs once per session; skip its timers in tests.
  win.sessionStorage.setItem('dewy.opened', '1');
  win.scrollTo = () => {};
  win.matchMedia = (query: string) => ({
    matches: query.indexOf('reduced-motion') > -1 ? !!opts.reducedMotion : false,
    media: query,
    onchange: null,
    addListener() {},
    removeListener() {},
    addEventListener() {},
    removeEventListener() {},
    dispatchEvent() { return false; },
  });

  doc.documentElement.setAttribute('data-test', '1');
  doc.body.innerHTML = markup;

  // Record document/window listeners so destroy() can remove them; otherwise a
  // second load in the same file would dispatch every click twice.
  const recorded: Recorded[] = [];
  const restores: Array<() => void> = [];
  const track = (target: EventTarget) => {
    const original = target.addEventListener.bind(target);
    (target as any).addEventListener = (
      type: string,
      fn: EventListenerOrEventListenerObject,
      options?: boolean | AddEventListenerOptions,
    ) => {
      recorded.push({ target, type, fn, opts: options });
      original(type, fn, options);
    };
    restores.push(() => { (target as any).addEventListener = original; });
  };
  track(doc);
  track(win);

  win.eval(script);

  const api = win.__dewy;
  if (!api) throw new Error('window.__dewy is missing: the data-test seam in design/dewy.html was not found');

  const el = (id: string) => doc.getElementById(id) as HTMLElement | null;

  const app: DewyApp = {
    api,
    view: () => el('view') as HTMLElement,
    text: () => (el('view') as HTMLElement).textContent || '',
    announce: () => (el('live') as HTMLElement).textContent || '',
    find: (sel) => doc.querySelector(sel) as HTMLElement | null,
    all: (sel) => Array.from(doc.querySelectorAll(sel)) as HTMLElement[],
    click(target) {
      const sel = typeof target === 'string' ? target : selectorFor(target);
      const node = doc.querySelector(sel) as HTMLElement | null;
      if (!node) throw new Error('click: nothing matches ' + sel);
      node.dispatchEvent(new win.MouseEvent('click', { bubbles: true, cancelable: true }));
    },
    tab(name) {
      app.click(`#nav [data-tab="${name}"]`);
    },
    type(id, value) {
      const node = el(id) as HTMLInputElement | null;
      if (!node) throw new Error('type: no element #' + id);
      node.value = value;
      node.dispatchEvent(new win.Event('input', { bubbles: true }));
    },
    key(id, key) {
      const node = el(id);
      if (!node) throw new Error('key: no element #' + id);
      node.dispatchEvent(new win.KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }));
    },
    file(id, f) {
      const node = el(id) as HTMLInputElement | null;
      if (!node) throw new Error('file: no element #' + id);
      Object.defineProperty(node, 'files', { value: [f], configurable: true });
      node.dispatchEvent(new win.Event('change', { bubbles: true }));
    },
    until(pred, ms = 1500) {
      return new Promise<void>((resolve, reject) => {
        const started = Date.now();
        const tickFn = () => {
          if (pred()) return resolve();
          if (Date.now() - started > ms) return reject(new Error('until: timed out'));
          setTimeout(tickFn, 20);
        };
        tickFn();
      });
    },
    storage(key = STORE_KEY) {
      const raw = win.localStorage.getItem(key);
      return raw ? JSON.parse(raw) : null;
    },
    reload(o = {}) {
      app.destroy();
      return loadDewy({ ...o, keepStorage: o.keepStorage !== false });
    },
    destroy() {
      for (const r of recorded) r.target.removeEventListener(r.type, r.fn, r.opts);
      recorded.length = 0;
      for (const restore of restores) restore();
      delete win.__dewy;
      doc.body.innerHTML = '';
    },
  };
  return app;
}
