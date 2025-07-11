const http = require('http');

// Test backend connection
const options = {
  hostname: 'localhost',
  port: 3001,
  path: '/health',
  method: 'GET',
};

const req = http.request(options, (res) => {
  console.log(`Backend Status: ${res.statusCode}`);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('Backend Response:', data);
  });
});

req.on('error', (err) => {
  console.error('Backend Connection Error:', err.message);
});

req.end();