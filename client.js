const net = require('net');
const port = 9877;

const client = net.createConnection( {port: port}, ()=>{
    console.log(`connected to server`);
})
client.setEncoding('utf-8')
process.stdin.setEncoding('utf-8')
process.stdin.pipe(client);

client.on('data', (message)=>{
    console.log(`${message}`);
})