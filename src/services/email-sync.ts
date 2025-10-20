// src/services/email-sync.ts
import Imap from 'imap';
import { simpleParser } from 'mailparser';
import { Server } from 'socket.io';
import { indexEmail } from './elasticsearch';

export const syncEmails = (config: Imap.Config, io: Server) => {
    const imap = new Imap(config);

    imap.once('ready', () => {
        console.log('IMAP connection ready.');
        // THIS IS THE FIX: Change 'true' to 'false'
        imap.openBox('INBOX', false, (err, box) => {
            if (err) throw err;
            console.log('Inbox opened. Listening for new mail...');
            
            imap.on('mail', () => {
                console.log('New mail event received! Fetching...');
                fetchAndProcessEmails(); 
            });

            fetchAndProcessEmails(); // Initial fetch for any unseen emails
        });
    });

    const fetchAndProcessEmails = () => {
        imap.search(['UNSEEN'], (err, results) => {
            if (err) throw err;
            if (results.length === 0) {
                console.log('No new emails to process.');
                return;
            }

            const f = imap.fetch(results, { bodies: '' });
            f.on('message', (msg, seqno) => {
                msg.on('body', (stream) => {
                    simpleParser(stream as any, async (err, parsed) => {
                        if (err) {
                            console.error('Error parsing email:', err);
                            return;
                        }
                        
                        await indexEmail(parsed);
                        io.emit('new-email', parsed);
                        console.log('Broadcasted new email over WebSocket');
                    });
                });
            });
            f.once('error', (err) => {
                console.log('Fetch error: ' + err);
            });
            f.once('end', () => {
                console.log('Done fetching new messages!');
                imap.addFlags(results, ['\\Seen'], (err) => {
                    if (err) {
                        console.log('Error marking emails as seen:', err);
                    } else {
                        console.log('Successfully marked emails as seen.');
                    }
                });
            });
        });
    };

    imap.once('error', (err: Error) => console.error('IMAP Error:', err));
    imap.once('end', () => console.log('IMAP connection ended'));
    imap.connect();
};