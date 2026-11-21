// VICE LEDGER — entrypoint (Node 22, standard library only).
// Hands the guide in: copies this repo's app/ and screenshots/ into the
// output directory and writes dossier.json with the vendored make.fun
// library, so the judge reads the screenshots and the source outline.
// Run locally with: mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
// (outside the grader, MAKEFUN_OUTPUT_DIR stands in for /output).
import { cpSync, existsSync, mkdirSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const repoRoot = fileURLToPath(new URL('.', import.meta.url));
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

// Fail early with a clear message if the guide is missing, instead of
// copying nothing and writing a dossier for an empty app.
if (!existsSync(join(repoRoot, 'app'))) {
  throw new Error('app/ is missing: nothing to hand in');
}
if (!existsSync(join(repoRoot, 'screenshots'))) {
  throw new Error('screenshots/ is missing: the judge reads the guide through its screenshots');
}

mkdirSync(outputDir, { recursive: true });
cpSync(join(repoRoot, 'app'), join(outputDir, 'app'), { recursive: true });
mkdirSync(join(outputDir, 'screenshots'), { recursive: true });
cpSync(join(repoRoot, 'screenshots'), join(outputDir, 'screenshots'), { recursive: true });

// The scorer's own caps: only text_max_bytes shapes the bytes; the rest
// refuse an entry the scorer would refuse (more than 4 screenshots, one
// over 256 KiB, more than 993 app files or 48 MiB of app files).
const dossierPath = join(outputDir, 'dossier.json');
writeFileSync(
  dossierPath,
  buildDossier(outputDir, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    app_max_files: 993,
    app_max_bytes: 50331648,
  }),
);

// One summary line so a run's result is visible without opening the file.
const shotCount = readdirSync(join(outputDir, 'screenshots')).length;
console.log(`VICE LEDGER handed in: dossier.json ${statSync(dossierPath).size} bytes, ${shotCount} screenshots.`);
