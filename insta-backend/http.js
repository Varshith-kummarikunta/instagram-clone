const http = require("http");

const PORT = 8000;

const server = http.createServer((request, response) => {
  const url = request.url;
  console.log(url, "request recieved");
  const obj = { name: "Aman" };
  response.writeHead(200, { "Content-Type": "application/json" });
  response.write(JSON.stringify(obj));
  response.end();
});

server.listen(PORT, () => {
  console.log("Server is listening on port: ", PORT);
});
