import { promises as fs } from 'node:fs';
import path from 'node:path';
import { defineConfig, type Plugin } from 'vite';

const PRECACHE_PLACEHOLDER = '__RAVEN_MANOR_PRECACHE_MANIFEST__';

const listFiles = async (directory: string, root = directory): Promise<string[]> => {
  const entries = await fs.readdir(directory, { withFileTypes: true });
  const files = await Promise.all(entries.map(async (entry) => {
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) return listFiles(absolute, root);
    return [path.relative(root, absolute).split(path.sep).join('/')];
  }));
  return files.flat();
};

const precacheManifestPlugin = (): Plugin => ({
  name: 'raven-manor-precache-manifest',
  apply: 'build',
  async writeBundle(outputOptions) {
    const outDir = path.resolve(outputOptions.dir ?? 'dist');
    const serviceWorkerPath = path.join(outDir, 'sw.js');
    const generatedFiles = await listFiles(outDir);
    const precachePaths = [
      './',
      ...generatedFiles
        .filter((file) => file !== 'sw.js' && !file.endsWith('.map'))
        .map((file) => `./${file}`),
    ];
    const uniquePaths = [...new Set(precachePaths)].sort();

    const source = await fs.readFile(serviceWorkerPath, 'utf8');
    const placeholderLiteral = `'${PRECACHE_PLACEHOLDER}'`;
    if (!source.includes(placeholderLiteral)) {
      throw new Error('Service worker precache placeholder was not found');
    }

    await fs.writeFile(
      serviceWorkerPath,
      source.replace(placeholderLiteral, JSON.stringify(uniquePaths)),
      'utf8',
    );
  },
});

export default defineConfig({
  base: './',
  plugins: [precacheManifestPlugin()],
});
