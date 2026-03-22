const http = require('http');

const endpoints = ['class', 'student', 'teacher', 'subject', 'marks'];

endpoints.forEach(ep => {
  http.get(`http://localhost:3000/api/${ep}`, (res) => {
    let rawData = '';
    res.on('data', (chunk) => { rawData += chunk; });
    res.on('end', () => {
      console.log(`\nEndpoint: ${ep}`);
      console.log(`Status: ${res.statusCode}`);
      console.log(`Body: ${rawData.substring(0, 100)}`);
    });
  }).on('error', (e) => {
    console.error(`Error on ${ep}: ${e.message}`);
  });
});
