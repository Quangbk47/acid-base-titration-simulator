import { createServer } from 'node:http';
import { existsSync, readFileSync, realpathSync, statSync } from 'node:fs';
import { extname, join, normalize, relative, resolve, sep } from 'node:path';
import { isPathInsideRoot } from './path-security.mjs';

const root = resolve(import.meta.dirname, '..');
const port = Number(process.env.PORT ?? 4173);
const contentTypes = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
};

const server = createServer((request, response) => {
  response.setHeader('X-Content-Type-Options', 'nosniff');
  response.setHeader('Referrer-Policy', 'no-referrer');
  response.setHeader('Cache-Control', 'no-store');
  const deny = (status, message) => { response.writeHead(status); response.end(message); };
  if (!['GET', 'HEAD'].includes(request.method)) { response.setHeader('Allow', 'GET, HEAD'); deny(405, 'Method Not Allowed'); return; }
  if (!/^(?:localhost|127\.0\.0\.1|\[::1\])(?::\d+)?$/i.test(request.headers.host ?? '')) { deny(403, 'Forbidden'); return; }
  let requestPath;
  try { requestPath = decodeURIComponent(new URL(request.url ?? '/', 'http://localhost').pathname); }
  catch { deny(400, 'Bad Request'); return; }
  // Browsers request this automatically; the project has no favicon asset.
  if (requestPath === '/favicon.ico') { response.writeHead(204); response.end(); return; }
  if (requestPath.includes('\0') || requestPath.includes('\\') || requestPath.split('/').some((part) => part.startsWith('.'))) { deny(403, 'Forbidden'); return; }
  const candidate = resolve(root, `.${normalize(requestPath)}`);
  if (!isPathInsideRoot(root, candidate)) { deny(403, 'Forbidden'); return; }
  const route = ['/', '/simulate', '/simulate/', '/index.html'].includes(requestPath);
  const asset = /^\/(?:assets|src)\//.test(requestPath) && Object.hasOwn(contentTypes, extname(candidate)) && extname(candidate) !== '.html';
  if (!route && !asset) { deny(404, 'Not Found'); return; }
  const file = route ? join(root, 'index.html') : candidate;
  try {
    if (!existsSync(file) || !statSync(file).isFile()) { deny(404, 'Not Found'); return; }
    const actual = realpathSync(file);
    if (!isPathInsideRoot(root, actual)) { deny(403, 'Forbidden'); return; }
    const actualPath = '/' + relative(root, actual).split(sep).join('/');
    if (actualPath.split('/').some((part) => part.startsWith('.')) || (route ? actualPath !== '/index.html' : !/^\/(?:assets|src)\//.test(actualPath) || !Object.hasOwn(contentTypes, extname(actual)) || extname(actual) === '.html')) { deny(403, 'Forbidden'); return; }
    const content = request.method === 'HEAD' ? null : readFileSync(actual);
    response.writeHead(200, { 'Content-Type': contentTypes[extname(file)] });
    response.end(content);
  } catch { deny(500, 'Internal Server Error'); }
});

server.listen(port, '127.0.0.1', () => {
  console.log(`Preview running at http://localhost:${server.address().port}`);
});

process.on('SIGINT', () => server.close(() => process.exit(0)));
