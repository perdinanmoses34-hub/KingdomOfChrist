import {
  Gereja,
  User,
  JemaatMember,
  Berita,
  Pengumuman,
  Renungan,
  EventGereja,
  JadwalIbadah,
  Pelayanan,
  StrukturOrganisasi,
  Album,
  Galeri,
  PokokDoa,
  Donasi,
  Kas,
  Notifikasi,
  Pengaturan,
  LogAktivitas,
  BackupRecord,
  RealtimeSyncMessage
} from '../types';
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
} from '../mockData';

// Local storage key for client-side fallback (GitHub Pages / Offline mode)
const STORAGE_KEY = 'cms_gereja_db_v1';

function getLocalDb() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Error reading localStorage DB:', e);
  }
  
  const defaultDb = {
    gereja: [...initialGerejaList],
    users: [...initialUsers],
    jemaat: [...initialJemaat],
    berita: [...initialBerita],
    pengumuman: [...initialPengumuman],
    renungan: [...initialRenungan],
    events: [...initialEvents],
    registrations: [...initialRegistrations],
    jadwalIbadah: [...initialJadwalIbadah],
    pelayanan: [...initialPelayanan],
    strukturOrganisasi: [...initialStrukturOrganisasi],
    albums: [...initialAlbums],
    galeri: [...initialGaleri],
    komentar: [...initialKomentar],
    pokokDoa: [...initialPokokDoa],
    donasi: [...initialDonasi],
    kas: [...initialKas],
    notifikasi: [...initialNotifikasi],
    pengaturan: { ...initialPengaturan },
    logAktivitas: [...initialLogAktivitas],
    backup: [...initialBackup]
  };

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultDb));
  } catch (e) {}

  return defaultDb;
}

function saveLocalDb(db: any) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
  } catch (e) {
    console.error('Error saving to localStorage DB:', e);
  }
}

async function requestOrFallback<T>(
  url: string,
  options?: RequestInit,
  fallbackFn?: () => T | Promise<T>
): Promise<T> {
  try {
    const res = await fetch(url, options);
    const contentType = res.headers.get('content-type') || '';
    if (res.ok && contentType.includes('application/json')) {
      const json = await res.json();
      if (json && json.success !== false) {
        return json.data !== undefined ? json.data : json;
      }
    }
  } catch (err) {
    // API endpoint unreachable (e.g., static hosting on GitHub Pages)
  }

  if (fallbackFn) {
    return await fallbackFn();
  }
  throw new Error(`Failed API request for ${url}`);
}

export class ApiService {
  static async getGerejaList(): Promise<Gereja[]> {
    return requestOrFallback('/api/gereja', undefined, () => {
      const db = getLocalDb();
      return db.gereja || initialGerejaList;
    });
  }

  static async getBerita(gerejaId?: string): Promise<Berita[]> {
    const url = gerejaId ? `/api/berita?gerejaId=${gerejaId}` : '/api/berita';
    return requestOrFallback(url, undefined, () => {
      const db = getLocalDb();
      const list = db.berita || initialBerita;
      return gerejaId ? list.filter((b: Berita) => b.gerejaId === gerejaId) : list;
    });
  }

