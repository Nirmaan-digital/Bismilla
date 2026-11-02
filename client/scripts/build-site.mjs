// ============================================
// Website build that never leaves the live site empty.
// Vite normally wipes dist/ before building, so while a deploy is building
// (or if the build fails) the running site has no files and shows
// "Not Found". Here the new build goes to .dist-next/ and replaces dist/
// only once it has finished successfully.
// ============================================
import { execSync } from 'node:child_process';
import { existsSync, renameSync, rmSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(root, 'dist');
const next = path.join(root, '.dist-next');
const old = path.join(root, '.dist-old');

rmSync(next, { recursive: true, force: true });
execSync(`npx vite build --outDir "${next}" --emptyOutDir`, { cwd: root, stdio: 'inherit' });

if (!existsSync(path.join(next, 'index.html'))) {
  console.error('Build finished without index.html; keeping the current site.');
  process.exit(1);
}

rmSync(old, { recursive: true, force: true });
if (existsSync(dist)) renameSync(dist, old);
renameSync(next, dist);
rmSync(old, { recursive: true, force: true });
console.log('✔ Website build is live in dist/');
