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

export class ApiService {
  private static baseUrl = '';

  static async getGerejaList(): Promise<Gereja[]> {
    const res = await fetch('/api/gereja');
    const json = await res.json();
    return json.data || [];
  }

  static async getBerita(gerejaId?: string): Promise<Berita[]> {
    const url = gerejaId ? `/api/berita?gerejaId=${gerejaId}` : '/api/berita';
    const res = await fetch(url);
    const json = await res.json();
    return json.data || [];
  }

  static async createBerita(data: Partial<Berita>): Promise<Berita> {
    const res = await fetch('/api/berita', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const json = await res.json();
    return json.data;
  }

  static async deleteBerita(id: string): Promise<boolean> {
    const res = await fetch(`/api/berita/${id}`, { method: 'DELETE' });
    const json = await res.json();
    return json.success;
  }

  static async getPengumuman(gerejaId?: string): Promise<Pengumuman[]> {
    const url = gerejaId ? `/api/pengumuman?gerejaId=${gerejaId}` : '/api/pengumuman';
    const res = await fetch(url);
    const json = await res.json();
    return json.data || [];
  }

  static async createPengumuman(data: Partial<Pengumuman>): Promise<Pengumuman> {
    const res = await fetch('/api/pengumuman', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const json = await res.json();
    return json.data;
  }

  static async deletePengumuman(id: string): Promise<boolean> {
    const res = await fetch(`/api/pengumuman/${id}`, { method: 'DELETE' });
    const json = await res.json();
    return json.success;
  }

  static async getRenungan(gerejaId?: string): Promise<Renungan[]> {
    const url = gerejaId ? `/api/renungan?gerejaId=${gerejaId}` : '/api/renungan';
    const res = await fetch(url);
    const json = await res.json();
    return json.data || [];
  }

  static async createRenungan(data: Partial<Renungan>): Promise<Renungan> {
    const res = await fetch('/api/renungan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const json = await res.json();
    return json.data;
  }

  static async likeRenungan(id: string): Promise<number> {
    const res = await fetch(`/api/renungan/${id}/like`, { method: 'POST' });
    const json = await res.json();
    return json.likesCount || 0;
  }

  static async deleteRenungan(id: string): Promise<boolean> {
    const res = await fetch(`/api/renungan/${id}`, { method: 'DELETE' });
    const json = await res.json();
    return json.success;
  }

  static async getEvents(gerejaId?: string): Promise<EventGereja[]> {
    const url = gerejaId ? `/api/events?gerejaId=${gerejaId}` : '/api/events';
    const res = await fetch(url);
    const json = await res.json();
    return json.data || [];
  }

  static async createEvent(data: Partial<EventGereja>): Promise<EventGereja> {
    const res = await fetch('/api/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const json = await res.json();
    return json.data;
  }

  static async rsvpEvent(eventId: string, payload: { jemaatName: string; phone: string; email: string; seats: number }): Promise<any> {
    const res = await fetch(`/api/events/${eventId}/rsvp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return await res.json();
  }

  static async deleteEvent(id: string): Promise<boolean> {
    const res = await fetch(`/api/events/${id}`, { method: 'DELETE' });
    const json = await res.json();
    return json.success;
  }

  static async getJadwal(gerejaId?: string): Promise<JadwalIbadah[]> {
    const url = gerejaId ? `/api/jadwal?gerejaId=${gerejaId}` : '/api/jadwal';
    const res = await fetch(url);
    const json = await res.json();
    return json.data || [];
  }

  static async createJadwal(data: Partial<JadwalIbadah>): Promise<JadwalIbadah> {
    const res = await fetch('/api/jadwal', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const json = await res.json();
    return json.data;
  }

  static async getPelayanan(gerejaId?: string): Promise<Pelayanan[]> {
    const url = gerejaId ? `/api/pelayanan?gerejaId=${gerejaId}` : '/api/pelayanan';
    const res = await fetch(url);
    const json = await res.json();
    return json.data || [];
  }

  static async getStruktur(gerejaId?: string): Promise<StrukturOrganisasi[]> {
    const url = gerejaId ? `/api/struktur?gerejaId=${gerejaId}` : '/api/struktur';
    const res = await fetch(url);
    const json = await res.json();
    return json.data || [];
  }

  static async getAlbums(gerejaId?: string): Promise<Album[]> {
    const url = gerejaId ? `/api/albums?gerejaId=${gerejaId}` : '/api/albums';
    const res = await fetch(url);
    const json = await res.json();
    return json.data || [];
  }

  static async getGaleri(gerejaId?: string, albumId?: string): Promise<Galeri[]> {
    let url = `/api/galeri?1=1`;
    if (gerejaId) url += `&gerejaId=${gerejaId}`;
    if (albumId) url += `&albumId=${albumId}`;
    const res = await fetch(url);
    const json = await res.json();
    return json.data || [];
  }

  static async createGaleri(data: Partial<Galeri>): Promise<Galeri> {
    const res = await fetch('/api/galeri', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const json = await res.json();
    return json.data;
  }

  static async getPokokDoa(gerejaId?: string): Promise<PokokDoa[]> {
    const url = gerejaId ? `/api/pokok-doa?gerejaId=${gerejaId}` : '/api/pokok-doa';
    const res = await fetch(url);
    const json = await res.json();
    return json.data || [];
  }

  static async createPokokDoa(data: Partial<PokokDoa>): Promise<PokokDoa> {
    const res = await fetch('/api/pokok-doa', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const json = await res.json();
    return json.data;
  }

  static async updatePokokDoa(id: string, data: Partial<PokokDoa>): Promise<PokokDoa> {
    const res = await fetch(`/api/pokok-doa/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const json = await res.json();
    return json.data;
  }

  static async getDonasi(gerejaId?: string): Promise<Donasi[]> {
    const url = gerejaId ? `/api/donasi?gerejaId=${gerejaId}` : '/api/donasi';
    const res = await fetch(url);
    const json = await res.json();
    return json.data || [];
  }

  static async createDonasi(data: Partial<Donasi>): Promise<Donasi> {
    const res = await fetch('/api/donasi', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const json = await res.json();
    return json.data;
  }

  static async verifyDonasi(id: string, status: 'verified' | 'rejected'): Promise<Donasi> {
    const res = await fetch(`/api/donasi/${id}/verify`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    const json = await res.json();
    return json.data;
  }

  static async getKas(gerejaId?: string): Promise<{ items: Kas[]; summary: { totalPemasukan: number; totalPengeluaran: number; saldoAkhir: number } }> {
    const url = gerejaId ? `/api/kas?gerejaId=${gerejaId}` : '/api/kas';
    const res = await fetch(url);
    const json = await res.json();
    return {
      items: json.data || [],
      summary: json.summary || { totalPemasukan: 0, totalPengeluaran: 0, saldoAkhir: 0 }
    };
  }

  static async getJemaatMembers(gerejaId?: string): Promise<JemaatMember[]> {
    const url = gerejaId ? `/api/jemaat-members?gerejaId=${gerejaId}` : '/api/jemaat-members';
    const res = await fetch(url);
    const json = await res.json();
    return json.data || [];
  }

  static async getNotifikasi(gerejaId?: string): Promise<Notifikasi[]> {
    const url = gerejaId ? `/api/notifikasi?gerejaId=${gerejaId}` : '/api/notifikasi';
    const res = await fetch(url);
    const json = await res.json();
    return json.data || [];
  }

  static async sendNotifikasi(data: Partial<Notifikasi>): Promise<Notifikasi> {
    const res = await fetch('/api/notifikasi', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const json = await res.json();
    return json.data;
  }

  static async getPengaturan(): Promise<Pengaturan> {
    const res = await fetch('/api/pengaturan');
    const json = await res.json();
    return json.data;
  }

  static async updatePengaturan(data: Partial<Pengaturan>): Promise<Pengaturan> {
    const res = await fetch('/api/pengaturan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const json = await res.json();
    return json.data;
  }

  static async syncGoogleSheets(sheetId: string, driveFolderId: string): Promise<any> {
    const res = await fetch('/api/google-sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sheetId, driveFolderId })
    });
    return await res.json();
  }

  static async triggerBackup(): Promise<BackupRecord> {
    const res = await fetch('/api/backup', { method: 'POST' });
    const json = await res.json();
    return json.data;
  }

  static async generateAiContent(prompt: string, type: 'renungan' | 'berita'): Promise<string> {
    const res = await fetch('/api/gemini/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, type })
    });
    const json = await res.json();
    return json.content;
  }

  static subscribeRealtime(gerejaId: string, onMessage: (msg: RealtimeSyncMessage) => void): () => void {
    const eventSource = new EventSource(`/api/realtime/stream?gerejaId=${gerejaId}`);
    
    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        onMessage(data);
      } catch (err) {
        // Ignored
      }
    };

    return () => {
      eventSource.close();
    };
  }
}
