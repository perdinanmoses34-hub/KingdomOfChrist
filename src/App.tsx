import React, { useState, useEffect } from 'react';
import { HeaderNavbar } from './components/HeaderNavbar';
import { JemaatView } from './components/JemaatView';
import { AdminGerejaView } from './components/AdminGerejaView';
import { SuperAdminView } from './components/SuperAdminView';
import { ApiService } from './services/api';
import {
  UserRole,
  Gereja,
  User,
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
  JemaatMember,
  Notifikasi,
  Pengaturan,
  LogAktivitas,
  RealtimeSyncMessage
} from './types';
import { Sparkles, Bell, CheckCircle2, AlertCircle } from 'lucide-react';

export default function App() {
  const [currentRole, setCurrentRole] = useState<UserRole>('jemaat');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [viewportMode, setViewportMode] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');

  // Multi-Tenant State
  const [gerejaList, setGerejaList] = useState<Gereja[]>([]);
  const [selectedGereja, setSelectedGereja] = useState<Gereja | null>(null);

  // Resource States
  const [beritaList, setBeritaList] = useState<Berita[]>([]);
  const [pengumumanList, setPengumumanList] = useState<Pengumuman[]>([]);
  const [renunganList, setRenunganList] = useState<Renungan[]>([]);
  const [eventList, setEventList] = useState<EventGereja[]>([]);
  const [jadwalList, setJadwalList] = useState<JadwalIbadah[]>([]);
  const [pelayananList, setPelayananList] = useState<Pelayanan[]>([]);
  const [strukturList, setStrukturList] = useState<StrukturOrganisasi[]>([]);
  const [albumList, setAlbumList] = useState<Album[]>([]);
  const [galeriList, setGaleriList] = useState<Galeri[]>([]);
  const [pokokDoaList, setPokokDoaList] = useState<PokokDoa[]>([]);
  const [donasiList, setDonasiList] = useState<Donasi[]>([]);
  const [kasData, setKasData] = useState<{ items: Kas[]; summary: { totalPemasukan: number; totalPengeluaran: number; saldoAkhir: number } }>({
    items: [],
    summary: { totalPemasukan: 0, totalPengeluaran: 0, saldoAkhir: 0 }
  });
  const [jemaatMembers, setJemaatMembers] = useState<JemaatMember[]>([]);
  const [notifikasiList, setNotifikasiList] = useState<Notifikasi[]>([]);
  const [pengaturan, setPengaturan] = useState<Pengaturan>({
    id: 'stg-1',
    gerejaId: 'ger-001',
    bankBcaAccount: '782-099-1234',
    bankMandiriAccount: '122-00-9876543-1',
    bankBriAccount: '0112-01-009988-50-3',
    qrisImageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=400&q=80',
    contactWhatsapp: '081234567890',
    contactEmail: 'info@church.org',
    googleApiConnected: true
  });
  const [logAktivitas, setLogAktivitas] = useState<LogAktivitas[]>([]);

  // Current logged in mock user
  const currentUser: User = {
    id: 'usr-1',
    email: 'jemaat.daniel@gmail.com',
    name: 'Daniel Sitorus',
    role: currentRole,
    gerejaId: selectedGereja?.id || 'ger-001',
    phone: '081398765432',
    membershipNo: 'HKBP-2025-088',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
    createdAt: new Date().toISOString()
  };

  // Toast State
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' } | null>(null);
  const [showNotifModal, setShowNotifModal] = useState(false);

  const showToastMsg = (message: string, type: 'success' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4500);
  };

  // Fetch all resources for selected church
  const loadChurchData = async (gerejaId: string) => {
    try {
      const [
        berita,
        pengumuman,
        renungan,
        events,
        jadwal,
        pelayanan,
        struktur,
        albums,
        galeri,
        pokokDoa,
        donasi,
        kas,
        jemaat,
        notif,
        stg
      ] = await Promise.all([
        ApiService.getBerita(gerejaId),
        ApiService.getPengumuman(gerejaId),
        ApiService.getRenungan(gerejaId),
        ApiService.getEvents(gerejaId),
        ApiService.getJadwal(gerejaId),
        ApiService.getPelayanan(gerejaId),
        ApiService.getStruktur(gerejaId),
        ApiService.getAlbums(gerejaId),
        ApiService.getGaleri(gerejaId),
        ApiService.getPokokDoa(gerejaId),
        ApiService.getDonasi(gerejaId),
        ApiService.getKas(gerejaId),
        ApiService.getJemaatMembers(gerejaId),
        ApiService.getNotifikasi(gerejaId),
        ApiService.getPengaturan()
      ]);

      setBeritaList(berita);
      setPengumumanList(pengumuman);
      setRenunganList(renungan);
      setEventList(events);
      setJadwalList(jadwal);
      setPelayananList(pelayanan);
      setStrukturList(struktur);
      setAlbumList(albums);
      setGaleriList(galeri);
      setPokokDoaList(pokokDoa);
      setDonasiList(donasi);
      setKasData(kas);
      setJemaatMembers(jemaat);
      setNotifikasiList(notif);
      if (stg) setPengaturan(stg);
    } catch (err) {
      console.error('Error loading church data:', err);
    }
  };

  // On Mount: Load Churches List
  useEffect(() => {
    ApiService.getGerejaList().then((list) => {
      setGerejaList(list);
      if (list.length > 0) {
        setSelectedGereja(list[0]);
        loadChurchData(list[0].id);
      }
    });
  }, []);

  // On Church Selection Change: Load Church Specific Data & Subscribe to Realtime SSE
  useEffect(() => {
    if (!selectedGereja) return;
    loadChurchData(selectedGereja.id);

    // Subscribe to SSE Realtime Updates
    const unsubscribe = ApiService.subscribeRealtime(selectedGereja.id, (msg: RealtimeSyncMessage) => {
      loadChurchData(selectedGereja.id);
      if (msg.type === 'NOTIFICATION') {
        showToastMsg(`🔔 Notifikasi Baru: ${msg.data?.title || 'Informasi Gereja'}`, 'info');
      } else if (msg.type === 'INSERT') {
        showToastMsg(`⚡ Data Baru Ditambahkan: ${msg.entity.toUpperCase()} telah diperbarui secara Realtime!`, 'success');
      } else if (msg.type === 'UPDATE') {
        showToastMsg(`🔄 Perubahan Realtime: ${msg.entity.toUpperCase()} diperbarui!`, 'info');
      }
    });

    return () => {
      unsubscribe();
    };
  }, [selectedGereja?.id]);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  return (
    <div className={`min-h-screen transition-colors duration-200 ${isDarkMode ? 'dark bg-slate-950 text-slate-100' : 'bg-slate-100 text-slate-900'}`}>
      {/* Top Navbar Header */}
      <HeaderNavbar
        currentRole={currentRole}
        onRoleChange={(r) => {
          setCurrentRole(r);
          showToastMsg(`Beralih hak akses ke: ${r.toUpperCase()}`, 'info');
        }}
        gerejaList={gerejaList}
        selectedGereja={selectedGereja}
        onGerejaChange={(g) => {
          setSelectedGereja(g);
          showToastMsg(`Membuka data ${g.name}`, 'info');
        }}
        isDarkMode={isDarkMode}
        onToggleDarkMode={toggleDarkMode}
        notifikasiList={notifikasiList}
        onOpenNotifModal={() => setShowNotifModal(true)}
        viewportMode={viewportMode}
        onViewportChange={setViewportMode}
        showViewportToggle={currentRole === 'admin_gereja'}
      />

      {/* Floating Realtime Toast Notification */}
      {toast && (
        <div className="fixed top-20 right-4 z-50 animate-bounce">
          <div className="bg-slate-900 text-white dark:bg-white dark:text-slate-900 px-4 py-3 rounded-2xl shadow-2xl border border-blue-500/50 flex items-center gap-3 max-w-md">
            {toast.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            ) : (
              <Sparkles className="w-5 h-5 text-amber-400 shrink-0" />
            )}
            <p className="text-xs font-bold leading-snug">{toast.message}</p>
          </div>
        </div>
      )}

      {/* Main Role-Based Content Area */}
      <main className="w-full">
        {selectedGereja ? (
          <>
            {/* 1. JEMAAT VIEW (With optional Admin Viewport simulator frame) */}
            {currentRole === 'jemaat' && (
              <JemaatView
                gereja={selectedGereja}
                beritaList={beritaList}
                pengumumanList={pengumumanList}
                renunganList={renunganList}
                eventList={eventList}
                jadwalList={jadwalList}
                pelayananList={pelayananList}
                strukturList={strukturList}
                albumList={albumList}
                galeriList={galeriList}
                pokokDoaList={pokokDoaList}
                donasiList={donasiList}
                kasData={kasData}
                currentUser={currentUser}
                onRefreshData={() => loadChurchData(selectedGereja.id)}
                onShowToast={showToastMsg}
              />
            )}

            {/* 2. ADMIN GEREJA VIEW */}
            {currentRole === 'admin_gereja' && (
              <div>
                {/* Viewport Frame Simulator for Admin */}
                {viewportMode !== 'desktop' ? (
                  <div className="py-6 px-4">
                    <div className="text-center mb-2 text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center justify-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-500" /> SIMULATOR VIEWPORT PWA JEMAAT ({viewportMode.toUpperCase()})
                    </div>
                    <div
                      className={`mx-auto bg-white dark:bg-slate-950 rounded-[36px] shadow-2xl border-8 border-slate-800 overflow-hidden ${
                        viewportMode === 'mobile' ? 'max-w-[400px] h-[780px]' : 'max-w-[768px] h-[800px]'
                      }`}
                    >
                      <div className="h-full overflow-y-auto">
                        <JemaatView
                          gereja={selectedGereja}
                          beritaList={beritaList}
                          pengumumanList={pengumumanList}
                          renunganList={renunganList}
                          eventList={eventList}
                          jadwalList={jadwalList}
                          pelayananList={pelayananList}
                          strukturList={strukturList}
                          albumList={albumList}
                          galeriList={galeriList}
                          pokokDoaList={pokokDoaList}
                          donasiList={donasiList}
                          kasData={kasData}
                          currentUser={currentUser}
                          onRefreshData={() => loadChurchData(selectedGereja.id)}
                          onShowToast={showToastMsg}
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <AdminGerejaView
                    gereja={selectedGereja}
                    beritaList={beritaList}
                    pengumumanList={pengumumanList}
                    renunganList={renunganList}
                    eventList={eventList}
                    jadwalList={jadwalList}
                    pelayananList={pelayananList}
                    strukturList={strukturList}
                    albumList={albumList}
                    galeriList={galeriList}
                    pokokDoaList={pokokDoaList}
                    donasiList={donasiList}
                    kasData={kasData}
                    jemaatMembers={jemaatMembers}
                    pengaturan={pengaturan}
                    logAktivitas={logAktivitas}
                    onRefreshData={() => loadChurchData(selectedGereja.id)}
                    onShowToast={showToastMsg}
                    onPreviewJemaatTab={() => {
                      setCurrentRole('jemaat');
                      showToastMsg('Membuka tampilan PWA Jemaat...', 'info');
                    }}
                  />
                )}
              </div>
            )}

            {/* 3. SUPER ADMIN VIEW */}
            {currentRole === 'super_admin' && (
              <SuperAdminView
                gerejaList={gerejaList}
                logAktivitas={logAktivitas}
                onRefreshData={() => {
                  ApiService.getGerejaList().then(setGerejaList);
                  loadChurchData(selectedGereja.id);
                }}
                onShowToast={showToastMsg}
              />
            )}
          </>
        ) : (
          <div className="min-h-[60vh] flex items-center justify-center">
            <div className="animate-spin text-blue-600 font-bold text-lg">Memuat Data Gereja...</div>
          </div>
        )}
      </main>

      {/* Notifications Drawer Modal */}
      {showNotifModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl relative border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setShowNotifModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 text-xl font-bold cursor-pointer"
            >
              ✕
            </button>
            <h3 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <Bell className="w-5 h-5 text-blue-600" /> Notifikasi & Pengumuman Realtime
            </h3>

            <div className="mt-4 space-y-3 max-h-80 overflow-y-auto">
              {notifikasiList.map((n) => (
                <div key={n.id} className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-2xl border border-slate-200 dark:border-slate-600 text-xs">
                  <span className="font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider text-[10px]">{n.type}</span>
                  <h4 className="font-bold text-slate-900 dark:text-white mt-0.5">{n.title}</h4>
                  <p className="text-slate-600 dark:text-slate-300 mt-1">{n.message}</p>
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    {new Date(n.createdAt).toLocaleDateString('id-ID')}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