  static async createBerita(data: Partial<Berita>): Promise<Berita> {
    return requestOrFallback(
      '/api/berita',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      },
      () => {
        const db = getLocalDb();
        const newItem: Berita = {
          id: `ber-${Date.now()}`,
          gerejaId: data.gerejaId || 'ger-001',
          title: data.title || 'Berita Baru',
          content: data.content || '',
          coverUrl: data.coverUrl || 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=800&q=80',
          category: data.category || 'Umum',
          tags: data.tags || [],
          publishDate: new Date().toISOString(),
          published: data.published ?? true,
          viewsCount: 0,
          authorName: data.authorName || 'Admin Gereja'
        };
        db.berita = [newItem, ...(db.berita || [])];
        saveLocalDb(db);
        return newItem;
      }
    );
  }

  static async deleteBerita(id: string): Promise<boolean> {
    return requestOrFallback(
      `/api/berita/${id}`,
      { method: 'DELETE' },
      () => {
        const db = getLocalDb();
        db.berita = (db.berita || []).filter((b: Berita) => b.id !== id);
        saveLocalDb(db);
        return true;
      }
    );
  }

  static async getPengumuman(gerejaId?: string): Promise<Pengumuman[]> {
    const url = gerejaId ? `/api/pengumuman?gerejaId=${gerejaId}` : '/api/pengumuman';
    return requestOrFallback(url, undefined, () => {
      const db = getLocalDb();
      const list = db.pengumuman || initialPengumuman;
      return gerejaId ? list.filter((p: Pengumuman) => p.gerejaId === gerejaId) : list;
    });
  }

  static async createPengumuman(data: Partial<Pengumuman>): Promise<Pengumuman> {
    return requestOrFallback(
      '/api/pengumuman',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      },
      () => {
        const db = getLocalDb();
        const newItem: Pengumuman = {
          id: `peng-${Date.now()}`,
          gerejaId: data.gerejaId || 'ger-001',
          title: data.title || '',
          content: data.content || '',
          priority: data.priority || 'normal',
          publishDate: new Date().toISOString(),
          targetAudience: data.targetAudience || 'Seluruh Jemaat'
        };
        db.pengumuman = [newItem, ...(db.pengumuman || [])];
        saveLocalDb(db);
        return newItem;
      }
    );
  }

  static async deletePengumuman(id: string): Promise<boolean> {
    return requestOrFallback(`/api/pengumuman/${id}`, { method: 'DELETE' }, () => {
      const db = getLocalDb();
      db.pengumuman = (db.pengumuman || []).filter((p: Pengumuman) => p.id !== id);
      saveLocalDb(db);
      return true;
    });
  }

  static async getRenungan(gerejaId?: string): Promise<Renungan[]> {
    const url = gerejaId ? `/api/renungan?gerejaId=${gerejaId}` : '/api/renungan';
    return requestOrFallback(url, undefined, () => {
      const db = getLocalDb();
      const list = db.renungan || initialRenungan;
      return gerejaId ? list.filter((r: Renungan) => r.gerejaId === gerejaId) : list;
    });
  }

  static async createRenungan(data: Partial<Renungan>): Promise<Renungan> {
    return requestOrFallback(
      '/api/renungan',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      },
      () => {
        const db = getLocalDb();
        const newItem: Renungan = {
          id: `ren-${Date.now()}`,
          gerejaId: data.gerejaId || 'ger-001',
          title: data.title || '',
          scripture: data.scripture || '',
          content: data.content || '',
          videoUrl: data.videoUrl,
          imageUrl: data.imageUrl,
          author: data.author || 'Pendeta',
          publishDate: new Date().toISOString(),
          likesCount: 0
        };
        db.renungan = [newItem, ...(db.renungan || [])];
        saveLocalDb(db);
        return newItem;
      }
    );
  }

  static async likeRenungan(id: string): Promise<number> {
    return requestOrFallback(`/api/renungan/${id}/like`, { method: 'POST' }, () => {
      const db = getLocalDb();
      const item = (db.renungan || []).find((r: Renungan) => r.id === id);
      if (item) {
        item.likesCount = (item.likesCount || 0) + 1;
        saveLocalDb(db);
        return item.likesCount;
      }
      return 1;
    });
  }

  static async deleteRenungan(id: string): Promise<boolean> {
    return requestOrFallback(`/api/renungan/${id}`, { method: 'DELETE' }, () => {
      const db = getLocalDb();
      db.renungan = (db.renungan || []).filter((r: Renungan) => r.id !== id);
      saveLocalDb(db);
      return true;
    });
  }

  static async getEvents(gerejaId?: string): Promise<EventGereja[]> {
    const url = gerejaId ? `/api/events?gerejaId=${gerejaId}` : '/api/events';
    return requestOrFallback(url, undefined, () => {
      const db = getLocalDb();
      const list = db.events || initialEvents;
      return gerejaId ? list.filter((e: EventGereja) => e.gerejaId === gerejaId) : list;
    });
  }

  static async createEvent(data: Partial<EventGereja>): Promise<EventGereja> {
    return requestOrFallback(
      '/api/events',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      },
      () => {
        const db = getLocalDb();
        const newItem: EventGereja = {
          id: `evt-${Date.now()}`,
          gerejaId: data.gerejaId || 'ger-001',
          title: data.title || '',
          description: data.description || '',
          posterUrl: data.posterUrl || 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
          locationName: data.locationName || 'Gereja Main Hall',
          mapUrl: data.mapUrl,
          date: data.date || new Date().toISOString().split('T')[0],
          time: data.time || '09:00 - selesai',
          quota: data.quota || 100,
          registeredCount: 0,
          category: data.category || 'Umum'
        };
        db.events = [newItem, ...(db.events || [])];
        saveLocalDb(db);
        return newItem;
      }
    );
  }

  static async rsvpEvent(eventId: string, payload: { jemaatName: string; phone: string; email: string; seats: number }): Promise<any> {
    return requestOrFallback(
      `/api/events/${eventId}/rsvp`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      },
      () => {
        const db = getLocalDb();
        const evt = (db.events || []).find((e: EventGereja) => e.id === eventId);
        if (evt) {
          evt.registeredCount = (evt.registeredCount || 0) + (payload.seats || 1);
        }
        const newReg = {
          id: `reg-${Date.now()}`,
          eventId,
          jemaatName: payload.jemaatName,
          phone: payload.phone,
          email: payload.email,
          seats: payload.seats,
          createdAt: new Date().toISOString()
        };
        db.registrations = [newReg, ...(db.registrations || [])];
        saveLocalDb(db);
        return { success: true, data: newReg };
      }
    );
  }

  static async deleteEvent(id: string): Promise<boolean> {
    return requestOrFallback(`/api/events/${id}`, { method: 'DELETE' }, () => {
      const db = getLocalDb();
      db.events = (db.events || []).filter((e: EventGereja) => e.id !== id);
      saveLocalDb(db);
      return true;
    });
  }

  static async getJadwal(gerejaId?: string): Promise<JadwalIbadah[]> {
    const url = gerejaId ? `/api/jadwal?gerejaId=${gerejaId}` : '/api/jadwal';
    return requestOrFallback(url, undefined, () => {
      const db = getLocalDb();
      const list = db.jadwalIbadah || initialJadwalIbadah;
      return gerejaId ? list.filter((j: JadwalIbadah) => j.gerejaId === gerejaId) : list;
    });
  }

  static async createJadwal(data: Partial<JadwalIbadah>): Promise<JadwalIbadah> {
    return requestOrFallback(
      '/api/jadwal',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      },
      () => {
        const db = getLocalDb();
        const newItem: JadwalIbadah = {
          id: `jad-${Date.now()}`,
          gerejaId: data.gerejaId || 'ger-001',
          title: data.title || 'Ibadah Raya',
          category: data.category || 'Ibadah Minggu',
          dayOfWeek: data.dayOfWeek || 'Minggu',
          time: data.time || '09:00 - 11:00 WIB',
          location: data.location || 'Gedung Utama',
          speaker: data.speaker || 'Pendeta',
          worshipLeader: data.worshipLeader || 'Tim Worship'
        };
        db.jadwalIbadah = [newItem, ...(db.jadwalIbadah || [])];
        saveLocalDb(db);
        return newItem;
      }
    );
  }

  static async getPelayanan(gerejaId?: string): Promise<Pelayanan[]> {
    const url = gerejaId ? `/api/pelayanan?gerejaId=${gerejaId}` : '/api/pelayanan';
    return requestOrFallback(url, undefined, () => {
      const db = getLocalDb();
      const list = db.pelayanan || initialPelayanan;
      return gerejaId ? list.filter((p: Pelayanan) => p.gerejaId === gerejaId) : list;
    });
  }

  static async getStruktur(gerejaId?: string): Promise<StrukturOrganisasi[]> {
    const url = gerejaId ? `/api/struktur?gerejaId=${gerejaId}` : '/api/struktur';
    return requestOrFallback(url, undefined, () => {
      const db = getLocalDb();
      const list = db.strukturOrganisasi || initialStrukturOrganisasi;
      return gerejaId ? list.filter((s: StrukturOrganisasi) => s.gerejaId === gerejaId) : list;
    });
  }

  static async getAlbums(gerejaId?: string): Promise<Album[]> {
    const url = gerejaId ? `/api/albums?gerejaId=${gerejaId}` : '/api/albums';
    return requestOrFallback(url, undefined, () => {
      const db = getLocalDb();
      const list = db.albums || initialAlbums;
      return gerejaId ? list.filter((a: Album) => a.gerejaId === gerejaId) : list;
    });
  }

  static async getGaleri(gerejaId?: string, albumId?: string): Promise<Galeri[]> {
    let url = `/api/galeri?1=1`;
    if (gerejaId) url += `&gerejaId=${gerejaId}`;
    if (albumId) url += `&albumId=${albumId}`;
    return requestOrFallback(url, undefined, () => {
      const db = getLocalDb();
      let res = db.galeri || initialGaleri;
      if (gerejaId) res = res.filter((g: Galeri) => g.gerejaId === gerejaId);
      if (albumId) res = res.filter((g: Galeri) => g.albumId === albumId);
      return res;
    });
  }

  static async createGaleri(data: Partial<Galeri>): Promise<Galeri> {
    return requestOrFallback(
      '/api/galeri',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      },
      () => {
        const db = getLocalDb();
        const newItem: Galeri = {
          id: `gal-${Date.now()}`,
          gerejaId: data.gerejaId || 'ger-001',
          albumId: data.albumId || 'alb-001',
          title: data.title || 'Foto Kegiatan',
          type: data.type || 'image',
          url: data.url || 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=800&q=80',
          createdAt: new Date().toISOString()
        };
        db.galeri = [newItem, ...(db.galeri || [])];
        saveLocalDb(db);
        return newItem;
      }
    );
  }

  static async getPokokDoa(gerejaId?: string): Promise<PokokDoa[]> {
    const url = gerejaId ? `/api/pokok-doa?gerejaId=${gerejaId}` : '/api/pokok-doa';
    return requestOrFallback(url, undefined, () => {
      const db = getLocalDb();
      const list = db.pokokDoa || initialPokokDoa;
      return gerejaId ? list.filter((p: PokokDoa) => p.gerejaId === gerejaId) : list;
    });
  }

  static async createPokokDoa(data: Partial<PokokDoa>): Promise<PokokDoa> {
    return requestOrFallback(
      '/api/pokok-doa',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      },
      () => {
        const db = getLocalDb();
        const newItem: PokokDoa = {
          id: `doa-${Date.now()}`,
          gerejaId: data.gerejaId || 'ger-001',
          senderName: data.senderName || 'Anonim',
          content: data.content || '',
          status: data.status || 'pending',
          isPrivate: data.isPrivate || false,
          createdAt: new Date().toISOString()
        };
        db.pokokDoa = [newItem, ...(db.pokokDoa || [])];
        saveLocalDb(db);
        return newItem;
      }
    );
  }

  static async updatePokokDoa(id: string, data: Partial<PokokDoa>): Promise<PokokDoa> {
    return requestOrFallback(
      `/api/pokok-doa/${id}`,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      },
      () => {
        const db = getLocalDb();
        const item = (db.pokokDoa || []).find((p: PokokDoa) => p.id === id);
        if (item) {
          Object.assign(item, data);
          saveLocalDb(db);
          return item;
        }
        return data as PokokDoa;
      }
    );
  }

  static async getDonasi(gerejaId?: string): Promise<Donasi[]> {
    const url = gerejaId ? `/api/donasi?gerejaId=${gerejaId}` : '/api/donasi';
    return requestOrFallback(url, undefined, () => {
      const db = getLocalDb();
      const list = db.donasi || initialDonasi;
      return gerejaId ? list.filter((d: Donasi) => d.gerejaId === gerejaId) : list;
    });
  }

  static async createDonasi(data: Partial<Donasi>): Promise<Donasi> {
    return requestOrFallback(
      '/api/donasi',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      },
      () => {
        const db = getLocalDb();
        const newItem: Donasi = {
          id: `don-${Date.now()}`,
          gerejaId: data.gerejaId || 'ger-001',
          donorName: data.donorName || 'Hamba Allah',
          amount: data.amount || 0,
          campaign: data.campaign || 'Persembahan',
          paymentMethod: data.paymentMethod || 'transfer_bank',
          transferProofUrl: data.transferProofUrl || 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=400&q=80',
          status: 'pending',
          date: new Date().toISOString()
        };
        db.donasi = [newItem, ...(db.donasi || [])];
        saveLocalDb(db);
        return newItem;
      }
    );
  }

  static async verifyDonasi(id: string, status: 'verified' | 'rejected'): Promise<Donasi> {
    return requestOrFallback(
      `/api/donasi/${id}/verify`,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      },
      () => {
        const db = getLocalDb();
        const item = (db.donasi || []).find((d: Donasi) => d.id === id);
        if (item) {
          item.status = status;
          saveLocalDb(db);
          return item;
        }
        return { id, status } as Donasi;
      }
    );
  }

  static async getKas(gerejaId?: string): Promise<{ items: Kas[]; summary: { totalPemasukan: number; totalPengeluaran: number; saldoAkhir: number } }> {
    const url = gerejaId ? `/api/kas?gerejaId=${gerejaId}` : '/api/kas';
    return requestOrFallback(url, undefined, () => {
      const db = getLocalDb();
      const items = gerejaId ? (db.kas || initialKas).filter((k: Kas) => k.gerejaId === gerejaId) : (db.kas || initialKas);
      const totalPemasukan = items.filter((k: Kas) => k.type === 'pemasukan').reduce((sum: number, k: Kas) => sum + k.amount, 0);
      const totalPengeluaran = items.filter((k: Kas) => k.type === 'pengeluaran').reduce((sum: number, k: Kas) => sum + k.amount, 0);
      return {
        items,
        summary: {
          totalPemasukan,
          totalPengeluaran,
          saldoAkhir: totalPemasukan - totalPengeluaran
        }
      };
    });
  }

  static async getJemaatMembers(gerejaId?: string): Promise<JemaatMember[]> {
    const url = gerejaId ? `/api/jemaat-members?gerejaId=${gerejaId}` : '/api/jemaat-members';
    return requestOrFallback(url, undefined, () => {
      const db = getLocalDb();
      const list = db.jemaat || initialJemaat;
      return gerejaId ? list.filter((j: JemaatMember) => j.gerejaId === gerejaId) : list;
    });
  }

  static async getNotifikasi(gerejaId?: string): Promise<Notifikasi[]> {
    const url = gerejaId ? `/api/notifikasi?gerejaId=${gerejaId}` : '/api/notifikasi';
    return requestOrFallback(url, undefined, () => {
      const db = getLocalDb();
      const list = db.notifikasi || initialNotifikasi;
      return gerejaId ? list.filter((n: Notifikasi) => n.gerejaId === gerejaId) : list;
    });
  }

  static async sendNotifikasi(data: Partial<Notifikasi>): Promise<Notifikasi> {
    return requestOrFallback(
      '/api/notifikasi',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      },
      () => {
        const db = getLocalDb();
        const newItem: Notifikasi = {
          id: `not-${Date.now()}`,
          gerejaId: data.gerejaId || 'ger-001',
          title: data.title || '',
          message: data.message || '',
          type: data.type || 'pengumuman',
          targetRole: data.targetRole || 'jemaat',
          createdAt: new Date().toISOString()
        };
        db.notifikasi = [newItem, ...(db.notifikasi || [])];
        saveLocalDb(db);
        return newItem;
      }
    );
  }

  static async getPengaturan(): Promise<Pengaturan> {
    return requestOrFallback('/api/pengaturan', undefined, () => {
      const db = getLocalDb();
      return db.pengaturan || initialPengaturan;
    });
  }

  static async updatePengaturan(data: Partial<Pengaturan>): Promise<Pengaturan> {
    return requestOrFallback(
      '/api/pengaturan',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      },
      () => {
        const db = getLocalDb();
        db.pengaturan = { ...db.pengaturan, ...data };
        saveLocalDb(db);
        return db.pengaturan;
      }
    );
  }

  static async syncGoogleSheets(sheetId: string, driveFolderId: string): Promise<any> {
    return requestOrFallback(
      '/api/google-sync',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sheetId, driveFolderId })
      },
      () => {
        const db = getLocalDb();
        db.pengaturan.googleSheetId = sheetId;
        db.pengaturan.googleDriveFolderId = driveFolderId;
        db.pengaturan.googleApiConnected = true;
        saveLocalDb(db);
        return { success: true, message: 'Simulasi Sinkronisasi Google Sheets Berhasil!' };
      }
    );
  }

  static async triggerBackup(): Promise<BackupRecord> {
    return requestOrFallback('/api/backup', { method: 'POST' }, () => {
      const db = getLocalDb();
      const newBackup: BackupRecord = {
        id: `bak-${Date.now()}`,
        gerejaId: 'ger-001',
        filename: `backup-${Date.now()}.json`,
        size: '2.4 MB',
        createdBy: 'Admin',
        createdAt: new Date().toISOString()
      };
      db.backup = [newBackup, ...(db.backup || [])];
      saveLocalDb(db);
      return newBackup;
    });
  }

  static async generateAiContent(prompt: string, type: 'renungan' | 'berita'): Promise<string> {
    return requestOrFallback(
      '/api/gemini/generate',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, type })
      },
      () => {
        return `[Konten AI Dihasilkan Otomatis]\n\nJudul: ${prompt}\n\nFirman Tuhan mengingatkan kita untuk senantiasa mengandalkan Allah dalam segala waktu dan keadaan. Semoga renungan/berita ini menjadi berkat dan menguatkan iman jemaat sekalian. Amin.`;
      }
    );
  }

  static async deleteJadwal(id: string): Promise<boolean> {
    return requestOrFallback(`/api/jadwal/${id}`, { method: 'DELETE' }, () => {
      const db = getLocalDb();
      db.jadwalIbadah = (db.jadwalIbadah || []).filter((j: JadwalIbadah) => j.id !== id);
      saveLocalDb(db);
      return true;
    });
  }

  static async createPelayanan(data: Partial<Pelayanan>): Promise<Pelayanan> {
    return requestOrFallback(
      '/api/pelayanan',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      },
      () => {
        const db = getLocalDb();
        const newItem: Pelayanan = {
          id: `ply-${Date.now()}`,
          gerejaId: data.gerejaId || 'ger-001',
          name: data.name || '',
          category: data.category || 'Kategorial',
          leaderName: data.leaderName || 'Koordinator',
          description: data.description || '',
          membersCount: 1,
          meetingTime: data.meetingTime || 'Setiap Minggu'
        };
        db.pelayanan = [newItem, ...(db.pelayanan || [])];
        saveLocalDb(db);
        return newItem;
      }
    );
  }

  static async deletePelayanan(id: string): Promise<boolean> {
    return requestOrFallback(`/api/pelayanan/${id}`, { method: 'DELETE' }, () => {
      const db = getLocalDb();
      db.pelayanan = (db.pelayanan || []).filter((p: Pelayanan) => p.id !== id);
      saveLocalDb(db);
      return true;
    });
  }

  static async createStruktur(data: Partial<StrukturOrganisasi>): Promise<StrukturOrganisasi> {
    return requestOrFallback(
      '/api/struktur',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      },
      () => {
        const db = getLocalDb();
        const newItem: StrukturOrganisasi = {
          id: `stk-${Date.now()}`,
          gerejaId: data.gerejaId || 'ger-001',
          name: data.name || '',
          position: data.position || 'Pengurus',
          photoUrl: data.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
          period: data.period || '2024-2027',
          level: data.level || 2
        };
        db.strukturOrganisasi = [newItem, ...(db.strukturOrganisasi || [])];
        saveLocalDb(db);
        return newItem;
      }
    );
  }

  static async deleteStruktur(id: string): Promise<boolean> {
    return requestOrFallback(`/api/struktur/${id}`, { method: 'DELETE' }, () => {
      const db = getLocalDb();
      db.strukturOrganisasi = (db.strukturOrganisasi || []).filter((s: StrukturOrganisasi) => s.id !== id);
      saveLocalDb(db);
      return true;
    });
  }

  static async deleteGaleri(id: string): Promise<boolean> {
    return requestOrFallback(`/api/galeri/${id}`, { method: 'DELETE' }, () => {
      const db = getLocalDb();
      db.galeri = (db.galeri || []).filter((g: Galeri) => g.id !== id);
      saveLocalDb(db);
      return true;
    });
  }

  static async deletePokokDoa(id: string): Promise<boolean> {
    return requestOrFallback(`/api/pokok-doa/${id}`, { method: 'DELETE' }, () => {
      const db = getLocalDb();
      db.pokokDoa = (db.pokokDoa || []).filter((d: PokokDoa) => d.id !== id);
      saveLocalDb(db);
      return true;
    });
  }

  static async createKas(data: Partial<Kas>): Promise<Kas> {
    return requestOrFallback(
      '/api/kas',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      },
      () => {
        const db = getLocalDb();
        const newItem: Kas = {
          id: `kas-${Date.now()}`,
          gerejaId: data.gerejaId || 'ger-001',
          title: data.title || '',
          type: data.type || 'pemasukan',
          amount: data.amount || 0,
          category: data.category || 'Lain-lain',
          date: data.date || new Date().toISOString().split('T')[0],
          description: data.description || ''
        };
        db.kas = [newItem, ...(db.kas || [])];
        saveLocalDb(db);
        return newItem;
      }
    );
  }

  static async deleteKas(id: string): Promise<boolean> {
    return requestOrFallback(`/api/kas/${id}`, { method: 'DELETE' }, () => {
      const db = getLocalDb();
      db.kas = (db.kas || []).filter((k: Kas) => k.id !== id);
      saveLocalDb(db);
      return true;
    });
  }

  static async createJemaatMember(data: Partial<JemaatMember>): Promise<JemaatMember> {
    return requestOrFallback(
      '/api/jemaat-members',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      },
      () => {
        const db = getLocalDb();
        const newItem: JemaatMember = {
          id: `jem-${Date.now()}`,
          gerejaId: data.gerejaId || 'ger-001',
          fullName: data.fullName || '',
          gender: data.gender || 'Laki-laki',
          phone: data.phone || '',
          address: data.address || '',
          sector: data.sector || 'Sektor 1',
          status: 'aktif',
          avatarUrl: data.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80',
          joinDate: new Date().toISOString().split('T')[0]
        };
        db.jemaat = [newItem, ...(db.jemaat || [])];
        saveLocalDb(db);
        return newItem;
      }
    );
  }

  static async deleteJemaatMember(id: string): Promise<boolean> {
    return requestOrFallback(`/api/jemaat-members/${id}`, { method: 'DELETE' }, () => {
      const db = getLocalDb();
      db.jemaat = (db.jemaat || []).filter((j: JemaatMember) => j.id !== id);
      saveLocalDb(db);
      return true;
    });
  }

  static subscribeRealtime(gerejaId: string, onMessage: (msg: RealtimeSyncMessage) => void): () => void {
    let eventSource: EventSource | null = null;
    let timer: any = null;
    let isStopped = false;

    const connect = () => {
      if (isStopped) return;
      try {
        eventSource = new EventSource(`/api/realtime/stream?gerejaId=${gerejaId}`);
        
        eventSource.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            onMessage(data);
          } catch (err) {}
        };

        eventSource.onerror = () => {
          if (eventSource) eventSource.close();
          if (!isStopped) {
            timer = setTimeout(connect, 4000);
          }
        };
      } catch (err) {
        if (!isStopped) {
          timer = setTimeout(connect, 4000);
        }
      }
    };

    connect();

    return () => {
      isStopped = true;
      if (timer) clearTimeout(timer);
      if (eventSource) eventSource.close();
    };
  }
}

