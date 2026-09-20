import { createServer } from 'node:http';
import { existsSync, readFileSync, statSync } from 'node:fs';
import { extname, join, normalize, resolve } from 'node:path';
import { isPathInsideRoot } from './path-security.mjs';

const root = resolve(import.meta.dirname, '..');
const port = Number(process.env.PORT ?? 4173);
const contentTypes = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
};

const server = createServer((request, response) => {
  const requestPath = decodeURIComponent(new URL(request.url ?? '/', `http://${request.headers.host ?? 'localhost'}`).pathname);
  const candidate = resolve(root, `.${normalize(requestPath)}`);
  if (!isPathInsideRoot(root, candidate)) {
    response.writeHead(403);
    response.end('Forbidden');
    return;
  }

  const file = existsSync(candidate) && statSync(candidate).isFile() ? candidate : join(root, 'index.html');
  const type = contentTypes[extname(file)] ?? 'application/octet-stream';
  response.writeHead(200, { 'Content-Type': type, 'Cache-Control': 'no-store' });
  response.end(readFileSync(file));
});

server.listen(port, '127.0.0.1', () => {
  console.log(`Preview running at http://localhost:${port}`);
});

process.on('SIGINT', () => server.close(() => process.exit(0)));
