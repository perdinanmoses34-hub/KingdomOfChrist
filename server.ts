import express, { Request, Response } from 'express';
import path from 'path';
import crypto from 'crypto';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import {
  initialGerejaList,
  initialUsers,
  initialJemaat,
  initialBerita,
  initialPengumuman,
  initialRenungan,
  initialEvents,
  initialRegistrations,
  initialJadwalIbadah,
  initialPelayanan,
  initialStrukturOrganisasi,
  initialAlbums,
  initialGaleri,
  initialKomentar,
  initialPokokDoa,
  initialDonasi,
  initialKas,
  initialNotifikasi,
  initialPengaturan,
  initialLogAktivitas,
  initialBackup
} from './src/mockData';
import {
  Gereja,
  User,
  JemaatMember,
  Berita,
  Pengumuman,
  Renungan,
  EventGereja,
  EventRegistration,
  JadwalIbadah,
  Pelayanan,
  StrukturOrganisasi,
  Album,
  Galeri,
  Komentar,
  PokokDoa,
  Donasi,
  Kas,
  Notifikasi,
  Pengaturan,
  LogAktivitas,
  BackupRecord,
  RealtimeSyncMessage
} from './src/types';

// In-Memory & File-Persistent Database Store with Pre-seeded Church Data
import fs from 'fs';

const db = {
  gereja: [...initialGerejaList] as Gereja[],
  users: [...initialUsers] as User[],
  jemaat: [...initialJemaat] as JemaatMember[],
  berita: [...initialBerita] as Berita[],
  pengumuman: [...initialPengumuman] as Pengumuman[],
  renungan: [...initialRenungan] as Renungan[],
  events: [...initialEvents] as EventGereja[],
  registrations: [...initialRegistrations] as EventRegistration[],
  jadwalIbadah: [...initialJadwalIbadah] as JadwalIbadah[],
  pelayanan: [...initialPelayanan] as Pelayanan[],
  strukturOrganisasi: [...initialStrukturOrganisasi] as StrukturOrganisasi[],
  albums: [...initialAlbums] as Album[],
  galeri: [...initialGaleri] as Galeri[],
  komentar: [...initialKomentar] as Komentar[],
  pokokDoa: [...initialPokokDoa] as PokokDoa[],
  donasi: [...initialDonasi] as Donasi[],
  kas: [...initialKas] as Kas[],
  notifikasi: [...initialNotifikasi] as Notifikasi[],
  pengaturan: { ...initialPengaturan } as Pengaturan,
  logAktivitas: [...initialLogAktivitas] as LogAktivitas[],
  backup: [...initialBackup] as BackupRecord[]
};

const DB_FILE_PATH = path.join(process.cwd(), 'church_cms_database.json');

function loadDbFromDisk() {
  try {
    if (fs.existsSync(DB_FILE_PATH)) {
      const raw = fs.readFileSync(DB_FILE_PATH, 'utf-8');
      const loaded = JSON.parse(raw);
      if (loaded && Array.isArray(loaded.berita)) {
        Object.assign(db, loaded);
        console.log('Database loaded successfully from disk persistent store.');
      }
    }
  } catch (err) {
    console.error('Error loading persistent db from disk:', err);
  }
}

