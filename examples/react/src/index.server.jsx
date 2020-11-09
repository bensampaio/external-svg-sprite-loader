import express from 'express';
import fs from 'fs';
import http from 'http';
import React from 'react';
import { renderToString } from 'react-dom/server';

import App from './App.jsx';

const app = express();

app.use(express.static('public', {
    maxAge: Infinity,
}));

app.get('*', (request, response) => {
    const content = renderToString(<App />);

    fs.readFile('public/build/index.html', 'utf8', (err, document) => {
        response.send(document.replace('<div id="root"></div>', `<div id="root">${content}</div>`));
    });
});

http.createServer(app).listen(3000);
