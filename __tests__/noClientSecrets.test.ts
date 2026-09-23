import * as fs from 'fs';
import * as path from 'path';

/**
 * Required test 18 — API credentials must not appear in client code.
 *
 * This walks the shipped source tree and fails on anything that looks like a
 * hard-coded key, token or secret, and on any attempt to read a secret-shaped
 * environment variable from client code. Provider credentials belong on a
 * server, which this repository does not yet have.
 */

const ROOT = path.resolve(__dirname, '..');
const CLIENT_DIRS = ['src', 'App.tsx', 'index.ts'];
const SKIP_DIRS = new Set(['node_modules', '.git', 'coverage', 'dist', 'web-build', '.expo']);

function collectFiles(target: string, acc: string[] = []): string[] {
  const full = path.join(ROOT, target);
  if (!fs.existsSync(full)) return acc;

  const stat = fs.statSync(full);
  if (stat.isFile()) {
    if (/\.(ts|tsx|js|jsx)$/.test(full)) acc.push(full);
    return acc;
  }

  for (const entry of fs.readdirSync(full)) {
    if (SKIP_DIRS.has(entry)) continue;
    collectFiles(path.join(target, entry), acc);
  }
  return acc;
}

const files = CLIENT_DIRS.flatMap((d) => collectFiles(d));

/** Literal assignments that would bake a credential into the bundle. */
const HARD_CODED_SECRET =
  /(api[_-]?key|apikey|secret|password|access[_-]?token|bearer|client[_-]?secret)\s*[:=]\s*['"][^'"]{8,}['"]/i;

/** Reading a secret-shaped env var from client code. */
const CLIENT_ENV_SECRET =
  /process\.env\.[A-Z0-9_]*(KEY|SECRET|TOKEN|PASSWORD|CREDENTIAL)[A-Z0-9_]*/;

/** Long base64/hex blobs that look like real keys. */
const KEY_SHAPED_LITERAL = /['"](?:sk|pk|rk)_[A-Za-z0-9]{16,}['"]|['"][A-Za-z0-9]{40,}['"]/;

describe('No credentials in client code (required test 18)', () => {
  it('finds client source files to scan', () => {
    expect(files.length).toBeGreaterThan(0);
  });

  it.each(files)('%s contains no hard-coded credential', (file) => {
    const contents = fs.readFileSync(file, 'utf8');
    const offending = contents
      .split('\n')
      .map((line, i) => ({ line, number: i + 1 }))
      // Ignore comment lines, which document env-var *names* only.
      .filter(({ line }) => !/^\s*(\*|\/\/|\/\*)/.test(line))
      .filter(({ line }) => HARD_CODED_SECRET.test(line) || KEY_SHAPED_LITERAL.test(line));

    expect(offending).toEqual([]);
  });

  it.each(files)('%s does not read a secret from the client environment', (file) => {
    const contents = fs.readFileSync(file, 'utf8');
    const offending = contents
      .split('\n')
      .filter((line) => !/^\s*(\*|\/\/|\/\*)/.test(line))
      .filter((line) => CLIENT_ENV_SECRET.test(line));

    expect(offending).toEqual([]);
  });

  it('ships no provider implementation that could carry a credential', () => {
    const adapter = fs.readFileSync(
      path.join(ROOT, 'src/catalog/providerAdapter.ts'),
      'utf8',
    );
    // The default provider must perform no I/O at all.
    expect(adapter).not.toMatch(/\bfetch\s*\(/);
    expect(adapter).not.toMatch(/XMLHttpRequest|axios|https?:\/\/(?!example)/);
  });
});
