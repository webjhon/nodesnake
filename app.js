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
                <meta name="description" content="Snake Academy é um jogo educacional minimalista que conecta lógica, programação e diversão em partidas multiplayer." />
                <meta name="keywords" content="jogo educacional, lógica, programação, snake multiplayer, pensamento computacional" />
                <meta name="author" content="Snake Academy" />
                <link rel="icon" href="https://www.w3.org/2008/site/images/favicon.ico" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <style>
                    :root {
                        color-scheme: dark;
                        font-family: 'Inter', 'Segoe UI', system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
                        --bg: #05060a;
                        --bg-glow: radial-gradient(circle at top, rgba(16, 205, 144, 0.18), transparent 55%);
                        --panel: rgba(7, 11, 20, 0.82);
                        --border: rgba(255, 255, 255, 0.08);
                        --text: #e9eef5;
                        --muted: #97a0b5;
                        --accent: #52f3c1;
                        --accent-strong: #14b884;
                    }
                    *, *::before, *::after { box-sizing: border-box; }
                    body {
                        margin: 0;
                        min-height: 100vh;
                        background: var(--bg);
                        color: var(--text);
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        padding: 32px 16px;
                        background-image: var(--bg-glow);
                        letter-spacing: 0.01em;
                    }
                    main {
                        width: min(940px, 100%);
                        border-radius: 32px;
                        border: 1px solid var(--border);
                        background: var(--panel);
                        backdrop-filter: blur(16px);
                        padding: clamp(32px, 6vw, 56px);
                        display: grid;
                        gap: 24px;
                    }
                    header h1 {
                        font-size: clamp(2.2rem, 4vw, 3rem);
                        margin: 0 0 8px;
                        font-weight: 600;
                    }
                    header p {
                        margin: 0;
                        color: var(--muted);
                        font-size: 1.05rem;
                    }
                    .tag {
                        display: inline-flex;
                        align-items: center;
                        gap: 8px;
                        text-transform: uppercase;
                        letter-spacing: 0.18em;
                        font-size: 0.75rem;
                        color: var(--accent);
                        margin-bottom: 12px;
                    }
                    .tag::before {
                        content: '';
                        width: 32px;
                        height: 1px;
                        background: linear-gradient(90deg, transparent, var(--accent));
                    }
                    section {
                        display: grid;
                        gap: 16px;
                    }
                    .features {
                        display: grid;
                        grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
                        gap: 16px;
                    }
                    .feature-card {
                        border: 1px solid var(--border);
                        border-radius: 20px;
                        padding: 18px;
                        background: rgba(255, 255, 255, 0.02);
                        min-height: 140px;
                        display: flex;
                        flex-direction: column;
                        gap: 8px;
                    }
                    .feature-card span {
                        font-size: 0.82rem;
                        letter-spacing: 0.12em;
                        color: var(--muted);
                    }
                    .feature-card strong {
                        font-size: 1.05rem;
                        font-weight: 600;
                    }
                    .cta-button {
                        justify-self: start;
                        padding: 0.95rem 2.4rem;
                        border-radius: 999px;
                        border: none;
                        text-decoration: none;
                        font-weight: 600;
                        color: #020305;
                        background: linear-gradient(120deg, var(--accent), var(--accent-strong));
                        box-shadow: 0 15px 35px rgba(20, 184, 132, 0.32);
                        transition: transform 180ms ease, box-shadow 180ms ease;
                    }
                    .cta-button:hover {
                        transform: translateY(-3px);
                        box-shadow: 0 20px 40px rgba(20, 184, 132, 0.45);
                    }
                    .cta-button:focus-visible {
                        outline: 3px solid rgba(82, 243, 193, 0.8);
                        outline-offset: 4px;
                    }
                </style>
            </head>
            <body>
                <main>
                    <header>
                        <div class="tag">Jogo educacional</div>
                        <h1>Snake Academy</h1>
                        <p>Uma experiência multiplayer minimalista para praticar lógica, pensamento computacional e colaboração em tempo real.</p>
                    </header>
                    <section>
                        <p>Snake Academy conecta estética gamer elegante com um foco pedagógico claro. A cada partida, estudantes exploram estratégias, fortalecem raciocínio espacial e vivenciam conceitos de programação em Node.js e WebSockets.</p>
                    </section>
                    <section class="features">
                        <article class="feature-card">
                            <span>Conceito</span>
                            <strong>Gamificação aplicada à educação para engajar e ensinar.</strong>
                        </article>
                        <article class="feature-card">
                            <span>Tecnologia</span>
                            <strong>Node.js, WebSockets e interface responsiva para múltiplos dispositivos.</strong>
                        </article>
                        <article class="feature-card">
                            <span>Competências</span>
                            <strong>Lógica, coordenação motora fina e trabalho em equipe.</strong>
                        </article>
                    </section>
                    <a class="cta-button" href="/play">Jogar Snake Academy</a>
                </main>
            </body>
        </html>`);
});

// Route that exposes the multiplayer game interface
app.get('/play', (request, response) => {
    response.sendFile(path.join(__dirname, 'app', 'views', 'game.html'));
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
