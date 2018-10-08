const http = require('http');

const port = 3000;

const requestHandler = (request, response) => {
  console.log(request.url);
  response.end('Hello Node.js Server!');
};

const server = http.createServer(requestHandler);

export async function serverStart() {
  return server.listen(port, err => {
    if (err) {
      return console.log('something bad happened', err);
    }

    console.log(`server is listening on ${port}`);
  });
}

export async function serverStop() {
  return server.close();
}
