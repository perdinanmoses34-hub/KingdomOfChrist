import React, { useState } from 'react';
import {
  LayoutDashboard,
  Newspaper,
  Megaphone,
  BookOpen,
  CalendarDays,
  Users,
  MessageSquare,
  Bell,
  UserCheck,
  Building2,
  Image,
  Plus,
  Trash2,
  CheckCircle,
  Sparkles,
  RefreshCw,
  Eye,
  FileSpreadsheet,
  Download,
  Search,
  DollarSign,
  Clock,
  MapPin,
  FolderPlus,
  Calendar,
  Palette,
  Layers,
  Check,
  Smartphone
} from 'lucide-react';
import {
  Gereja,
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
  Pengaturan,
  LogAktivitas
} from '../types';
import { ApiService } from '../services/api';

interface AdminGerejaViewProps {
  gereja: Gereja;
  beritaList: Berita[];
  pengumumanList: Pengumuman[];
  renunganList: Renungan[];
  eventList: EventGereja[];
  jadwalList: JadwalIbadah[];
  pelayananList: Pelayanan[];
  strukturList: StrukturOrganisasi[];
  albumList: Album[];
  galeriList: Galeri[];
  pokokDoaList: PokokDoa[];
  donasiList: Donasi[];
  kasData: { items: Kas[]; summary: { totalPemasukan: number; totalPengeluaran: number; saldoAkhir: number } };
  jemaatMembers: JemaatMember[];
  pengaturan: Pengaturan;
  logAktivitas: LogAktivitas[];
  onRefreshData: () => void;
  onShowToast: (msg: string, type?: 'success' | 'info') => void;
  onPreviewJemaatTab: () => void;
}

