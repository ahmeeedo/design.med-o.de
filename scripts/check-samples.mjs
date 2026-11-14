/**
 * Code samples type-check: every fenced block with the language ts or tsx in content/**\/*.mdx is compiled with the
 * installed TypeScript against the installed packages, so a sample that no longer matches the API fails here.
 * Each block becomes one module in a temp folder (os.tmpdir()), named after its MDX file and block number, with a
 * header comment naming its source. The temp folder gets a node_modules link to this repo's node_modules, so imports
 * and @types resolve exactly as in the site. Errors are reported with the MDX path and line, never the temp path.
 *
 * Skip a block on purpose with the info string `tsx nocheck` or `ts nocheck`, e.g. for a fragment that is not a
 * complete module. Exit 1 on a type error, 0 when every block passes or there is nothing to check.
 */
import { execFileSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, symlinkSync, unlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('../', import.meta.url));
const LANGUAGES = new Set(['ts', 'tsx']);
// The header comment shifts every sample by this many lines; errors are mapped back with it.
const HEADER_LINES = 1;

/** Every .mdx file under dir, as repo-relative POSIX paths. */
function listMdx(dir) {
  const files = [];
  for (const entry of readdirSync(join(ROOT, dir), { withFileTypes: true })) {
    const path = `${dir}/${entry.name}`;
    if (entry.isDirectory()) files.push(...listMdx(path));
    else if (entry.name.endsWith('.mdx')) files.push(path);
  }
  return files.sort();
}

/**
 * The ts and tsx blocks of one MDX file as { lang, line, code }, where line is the 1-based line of the first code
 * line. Follows CommonMark fences: ``` or ~~~, three or more, closed by the same character at least as long.
 */
function extractBlocks(source) {
  const blocks = [];
  let open = null;
  source.split(/\r?\n/).forEach((text, index) => {
    if (!open) {
      const match = /^ {0,3}(`{3,}|~{3,})\s*([^\s`]*)\s*(.*)$/.exec(text);
      if (match) open = { fence: match[1], lang: match[2], flags: match[3].split(/\s+/), start: index + 1, code: [] };
      return;
    }
    const close = /^ {0,3}(`{3,}|~{3,})\s*$/.exec(text);
    if (close && close[1][0] === open.fence[0] && close[1].length >= open.fence.length) {
      if (LANGUAGES.has(open.lang) && !open.flags.includes('nocheck')) {
        blocks.push({ lang: open.lang, line: open.start + 1, code: open.code.join('\n') });
      }
      open = null;
      return;
    }
    open.code.push(text);
  });
  return blocks;
}

/** Runs tsc on the samples in a temp folder and returns its output; empty when everything type-checks. */
function typeCheck(samples) {
  const temp = mkdtempSync(join(tmpdir(), 'medo-samples-'));
  const link = join(temp, 'node_modules');
  try {
    // A junction on Windows needs no admin rights; elsewhere it is a plain directory link.
    symlinkSync(join(ROOT, 'node_modules'), link, process.platform === 'win32' ? 'junction' : 'dir');
    mkdirSync(join(temp, 'samples'));
    for (const sample of samples) {
      // `export {}` makes every sample a module, so two samples may declare the same name.
      const code = `// ${sample.mdx}:${sample.line}\n${sample.code}\nexport {};\n`;
      writeFileSync(join(temp, 'samples', sample.name), code);
    }
    // The compiler options of the site's tsconfig.json that matter for a sample; no Next plugin, no incremental.
    const tsconfig = {
      compilerOptions: {
        target: 'ES2022',
        lib: ['dom', 'dom.iterable', 'esnext'],
        module: 'esnext',
        moduleResolution: 'bundler',
        jsx: 'react-jsx',
        strict: true,
        noEmit: true,
        skipLibCheck: true,
        isolatedModules: true,
        esModuleInterop: true,
        resolveJsonModule: true,
        types: ['react', 'node'],
        rootDir: 'samples',
      },
      include: ['samples'],
    };
    writeFileSync(join(temp, 'tsconfig.json'), JSON.stringify(tsconfig, null, 2));

    const tsc = join(ROOT, 'node_modules', 'typescript', 'bin', 'tsc');
    try {
      execFileSync(process.execPath, [tsc, '-p', join(temp, 'tsconfig.json'), '--pretty', 'false'], {
        cwd: ROOT,
        encoding: 'utf8',
        stdio: ['ignore', 'pipe', 'pipe'],
      });
      return '';
    } catch (error) {
      const output = `${error.stdout ?? ''}${error.stderr ?? ''}`;
      if (!output.trim()) throw error;
      return output;
    }
  } finally {
    // Remove the link first, so the recursive delete never reaches the repo's node_modules.
    try {
      unlinkSync(link);
    } catch {}
    rmSync(temp, { recursive: true, force: true });
  }
}

const samples = [];
for (const mdx of listMdx('content')) {
  extractBlocks(readFileSync(join(ROOT, mdx), 'utf8')).forEach((block, index) => {
    const name = `${mdx.replace(/\.mdx$/, '').replace(/[^\w-]+/g, '_')}__${index + 1}.${block.lang}`;
    samples.push({ ...block, mdx, name });
  });
}

if (samples.length === 0) {
  console.log('Code samples: no ts or tsx block in content/, nothing to check.');
} else {
  const output = typeCheck(samples);
  if (!output) {
    console.log(`Code samples: ${samples.length} blocks type-check.`);
  } else {
    // tsc prints "<path>(<line>,<col>): error TS<code>: <message>"; continuation lines stay as they are.
    const byName = new Map(samples.map((s) => [s.name, s]));
    const report = output
      .trimEnd()
      .split(/\r?\n/)
      .map((text) => {
        const match = /^.*?[\\/]samples[\\/]([^\\/(]+)\((\d+),(\d+)\): (.*)$/.exec(text);
        const sample = match && byName.get(match[1]);
        if (!sample) return text;
        return `${sample.mdx}:${sample.line + Number(match[2]) - 1 - HEADER_LINES}:${match[3]} ${match[4]}`;
      });
    console.error(`Code samples: type errors in ${samples.length} checked blocks:\n\n${report.join('\n')}`);
    process.exitCode = 1;
  }
}
