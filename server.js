const { log } = require('console');
const { json } = require('express');
const fs = require('fs');
const net = require('net');
const port = 9877;
let clientCount = 0;
let clientList = [];
const server = net.createServer((client) => {
    client.setEncoding('utf-8');
    clientCount++;
    client.clientName = `Guest${clientCount}`;
    clientList.push(client);
    client.write(`You are logged in as ${client.clientName}`);
    //messages each client about a new connection
    clientList.forEach(person => {
        if (person.clientName != client.clientName) {
            person.write(`${client.clientName} has joined the server`)
        }
    })
    client.on('data', (payload) => {
        //changes username
        if (payload.startsWith('/username')){
            let string = payload.substring(10);
            clientName = string.replace(/(\r\n|\n|\r)/gm, "");
            client.clientName = clientName;
            client.write(`You are now logged in as ${client.clientName}`);
        }
        //sends direct message to another player
        else if (payload.startsWith('/w')) {
            let words = payload.split(' ')
            let clientSearch = words[1];
            let notClient = 0;
            clientList.forEach(el => {
                if (el.clientName === clientSearch) {
                    let newWords = words.slice(2);
                    let message = newWords.reduce(
                        (previousValue, currentValue) => `${previousValue} ${currentValue}`
                    )
                    el.write(`${client.clientName} dm: ${message}`);
                }
                else {
                    notClient++;
                    if (notClient === clientList.length) {
                        client.write('user not found');
                    }
                }
            })
        }
        //kicks another user with admin password
        else if (payload.startsWith('/kick')) {
            let words = payload.split(' ');
            const password = 1234;
            if (words.length != 3) {
                client.write('invalid command')
            }
            else if (words[2] != password) {
                client.write('invalid password');
            }
            else {
                let notClient = 0;
                let clientSearch = words[1];
                clientList.forEach(person => {
                    if (person.clientName === clientSearch) {
                        if (person.clientName === client.clientName) {
                            client.write('you cannot kick yourself');
                        }
                        else {
                            person.write(`you've been kicked from the server`);
                            person.end();
                            client.write(`${person.clientName} was kicked from the server`);
                        }
                    }
                    else {
                        notClient++;
                        if (notClient === clientList.length) {
                            client.write('user not found');
                        }
                    }
                })
            }
        }
        //displays list of all server clients
        else if (payload.startsWith('/clientlist')) {
            clientList.forEach(person => {
                client.write(`${person.clientName} `);
            })
        }
        // allows client to exit
        else if (payload.startsWith('/exit')) {
            for (i = 0; i < clientList.length; i++) {
                if (clientList[i].clientName === client.clientName) {
                    clientList.splice(i, 1);
                    clientList.forEach(person => {
                        person.write(`${client.clientName} left the server`);
                    })
                }
            }
            client.end();
        }
        // sends message to server
        else {
            console.log(`${client.clientName}: ${payload}`);
            clientList.forEach(person => {
                if (person.clientName != client.clientName) {
                    person.write(`${client.clientName}: ${payload}`)
                }
            })
        }

    })
    
});

server.listen(port, () => {

})