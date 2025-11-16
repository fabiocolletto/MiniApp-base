const { spawn } = require('child_process');
const net = require('net');
const path = require('path');

async function findAvailablePort(start = 8000, attempts = 15) {
    for (let offset = 0; offset < attempts; offset += 1) {
        const port = start + offset;
        const available = await new Promise((resolve) => {
            const tester = net.createServer()
                .once('error', () => resolve(false))
                .once('listening', () => tester.once('close', () => resolve(true)).close())
                .listen(port);
        });
        if (available) {
            return port;
        }
    }
    throw new Error('Nenhuma porta disponível encontrada para o servidor de teste.');
}

async function startStaticServer({ root = path.join(__dirname, '..'), preferredPort = 8000 } = {}) {
    const port = await findAvailablePort(preferredPort);

    return new Promise((resolve, reject) => {
        const server = spawn('python3', ['-m', 'http.server', String(port)], {
            cwd: root,
            stdio: ['ignore', 'pipe', 'pipe']
        });

        let settled = false;
        const cleanup = () => {
            server.stdout.off('data', onData);
            server.stderr.off('data', onData);
            server.off('error', onError);
            server.off('exit', onExit);
            clearTimeout(timeoutId);
        };

        const onData = (data) => {
            const text = data.toString();
            if (!settled && text.toLowerCase().includes('serving http')) {
                settled = true;
                cleanup();
                resolve({ port, stop: () => server.kill('SIGTERM') });
            }
        };

        const onError = (error) => {
            if (!settled) {
                settled = true;
                cleanup();
                reject(error);
            }
        };

        const onExit = (code) => {
            if (!settled) {
                settled = true;
                cleanup();
                reject(new Error(`Servidor de teste encerrado com código ${code}.`));
            }
        };

        const timeoutId = setTimeout(() => {
            if (!settled) {
                settled = true;
                cleanup();
                resolve({ port, stop: () => server.kill('SIGTERM') });
            }
        }, 1500);

        server.stdout.on('data', onData);
        server.stderr.on('data', onData);
        server.on('error', onError);
        server.on('exit', onExit);
    });
}

module.exports = { startStaticServer };