export const AdminGerejaView: React.FC<AdminGerejaViewProps> = ({
  gereja,
  beritaList,
  pengumumanList,
  renunganList,
  eventList,
  jadwalList,
  pelayananList,
  strukturList,
  albumList,
  galeriList,
  pokokDoaList,
  donasiList,
  kasData,
  jemaatMembers,
  pengaturan,
  logAktivitas,
  onRefreshData,
  onShowToast,
  onPreviewJemaatTab
}) => {
  const [activeAdminTab, setActiveAdminTab] = useState<
    | 'dashboard'
    | 'berita'
    | 'pengumuman'
    | 'renungan'
    | 'event'
    | 'jadwal'
    | 'jemaat'
    | 'donasi'
    | 'doa'
    | 'notif'
    | 'pelayanan'
    | 'galeri'
    | 'pengaturan'
  >('dashboard');

  // Modal Visibility States
  const [showBeritaModal, setShowBeritaModal] = useState(false);
  const [showPengumumanModal, setShowPengumumanModal] = useState(false);
  const [showRenunganModal, setShowRenunganModal] = useState(false);
  const [showEventModal, setShowEventModal] = useState(false);
  const [showJadwalModal, setShowJadwalModal] = useState(false);
  const [showJemaatModal, setShowJemaatModal] = useState(false);
  const [showKasModal, setShowKasModal] = useState(false);
  const [showPelayananModal, setShowPelayananModal] = useState(false);
  const [showStrukturModal, setShowStrukturModal] = useState(false);
  const [showGaleriModal, setShowGaleriModal] = useState(false);
  const [showNotifModal, setShowNotifModal] = useState(false);

  // Search Filter
  const [jemaatSearch, setJemaatSearch] = useState('');

  // Form States
  const [newBerita, setNewBerita] = useState({ title: '', content: '', coverUrl: '', category: 'Kegiatan Gereja', tags: 'Warta,Jemaat' });
  const [newPengumuman, setNewPengumuman] = useState({ title: '', content: '', priority: 'normal' as 'normal' | 'penting' | 'mendesak' });
  const [newRenungan, setNewRenungan] = useState({ title: '', scripture: '', content: '', videoUrl: '', imageUrl: '', author: gereja.pastorName });
  const [newEvent, setNewEvent] = useState({ title: '', description: '', posterUrl: '', locationName: '', date: '', time: '', quota: 100, category: 'Umum' });
  const [newJadwal, setNewJadwal] = useState({ title: 'Ibadah Minggu', category: 'Ibadah Minggu' as any, dayOfWeek: 'Minggu', time: '09:00 - 11:00 WIB', location: 'Gedung Utama', speaker: gereja.pastorName, worshipLeader: 'Tim Worship' });
  const [newJemaat, setNewJemaat] = useState({ fullName: '', gender: 'Laki-laki' as any, phone: '', sector: 'Sektor 1', address: '' });
  const [newKas, setNewKas] = useState({ title: '', type: 'pemasukan' as 'pemasukan' | 'pengeluaran', amount: 0, category: 'Persembahan', description: '' });
  const [newPelayanan, setNewPelayanan] = useState({ name: '', category: 'Kategorial', leaderName: '', description: '', meetingTime: 'Setiap Minggu 10:00' });
  const [newStruktur, setNewStruktur] = useState({ name: '', position: 'Pengurus', period: '2024-2027', photoUrl: '', level: 2 });
  const [newGaleri, setNewGaleri] = useState({ title: '', type: 'image' as 'image' | 'video', url: '', albumId: albumList[0]?.id || 'alb-001' });
  const [notifForm, setNotifForm] = useState({ title: '', message: '', type: 'pengumuman' as any });

  // Gemini AI Loading
  const [aiGenerating, setAiGenerating] = useState(false);

  // Google Sheets Sync Config
  const [sheetIdInput, setSheetIdInput] = useState(gereja.googleSheetId || '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms');
  const [driveFolderInput, setDriveFolderInput] = useState(gereja.googleDriveFolderId || '1zA9K_drive_folder_hkbp_grace');
  const [syncing, setSyncing] = useState(false);

  // Theme Customization State
  const [themeForm, setThemeForm] = useState({
    churchNameCustom: pengaturan?.theme?.churchNameCustom || gereja.name || '',
    logoUrlCustom: pengaturan?.theme?.logoUrlCustom || gereja.logoUrl || '',
    bannerUrlCustom: pengaturan?.theme?.bannerUrlCustom || gereja.bannerUrl || '',
    welcomeTitle: pengaturan?.theme?.welcomeTitle || 'Selamat Datang di Rumah Tuhan',
    welcomeSubtitle: pengaturan?.theme?.welcomeSubtitle || 'Gereja yang Mengasihi, Melayani, dan Bertumbuh Bersama',
    primaryColor: pengaturan?.theme?.primaryColor || 'blue',
    backgroundStyle: pengaturan?.theme?.backgroundStyle || 'twilight',
    cardStyle: pengaturan?.theme?.cardStyle || 'glassmorphic',
    layoutStyle: pengaturan?.theme?.layoutStyle || 'modern_cards',
    buttonRadius: pengaturan?.theme?.buttonRadius || 'modern_rounded'
  });
  const [isSavingTheme, setIsSavingTheme] = useState(false);

  const handleSaveTheme = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingTheme(true);
    try {
      await ApiService.updatePengaturan({
        ...pengaturan,
        theme: {
          churchNameCustom: themeForm.churchNameCustom,
          logoUrlCustom: themeForm.logoUrlCustom,
          bannerUrlCustom: themeForm.bannerUrlCustom,
          welcomeTitle: themeForm.welcomeTitle,
          welcomeSubtitle: themeForm.welcomeSubtitle,
          primaryColor: themeForm.primaryColor as any,
          backgroundStyle: themeForm.backgroundStyle as any,
          cardStyle: themeForm.cardStyle as any,
          layoutStyle: themeForm.layoutStyle as any,
          buttonRadius: themeForm.buttonRadius as any
        }
      });

      if (themeForm.churchNameCustom || themeForm.logoUrlCustom || themeForm.bannerUrlCustom) {
        await ApiService.updateGereja(gereja.id, {
          name: themeForm.churchNameCustom || gereja.name,
          logoUrl: themeForm.logoUrlCustom || gereja.logoUrl,
          bannerUrl: themeForm.bannerUrlCustom || gereja.bannerUrl
        });
      }

      onShowToast('🎨 Kustomisasi Tampilan Dashboard Jemaat Berhasil Disimpan & Tersinkron Realtime!', 'success');
      onRefreshData();
    } catch (err) {
      alert('Gagal menyimpan pengaturan tema');
    } finally {
      setIsSavingTheme(false);
    }
  };

  // --- HANDLERS ---
  const handleCreateBerita = async (e: React.FormEvent) => {
    e.preventDefault();
    await ApiService.createBerita({
      gerejaId: gereja.id,
      title: newBerita.title,
      content: newBerita.content,
      coverUrl: newBerita.coverUrl || 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=800&q=80',
      category: newBerita.category,
      tags: newBerita.tags.split(','),
      authorName: 'Admin Gereja'
    });
    onShowToast(`Berita "${newBerita.title}" berhasil ditambahkan & tersinkron Realtime!`, 'success');
    setShowBeritaModal(false);
    setNewBerita({ title: '', content: '', coverUrl: '', category: 'Kegiatan Gereja', tags: 'Warta,Jemaat' });
    onRefreshData();
  };

  const handleCreatePengumuman = async (e: React.FormEvent) => {
    e.preventDefault();
    await ApiService.createPengumuman({
      gerejaId: gereja.id,
      title: newPengumuman.title,
      content: newPengumuman.content,
      priority: newPengumuman.priority,
      publishDate: new Date().toISOString()
    });
    onShowToast(`Pengumuman "${newPengumuman.title}" diterbitkan!`, 'success');
    setShowPengumumanModal(false);
    setNewPengumuman({ title: '', content: '', priority: 'normal' });
    onRefreshData();
  };

  const handleCreateRenungan = async (e: React.FormEvent) => {
    e.preventDefault();
    await ApiService.createRenungan({
      gerejaId: gereja.id,
      title: newRenungan.title,
      scripture: newRenungan.scripture,
      content: newRenungan.content,
      videoUrl: newRenungan.videoUrl,
      imageUrl: newRenungan.imageUrl || 'https://images.unsplash.com/photo-1507692049790-de58290a4334?auto=format&fit=crop&w=800&q=80',
      author: newRenungan.author
    });
    onShowToast(`Renungan "${newRenungan.title}" berhasil dipublikasikan!`, 'success');
    setShowRenunganModal(false);
    setNewRenungan({ title: '', scripture: '', content: '', videoUrl: '', imageUrl: '', author: gereja.pastorName });
    onRefreshData();
  };

  const handleGenerateAiRenungan = async () => {
    setAiGenerating(true);
    try {
      const content = await ApiService.generateAiContent('Buatkan draf renungan Alkitab tentang pentingnya persekutuan dan kasih di gereja.', 'renungan');
      setNewRenungan(prev => ({
        ...prev,
        title: 'Persekutuan Kasih Kristus di Tengah Jemaat',
        scripture: '1 Yohanes 4:11 - "Saudara-saudaraku yang kekasih, jikalau Allah sedemikian mengasihi kita, maka haruslah kita juga saling mengasihi."',
        content
      }));
      onShowToast('Draf Renungan berhasil digenerate oleh Gemini AI!', 'success');
    } catch (err) {
      alert('Gagal menggenerasi AI');
    } finally {
      setAiGenerating(false);
    }
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    await ApiService.createEvent({
      gerejaId: gereja.id,
      title: newEvent.title,
      description: newEvent.description,
      posterUrl: newEvent.posterUrl || 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
      locationName: newEvent.locationName,
      mapUrl: 'https://maps.google.com/?q=' + encodeURIComponent(newEvent.locationName),
      date: newEvent.date,
      time: newEvent.time,
      quota: newEvent.quota,
      category: newEvent.category
    });
    onShowToast(`Event "${newEvent.title}" telah dipublikasikan!`, 'success');
    setShowEventModal(false);
    setNewEvent({ title: '', description: '', posterUrl: '', locationName: '', date: '', time: '', quota: 100, category: 'Umum' });
    onRefreshData();
  };

  const handleCreateJadwal = async (e: React.FormEvent) => {
    e.preventDefault();
    await ApiService.createJadwal({
      gerejaId: gereja.id,
      title: newJadwal.title,
      category: newJadwal.category,
      dayOfWeek: newJadwal.dayOfWeek,
      time: newJadwal.time,
      location: newJadwal.location,
      speaker: newJadwal.speaker,
      worshipLeader: newJadwal.worshipLeader
    });
    onShowToast(`Jadwal "${newJadwal.title}" telah ditambahkan!`, 'success');
    setShowJadwalModal(false);
    setNewJadwal({ title: 'Ibadah Minggu', category: 'Ibadah Minggu', dayOfWeek: 'Minggu', time: '09:00 - 11:00 WIB', location: 'Gedung Utama', speaker: gereja.pastorName, worshipLeader: 'Tim Worship' });
    onRefreshData();
  };

  const handleCreateJemaat = async (e: React.FormEvent) => {
    e.preventDefault();
    await ApiService.createJemaatMember({
      gerejaId: gereja.id,
      fullName: newJemaat.fullName,
      gender: newJemaat.gender,
      phone: newJemaat.phone,
      sector: newJemaat.sector,
      address: newJemaat.address
    });
    onShowToast(`Jemaat Baru "${newJemaat.fullName}" berhasil terdaftar & tersinkron!`, 'success');
    setShowJemaatModal(false);
    setNewJemaat({ fullName: '', gender: 'Laki-laki', phone: '', sector: 'Sektor 1', address: '' });
    onRefreshData();
  };

  const handleCreateKas = async (e: React.FormEvent) => {
    e.preventDefault();
    await ApiService.createKas({
      gerejaId: gereja.id,
      title: newKas.title,
      type: newKas.type,
      amount: Number(newKas.amount),
      category: newKas.category,
      description: newKas.description
    });
    onShowToast(`Pencatatan Kas (${newKas.type.toUpperCase()}) senilai Rp ${Number(newKas.amount).toLocaleString('id-ID')} disimpan!`, 'success');
    setShowKasModal(false);
    setNewKas({ title: '', type: 'pemasukan', amount: 0, category: 'Persembahan', description: '' });
    onRefreshData();
  };

  const handleCreatePelayanan = async (e: React.FormEvent) => {
    e.preventDefault();
    await ApiService.createPelayanan({
      gerejaId: gereja.id,
      name: newPelayanan.name,
      category: newPelayanan.category,
      leaderName: newPelayanan.leaderName,
      description: newPelayanan.description,
      meetingTime: newPelayanan.meetingTime
    });
    onShowToast(`Seksi Pelayanan "${newPelayanan.name}" ditambahkan!`, 'success');
    setShowPelayananModal(false);
    setNewPelayanan({ name: '', category: 'Kategorial', leaderName: '', description: '', meetingTime: 'Setiap Minggu 10:00' });
    onRefreshData();
  };

  const handleCreateStruktur = async (e: React.FormEvent) => {
    e.preventDefault();
    await ApiService.createStruktur({
      gerejaId: gereja.id,
      name: newStruktur.name,
      position: newStruktur.position,
      period: newStruktur.period,
      photoUrl: newStruktur.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      level: newStruktur.level
    });
    onShowToast(`Pengurus Organisasi "${newStruktur.name}" ditambahkan!`, 'success');
    setShowStrukturModal(false);
    setNewStruktur({ name: '', position: 'Pengurus', period: '2024-2027', photoUrl: '', level: 2 });
    onRefreshData();
  };

  const handleCreateGaleri = async (e: React.FormEvent) => {
    e.preventDefault();
    await ApiService.createGaleri({
      gerejaId: gereja.id,
      albumId: newGaleri.albumId,
      title: newGaleri.title,
      type: newGaleri.type,
      url: newGaleri.url || 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=800&q=80'
    });
    onShowToast(`Foto/Video "${newGaleri.title}" tersimpan di Galeri!`, 'success');
    setShowGaleriModal(false);
    setNewGaleri({ title: '', type: 'image', url: '', albumId: albumList[0]?.id || 'alb-001' });
    onRefreshData();
  };

  const handleSendNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    await ApiService.sendNotifikasi({
      gerejaId: gereja.id,
      title: notifForm.title,
      message: notifForm.message,
      type: notifForm.type,
      targetRole: 'jemaat'
    });
    onShowToast(`Notifikasi "${notifForm.title}" berhasil disiarkan Realtime ke HP Jemaat!`, 'success');
    setShowNotifModal(false);
    setNotifForm({ title: '', message: '', type: 'pengumuman' });
    onRefreshData();
  };

  const handleVerifyDonation = async (id: string, status: 'verified' | 'rejected') => {
    await ApiService.verifyDonasi(id, status);
    onShowToast(`Donasi berhasil di-${status === 'verified' ? 'verifikasi & masuk ke Kas' : 'tolak'}.`, 'success');
    onRefreshData();
  };

  const handleGoogleSheetsSync = async () => {
    setSyncing(true);
    const res = await ApiService.syncGoogleSheets(sheetIdInput, driveFolderInput);
    setSyncing(false);
    if (res.success) {
      onShowToast('Sinkronisasi Google Sheets API & Google Drive API Sukses!', 'success');
      onRefreshData();
    }
  };

  const filteredJemaat = jemaatMembers.filter(j =>
    j.fullName.toLowerCase().includes(jemaatSearch.toLowerCase()) ||
    j.phone.includes(jemaatSearch) ||
    j.sector.toLowerCase().includes(jemaatSearch.toLowerCase())
  );

  return (
    <div className="py-6 px-3 sm:px-6 max-w-7xl mx-auto space-y-6 overflow-x-hidden w-full max-w-full">
      {/* Admin Top Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-900 text-white rounded-3xl p-6 shadow-xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-400 text-slate-950 rounded-full font-extrabold text-xs mb-2">
            <Building2 className="w-3.5 h-3.5" /> Dashboard Admin Gereja
          </div>
          <h1 className="text-xl sm:text-2xl font-black">{gereja.name}</h1>
          <p className="text-xs text-slate-300 mt-1">
            Kelola warta, renungan, event, keuangan, dan data jemaat secara terpusat dengan sinkronisasi Realtime.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onPreviewJemaatTab}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm rounded-2xl shadow-lg transition-transform active:scale-95 flex items-center gap-2 cursor-pointer"
          >
            <Eye className="w-4 h-4" /> Live Preview Tampilan Jemaat
          </button>
        </div>
      </div>

      {/* Admin Navigation Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
        {[
          { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
          { id: 'berita', label: 'Berita', icon: Newspaper },
          { id: 'pengumuman', label: 'Pengumuman', icon: Megaphone },
          { id: 'renungan', label: 'Renungan', icon: BookOpen },
          { id: 'event', label: 'Event', icon: CalendarDays },
          { id: 'jadwal', label: 'Jadwal', icon: Calendar },
          { id: 'jemaat', label: 'Data Jemaat', icon: Users },
          { id: 'donasi', label: 'Donasi & Kas', icon: DollarSign },
          { id: 'doa', label: 'Pokok Doa', icon: MessageSquare },
          { id: 'notif', label: 'Notifikasi', icon: Bell },
          { id: 'pelayanan', label: 'Pelayanan & Pengurus', icon: UserCheck },
          { id: 'galeri', label: 'Galeri & Drive', icon: Image },
          { id: 'pengaturan', label: 'Google API Sync', icon: FileSpreadsheet }
        ].map((item) => {
          const Icon = item.icon;
          const isActive = activeAdminTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveAdminTab(item.id as any)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? 'bg-amber-500 text-slate-950 shadow-md ring-2 ring-amber-400'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* --- TAB 1: OVERVIEW DASHBOARD --- */}
      {activeAdminTab === 'dashboard' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-slate-800 p-5 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm">
              <div className="flex justify-between items-center text-slate-500 text-xs font-bold">
                <span>Total Jemaat</span>
                <Users className="w-4 h-4 text-blue-600" />
              </div>
              <p className="text-2xl font-black text-slate-900 dark:text-white mt-2">{jemaatMembers.length} Orang</p>
              <span className="text-[10px] text-emerald-600 font-bold mt-1 inline-block">Sync ke HP Active</span>
            </div>

            <div className="bg-white dark:bg-slate-800 p-5 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm">
              <div className="flex justify-between items-center text-slate-500 text-xs font-bold">
                <span>Saldo Kas Gereja</span>
                <DollarSign className="w-4 h-4 text-emerald-600" />
              </div>
              <p className="text-xl font-black text-slate-900 dark:text-white mt-2">
                Rp {kasData.summary.saldoAkhir.toLocaleString('id-ID')}
              </p>
              <span className="text-[10px] text-slate-500 mt-1 inline-block">Realtime Kasflow</span>
            </div>

            <div className="bg-white dark:bg-slate-800 p-5 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm">
              <div className="flex justify-between items-center text-slate-500 text-xs font-bold">
                <span>Pokok Doa Masuk</span>
                <MessageSquare className="w-4 h-4 text-rose-500" />
              </div>
              <p className="text-2xl font-black text-slate-900 dark:text-white mt-2">{pokokDoaList.length} Permohonan</p>
              <span className="text-[10px] text-amber-600 font-bold mt-1 inline-block">
                {pokokDoaList.filter(d => d.status === 'pending').length} Perlu Moderasi
              </span>
            </div>

            <div className="bg-white dark:bg-slate-800 p-5 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm">
              <div className="flex justify-between items-center text-slate-500 text-xs font-bold">
                <span>Google API Sync</span>
                <FileSpreadsheet className="w-4 h-4 text-emerald-500" />
              </div>
              <p className="text-sm font-black text-emerald-600 dark:text-emerald-400 mt-2">TERHUBUNG</p>
              <span className="text-[10px] text-slate-500 mt-1 inline-block">Sheets & Drive Cloud</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
              <h3 className="font-extrabold text-slate-900 dark:text-white text-base mb-4 flex items-center gap-2">
                <RefreshCw className="w-5 h-5 text-blue-600" /> Log Perubahan Multi-Device Realtime
              </h3>

              <div className="space-y-3 max-h-80 overflow-y-auto">
                {logAktivitas.map((log) => (
                  <div
                    key={log.id}
                    className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-2xl border border-slate-200 dark:border-slate-600 flex justify-between items-start text-xs"
                  >
                    <div>
                      <span className="font-bold text-slate-900 dark:text-white">{log.userName}</span>
                      <p className="text-slate-600 dark:text-slate-300 mt-0.5">{log.details}</p>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleTimeString('id-ID')}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm space-y-3">
              <h3 className="font-extrabold text-slate-900 dark:text-white text-base mb-2">Tindakan Cepat Admin</h3>
              <button
                onClick={() => setShowBeritaModal(true)}
                className="w-full py-2.5 bg-blue-600 text-white rounded-xl font-bold text-xs hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Tambah Berita Gereja
              </button>
              <button
                onClick={() => setShowPengumumanModal(true)}
                className="w-full py-2.5 bg-indigo-600 text-white rounded-xl font-bold text-xs hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <Megaphone className="w-4 h-4" /> Publis Pengumuman
              </button>
              <button
                onClick={() => setShowRenunganModal(true)}
                className="w-full py-2.5 bg-amber-500 text-slate-950 rounded-xl font-bold text-xs hover:bg-amber-400 transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <BookOpen className="w-4 h-4" /> Publis Renungan + Gemini AI
              </button>
              <button
                onClick={() => setShowJemaatModal(true)}
                className="w-full py-2.5 bg-emerald-600 text-white rounded-xl font-bold text-xs hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <Users className="w-4 h-4" /> Registrasi Jemaat Baru
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- TAB 2: KELOLA BERITA --- */}
      {activeAdminTab === 'berita' && (
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <Newspaper className="w-5 h-5 text-blue-600" /> Kelola Berita & Warta Gereja
            </h2>
            <button
              onClick={() => setShowBeritaModal(true)}
              className="px-4 py-2 bg-blue-600 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer shadow-md"
            >
              <Plus className="w-4 h-4" /> Tambah Berita
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {beritaList.map((b) => (
              <div
                key={b.id}
                className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-2xl border border-slate-200 dark:border-slate-600 flex gap-3"
              >
                <img src={b.coverUrl} alt={b.title} className="w-20 h-20 rounded-xl object-cover shrink-0" />
                <div className="flex-1">
                  <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full text-[10px] font-bold">
                    {b.category}
                  </span>
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm mt-1">{b.title}</h4>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">{b.content}</p>
                  <div className="mt-2 flex justify-end">
                    <button
                      onClick={async () => {
                        await ApiService.deleteBerita(b.id);
                        onShowToast('Berita berhasil dihapus.', 'info');
                        onRefreshData();
                      }}
                      className="text-xs text-red-600 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Hapus
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* --- TAB 3: KELOLA PENGUMUMAN --- */}
      {activeAdminTab === 'pengumuman' && (
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <Megaphone className="w-5 h-5 text-indigo-600" /> Kelola Pengumuman Resmi Gereja
            </h2>
            <button
              onClick={() => setShowPengumumanModal(true)}
              className="px-4 py-2 bg-indigo-600 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer shadow-md"
            >
              <Plus className="w-4 h-4" /> Tambah Pengumuman
            </button>
          </div>

          <div className="space-y-3">
            {pengumumanList.map((p) => (
              <div
                key={p.id}
                className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-2xl border border-slate-200 dark:border-slate-600 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      p.priority === 'mendesak' ? 'bg-red-100 text-red-800' : p.priority === 'penting' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {p.priority.toUpperCase()}
                    </span>
                    <h4 className="font-bold text-slate-900 dark:text-white text-sm">{p.title}</h4>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300">{p.content}</p>
                  <span className="text-[10px] text-slate-400 block">{new Date(p.publishDate).toLocaleDateString('id-ID')}</span>
                </div>

                <button
                  onClick={async () => {
                    await ApiService.deletePengumuman(p.id);
                    onShowToast('Pengumuman dihapus.', 'info');
                    onRefreshData();
                  }}
                  className="text-xs text-red-600 font-bold hover:underline flex items-center gap-1 cursor-pointer shrink-0"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Hapus
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* --- TAB 4: KELOLA RENUNGAN & GEMINI AI --- */}
      {activeAdminTab === 'renungan' && (
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-amber-500" /> Renungan & Khotbah
              </h2>
              <p className="text-xs text-slate-500">Dilengkapi Asisten Gemini AI untuk draf pesan firman Tuhan.</p>
            </div>
            <button
              onClick={() => setShowRenunganModal(true)}
              className="px-4 py-2 bg-amber-500 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer shadow-md"
            >
              <Plus className="w-4 h-4" /> Publis Renungan
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {renunganList.map((r) => (
              <div
                key={r.id}
                className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-2xl border border-slate-200 dark:border-slate-600 space-y-2"
              >
                <div className="flex justify-between items-center">
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm">{r.title}</h4>
                  <span className="text-xs font-bold text-rose-600">👍 {r.likesCount} Suka</span>
                </div>
                <p className="text-xs italic text-blue-600">{r.scripture}</p>
                <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2">{r.content}</p>
                <div className="pt-2 flex justify-end">
                  <button
                    onClick={async () => {
                      await ApiService.deleteRenungan(r.id);
                      onShowToast('Renungan dihapus.', 'info');
                      onRefreshData();
                    }}
                    className="text-xs text-red-600 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Hapus
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* --- TAB 5: EVENT & QUOTA RSVP --- */}
      {activeAdminTab === 'event' && (
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <CalendarDays className="w-5 h-5 text-purple-600" /> Event & Kuota Pendaftaran Jemaat
            </h2>
            <button
              onClick={() => setShowEventModal(true)}
              className="px-4 py-2 bg-purple-600 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer shadow-md"
            >
              <Plus className="w-4 h-4" /> Buat Event Baru
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {eventList.map((e) => (
              <div
                key={e.id}
                className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-2xl border border-slate-200 dark:border-slate-600 space-y-3"
              >
                <div className="flex gap-3">
                  <img src={e.posterUrl} alt={e.title} className="w-20 h-24 rounded-xl object-cover shrink-0" />
                  <div className="flex-1 space-y-1 text-xs">
                    <span className="px-2 py-0.5 bg-purple-100 text-purple-800 rounded-full font-bold text-[10px]">
                      {e.category}
                    </span>
                    <h4 className="font-bold text-slate-900 dark:text-white text-sm">{e.title}</h4>
                    <p className="text-slate-500 flex items-center gap-1"><Clock className="w-3 h-3" /> {e.date} • {e.time}</p>
                    <p className="text-slate-500 flex items-center gap-1"><MapPin className="w-3 h-3" /> {e.locationName}</p>
                  </div>
                </div>

                <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1">
                  <div className="flex justify-between text-xs font-bold">
                    <span>Kuota Terisi:</span>
                    <span className="text-purple-600">{e.registeredCount} / {e.quota} Kursi</span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-purple-600 h-full rounded-full"
                      style={{ width: `${Math.min(100, (e.registeredCount / e.quota) * 100)}%` }}
                    ></div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={async () => {
                      await ApiService.deleteEvent(e.id);
                      onShowToast('Event dihapus.', 'info');
                      onRefreshData();
                    }}
                    className="text-xs text-red-600 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Hapus Event
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* --- TAB 6: JADWAL IBADAH --- */}
      {activeAdminTab === 'jadwal' && (
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-600" /> Kelola Jadwal Ibadah Minggu & Spesial
            </h2>
            <button
              onClick={() => setShowJadwalModal(true)}
              className="px-4 py-2 bg-blue-600 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer shadow-md"
            >
              <Plus className="w-4 h-4" /> Tambah Jadwal
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {jadwalList.map((j) => (
              <div
                key={j.id}
                className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-2xl border border-slate-200 dark:border-slate-600 space-y-2 text-xs"
              >
                <div className="flex justify-between items-center">
                  <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full font-bold text-[10px]">
                    {j.category}
                  </span>
                  <span className="font-bold text-blue-600">{j.dayOfWeek}, {j.time}</span>
                </div>
                <h4 className="font-extrabold text-slate-900 dark:text-white text-sm">{j.title}</h4>
                <p className="text-slate-600 dark:text-slate-300">📍 Lokasi: {j.location}</p>
                <p className="text-slate-600 dark:text-slate-300">🎙️ Pelayan Firman: {j.speaker}</p>
                <p className="text-slate-600 dark:text-slate-300">🎵 Worship Leader: {j.worshipLeader}</p>

                <div className="pt-2 flex justify-end">
                  <button
                    onClick={async () => {
                      await ApiService.deleteJadwal(j.id);
                      onShowToast('Jadwal dihapus.', 'info');
                      onRefreshData();
                    }}
                    className="text-xs text-red-600 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Hapus
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* --- TAB 7: DATA JEMAAT MEMBER --- */}
      {activeAdminTab === 'jemaat' && (
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <h2 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600" /> Database & Registrasi Jemaat
              </h2>
              <p className="text-xs text-slate-500">Tersinkronisasi Realtime dengan Cloud & Google Sheets.</p>
            </div>
            <button
              onClick={() => setShowJemaatModal(true)}
              className="px-4 py-2 bg-blue-600 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer shadow-md"
            >
              <Plus className="w-4 h-4" /> Registrasi Jemaat Baru
            </button>
          </div>

          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Cari nama jemaat, nomor HP, atau sektor..."
              value={jemaatSearch}
              onChange={(e) => setJemaatSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-xl text-xs text-slate-900 dark:text-white"
            />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold">
                <tr>
                  <th className="p-3 rounded-l-xl">Nama Lengkap</th>
                  <th className="p-3">Gender</th>
                  <th className="p-3">No. HP</th>
                  <th className="p-3">Sektor</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Tgl Gabung</th>
                  <th className="p-3 rounded-r-xl text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {filteredJemaat.map((j) => (
                  <tr key={j.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/40">
                    <td className="p-3 font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <img src={j.avatarUrl} alt={j.fullName} className="w-7 h-7 rounded-full object-cover" />
                      {j.fullName}
                    </td>
                    <td className="p-3 text-slate-600 dark:text-slate-300">{j.gender}</td>
                    <td className="p-3 font-mono text-slate-600 dark:text-slate-300">{j.phone}</td>
                    <td className="p-3 text-slate-600 dark:text-slate-300">{j.sector}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        {j.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="p-3 text-slate-500">{j.joinDate}</td>
                    <td className="p-3 text-right">
                      <button
                        onClick={async () => {
                          await ApiService.deleteJemaatMember(j.id);
                          onShowToast(`Data jemaat ${j.fullName} telah dihapus.`, 'info');
                          onRefreshData();
                        }}
                        className="text-red-600 hover:underline font-bold text-xs cursor-pointer"
                      >
                        Hapus
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* --- TAB 8: DONASI & KAS KEAGAMAAN --- */}
      {activeAdminTab === 'donasi' && (
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <h2 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-emerald-600" /> Kelola Keuangan & Transaksi Kas Gereja
              </h2>
              <p className="text-xs text-slate-500">Saldo Akhir Kas: Rp {kasData.summary.saldoAkhir.toLocaleString('id-ID')}</p>
            </div>
            <button
              onClick={() => setShowKasModal(true)}
              className="px-4 py-2 bg-emerald-600 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer shadow-md"
            >
              <Plus className="w-4 h-4" /> Catat Kas Pemasukan / Pengeluaran
            </button>
          </div>

          <div className="space-y-4">
            <h3 className="font-extrabold text-slate-900 dark:text-white text-sm">1. Verifikasi Donasi & Persembahan Online</h3>
            <div className="space-y-2">
              {donasiList.map((d) => (
                <div
                  key={d.id}
                  className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-2xl border border-slate-200 dark:border-slate-600 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 dark:text-white text-sm">{d.donorName}</span>
                      <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full font-bold text-[10px]">
                        {d.paymentMethod}
                      </span>
                    </div>
                    <p className="text-slate-500 mt-0.5">{d.campaign} • Tanggal: {d.date}</p>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="font-extrabold text-base text-emerald-600">
                      Rp {d.amount.toLocaleString('id-ID')}
                    </span>

                    {d.status === 'pending' ? (
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleVerifyDonation(d.id, 'verified')}
                          className="px-3 py-1.5 bg-emerald-600 text-white font-bold rounded-xl cursor-pointer hover:bg-emerald-700"
                        >
                          Verifikasi
                        </button>
                        <button
                          onClick={() => handleVerifyDonation(d.id, 'rejected')}
                          className="px-3 py-1.5 bg-red-600 text-white font-bold rounded-xl cursor-pointer hover:bg-red-700"
                        >
                          Tolak
                        </button>
                      </div>
                    ) : (
                      <span className="px-3 py-1 bg-emerald-100 text-emerald-800 font-bold rounded-xl">
                        ✓ Terverifikasi
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <h3 className="font-extrabold text-slate-900 dark:text-white text-sm pt-4">2. Catatan Arus Kas Gereja</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold">
                  <tr>
                    <th className="p-3 rounded-l-xl">Tanggal</th>
                    <th className="p-3">Keterangan</th>
                    <th className="p-3">Kategori</th>
                    <th className="p-3">Jenis</th>
                    <th className="p-3">Nominal</th>
                    <th className="p-3 rounded-r-xl text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                  {kasData.items.map((k) => (
                    <tr key={k.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/40">
                      <td className="p-3 text-slate-500 font-mono">{k.date}</td>
                      <td className="p-3 font-bold text-slate-900 dark:text-white">{k.title}</td>
                      <td className="p-3 text-slate-600 dark:text-slate-300">{k.category}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          k.type === 'pemasukan' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                        }`}>
                          {k.type.toUpperCase()}
                        </span>
                      </td>
                      <td className={`p-3 font-bold ${k.type === 'pemasukan' ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {k.type === 'pemasukan' ? '+' : '-'} Rp {k.amount.toLocaleString('id-ID')}
                      </td>
                      <td className="p-3 text-right">
                        <button
                          onClick={async () => {
                            await ApiService.deleteKas(k.id);
                            onShowToast('Catatan kas dihapus.', 'info');
                            onRefreshData();
                          }}
                          className="text-red-600 hover:underline font-bold cursor-pointer"
                        >
                          Hapus
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* --- TAB 9: POKOK DOA SYAFAAT MODERATION --- */}
      {activeAdminTab === 'doa' && (
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
          <h2 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-rose-500" /> Moderasi & Respon Pokok Doa Syafaat
          </h2>

          <div className="space-y-3">
            {pokokDoaList.map((d) => (
              <div
                key={d.id}
                className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-2xl border border-slate-200 dark:border-slate-600 space-y-2 text-xs"
              >
                <div className="flex justify-between items-center">
                  <span className="font-bold text-slate-900 dark:text-white">{d.senderName} ({d.isPrivate ? 'PRIVAT' : 'PUBLIK'})</span>
                  <span className="text-slate-400">{new Date(d.createdAt).toLocaleDateString('id-ID')}</span>
                </div>
                <p className="text-slate-700 dark:text-slate-300 italic">"{d.content}"</p>

                <div className="pt-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={async () => {
                        await ApiService.updatePokokDoa(d.id, {
                          status: 'didoakan',
                          adminReply: 'Tim Doa Syafaat telah mendoakan permohonan Anda.'
                        });
                        onShowToast('Status doa diperbarui ke DIDOAKAN', 'success');
                        onRefreshData();
                      }}
                      className="px-3 py-1 bg-blue-600 text-white font-bold rounded-xl cursor-pointer hover:bg-blue-700"
                    >
                      Tandai Didoakan
                    </button>
                    <button
                      onClick={async () => {
                        await ApiService.updatePokokDoa(d.id, {
                          status: 'terjawab',
                          adminReply: 'Puji Tuhan! Doa telah terjawab.'
                        });
                        onShowToast('Status doa diperbarui ke TERJAWAB', 'success');
                        onRefreshData();
                      }}
                      className="px-3 py-1 bg-emerald-600 text-white font-bold rounded-xl cursor-pointer hover:bg-emerald-700"
                    >
                      Tandai Terjawab
                    </button>
                  </div>

                  <button
                    onClick={async () => {
                      await ApiService.deletePokokDoa(d.id);
                      onShowToast('Permohonan doa dihapus.', 'info');
                      onRefreshData();
                    }}
                    className="text-red-600 hover:underline font-bold cursor-pointer"
                  >
                    Hapus
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* --- TAB 10: NOTIFIKASI BROADCAST --- */}
      {activeAdminTab === 'notif' && (
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <Bell className="w-5 h-5 text-indigo-600" /> Kirim Push Notification Broadcast ke HP Jemaat
            </h2>
            <button
              onClick={() => setShowNotifModal(true)}
              className="px-4 py-2 bg-indigo-600 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer shadow-md"
            >
              <Plus className="w-4 h-4" /> Kirim Push Broadcast
            </button>
          </div>

          <div className="p-4 bg-indigo-50 dark:bg-indigo-950/40 rounded-2xl border border-indigo-200 dark:border-indigo-800 text-xs">
            <p className="font-bold text-indigo-900 dark:text-indigo-300">⚡ Fitur Realtime Notification Active</p>
            <p className="text-slate-600 dark:text-slate-300 mt-1">
              Setiap kali Anda menekan tombol broadcast, notifikasi akan langsung muncul secara otomatis di HP seluruh Jemaat yang sedang membuka aplikasi!
            </p>
          </div>
        </div>
      )}

      {/* --- TAB 11: PELAYANAN & STRUKTUR ORGANISASI --- */}
      {activeAdminTab === 'pelayanan' && (
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <h2 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-blue-600" /> Pelayanan Kategorial & Struktur Organisasi
            </h2>
            <div className="flex gap-2">
              <button
                onClick={() => setShowPelayananModal(true)}
                className="px-3.5 py-2 bg-blue-600 text-white font-bold text-xs rounded-xl cursor-pointer"
              >
                + Seksi Pelayanan
              </button>
              <button
                onClick={() => setShowStrukturModal(true)}
                className="px-3.5 py-2 bg-amber-500 text-slate-950 font-bold text-xs rounded-xl cursor-pointer"
              >
                + Pengurus Majelis
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-extrabold text-slate-900 dark:text-white text-sm">1. Seksi & Komisi Pelayanan</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {pelayananList.map((p) => (
                <div key={p.id} className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-2xl border border-slate-200 dark:border-slate-600 flex justify-between items-start text-xs">
                  <div>
                    <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full font-bold text-[10px]">{p.category}</span>
                    <h4 className="font-bold text-slate-900 dark:text-white text-sm mt-1">{p.name}</h4>
                    <p className="text-slate-500 mt-1">👤 Koordinator: {p.leaderName}</p>
                    <p className="text-slate-500">🕒 {p.meetingTime}</p>
                  </div>
                  <button
                    onClick={async () => {
                      await ApiService.deletePelayanan(p.id);
                      onShowToast('Seksi pelayanan dihapus.', 'info');
                      onRefreshData();
                    }}
                    className="text-red-600 font-bold hover:underline cursor-pointer"
                  >
                    Hapus
                  </button>
                </div>
              ))}
            </div>

            <h3 className="font-extrabold text-slate-900 dark:text-white text-sm pt-4">2. Struktur Organisasi Majelis Gereja</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {strukturList.map((s) => (
                <div key={s.id} className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-2xl border border-slate-200 dark:border-slate-600 text-center text-xs space-y-1">
                  <img src={s.photoUrl} alt={s.name} className="w-12 h-12 rounded-full object-cover mx-auto" />
                  <h4 className="font-bold text-slate-900 dark:text-white">{s.name}</h4>
                  <p className="text-blue-600 font-bold text-[10px]">{s.position}</p>
                  <p className="text-slate-400 text-[10px]">Periode: {s.period}</p>
                  <button
                    onClick={async () => {
                      await ApiService.deleteStruktur(s.id);
                      onShowToast('Pengurus dihapus.', 'info');
                      onRefreshData();
                    }}
                    className="text-red-600 font-bold hover:underline text-[10px] cursor-pointer pt-1 block mx-auto"
                  >
                    Hapus
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* --- TAB 12: GALERI FOTO & GOOGLE DRIVE --- */}
      {activeAdminTab === 'galeri' && (
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <Image className="w-5 h-5 text-emerald-600" /> Galeri Dokumentasi & Drive Cloud
            </h2>
            <button
              onClick={() => setShowGaleriModal(true)}
              className="px-4 py-2 bg-emerald-600 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer shadow-md"
            >
              <Plus className="w-4 h-4" /> Upload Foto Galeri
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {galeriList.map((g) => (
              <div key={g.id} className="group relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-900">
                <img src={g.url} alt={g.title} className="w-full h-36 object-cover" />
                <div className="p-2 text-xs">
                  <p className="font-bold text-slate-900 dark:text-white truncate">{g.title}</p>
                  <button
                    onClick={async () => {
                      await ApiService.deleteGaleri(g.id);
                      onShowToast('Foto dihapus dari Galeri.', 'info');
                      onRefreshData();
                    }}
                    className="text-red-600 font-bold hover:underline text-[10px] mt-1 cursor-pointer"
                  >
                    Hapus Foto
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* --- TAB 13: PENGATURAN SISTEM & CUSTOM TAMPILAN JEMAAT --- */}
      {activeAdminTab === 'pengaturan' && (
        <div className="space-y-8 max-w-5xl mx-auto pb-12">
          {/* SECTION 1: CUSTOM TAMPILAN DASHBOARD JEMAAT */}
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-700 shadow-lg space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-700 pb-5">
              <div>
                <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2.5">
                  <Palette className="w-6 h-6 text-amber-500" /> Kustomisasi Tampilan Dashboard Jemaat
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Atur tema, warna, logo, background, banner, dan gaya visual kartu agar tampilan aplikasi jemaat menarik, variatif, dan tidak membosankan.
                </p>
              </div>
              <button
                type="button"
                onClick={onPreviewJemaatTab}
                className="px-4 py-2 bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-amber-400 font-extrabold text-xs rounded-2xl border border-blue-200 dark:border-blue-800 flex items-center gap-2 hover:bg-blue-100 transition-colors cursor-pointer shrink-0"
              >
                <Smartphone className="w-4 h-4" /> Buka Simulator HP Jemaat
              </button>
            </div>

            <form onSubmit={handleSaveTheme} className="space-y-8">
              {/* 1. IDENTITAS & BRANDING GEREJA */}
              <div className="space-y-4">
                <h3 className="text-xs font-black uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                  <Building2 className="w-4 h-4" /> Identitas & Banner Hero Utama
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 mb-1">
                      Nama Gereja Publik
                    </label>
                    <input
                      type="text"
                      value={themeForm.churchNameCustom}
                      onChange={(e) => setThemeForm({ ...themeForm, churchNameCustom: e.target.value })}
                      placeholder="Contoh: HKBP Grace City Jakarta"
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-2xl text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 mb-1">
                      URL Logo Gereja
                    </label>
                    <input
                      type="text"
                      value={themeForm.logoUrlCustom}
                      onChange={(e) => setThemeForm({ ...themeForm, logoUrlCustom: e.target.value })}
                      placeholder="https://..."
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-2xl text-xs font-mono text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 mb-1">
                      Judul Banner Teks (Welcome Title)
                    </label>
                    <input
                      type="text"
                      value={themeForm.welcomeTitle}
                      onChange={(e) => setThemeForm({ ...themeForm, welcomeTitle: e.target.value })}
                      placeholder="Selamat Datang di Rumah Tuhan"
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-2xl text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 mb-1">
                      Subjudul Banner Teks (Subtitle)
                    </label>
                    <input
                      type="text"
                      value={themeForm.welcomeSubtitle}
                      onChange={(e) => setThemeForm({ ...themeForm, welcomeSubtitle: e.target.value })}
                      placeholder="Gereja yang Mengasihi, Melayani, dan Bertumbuh Bersama"
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-2xl text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 outline-none"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 mb-1">
                      URL Background Banner Hero Image
                    </label>
                    <input
                      type="text"
                      value={themeForm.bannerUrlCustom}
                      onChange={(e) => setThemeForm({ ...themeForm, bannerUrlCustom: e.target.value })}
                      placeholder="https://images.unsplash.com/photo-1548625361-18349d9c228d?auto=format&fit=crop&w=1200&q=80"
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-2xl text-xs font-mono text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* 2. WARNA UTAMA / ACCENT COLOR */}
              <div className="space-y-3">
                <h3 className="text-xs font-black uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4" /> Warna Akses Utama (Primary Accent)
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { id: 'blue', label: 'Blue Ocean', bg: 'bg-blue-600', ring: 'ring-blue-500' },
                    { id: 'amber', label: 'Amber Gold', bg: 'bg-amber-500', ring: 'ring-amber-400' },
                    { id: 'emerald', label: 'Emerald Grace', bg: 'bg-emerald-600', ring: 'ring-emerald-500' },
                    { id: 'purple', label: 'Royal Purple', bg: 'bg-purple-600', ring: 'ring-purple-500' },
                    { id: 'indigo', label: 'Indigo Deep', bg: 'bg-indigo-600', ring: 'ring-indigo-500' },
                    { id: 'rose', label: 'Sunset Rose', bg: 'bg-rose-600', ring: 'ring-rose-500' },
                    { id: 'teal', label: 'Teal Harmony', bg: 'bg-teal-600', ring: 'ring-teal-500' },
                    { id: 'slate', label: 'Slate Midnight', bg: 'bg-slate-700', ring: 'ring-slate-500' },
                  ].map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setThemeForm({ ...themeForm, primaryColor: c.id as any })}
                      className={`p-3 rounded-2xl border text-left flex items-center gap-3 transition-all cursor-pointer ${
                        themeForm.primaryColor === c.id
                          ? `bg-slate-100 dark:bg-slate-700 border-amber-500 ring-2 ${c.ring} shadow-md`
                          : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 hover:border-slate-300'
                      }`}
                    >
                      <span className={`w-5 h-5 rounded-full ${c.bg} shrink-0 shadow-sm flex items-center justify-center text-white text-[10px]`}>
                        {themeForm.primaryColor === c.id && <Check className="w-3 h-3 stroke-[3]" />}
                      </span>
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{c.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* 3. ATMOSPHERE / BACKGROUND STYLE */}
              <div className="space-y-3">
                <h3 className="text-xs font-black uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                  <Layers className="w-4 h-4" /> Latar Belakang & Atmosfer App (Background Theme)
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {[
                    { id: 'twilight', name: '🌙 Twilight Dark', desc: 'Sangat nyaman di mata (Dark Slate-Blue)', bg: 'bg-slate-900 border-slate-700 text-white' },
                    { id: 'clean_light', name: '☀️ Clean Minimalist Light', desc: 'Bersih cerah & modern off-white', bg: 'bg-slate-100 border-slate-300 text-slate-900' },
                    { id: 'warm_amber', name: '🌾 Warm Amber Cream', desc: 'Hangat, lembut & teduh', bg: 'bg-amber-50 border-amber-200 text-amber-950' },
                    { id: 'royal_blue', name: '🌊 Royal Samudra', desc: 'Biru elegan & anggun', bg: 'bg-blue-950 border-blue-800 text-blue-50' },
                    { id: 'emerald_nature', name: '🍃 Emerald Nature', desc: 'Segar & menenangkan hati', bg: 'bg-emerald-950 border-emerald-800 text-emerald-50' },
                    { id: 'dark_luxury', name: '💎 Dark Luxury Velvet', desc: 'Hitam eksklusif & mewah', bg: 'bg-black border-slate-800 text-slate-100' }
                  ].map((bgStyle) => (
                    <button
                      key={bgStyle.id}
                      type="button"
                      onClick={() => setThemeForm({ ...themeForm, backgroundStyle: bgStyle.id as any })}
                      className={`p-3.5 rounded-2xl border-2 text-left space-y-1 transition-all cursor-pointer ${bgStyle.bg} ${
                        themeForm.backgroundStyle === bgStyle.id
                          ? 'border-amber-400 ring-2 ring-amber-400/50 shadow-lg scale-[1.02]'
                          : 'opacity-80 hover:opacity-100'
                      }`}
                    >
                      <div className="flex items-center justify-between font-black text-xs">
                        <span>{bgStyle.name}</span>
                        {themeForm.backgroundStyle === bgStyle.id && <Check className="w-4 h-4 text-amber-400" />}
                      </div>
                      <p className="text-[11px] opacity-80 leading-snug">{bgStyle.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* 4. GAYA KARTU & BUTTON RADIUS */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h3 className="text-xs font-black uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                    <Eye className="w-4 h-4" /> Gaya Visual Kartu Modul
                  </h3>
                  <div className="space-y-2">
                    {[
                      { id: 'glassmorphic', label: '✨ Glassmorphism & Transparan Glow' },
                      { id: 'elevated_shadow', label: '☁️ Elevated Soft Shadow Clean' },
                      { id: 'bordered_minimal', label: '📐 Bordered Minimalist Modern' },
                      { id: 'soft_gradient', label: '🌈 Soft Gradient Depth' }
                    ].map((card) => (
                      <button
                        key={card.id}
                        type="button"
                        onClick={() => setThemeForm({ ...themeForm, cardStyle: card.id as any })}
                        className={`w-full px-4 py-3 rounded-2xl border text-left text-xs font-extrabold flex items-center justify-between transition-all cursor-pointer ${
                          themeForm.cardStyle === card.id
                            ? 'bg-amber-500/20 text-amber-600 dark:text-amber-300 border-amber-500 font-black'
                            : 'bg-slate-50 dark:bg-slate-700/50 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        <span>{card.label}</span>
                        {themeForm.cardStyle === card.id && <Check className="w-4 h-4 text-amber-500" />}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="text-xs font-black uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                    <Smartphone className="w-4 h-4" /> Radius Sudut Tombol (Button Shape)
                  </h3>
                  <div className="space-y-2">
                    {[
                      { id: 'rounded_pill', label: '⭕ Full Pill Rounded (rounded-full)' },
                      { id: 'modern_rounded', label: '🔲 Modern Curved (rounded-2xl)' },
                      { id: 'square_sleek', label: '⏹️ Sleek Square (rounded-lg)' }
                    ].map((rad) => (
                      <button
                        key={rad.id}
                        type="button"
                        onClick={() => setThemeForm({ ...themeForm, buttonRadius: rad.id as any })}
                        className={`w-full px-4 py-3 rounded-2xl border text-left text-xs font-extrabold flex items-center justify-between transition-all cursor-pointer ${
                          themeForm.buttonRadius === rad.id
                            ? 'bg-amber-500/20 text-amber-600 dark:text-amber-300 border-amber-500 font-black'
                            : 'bg-slate-50 dark:bg-slate-700/50 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        <span>{rad.label}</span>
                        {themeForm.buttonRadius === rad.id && <Check className="w-4 h-4 text-amber-500" />}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* LIVE MINI PREVIEW CARD */}
              <div className="p-5 bg-slate-900 rounded-3xl border border-slate-700 space-y-3">
                <div className="flex items-center justify-between text-xs text-amber-400 font-extrabold">
                  <span className="flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4" /> LIVE PREVIEW SIMULASI TAMPILAN JEMAAT
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">Realtime Sync Target</span>
                </div>

                <div className="p-4 rounded-2xl bg-slate-800 border border-slate-700 text-white space-y-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={themeForm.logoUrlCustom || gereja.logoUrl}
                      alt="Logo Preview"
                      className="w-10 h-10 rounded-full border border-amber-400 object-cover shadow"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = gereja.logoUrl;
                      }}
                    />
                    <div>
                      <h4 className="font-black text-sm text-amber-300">
                        {themeForm.churchNameCustom || gereja.name}
                      </h4>
                      <p className="text-[11px] text-slate-300">
                        {themeForm.welcomeTitle}
                      </p>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed italic">
                    "{themeForm.welcomeSubtitle}"
                  </p>

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      className={`px-3 py-1.5 text-xs font-black text-slate-950 bg-amber-500 shadow ${
                        themeForm.buttonRadius === 'rounded_pill'
                          ? 'rounded-full'
                          : themeForm.buttonRadius === 'square_sleek'
                          ? 'rounded-md'
                          : 'rounded-xl'
                      }`}
                    >
                      Tombol Utama Preview
                    </button>
                    <span className="text-[10px] text-emerald-400 font-bold bg-emerald-950/80 px-2 py-1 rounded-full border border-emerald-700">
                      Aksen Warna: {themeForm.primaryColor.toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSavingTheme}
                className="w-full py-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm uppercase tracking-wider rounded-2xl shadow-xl flex items-center justify-center gap-2 transition-transform active:scale-98 cursor-pointer"
              >
                <Palette className="w-5 h-5" />
                {isSavingTheme ? 'Menyimpan & Menyinkronkan Tampilan...' : 'Simpan & Terapkan ke Dashboard Jemaat Sekarang'}
              </button>
            </form>
          </div>

          {/* SECTION 2: GOOGLE SHEETS & DRIVE API INTEGRASI */}
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-700 shadow-lg space-y-6">
            <div>
              <h2 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-emerald-600" /> Integrasi Cloud Database & Google Sheets API
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Seluruh data CRUD (Jemaat, Kas, Warta, Event) tersinkronisasi otomatis secara realtime ke Spreadsheet & Cloud Storage.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Google Sheets Spreadsheet ID
                </label>
                <input
                  type="text"
                  value={sheetIdInput}
                  onChange={(e) => setSheetIdInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-2xl text-xs font-mono text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Google Drive Root Folder ID
                </label>
                <input
                  type="text"
                  value={driveFolderInput}
                  onChange={(e) => setDriveFolderInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-2xl text-xs font-mono text-slate-900 dark:text-white"
                />
              </div>

              <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl border border-emerald-200 dark:border-emerald-800 text-xs space-y-1">
                <p className="font-bold text-emerald-900 dark:text-emerald-300 flex items-center gap-1">
                  <CheckCircle className="w-4 h-4 text-emerald-600" /> Status Koneksi Cloud: TERHUBUNG REALTIME
                </p>
                <p className="text-slate-600 dark:text-slate-300">
                  20 Sheet Terbuat: users, gereja, jemaat, berita, pengumuman, renungan, event, jadwal_ibadah, pelayanan, galeri, pokok_doa, donasi, kas, dll.
                </p>
              </div>

              <button
                type="button"
                onClick={handleGoogleSheetsSync}
                disabled={syncing}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider rounded-2xl shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
                {syncing ? 'Menyinkronkan Data...' : 'Uji & Sinkronkan Google Sheets API'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL: TAMBAH BERITA --- */}
      {showBeritaModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl relative border border-slate-200 dark:border-slate-700">
            <button onClick={() => setShowBeritaModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 text-xl font-bold cursor-pointer">✕</button>
            <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">Tambah Berita Gereja</h3>
            <form onSubmit={handleCreateBerita} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Judul Berita</label>
                <input type="text" value={newBerita.title} onChange={(e) => setNewBerita({ ...newBerita, title: e.target.value })} required className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-xl text-xs text-slate-900 dark:text-white" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Isi Berita</label>
                <textarea rows={4} value={newBerita.content} onChange={(e) => setNewBerita({ ...newBerita, content: e.target.value })} required className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-xl text-xs text-slate-900 dark:text-white"></textarea>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">URL Gambar Cover</label>
                <input type="url" value={newBerita.coverUrl} onChange={(e) => setNewBerita({ ...newBerita, coverUrl: e.target.value })} placeholder="https://images.unsplash.com/..." className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-xl text-xs text-slate-900 dark:text-white" />
              </div>
              <button type="submit" className="w-full py-2.5 bg-blue-600 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer mt-2">Publikasikan Berita</button>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL: TAMBAH PENGUMUMAN --- */}
      {showPengumumanModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl relative border border-slate-200 dark:border-slate-700">
            <button onClick={() => setShowPengumumanModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 text-xl font-bold cursor-pointer">✕</button>
            <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">Tambah Pengumuman</h3>
            <form onSubmit={handleCreatePengumuman} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Judul Pengumuman</label>
                <input type="text" value={newPengumuman.title} onChange={(e) => setNewPengumuman({ ...newPengumuman, title: e.target.value })} required className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-xl text-xs text-slate-900 dark:text-white" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Prioritas</label>
                <select value={newPengumuman.priority} onChange={(e) => setNewPengumuman({ ...newPengumuman, priority: e.target.value as any })} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-xl text-xs text-slate-900 dark:text-white">
                  <option value="normal">Normal</option>
                  <option value="penting">Penting</option>
                  <option value="mendesak">Mendesak</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Isi Pengumuman</label>
                <textarea rows={4} value={newPengumuman.content} onChange={(e) => setNewPengumuman({ ...newPengumuman, content: e.target.value })} required className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-xl text-xs text-slate-900 dark:text-white"></textarea>
              </div>
              <button type="submit" className="w-full py-2.5 bg-indigo-600 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer mt-2">Publikasikan Pengumuman</button>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL: PUBLIKASI RENUNGAN + GEMINI AI --- */}
      {showRenunganModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl relative border border-slate-200 dark:border-slate-700">
            <button onClick={() => setShowRenunganModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 text-xl font-bold cursor-pointer">✕</button>
            <div className="flex justify-between items-center pr-6">
              <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">Publikasi Renungan</h3>
              <button
                type="button"
                onClick={handleGenerateAiRenungan}
                disabled={aiGenerating}
                className="px-3 py-1 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs rounded-full flex items-center gap-1 cursor-pointer shadow-sm"
              >
                <Sparkles className="w-3.5 h-3.5" />
                {aiGenerating ? 'Menggenerasi...' : 'Draf AI Gemini'}
              </button>
            </div>
            <form onSubmit={handleCreateRenungan} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Judul Renungan</label>
                <input type="text" value={newRenungan.title} onChange={(e) => setNewRenungan({ ...newRenungan, title: e.target.value })} required className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-xl text-xs text-slate-900 dark:text-white" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Ayat Alkitab Kunci</label>
                <input type="text" value={newRenungan.scripture} onChange={(e) => setNewRenungan({ ...newRenungan, scripture: e.target.value })} required className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-xl text-xs text-slate-900 dark:text-white" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Isi Pesan Renungan</label>
                <textarea rows={4} value={newRenungan.content} onChange={(e) => setNewRenungan({ ...newRenungan, content: e.target.value })} required className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-xl text-xs text-slate-900 dark:text-white"></textarea>
              </div>
              <button type="submit" className="w-full py-2.5 bg-amber-500 text-slate-950 font-bold text-xs rounded-xl shadow-md cursor-pointer mt-2">Publikasikan ke Jemaat</button>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL: BUAT EVENT BARU --- */}
      {showEventModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl relative border border-slate-200 dark:border-slate-700">
            <button onClick={() => setShowEventModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 text-xl font-bold cursor-pointer">✕</button>
            <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">Buat Event Gereja Baru</h3>
            <form onSubmit={handleCreateEvent} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Judul Event</label>
                <input type="text" value={newEvent.title} onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })} required className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-xl text-xs text-slate-900 dark:text-white" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Tanggal</label>
                  <input type="date" value={newEvent.date} onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })} required className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-xl text-xs text-slate-900 dark:text-white" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Waktu</label>
                  <input type="text" value={newEvent.time} onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })} required placeholder="18:00 - Selesai" className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-xl text-xs text-slate-900 dark:text-white" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Lokasi</label>
                  <input type="text" value={newEvent.locationName} onChange={(e) => setNewEvent({ ...newEvent, locationName: e.target.value })} required className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-xl text-xs text-slate-900 dark:text-white" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Kuota Tempat</label>
                  <input type="number" value={newEvent.quota} onChange={(e) => setNewEvent({ ...newEvent, quota: Number(e.target.value) })} required className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-xl text-xs text-slate-900 dark:text-white" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Deskripsi Event</label>
                <textarea rows={3} value={newEvent.description} onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })} required className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-xl text-xs text-slate-900 dark:text-white"></textarea>
              </div>
              <button type="submit" className="w-full py-2.5 bg-purple-600 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer mt-2">Publikasikan Event</button>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL: TAMBAH JADWAL --- */}
      {showJadwalModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl relative border border-slate-200 dark:border-slate-700">
            <button onClick={() => setShowJadwalModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 text-xl font-bold cursor-pointer">✕</button>
            <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">Tambah Jadwal Ibadah</h3>
            <form onSubmit={handleCreateJadwal} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Nama Ibadah</label>
                <input type="text" value={newJadwal.title} onChange={(e) => setNewJadwal({ ...newJadwal, title: e.target.value })} required className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-xl text-xs text-slate-900 dark:text-white" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Hari</label>
                  <input type="text" value={newJadwal.dayOfWeek} onChange={(e) => setNewJadwal({ ...newJadwal, dayOfWeek: e.target.value })} required placeholder="Minggu / Sabtu" className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-xl text-xs text-slate-900 dark:text-white" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Waktu</label>
                  <input type="text" value={newJadwal.time} onChange={(e) => setNewJadwal({ ...newJadwal, time: e.target.value })} required placeholder="09:00 WIB" className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-xl text-xs text-slate-900 dark:text-white" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Pelayan Firman</label>
                  <input type="text" value={newJadwal.speaker} onChange={(e) => setNewJadwal({ ...newJadwal, speaker: e.target.value })} required className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-xl text-xs text-slate-900 dark:text-white" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Worship Leader</label>
                  <input type="text" value={newJadwal.worshipLeader} onChange={(e) => setNewJadwal({ ...newJadwal, worshipLeader: e.target.value })} required className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-xl text-xs text-slate-900 dark:text-white" />
                </div>
              </div>
              <button type="submit" className="w-full py-2.5 bg-blue-600 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer mt-2">Simpan Jadwal</button>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL: REGISTRASI JEMAAT --- */}
      {showJemaatModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl relative border border-slate-200 dark:border-slate-700">
            <button onClick={() => setShowJemaatModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 text-xl font-bold cursor-pointer">✕</button>
            <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">Registrasi Jemaat Baru</h3>
            <form onSubmit={handleCreateJemaat} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Nama Lengkap</label>
                <input type="text" value={newJemaat.fullName} onChange={(e) => setNewJemaat({ ...newJemaat, fullName: e.target.value })} required className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-xl text-xs text-slate-900 dark:text-white" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Jenis Kelamin</label>
                  <select value={newJemaat.gender} onChange={(e) => setNewJemaat({ ...newJemaat, gender: e.target.value as any })} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-xl text-xs text-slate-900 dark:text-white">
                    <option value="Laki-laki">Laki-laki</option>
                    <option value="Perempuan">Perempuan</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">No. HP / WhatsApp</label>
                  <input type="text" value={newJemaat.phone} onChange={(e) => setNewJemaat({ ...newJemaat, phone: e.target.value })} required placeholder="0812..." className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-xl text-xs text-slate-900 dark:text-white" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Sektor / Rayon</label>
                <input type="text" value={newJemaat.sector} onChange={(e) => setNewJemaat({ ...newJemaat, sector: e.target.value })} required placeholder="Sektor 1 / Wilayah A" className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-xl text-xs text-slate-900 dark:text-white" />
              </div>
              <button type="submit" className="w-full py-2.5 bg-blue-600 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer mt-2">Daftarkan Jemaat</button>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL: CATAT KAS --- */}
      {showKasModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl relative border border-slate-200 dark:border-slate-700">
            <button onClick={() => setShowKasModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 text-xl font-bold cursor-pointer">✕</button>
            <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">Catat Arus Kas Transaksi</h3>
            <form onSubmit={handleCreateKas} className="mt-4 space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Jenis Transaksi</label>
                  <select value={newKas.type} onChange={(e) => setNewKas({ ...newKas, type: e.target.value as any })} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-xl text-xs text-slate-900 dark:text-white">
                    <option value="pemasukan">Pemasukan (+)</option>
                    <option value="pengeluaran">Pengeluaran (-)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Nominal (Rp)</label>
                  <input type="number" value={newKas.amount} onChange={(e) => setNewKas({ ...newKas, amount: Number(e.target.value) })} required className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-xl text-xs text-slate-900 dark:text-white" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Judul / Keterangan</label>
                <input type="text" value={newKas.title} onChange={(e) => setNewKas({ ...newKas, title: e.target.value })} required placeholder="Persembahan Minggu II..." className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-xl text-xs text-slate-900 dark:text-white" />
              </div>
              <button type="submit" className="w-full py-2.5 bg-emerald-600 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer mt-2">Simpan Catatan Kas</button>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL: TAMBAH PELAYANAN --- */}
      {showPelayananModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl relative border border-slate-200 dark:border-slate-700">
            <button onClick={() => setShowPelayananModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 text-xl font-bold cursor-pointer">✕</button>
            <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">Tambah Seksi Pelayanan</h3>
            <form onSubmit={handleCreatePelayanan} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Nama Seksi / Komisi</label>
                <input type="text" value={newPelayanan.name} onChange={(e) => setNewPelayanan({ ...newPelayanan, name: e.target.value })} required placeholder="Pemuda, Wanita, Diakonia..." className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-xl text-xs text-slate-900 dark:text-white" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Koordinator / Penanggung Jawab</label>
                <input type="text" value={newPelayanan.leaderName} onChange={(e) => setNewPelayanan({ ...newPelayanan, leaderName: e.target.value })} required className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-xl text-xs text-slate-900 dark:text-white" />
              </div>
              <button type="submit" className="w-full py-2.5 bg-blue-600 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer mt-2">Simpan Seksi Pelayanan</button>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL: TAMBAH PENGURUS --- */}
      {showStrukturModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl relative border border-slate-200 dark:border-slate-700">
            <button onClick={() => setShowStrukturModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 text-xl font-bold cursor-pointer">✕</button>
            <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">Tambah Pengurus Majelis</h3>
            <form onSubmit={handleCreateStruktur} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Nama Lengkap & Gelar</label>
                <input type="text" value={newStruktur.name} onChange={(e) => setNewStruktur({ ...newStruktur, name: e.target.value })} required className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-xl text-xs text-slate-900 dark:text-white" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Jabatan Majelis</label>
                <input type="text" value={newStruktur.position} onChange={(e) => setNewStruktur({ ...newStruktur, position: e.target.value })} required placeholder="Ketua Majelis, Sekretaris, Bendahara..." className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-xl text-xs text-slate-900 dark:text-white" />
              </div>
              <button type="submit" className="w-full py-2.5 bg-amber-500 text-slate-950 font-bold text-xs rounded-xl shadow-md cursor-pointer mt-2">Simpan Pengurus</button>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL: UPLOAD GALERI --- */}
      {showGaleriModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl relative border border-slate-200 dark:border-slate-700">
            <button onClick={() => setShowGaleriModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 text-xl font-bold cursor-pointer">✕</button>
            <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">Upload Foto / Video Galeri</h3>
            <form onSubmit={handleCreateGaleri} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Judul Dokumen / Foto</label>
                <input type="text" value={newGaleri.title} onChange={(e) => setNewGaleri({ ...newGaleri, title: e.target.value })} required className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-xl text-xs text-slate-900 dark:text-white" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">URL Foto (Drive / Cloud Image)</label>
                <input type="url" value={newGaleri.url} onChange={(e) => setNewGaleri({ ...newGaleri, url: e.target.value })} placeholder="https://images.unsplash.com/..." className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-xl text-xs text-slate-900 dark:text-white" />
              </div>
              <button type="submit" className="w-full py-2.5 bg-emerald-600 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer mt-2">Simpan Foto</button>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL: KIRIM NOTIFIKASI BROADCAST --- */}
      {showNotifModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl relative border border-slate-200 dark:border-slate-700">
            <button onClick={() => setShowNotifModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 text-xl font-bold cursor-pointer">✕</button>
            <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">Kirim Push Notification PWA</h3>
            <form onSubmit={handleSendNotification} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Judul Notifikasi</label>
                <input type="text" value={notifForm.title} onChange={(e) => setNotifForm({ ...notifForm, title: e.target.value })} required placeholder="Contoh: Jadwal Ibadah Paskah..." className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-xl text-xs text-slate-900 dark:text-white" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Pesan Notifikasi</label>
                <textarea rows={3} value={notifForm.message} onChange={(e) => setNotifForm({ ...notifForm, message: e.target.value })} required className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-xl text-xs text-slate-900 dark:text-white"></textarea>
              </div>
              <button type="submit" className="w-full py-2.5 bg-indigo-600 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer mt-2">Siarkan Push Broadcast</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
