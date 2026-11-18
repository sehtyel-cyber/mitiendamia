const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;

const MIME_TYPES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

const server = http.createServer((req, res) => {
  let cleanUrl = req.url.split('?')[0];
  let reqPath = cleanUrl;

  // Rutas del SPA: / y /admin sirven index.html (la aplicación completa)
  if (cleanUrl === '/' || cleanUrl === '/pedido') {
    reqPath = '/index.html';
  } else if (cleanUrl === '/admin') {
    reqPath = '/index.html';
  } else {
    reqPath = cleanUrl;
  }

  let filePath = path.join(__dirname, reqPath);
  let ext = path.extname(filePath).toLowerCase();
  let contentType = MIME_TYPES[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, content) => {
    if (err) {
      if (err.code === 'ENOENT') {
        res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('404 Not Found');
      } else {
        res.writeHead(500);
        res.end(`Server Error: ${err.code}`);
      }
    } else {
      res.writeHead(200, { 'Content-Type': contentType + '; charset=utf-8' });
      res.end(content, 'utf-8');
    }
  });
});

server.listen(PORT, () => {
  console.log(`\n======================================================`);
  console.log(`?? LOGIX FASHION - Servidor Activo`);
  console.log(`?? Tienda pública: http://localhost:${PORT}/`);
  console.log(`?? Panel admin:    http://localhost:${PORT}/admin`);
  console.log(`?? Modo demo: contraseña admin123`);
  console.log(`======================================================\n`);
});
