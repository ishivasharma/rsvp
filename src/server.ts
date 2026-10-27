import express from 'express';
import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { wedding } from './config';

type RSVP = { name: string; email: string; attendance: 'yes'|'no'; guests: number; events: string[]; message: string; submittedAt: string };
const app = express();
app.use(express.json({ limit: '16kb' }));
const root = path.dirname(fileURLToPath(import.meta.url));
const store = path.resolve(process.env.RSVP_STORE_PATH || path.join(root, '../data/rsvps.json'));
const validEvents = new Set<string>(wedding.events.map(event => event.title));
const clientBuild = path.resolve(root, '../dist');

app.post('/api/rsvps', async (req, res) => {
  const { name, email, attendance, guests, events, message } = req.body ?? {};
  const cleanedName = typeof name === 'string' ? name.trim() : '';
  const cleanedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';
  const cleanedMessage = typeof message === 'string' ? message.trim() : '';
  if (cleanedName.length < 2 || cleanedName.length > 120) return res.status(400).json({ error: 'Enter a name between 2 and 120 characters.' });
  if (cleanedEmail.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanedEmail)) return res.status(400).json({ error: 'Enter a valid email address.' });
  if (attendance !== 'yes' && attendance !== 'no') return res.status(400).json({ error: 'Choose an attendance option.' });
  const guestCount = Number(guests);
  if (attendance === 'yes' && (!Number.isInteger(guestCount) || guestCount < 1 || guestCount > 4)) return res.status(400).json({ error: 'Choose between 1 and 4 guests.' });
  if (cleanedMessage.length > 1000) return res.status(400).json({ error: 'Keep your message under 1,000 characters.' });
  if (!Array.isArray(events) || events.some((event: unknown) => typeof event !== 'string' || !validEvents.has(event))) return res.status(400).json({ error: 'Choose from the listed wedding events.' });
  const record: RSVP = { name: cleanedName, email: cleanedEmail, attendance, guests: attendance === 'yes' ? guestCount : 0, events: attendance === 'yes' ? [...new Set(events as string[])] : [], message: cleanedMessage, submittedAt: new Date().toISOString() };
  try {
    await mkdir(path.dirname(store), { recursive: true });
    let rows: RSVP[] = [];
    try { rows = JSON.parse(await readFile(store, 'utf8')) as RSVP[]; } catch (error) { if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error; }
    if (rows.some(row => row.email === cleanedEmail)) return res.status(409).json({ error: 'We already have an RSVP for this email. Please contact the couple if you need to change it.' });
    const temporary = `${store}.${process.pid}.tmp`;
    await writeFile(temporary, JSON.stringify([...rows, record], null, 2), { encoding: 'utf8', flag: 'wx' });
    await rename(temporary, store);
    return res.status(201).json({ message: 'Thank you for your reply. We can’t wait to celebrate with you!' });
  } catch (error) {
    console.error('RSVP storage error:', error);
    return res.status(500).json({ error: 'We couldn’t save your reply right now. Please try again later.' });
  }
});

app.use(express.static(clientBuild));
app.get(/.*/, (_req, res) => res.sendFile(path.join(clientBuild, 'index.html')));

const port = Number(process.env.PORT || 3000);
app.listen(port, () => console.log(`RSVP server listening on http://localhost:${port}`));
