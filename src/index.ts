// src/index.ts
import express, { Request, Response } from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { syncEmails } from './services/email-sync';
import { searchEmails } from './services/elasticsearch';
import Imap from 'imap';
import { emailQueue } from './services/queue';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer);
const port = 3000;

app.use(express.static('public'));
app.use(express.json());

const imapConfig: Imap.Config = {
    user: 'bhuvaneshmuvvala435@gmail.com',
    password: 'dhxp kdab ytsq puep',
    host: 'imap.gmail.com',
    port: 993,
    tls: true,
    tlsOptions: { rejectUnauthorized: false }
};

app.get('/', (req: Request, res: Response) => {
    res.send('Hello, ReachInbox! The services are running.');
});

app.get('/search', async (req: Request, res: Response) => {
    const query = req.query.q as string;
    if (!query) {
        return res.status(400).send({ error: 'Search query is required.' });
    }
    const results = await searchEmails(query);
    res.status(200).send(results);
});

app.post('/send-email', async (req, res) => {
    const { from, to, subject, body } = req.body;
    if (!from || !to || !subject || !body) {
      return res.status(400).send({ error: 'Missing required fields.' });
    }
  
    await emailQueue.add('send-email-job', { from, to, subject, body });
  
    res.status(202).send({ message: 'Email job accepted.' });
});

io.on('connection', (socket) => {
    console.log('A user connected via WebSocket');
    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});

// --- THIS IS THE FIX ---
// We wrap the startup logic in a function to add a delay.
const startApp = async () => {
    console.log('Application starting...');
    console.log('Waiting for 30 seconds for databases to be ready...');
    // Wait for 30 seconds
    await new Promise(resolve => setTimeout(resolve, 30000));
    console.log('Databases should be ready. Starting email sync...');

    // Now, start the email synchronization
    syncEmails(imapConfig, io);

    httpServer.listen(port, () => {
        console.log(`🚀 Server is running on http://localhost:${port}`);
    });
};

// Run the startup function
startApp();
// -----------------------