// Packages the built Studio as one self-contained page fragment for the private claude.ai page.
// That page's host wraps the fragment in its own document skeleton, so this file has no <html>, <head>, or <body>.
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';

const dist = new URL('../dist/', import.meta.url);
let js = readFileSync(new URL('assets/app.js', dist), 'utf8');
const css = readFileSync(new URL('assets/style.css', dist), 'utf8');

if (/<\/style/i.test(css)) throw new Error('The stylesheet contains a closing style tag and cannot be inlined safely.');
// A literal closing script tag inside the bundle would end the inline script early.
js = js.replace(/<\/script/gi, '<\\/script');
if (js.includes('<!--')) throw new Error('The bundle contains "<!--", which is unsafe inside an inline script. Inspect it before publishing.');

const page = [
  '<title>Refraction Studio</title>',
  '<meta name="claude:viewport-fit-sides" content="cover">',
  `<style>${css}</style>`,
  '<div id="root"></div>',
  `<script type="module">${js}</script>`,
  '',
].join('\n');

mkdirSync(new URL('artifact/', dist), { recursive: true });
writeFileSync(new URL('artifact/refraction-studio.html', dist), page);
// A local test copy, wrapped the way the host wraps it.
const reset = ':root{color-scheme:light;padding:env(safe-area-inset-top,0px) 0 env(safe-area-inset-bottom,0px)}body{margin:0;font:14px system-ui}img{max-width:100%}[hidden]{display:none!important}';
writeFileSync(new URL('artifact/local-test.html', dist), `<!doctype html><html><head><meta charset=utf8><meta name=viewport content="width=device-width,initial-scale=1,viewport-fit=cover"><style>${reset}</style></head><body>${page}</body></html>`);
console.log(`artifact: ${(page.length / 1024).toFixed(0)} KB`);
