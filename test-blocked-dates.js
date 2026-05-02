// Simple Node.js HTTP test for blocked dates endpoint
const http = require('http');
const url = 'http://localhost:8081/springsecurity/api/homecare/providers/6/blocked-dates?from=2026-03-28&to=2026-06-26';

const req = http.get(url, (res) => {
    console.log(`Status Code: ${res.statusCode}`);
    console.log(`Headers:`, res.headers);

    let data = '';
    res.on('data', (chunk) => {
        data += chunk;
    });

    res.on('end', () => {
        console.log('\nResponse Body:');
        console.log(data);

        if (res.statusCode === 200) {
            try {
                const parsed = JSON.parse(data);
                console.log('\n✅ Response parsed successfully:');
                console.log('Blocked dates:', parsed);
            } catch (e) {
                console.log('\n⚠️  Response is not valid JSON');
            }
        } else {
            console.log('\n❌ Error response');
        }
        process.exit(0);
    });
});

req.on('error', (err) => {
    console.error('\n❌ Request failed:', err.message);
    console.error('Make sure backend is running on port 8081');
    process.exit(1);
});

req.setTimeout(5000, () => {
    console.error('\n❌ Request timeout');
    req.destroy();
    process.exit(1);
});

console.log('Testing endpoint:', url);
console.log('Please wait...\n');
