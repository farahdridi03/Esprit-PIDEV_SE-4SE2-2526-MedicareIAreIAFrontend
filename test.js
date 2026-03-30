const http = require('http');

const options = {
  hostname: 'localhost',
  port: 8081,
  path: '/springsecurity/api/v1/providers/1/availabilities?from=2026-03-23T00:00:00&to=2026-03-23T23:59:59&status=AVAILABLE',
  method: 'GET'
};

const req = http.request(options, res => {
  let body = '';
  res.on('data', d => body += d);
  res.on('end', () => {
    console.log("STATUS:", res.statusCode);
    console.log("BODY:", body);
  });
});

req.on('error', error => {
  console.error(error);
});

req.end();
