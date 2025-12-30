const http = require('http');

const options = {
  hostname: '192.168.151.201',
  port: 8000,
  path: '/api/chat',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 5000 // 5 seconds timeout
};

console.log('Testing connection to http://192.168.151.201:8000/api/chat ...');

const req = http.request(options, (res) => {
  console.log(`STATUS: ${res.statusCode}`);
  console.log(`HEADERS: ${JSON.stringify(res.headers)}`);
  res.setEncoding('utf8');
  res.on('data', (chunk) => {
    console.log(`BODY: ${chunk}`);
  });
  res.on('end', () => {
    console.log('No more data in response.');
  });
});

req.on('timeout', () => {
  console.error('Request Timed Out (5s) - The server is not reachable.');
  req.destroy();
});

req.on('error', (e) => {
  console.error(`Problem with request: ${e.message}`);
});

// Write data to request body
req.write(JSON.stringify({
  messages: [{ role: 'user', content: 'ping' }],
  provider: 'deepseek'
}));

req.end();