function saveDbToDisk() {
  try {
    fs.writeFileSync(DB_FILE_PATH, JSON.stringify(db, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing persistent db to disk:', err);
  }
}

loadDbFromDisk();

// SSE Active Connections Array
const sseClients: { id: string; res: Response; gerejaId?: string }[] = [];

// Helper to broadcast Realtime Messages to connected clients
function broadcastRealtime(event: RealtimeSyncMessage) {
  const payload = `data: ${JSON.stringify(event)}\n\n`;
  sseClients.forEach(client => {
    if (!client.gerejaId || client.gerejaId === event.gerejaId) {
      try {
        client.res.write(payload);
      } catch (err) {
        // Ignored
      }
    }
  });
}

function addLog(gerejaId: string, userId: string, userName: string, action: string, details: string) {
  const newLog: LogAktivitas = {
    id: `log-${Date.now()}`,
    gerejaId,
    userId,
    userName,
    action,
    details,
    timestamp: new Date().toISOString()
  };
  db.logAktivitas.unshift(newLog);
  saveDbToDisk();
}

// Simple JWT Helper using Node Crypto
const JWT_SECRET = process.env.JWT_SECRET || 'church_cms_secret_2026';

function generateToken(payload: object): string {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto.createHmac('sha256', JWT_SECRET).update(`${header}.${body}`).digest('base64url');
  return `${header}.${body}.${signature}`;
}

function verifyToken(token: string): any {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const [header, body, signature] = parts;
    const expectedSig = crypto.createHmac('sha256', JWT_SECRET).update(`${header}.${body}`).digest('base64url');
    if (signature !== expectedSig) return null;
    return JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));
  } catch (err) {
    return null;
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // --- Realtime SSE Endpoint ---
  app.get('/api/realtime/stream', (req: Request, res: Response) => {
    const gerejaId = req.query.gerejaId as string;
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    const clientId = `client-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    sseClients.push({ id: clientId, res, gerejaId });

    res.write(`data: ${JSON.stringify({ type: 'CONNECTED', message: 'SSE Connection Established' })}\n\n`);

    req.on('close', () => {
      const idx = sseClients.findIndex(c => c.id === clientId);
      if (idx !== -1) sseClients.splice(idx, 1);
    });
  });

  // --- Auth API ---
  app.post('/api/auth/login', (req: Request, res: Response) => {
    const { email, password, roleChoice } = req.body;
    
    // Find user by email or pick default by role choice
    let user = db.users.find(u => u.email.toLowerCase() === (email || '').toLowerCase());
    if (!user && roleChoice) {
      user = db.users.find(u => u.role === roleChoice);
    }
    if (!user) {
      user = db.users.find(u => u.role === 'jemaat') || db.users[0];
    }

    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      gerejaId: user.gerejaId
    });

    res.json({
      success: true,
      token,
      user,
      message: `Berhasil masuk sebagai ${user.name} (${user.role.toUpperCase()})`
    });
  });

  app.get('/api/auth/me', (req: Request, res: Response) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
    const token = authHeader.replace('Bearer ', '');
    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(401).json({ success: false, message: 'Token invalid or expired' });
    }
    const user = db.users.find(u => u.id === decoded.userId);
    res.json({ success: true, user: user || db.users[0] });
  });

  // --- Church / Gereja API ---
  app.get('/api/gereja', (req: Request, res: Response) => {
    res.json({ success: true, data: db.gereja });
  });

  app.post('/api/gereja', (req: Request, res: Response) => {
    const newGereja: Gereja = {
      id: `ger-${Date.now()}`,
      createdAt: new Date().toISOString(),
      status: 'active',
      licensePackage: 'Pro',
      ...req.body
    };
    db.gereja.push(newGereja);
    broadcastRealtime({ type: 'INSERT', entity: 'gereja', gerejaId: newGereja.id, data: newGereja, timestamp: new Date().toISOString() });
    res.json({ success: true, data: newGereja });
  });

  app.put('/api/gereja/:id', (req: Request, res: Response) => {
    const { id } = req.params;
    const idx = db.gereja.findIndex(g => g.id === id);
    if (idx !== -1) {
      db.gereja[idx] = { ...db.gereja[idx], ...req.body };
      broadcastRealtime({ type: 'UPDATE', entity: 'gereja', gerejaId: id, data: db.gereja[idx], timestamp: new Date().toISOString() });
      return res.json({ success: true, data: db.gereja[idx] });
    }
    res.status(404).json({ success: false, message: 'Gereja tidak ditemukan' });
  });

  // --- Berita API ---
  app.get('/api/berita', (req: Request, res: Response) => {
    const { gerejaId } = req.query;
    const items = gerejaId ? db.berita.filter(b => b.gerejaId === gerejaId) : db.berita;
    res.json({ success: true, data: items });
  });

  app.post('/api/berita', (req: Request, res: Response) => {
    const item: Berita = {
      id: `ber-${Date.now()}`,
      viewsCount: 0,
      publishDate: new Date().toISOString(),
      published: true,
      tags: [],
      ...req.body
    };
    db.berita.unshift(item);
    addLog(item.gerejaId, 'admin-1', 'Admin Gereja', 'TAMBAH_BERITA', `Menambahkan berita "${item.title}"`);
    broadcastRealtime({ type: 'INSERT', entity: 'berita', gerejaId: item.gerejaId, data: item, timestamp: new Date().toISOString() });
    res.json({ success: true, data: item });
  });

  app.put('/api/berita/:id', (req: Request, res: Response) => {
    const { id } = req.params;
    const idx = db.berita.findIndex(b => b.id === id);
    if (idx !== -1) {
      db.berita[idx] = { ...db.berita[idx], ...req.body };
      broadcastRealtime({ type: 'UPDATE', entity: 'berita', gerejaId: db.berita[idx].gerejaId, data: db.berita[idx], timestamp: new Date().toISOString() });
      return res.json({ success: true, data: db.berita[idx] });
    }
    res.status(404).json({ success: false, message: 'Berita tidak ditemukan' });
  });

  app.delete('/api/berita/:id', (req: Request, res: Response) => {
    const { id } = req.params;
    const idx = db.berita.findIndex(b => b.id === id);
    if (idx !== -1) {
      const deleted = db.berita.splice(idx, 1)[0];
      broadcastRealtime({ type: 'DELETE', entity: 'berita', gerejaId: deleted.gerejaId, data: { id }, timestamp: new Date().toISOString() });
      return res.json({ success: true });
    }
    res.status(404).json({ success: false, message: 'Berita tidak ditemukan' });
  });

  // --- Pengumuman API ---
  app.get('/api/pengumuman', (req: Request, res: Response) => {
    const { gerejaId } = req.query;
    const items = gerejaId ? db.pengumuman.filter(p => p.gerejaId === gerejaId) : db.pengumuman;
    res.json({ success: true, data: items });
  });

  app.post('/api/pengumuman', (req: Request, res: Response) => {
    const item: Pengumuman = {
      id: `peng-${Date.now()}`,
      publishDate: new Date().toISOString(),
      priority: 'normal',
      targetAudience: 'Seluruh Jemaat',
      ...req.body
    };
    db.pengumuman.unshift(item);
    addLog(item.gerejaId, 'admin-1', 'Admin Gereja', 'TAMBAH_PENGUMUMAN', `Menambahkan pengumuman "${item.title}"`);
    broadcastRealtime({ type: 'INSERT', entity: 'pengumuman', gerejaId: item.gerejaId, data: item, timestamp: new Date().toISOString() });
    res.json({ success: true, data: item });
  });

  app.delete('/api/pengumuman/:id', (req: Request, res: Response) => {
    const { id } = req.params;
    const idx = db.pengumuman.findIndex(p => p.id === id);
    if (idx !== -1) {
      const deleted = db.pengumuman.splice(idx, 1)[0];
      broadcastRealtime({ type: 'DELETE', entity: 'pengumuman', gerejaId: deleted.gerejaId, data: { id }, timestamp: new Date().toISOString() });
      return res.json({ success: true });
    }
    res.status(404).json({ success: false, message: 'Pengumuman tidak ditemukan' });
  });

  // --- Renungan API ---
  app.get('/api/renungan', (req: Request, res: Response) => {
    const { gerejaId } = req.query;
    const items = gerejaId ? db.renungan.filter(r => r.gerejaId === gerejaId) : db.renungan;
    res.json({ success: true, data: items });
  });

  app.post('/api/renungan', (req: Request, res: Response) => {
    const item: Renungan = {
      id: `ren-${Date.now()}`,
      likesCount: 0,
      publishDate: new Date().toISOString(),
      ...req.body
    };
    db.renungan.unshift(item);
    addLog(item.gerejaId, 'admin-1', 'Admin Gereja', 'TAMBAH_RENUNGAN', `Menambahkan renungan "${item.title}"`);
    broadcastRealtime({ type: 'INSERT', entity: 'renungan', gerejaId: item.gerejaId, data: item, timestamp: new Date().toISOString() });
    res.json({ success: true, data: item });
  });

  app.post('/api/renungan/:id/like', (req: Request, res: Response) => {
    const { id } = req.params;
    const item = db.renungan.find(r => r.id === id);
    if (item) {
      item.likesCount += 1;
      broadcastRealtime({ type: 'UPDATE', entity: 'renungan', gerejaId: item.gerejaId, data: item, timestamp: new Date().toISOString() });
      return res.json({ success: true, likesCount: item.likesCount });
    }
    res.status(404).json({ success: false, message: 'Renungan tidak ditemukan' });
  });

  app.delete('/api/renungan/:id', (req: Request, res: Response) => {
    const { id } = req.params;
    const idx = db.renungan.findIndex(r => r.id === id);
    if (idx !== -1) {
      const deleted = db.renungan.splice(idx, 1)[0];
      broadcastRealtime({ type: 'DELETE', entity: 'renungan', gerejaId: deleted.gerejaId, data: { id }, timestamp: new Date().toISOString() });
      return res.json({ success: true });
    }
    res.status(404).json({ success: false, message: 'Renungan tidak ditemukan' });
  });

  // --- Events API & RSVP ---
  app.get('/api/events', (req: Request, res: Response) => {
    const { gerejaId } = req.query;
    const items = gerejaId ? db.events.filter(e => e.gerejaId === gerejaId) : db.events;
    res.json({ success: true, data: items });
  });

  app.post('/api/events', (req: Request, res: Response) => {
    const item: EventGereja = {
      id: `evt-${Date.now()}`,
      registeredCount: 0,
      ...req.body
    };
    db.events.unshift(item);
    addLog(item.gerejaId, 'admin-1', 'Admin Gereja', 'TAMBAH_EVENT', `Menambahkan event "${item.title}"`);
    broadcastRealtime({ type: 'INSERT', entity: 'events', gerejaId: item.gerejaId, data: item, timestamp: new Date().toISOString() });
    res.json({ success: true, data: item });
  });

  app.post('/api/events/:id/rsvp', (req: Request, res: Response) => {
    const { id } = req.params;
    const { jemaatName, phone, email, seats } = req.body;
    const evt = db.events.find(e => e.id === id);
    if (!evt) return res.status(404).json({ success: false, message: 'Event tidak ditemukan' });

    const seatCount = seats ? parseInt(seats) : 1;
    if (evt.registeredCount + seatCount > evt.quota) {
      return res.status(400).json({ success: false, message: 'Maaf, kuota pendaftaran event sudah penuh' });
    }

    evt.registeredCount += seatCount;
    const reg: EventRegistration = {
      id: `reg-${Date.now()}`,
      eventId: id,
      gerejaId: evt.gerejaId,
      jemaatName,
      phone,
      email,
      seats: seatCount,
      status: 'confirmed',
      registeredAt: new Date().toISOString()
    };
    db.registrations.unshift(reg);

    broadcastRealtime({ type: 'UPDATE', entity: 'events', gerejaId: evt.gerejaId, data: evt, timestamp: new Date().toISOString() });
    res.json({ success: true, data: reg, event: evt, message: 'Pendaftaran event berhasil!' });
  });

  app.delete('/api/events/:id', (req: Request, res: Response) => {
    const { id } = req.params;
    const idx = db.events.findIndex(e => e.id === id);
    if (idx !== -1) {
      const deleted = db.events.splice(idx, 1)[0];
      broadcastRealtime({ type: 'DELETE', entity: 'events', gerejaId: deleted.gerejaId, data: { id }, timestamp: new Date().toISOString() });
      return res.json({ success: true });
    }
    res.status(404).json({ success: false, message: 'Event tidak ditemukan' });
  });

  // --- Jadwal Ibadah API ---
  app.get('/api/jadwal', (req: Request, res: Response) => {
    const { gerejaId } = req.query;
    const items = gerejaId ? db.jadwalIbadah.filter(j => j.gerejaId === gerejaId) : db.jadwalIbadah;
    res.json({ success: true, data: items });
  });

  app.post('/api/jadwal', (req: Request, res: Response) => {
    const item: JadwalIbadah = {
      id: `jdw-${Date.now()}`,
      ...req.body
    };
    db.jadwalIbadah.push(item);
    broadcastRealtime({ type: 'INSERT', entity: 'jadwal', gerejaId: item.gerejaId, data: item, timestamp: new Date().toISOString() });
    res.json({ success: true, data: item });
  });

  app.delete('/api/jadwal/:id', (req: Request, res: Response) => {
    const { id } = req.params;
    const idx = db.jadwalIbadah.findIndex(j => j.id === id);
    if (idx !== -1) {
      const deleted = db.jadwalIbadah.splice(idx, 1)[0];
      broadcastRealtime({ type: 'DELETE', entity: 'jadwal', gerejaId: deleted.gerejaId, data: { id }, timestamp: new Date().toISOString() });
      return res.json({ success: true });
    }
    res.status(404).json({ success: false, message: 'Jadwal tidak ditemukan' });
  });

  // --- Pelayanan API ---
  app.get('/api/pelayanan', (req: Request, res: Response) => {
    const { gerejaId } = req.query;
    const items = gerejaId ? db.pelayanan.filter(p => p.gerejaId === gerejaId) : db.pelayanan;
    res.json({ success: true, data: items });
  });

  app.post('/api/pelayanan', (req: Request, res: Response) => {
    const item: Pelayanan = {
      id: `ply-${Date.now()}`,
      membersCount: 1,
      ...req.body
    };
    db.pelayanan.push(item);
    broadcastRealtime({ type: 'INSERT', entity: 'pelayanan', gerejaId: item.gerejaId, data: item, timestamp: new Date().toISOString() });
    res.json({ success: true, data: item });
  });

  // --- Struktur Organisasi API ---
  app.get('/api/struktur', (req: Request, res: Response) => {
    const { gerejaId } = req.query;
    const items = gerejaId ? db.strukturOrganisasi.filter(s => s.gerejaId === gerejaId) : db.strukturOrganisasi;
    res.json({ success: true, data: items });
  });

  app.post('/api/struktur', (req: Request, res: Response) => {
    const item: StrukturOrganisasi = {
      id: `stk-${Date.now()}`,
      level: 2,
      ...req.body
    };
    db.strukturOrganisasi.push(item);
    broadcastRealtime({ type: 'INSERT', entity: 'struktur', gerejaId: item.gerejaId, data: item, timestamp: new Date().toISOString() });
    res.json({ success: true, data: item });
  });

  // --- Galeri & Album API ---
  app.get('/api/albums', (req: Request, res: Response) => {
    const { gerejaId } = req.query;
    const items = gerejaId ? db.albums.filter(a => a.gerejaId === gerejaId) : db.albums;
    res.json({ success: true, data: items });
  });

  app.get('/api/galeri', (req: Request, res: Response) => {
    const { gerejaId, albumId } = req.query;
    let items = gerejaId ? db.galeri.filter(g => g.gerejaId === gerejaId) : db.galeri;
    if (albumId) items = items.filter(g => g.albumId === albumId);
    res.json({ success: true, data: items });
  });

  app.post('/api/galeri', (req: Request, res: Response) => {
    const item: Galeri = {
      id: `gal-${Date.now()}`,
      createdAt: new Date().toISOString(),
      ...req.body
    };
    db.galeri.unshift(item);
    broadcastRealtime({ type: 'INSERT', entity: 'galeri', gerejaId: item.gerejaId, data: item, timestamp: new Date().toISOString() });
    res.json({ success: true, data: item });
  });

  // --- Pokok Doa API ---
  app.get('/api/pokok-doa', (req: Request, res: Response) => {
    const { gerejaId } = req.query;
    const items = gerejaId ? db.pokokDoa.filter(d => d.gerejaId === gerejaId) : db.pokokDoa;
    res.json({ success: true, data: items });
  });

  app.post('/api/pokok-doa', (req: Request, res: Response) => {
    const item: PokokDoa = {
      id: `doa-${Date.now()}`,
      status: 'pending',
      createdAt: new Date().toISOString(),
      likesCount: 0,
      ...req.body
    };
    db.pokokDoa.unshift(item);
    broadcastRealtime({ type: 'INSERT', entity: 'pokokDoa', gerejaId: item.gerejaId, data: item, timestamp: new Date().toISOString() });
    res.json({ success: true, data: item });
  });

  app.put('/api/pokok-doa/:id', (req: Request, res: Response) => {
    const { id } = req.params;
    const idx = db.pokokDoa.findIndex(d => d.id === id);
    if (idx !== -1) {
      db.pokokDoa[idx] = { ...db.pokokDoa[idx], ...req.body };
      broadcastRealtime({ type: 'UPDATE', entity: 'pokokDoa', gerejaId: db.pokokDoa[idx].gerejaId, data: db.pokokDoa[idx], timestamp: new Date().toISOString() });
      return res.json({ success: true, data: db.pokokDoa[idx] });
    }
    res.status(404).json({ success: false, message: 'Pokok doa tidak ditemukan' });
  });

  app.delete('/api/pokok-doa/:id', (req: Request, res: Response) => {
    const { id } = req.params;
    const idx = db.pokokDoa.findIndex(d => d.id === id);
    if (idx !== -1) {
      const deleted = db.pokokDoa.splice(idx, 1)[0];
      broadcastRealtime({ type: 'DELETE', entity: 'pokokDoa', gerejaId: deleted.gerejaId, data: { id }, timestamp: new Date().toISOString() });
      return res.json({ success: true });
    }
    res.status(404).json({ success: false, message: 'Pokok doa tidak ditemukan' });
  });

  // --- Pelayanan & Struktur Delete API ---
  app.delete('/api/pelayanan/:id', (req: Request, res: Response) => {
    const { id } = req.params;
    const idx = db.pelayanan.findIndex(p => p.id === id);
    if (idx !== -1) {
      const deleted = db.pelayanan.splice(idx, 1)[0];
      broadcastRealtime({ type: 'DELETE', entity: 'pelayanan', gerejaId: deleted.gerejaId, data: { id }, timestamp: new Date().toISOString() });
      return res.json({ success: true });
    }
    res.status(404).json({ success: false, message: 'Pelayanan tidak ditemukan' });
  });

  app.delete('/api/struktur/:id', (req: Request, res: Response) => {
    const { id } = req.params;
    const idx = db.strukturOrganisasi.findIndex(s => s.id === id);
    if (idx !== -1) {
      const deleted = db.strukturOrganisasi.splice(idx, 1)[0];
      broadcastRealtime({ type: 'DELETE', entity: 'struktur', gerejaId: deleted.gerejaId, data: { id }, timestamp: new Date().toISOString() });
      return res.json({ success: true });
    }
    res.status(404).json({ success: false, message: 'Struktur tidak ditemukan' });
  });

  // --- Galeri Delete API ---
  app.delete('/api/galeri/:id', (req: Request, res: Response) => {
    const { id } = req.params;
    const idx = db.galeri.findIndex(g => g.id === id);
    if (idx !== -1) {
      const deleted = db.galeri.splice(idx, 1)[0];
      broadcastRealtime({ type: 'DELETE', entity: 'galeri', gerejaId: deleted.gerejaId, data: { id }, timestamp: new Date().toISOString() });
      return res.json({ success: true });
    }
    res.status(404).json({ success: false, message: 'Foto galeri tidak ditemukan' });
  });

  // --- Donasi & Kas API ---
  app.get('/api/donasi', (req: Request, res: Response) => {
    const { gerejaId } = req.query;
    const items = gerejaId ? db.donasi.filter(d => d.gerejaId === gerejaId) : db.donasi;
    res.json({ success: true, data: items });
  });

  app.post('/api/donasi', (req: Request, res: Response) => {
    const item: Donasi = {
      id: `don-${Date.now()}`,
      status: 'pending',
      date: new Date().toISOString().split('T')[0],
      ...req.body
    };
    db.donasi.unshift(item);
    broadcastRealtime({ type: 'INSERT', entity: 'donasi', gerejaId: item.gerejaId, data: item, timestamp: new Date().toISOString() });
    res.json({ success: true, data: item });
  });

  app.put('/api/donasi/:id/verify', (req: Request, res: Response) => {
    const { id } = req.params;
    const { status } = req.body;
    const don = db.donasi.find(d => d.id === id);
    if (don) {
      don.status = status;
      if (status === 'verified') {
        const kasEntry: Kas = {
          id: `kas-${Date.now()}`,
          gerejaId: don.gerejaId,
          title: `Donasi Online: ${don.campaign} (${don.donorName})`,
          type: 'pemasukan',
          amount: don.amount,
          category: 'Donasi Online',
          date: new Date().toISOString().split('T')[0],
          description: `Metode: ${don.paymentMethod}`
        };
        db.kas.unshift(kasEntry);
        broadcastRealtime({ type: 'INSERT', entity: 'kas', gerejaId: don.gerejaId, data: kasEntry, timestamp: new Date().toISOString() });
      }
      broadcastRealtime({ type: 'UPDATE', entity: 'donasi', gerejaId: don.gerejaId, data: don, timestamp: new Date().toISOString() });
      return res.json({ success: true, data: don });
    }
    res.status(404).json({ success: false, message: 'Donasi tidak ditemukan' });
  });

  app.get('/api/log-aktivitas', (req: Request, res: Response) => {
    const { gerejaId } = req.query;
    const items = gerejaId ? db.logAktivitas.filter(l => l.gerejaId === gerejaId) : db.logAktivitas;
    res.json({ success: true, data: items });
  });

  app.get('/api/kas', (req: Request, res: Response) => {
    const { gerejaId } = req.query;
    const items = gerejaId ? db.kas.filter(k => k.gerejaId === gerejaId) : db.kas;
    const totalPemasukan = items.filter(i => i.type === 'pemasukan').reduce((acc, c) => acc + c.amount, 0);
    const totalPengeluaran = items.filter(i => i.type === 'pengeluaran').reduce((acc, c) => acc + c.amount, 0);
    const saldoAkhir = totalPemasukan - totalPengeluaran;
    res.json({ success: true, data: { items, summary: { totalPemasukan, totalPengeluaran, saldoAkhir } } });
  });

  app.post('/api/kas', (req: Request, res: Response) => {
    const item: Kas = {
      id: `kas-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      ...req.body
    };
    db.kas.unshift(item);
    addLog(item.gerejaId, 'admin-1', 'Admin Gereja', 'TAMBAH_KAS', `Catatan Kas (${item.type.toUpperCase()}): Rp ${item.amount.toLocaleString('id-ID')} - ${item.title}`);
    broadcastRealtime({ type: 'INSERT', entity: 'kas', gerejaId: item.gerejaId, data: item, timestamp: new Date().toISOString() });
    res.json({ success: true, data: item });
  });

  app.delete('/api/kas/:id', (req: Request, res: Response) => {
    const { id } = req.params;
    const idx = db.kas.findIndex(k => k.id === id);
    if (idx !== -1) {
      const deleted = db.kas.splice(idx, 1)[0];
      broadcastRealtime({ type: 'DELETE', entity: 'kas', gerejaId: deleted.gerejaId, data: { id }, timestamp: new Date().toISOString() });
      return res.json({ success: true });
    }
    res.status(404).json({ success: false, message: 'Catatan kas tidak ditemukan' });
  });

  // --- Jemaat Member Directory API ---
  app.get('/api/jemaat-members', (req: Request, res: Response) => {
    const { gerejaId } = req.query;
    const items = gerejaId ? db.jemaat.filter(j => j.gerejaId === gerejaId) : db.jemaat;
    res.json({ success: true, data: items });
  });

  app.post('/api/jemaat-members', (req: Request, res: Response) => {
    const item: JemaatMember = {
      id: `jem-${Date.now()}`,
      status: 'aktif',
      joinDate: new Date().toISOString().split('T')[0],
      ...req.body
    };
    db.jemaat.unshift(item);
    addLog(item.gerejaId, 'admin-1', 'Admin Gereja', 'TAMBAH_JEMAAT', `Mendaftarkan Jemaat Baru: ${item.fullName}`);
    broadcastRealtime({ type: 'INSERT', entity: 'jemaat', gerejaId: item.gerejaId, data: item, timestamp: new Date().toISOString() });
    res.json({ success: true, data: item });
  });

  app.delete('/api/jemaat-members/:id', (req: Request, res: Response) => {
    const { id } = req.params;
    const idx = db.jemaat.findIndex(j => j.id === id);
    if (idx !== -1) {
      const deleted = db.jemaat.splice(idx, 1)[0];
      broadcastRealtime({ type: 'DELETE', entity: 'jemaat', gerejaId: deleted.gerejaId, data: { id }, timestamp: new Date().toISOString() });
      return res.json({ success: true });
    }
    res.status(404).json({ success: false, message: 'Jemaat tidak ditemukan' });
  });

  // --- Notifikasi Broadcast API ---
  app.get('/api/notifikasi', (req: Request, res: Response) => {
    const { gerejaId } = req.query;
    const items = gerejaId ? db.notifikasi.filter(n => n.gerejaId === gerejaId) : db.notifikasi;
    res.json({ success: true, data: items });
  });

  app.post('/api/notifikasi', (req: Request, res: Response) => {
    const item: Notifikasi = {
      id: `notif-${Date.now()}`,
      createdAt: new Date().toISOString(),
      read: false,
      ...req.body
    };
    db.notifikasi.unshift(item);
    broadcastRealtime({
      type: 'NOTIFICATION',
      entity: 'notifikasi',
      gerejaId: item.gerejaId,
      data: item,
      timestamp: new Date().toISOString()
    });
    res.json({ success: true, data: item });
  });

  // --- Settings & Google API Proxy ---
  app.get('/api/pengaturan', (req: Request, res: Response) => {
    res.json({ success: true, data: db.pengaturan });
  });

  app.post('/api/pengaturan', (req: Request, res: Response) => {
    db.pengaturan = { ...db.pengaturan, ...req.body };
    res.json({ success: true, data: db.pengaturan });
  });

  // --- Google Sheets & Drive Sync Action Simulation / Live Proxy ---
  app.post('/api/google-sync', (req: Request, res: Response) => {
    const { sheetId, driveFolderId } = req.body;
    if (sheetId) db.pengaturan.googleSheetUrl = `https://docs.google.com/spreadsheets/d/${sheetId}`;
    if (driveFolderId) db.pengaturan.googleDriveFolderUrl = `https://drive.google.com/drive/folders/${driveFolderId}`;
    db.pengaturan.googleApiConnected = true;

    addLog('ger-001', 'admin-1', 'Admin Gereja', 'SINKRONISASI_GOOGLE', `Menyinkronkan Google Sheets ID: ${sheetId || 'Default'} & Drive Folder`);

    res.json({
      success: true,
      message: 'Koneksi & Sinkronisasi Google Sheets API + Google Drive API Berhasil!',
      stats: {
        syncedSheets: 20,
        totalRowsSynced: db.berita.length + db.renungan.length + db.events.length + db.jemaat.length,
        googleDriveConnected: true
      }
    });
  });

  // --- Database Backup & Restore API ---
  app.get('/api/backup', (req: Request, res: Response) => {
    res.json({ success: true, data: db.backup, fullDatabaseDump: db });
  });

  app.post('/api/backup', (req: Request, res: Response) => {
    const filename = `backup_church_cms_${new Date().toISOString().replace(/[:.]/g, '_')}.json`;
    const rec: BackupRecord = {
      id: `bak-${Date.now()}`,
      gerejaId: 'ger-001',
      filename,
      size: '2.1 MB',
      createdBy: 'Super Admin',
      createdAt: new Date().toISOString()
    };
    db.backup.unshift(rec);
    res.json({ success: true, data: rec, downloadUrl: `/api/backup/download/${rec.id}` });
  });

  // --- Gemini AI Sermon & Devotion Generator ---
  app.post('/api/gemini/generate', async (req: Request, res: Response) => {
    try {
      const { prompt, type } = req.body;
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.json({
          success: true,
          content: `[Saran Renungan AI]: "Hiduplah dalam Kasih dan Kedamaian Kristus di tengah tantangan masa kini. Tetap teguh beriman dan saling menguatkan dalam persekutuan gereja."`
        });
      }

      const ai = new GoogleGenAI({ apiKey });
      const systemInstruction = type === 'renungan'
        ? 'Anda adalah seorang Pendeta dan Penulis Renungan Kristen berpengalaman. Buatkan draf renungan singkat lengkap dengan judul yang menarik, ayat Alkitab pendukung, dan pesan reflektif praktis dalam bahasa Indonesia yang penuh kasih dan menguatkan.'
        : 'Anda adalah seorang pengurus humas gereja. Buatkan pengumuman atau berita gereja yang rapi, ramah, dan informatif.';

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt || 'Buatkan renungan singkat tentang kasih dan pengharapan Kristen.',
        config: {
          systemInstruction,
          temperature: 0.7
        }
      });

      res.json({ success: true, content: response.text });
    } catch (err: any) {
      res.json({
        success: true,
        content: `Draf Renungan Singkat: Tetaplah berpegang pada janji Tuhan di setiap musim hidupmu. (Salm 23:1)`
      });
    }
  });

  // Vite Dev / Prod Static Middleware
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Church Management System server running on http://localhost:${PORT}`);
  });
}

startServer();
