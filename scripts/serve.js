'use strict';
const http = require('node:http');
const { readFile, stat } = require('node:fs/promises');
const { resolve, extname, sep } = require('node:path');
const root = resolve(__dirname, '..');
const port = Number(process.env.PORT || 3000);
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png' };
http.createServer(async (request, response) => {
  try {
    const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
    const file = resolve(root, `.${pathname === '/' ? '/index.html' : pathname}`);
    const relative = file.slice(root.length).split(/[\\/]/);
    if (!file.startsWith(root + sep) || relative.some((part) => part.startsWith('.')) || !['.html', '.css', '.js', '.svg', '.png'].includes(extname(file))) {
      response.writeHead(403); response.end('Acceso no permitido'); return;
    }
    if (!(await stat(file)).isFile()) throw new Error('Not found');
    response.writeHead(200, { 'Content-Type': types[extname(file)], 'X-Content-Type-Options': 'nosniff' });
    response.end(await readFile(file));
  } catch { response.writeHead(404); response.end('Archivo no encontrado'); }
}).listen(port, '127.0.0.1', () => console.log(`Abre http://localhost:${port}`));
