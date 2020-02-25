const http = require('http');

const port = 3000;

const HTML_RESPONSE =
  '<!Doctype html><html><head><title>Testing Eyes.it</title></head><body><h1 style="color:orangered">HELLO WORLD</h1></body></html>';

export class MockServer {
  static URI = 'http://localhost:3000';

  server;

  requestHandler(req, res) {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.write(HTML_RESPONSE);
    res.end();
  }

  start() {
    this.server = http.createServer(this.requestHandler);

    this.server.listen(port, err => {
      if (err) {
        return console.log('something bad happened', err);
      }

      console.log(`server is listening on ${port}`);
    });
  }

  stop() {
    this.server.close();
  }
}
