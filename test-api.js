const http = require('http');

const options = {
    hostname: '127.0.0.1',
    port: 5000,
    path: '/api/address/suggest?q=' + encodeURIComponent('837 W 103rd Street'),
    method: 'GET'
};

const req = http.request(options, (res) => {
    let data = '';
    res.on('data', (chunk) => {
        data += chunk;
    });
    res.on('end', () => {
        console.log('Status:', res.statusCode);
        console.log('Body:', data);
    });
});

req.on('error', (e) => {
    console.error('Error:', e.message);
});

req.end();
