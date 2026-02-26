import http from 'http';

const REMOTE_URL = 'http://10.2.0.6:3005/health';

console.log('🔍 Checking Remote Backend Connection (10.2.0.6:3005)...');

http.get(REMOTE_URL, (res) => {
    if (res.statusCode === 200) {
        console.log('✅ Remote Backend is Reachable!');
        process.exit(0);
    } else {
        console.error(`❌ Remote Backend returned status: ${res.statusCode}`);
        process.exit(1);
    }
}).on('error', (err) => {
    console.error('❌ Cannot reach Remote Backend. Please ensure:');
    console.log('   1. You are connected to VPN');
    console.log('   2. The server 10.2.0.6 is online');
    console.log(`   (Error: ${err.message})`);
    process.exit(1);
});


