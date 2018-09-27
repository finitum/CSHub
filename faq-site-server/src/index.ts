import {LIVE} from './settings_baseline';

import https from 'https';
import http from 'http';
import express from 'express';
import fs from 'fs';
import io from 'socket.io';

export const app: express.Application = express();

//Read the public key
export const pubKey = fs.readFileSync('certs/csedelft-pubkey.pem');

//Read the private key
const options = {
    key: fs.readFileSync('certs/csedelft-privkey.pem'),
    cert: pubKey
};

let server: http.Server | https.Server;

if (LIVE) {
    //Run the server on port 443 if live
    server = https.createServer(options, app).listen(443);

    //Use port 80 (http), but redirect to 443 (https)
    http.createServer((req, res) => {
        res.writeHead(301, {Location: 'https://' + req.headers.host + req.url});
        res.end();
    }).listen(80);

} else {
    //Run the server on port 3000 if running local
    server = http.createServer(app).listen(3000);
}

//Let the sockets listen to the server
export const socket = io.listen(server);

//Serve the built angular files
app.use(express.static('../faq-site-client/dist'));

console.log('Express server started');