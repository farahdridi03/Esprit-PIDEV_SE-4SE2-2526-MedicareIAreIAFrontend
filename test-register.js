const http = require('http');

const payload = {
  fullName: "Test Provider",
  email: "testprovider" + Date.now() + "@example.com",
  phone: "12345678",
  birthDate: "1990-01-01",
  role: "HOME_CARE_PROVIDER",
  gender: "MALE",
  bloodType: "O_POS",
  password: "password123"
};

const boundary = '----WebKitFormBoundary7MA4YWxkTrZu0gW';
let postData = '';
postData += `--${boundary}\r\n`;
postData += `Content-Disposition: form-data; name="user"\r\n\r\n`;
postData += `${JSON.stringify(payload)}\r\n`;
postData += `--${boundary}\r\n`;
postData += `Content-Disposition: form-data; name="document"; filename="test.txt"\r\n`;
postData += `Content-Type: text/plain\r\n\r\n`;
postData += `This is a test document.\r\n`;
postData += `--${boundary}--\r\n`;

const options = {
  hostname: 'localhost',
  port: 8081,
  path: '/springsecurity/auth/register',
  method: 'POST',
  headers: {
    'Content-Type': `multipart/form-data; boundary=${boundary}`,
    'Content-Length': Buffer.byteLength(postData)
  }
};

const req = http.request(options, (res) => {
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  res.on('end', () => {
    console.log(`STATUS: ${res.statusCode}`);
    console.log(`BODY: ${data}`);
  });
});

req.on('error', (e) => {
  console.error(`Problem with request: ${e.message}`);
});

req.write(postData);
req.end();
