'use strict';
const path = require('path');
const GameController = require('./app/controllers/game-controller');
const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const favicon = require('serve-favicon');
const lessMiddleware = require('less-middleware');

app.use(lessMiddleware(path.join(__dirname, 'public')));
// Expose all static resources in /public
app.use(express.static(path.join(__dirname, 'public')));
app.use(favicon(path.join(__dirname, 'public', 'favicon.png')));

// Public landing page describing the project
app.get('/', (request, response) => {
    response.send(`<!DOCTYPE html>
        <html lang="pt-BR">
            <head>
                <meta charset="utf-8" />
                <title>Snake Academy - Jogo Educacional</title>
                <meta name="description" content="Snake Academy é um jogo educacional que ensina lógica e pensamento computacional de maneira divertida." />
                <meta name="keywords" content="jogo educacional, lógica, programação, pensamento computacional, snake" />
                <meta name="author" content="Snake Academy" />
                <link rel="icon" href="https://www.w3.org/2008/site/images/favicon.ico" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <style>
                    body { font-family: Arial, sans-serif; margin: 0; padding: 40px; background: #0d1117; color: #f1f5f9; }
                    main { max-width: 720px; margin: 0 auto; line-height: 1.6; }
                    h1 { font-size: 2.25rem; margin-bottom: 0.5rem; }
                    p { font-size: 1.125rem; }
                </style>
            </head>
            <body>
                <main>
                    <h1>Snake Academy</h1>
                    <p>Snake Academy é um jogo educacional multiplayer inspirado no clássico Snake. Ele foi criado para ajudar estudantes a praticarem lógica, coordenação e pensamento estratégico, enquanto se divertem com partidas em tempo real.</p>
                    <p>O projeto demonstra conceitos de programação em Node.js, comunicação via WebSockets e criação de jogos interativos no navegador. É ideal para professores que desejam introduzir tecnologia em sala de aula ou para estudantes curiosos sobre desenvolvimento web.</p>
                    <p>Palavras-chave: aprendizagem baseada em jogos, tecnologia educacional, gamificação, lógica de programação, colaboração.</p>
                </main>
            </body>
        </html>`);
});

// Create the main controller
const gameController = new GameController();
gameController.listen(io);

const SERVER_PORT = process.env.PORT || 4000;
app.set('port', SERVER_PORT);

// Start Express server
server.listen(app.get('port'), () => {
    console.log('Express server listening on port %d in %s mode', app.get('port'), app.get('env'));
});

module.exports = app;
