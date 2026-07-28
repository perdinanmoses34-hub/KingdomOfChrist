import React, { useState } from 'react';
import {
  LayoutDashboard,
  Newspaper,
  Megaphone,
  BookOpen,
  CalendarDays,
  Users,
  Heart,
  MessageSquare,
  Bell,
  UserCheck,
  Building2,
  Image,
  Settings,
  Plus,
  Trash2,
  Edit,
  CheckCircle,
  XCircle,
  Sparkles,
  RefreshCw,
  Eye,
  FileSpreadsheet,
  HardDrive,
  Download,
  Search,
  DollarSign
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
    'dashboard' | 'berita' | 'pengumuman' | 'renungan' | 'event' | 'jemaat' | 'donasi' | 'doa' | 'notif' | 'pelayanan' | 'struktur' | 'galeri' | 'pengaturan'
  >('dashboard');

  // Modal forms
  const [showBeritaModal, setShowBeritaModal] = useState(false);
  const [showRenunganModal, setShowRenunganModal] = useState(false);
  const [showEventModal, setShowEventModal] = useState(false);
  const [showJadwalModal, setShowJadwalModal] = useState(false);
  const [showNotifModal, setShowNotifModal] = useState(false);

  // Form states
  const [newBerita, setNewBerita] = useState({ title: '', content: '', coverUrl: '', category: 'Kegiatan Gereja', tags: 'Warta,Jemaat' });
  const [newPengumuman, setNewPengumuman] = useState({ title: '', content: '', priority: 'normal' as 'normal' | 'penting' | 'mendesak' });
  const [newRenungan, setNewRenungan] = useState({ title: '', scripture: '', content: '', videoUrl: '', imageUrl: '', author: gereja.pastorName });
  const [newEvent, setNewEvent] = useState({ title: '', description: '', posterUrl: '', locationName: '', date: '', time: '', quota: 100, category: 'Umum' });
  const [newJadwal, setNewJadwal] = useState({ title: '', category: 'Ibadah Minggu' as any, dayOfWeek: 'Minggu', time: '09:00 WIB', location: 'Gedung Gereja Utama', speaker: gereja.pastorName, worshipLeader: 'Tim Worship' });
  const [notifForm, setNotifForm] = useState({ title: '', message: '', type: 'pengumuman' as any });

  // Gemini AI Loading
  const [aiGenerating, setAiGenerating] = useState(false);

  // Google Sheets Sync Config
  const [sheetIdInput, setSheetIdInput] = useState(gereja.googleSheetId || '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms');
  const [driveFolderInput, setDriveFolderInput] = useState(gereja.googleDriveFolderId || '1zA9K_drive_folder_hkbp_grace');
  const [syncing, setSyncing] = useState(false);

  // Handlers
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
    onShowToast(`Berita "${newBerita.title}" berhasil ditambahkan & tersinkron secara Realtime!`, 'success');
    setShowBeritaModal(false);
    setNewBerita({ title: '', content: '', coverUrl: '', category: 'Kegiatan Gereja', tags: 'Warta,Jemaat' });
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
    onShowToast(`Renungan "${newRenungan.title}" berhasil dipublikasikan ke Jemaat!`, 'success');
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

  const handleSendNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    await ApiService.sendNotifikasi({
      gerejaId: gereja.id,
      title: notifForm.title,
      message: notifForm.message,
      type: notifForm.type,
      targetRole: 'jemaat'
    });
    onShowToast(`Notifikasi "${notifForm.title}" berhasil disiarkan secara Realtime ke seluruh Jemaat!`, 'success');
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
          { id: 'berita', label: 'Kelola Berita', icon: Newspaper },
          { id: 'pengumuman', label: 'Pengumuman', icon: Megaphone },
          { id: 'renungan', label: 'Renungan', icon: BookOpen },
          { id: 'event', label: 'Event & Quota', icon: CalendarDays },
          { id: 'jemaat', label: 'Data Jemaat', icon: Users },
          { id: 'donasi', label: 'Donasi & Kas', icon: DollarSign },
          { id: 'doa', label: 'Pokok Doa', icon: MessageSquare },
          { id: 'notif', label: 'Notifikasi Broadcast', icon: Bell },
          { id: 'pelayanan', label: 'Pelayanan', icon: UserCheck },
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
          {/* Key Metric Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-slate-800 p-5 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm">
              <div className="flex justify-between items-center text-slate-500 text-xs font-bold">
                <span>Total Jemaat</span>
                <Users className="w-4 h-4 text-blue-600" />
              </div>
              <p className="text-2xl font-black text-slate-900 dark:text-white mt-2">{jemaatMembers.length} Orang</p>
              <span className="text-[10px] text-emerald-600 font-bold mt-1 inline-block">100% Terdata</span>
            </div>

            <div className="bg-white dark:bg-slate-800 p-5 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm">
              <div className="flex justify-between items-center text-slate-500 text-xs font-bold">
                <span>Saldo Kas Gereja</span>
                <DollarSign className="w-4 h-4 text-emerald-600" />
              </div>
              <p className="text-xl font-black text-slate-900 dark:text-white mt-2">
                Rp {kasData.summary.saldoAkhir.toLocaleString('id-ID')}
              </p>
              <span className="text-[10px] text-slate-500 mt-1 inline-block">Pemasukan vs Pengeluaran</span>
            </div>

            <div className="bg-white dark:bg-slate-800 p-5 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm">
              <div className="flex justify-between items-center text-slate-500 text-xs font-bold">
                <span>Pokok Doa Masuk</span>
                <MessageSquare className="w-4 h-4 text-rose-500" />
              </div>
              <p className="text-2xl font-black text-slate-900 dark:text-white mt-2">{pokokDoaList.length} Permohonan</p>
              <span className="text-[10px] text-amber-600 font-bold mt-1 inline-block">
                {pokokDoaList.filter(d => d.status === 'pending').length} Perlu Respon
              </span>
            </div>

            <div className="bg-white dark:bg-slate-800 p-5 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm">
              <div className="flex justify-between items-center text-slate-500 text-xs font-bold">
                <span>Google API Sync</span>
                <FileSpreadsheet className="w-4 h-4 text-emerald-500" />
              </div>
              <p className="text-sm font-black text-emerald-600 dark:text-emerald-400 mt-2">CONNECTED</p>
              <span className="text-[10px] text-slate-500 mt-1 inline-block">Sheets & Drive Active</span>
            </div>
          </div>

          {/* Activity Logs & Quick Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
              <h3 className="font-extrabold text-slate-900 dark:text-white text-base mb-4 flex items-center gap-2">
                <RefreshCw className="w-5 h-5 text-blue-600" /> Log Aktivitas Perubahan System Realtime
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
              <h3 className="font-extrabold text-slate-900 dark:text-white text-base mb-2">Tindakan Cepat</h3>
              <button
                onClick={() => setShowBeritaModal(true)}
                className="w-full py-2.5 bg-blue-600 text-white rounded-xl font-bold text-xs hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Tambah Berita Gereja
              </button>
              <button
                onClick={() => setShowRenunganModal(true)}
                className="w-full py-2.5 bg-amber-500 text-slate-950 rounded-xl font-bold text-xs hover:bg-amber-400 transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <BookOpen className="w-4 h-4" /> Publis Renungan Baru
              </button>
              <button
                onClick={() => setShowNotifModal(true)}
                className="w-full py-2.5 bg-indigo-600 text-white rounded-xl font-bold text-xs hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <Bell className="w-4 h-4" /> Kirim Push Broadcast
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

      {/* --- TAB 3: KELOLA RENUNGAN & GEMINI AI --- */}
      {activeAdminTab === 'renungan' && (
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-amber-500" /> Renungan & Khotbah
              </h2>
              <p className="text-xs text-slate-500">Dilengkapi Asisten Gemini AI untuk membuat draf khotbah & renungan.</p>
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

      {/* --- TAB 4: DATA JEMAAT MEMBER --- */}
      {activeAdminTab === 'jemaat' && (
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600" /> Data Anggota & Jemaat
            </h2>
            <button
              onClick={() => onShowToast('Form Tambah Jemaat Baru dibuka.', 'info')}
              className="px-4 py-2 bg-blue-600 text-white font-bold text-xs rounded-xl cursor-pointer"
            >
              + Registrasi Jemaat
            </button>
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
                  <th className="p-3 rounded-r-xl">Tanggal Gabung</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {jemaatMembers.map((j) => (
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
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* --- TAB 5: DONASI & KAS VERIFICATION --- */}
      {activeAdminTab === 'donasi' && (
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm space-y-6">
          <h2 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-emerald-600" /> Verifikasi Donasi Online
          </h2>

          <div className="space-y-3">
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
        </div>
      )}

      {/* --- TAB 6: POKOK DOA SYAFAAT MODERATION --- */}
      {activeAdminTab === 'doa' && (
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
          <h2 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-rose-500" /> Moderasi & Respon Pokok Doa
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

                <div className="pt-2 flex items-center gap-2">
                  <button
                    onClick={async () => {
                      await ApiService.updatePokokDoa(d.id, {
                        status: 'didoakan',
                        adminReply: 'Tim Doa Syafaat telah mendoakan permohonan Anda.'
                      });
                      onShowToast('Status doa diperbarui ke DIDOAKAN', 'success');
                      onRefreshData();
                    }}
                    className="px-3 py-1 bg-blue-600 text-white font-bold rounded-xl cursor-pointer"
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
                    className="px-3 py-1 bg-emerald-600 text-white font-bold rounded-xl cursor-pointer"
                  >
                    Tandai Terjawab
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* --- TAB 7: GOOGLE SHEETS & DRIVE API SYNC --- */}
      {activeAdminTab === 'pengaturan' && (
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm space-y-6 max-w-3xl mx-auto">
          <div>
            <h2 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-emerald-600" /> Integrasi Google Sheets API & Google Drive API
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Seluruh data CRUD otomatis tersinkron ke Spreadsheet & Google Drive Cloud Folder secara realtime.
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
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-xl text-xs font-mono text-slate-900 dark:text-white"
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
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-xl text-xs font-mono text-slate-900 dark:text-white"
              />
            </div>

            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl border border-emerald-200 dark:border-emerald-800 text-xs space-y-1">
              <p className="font-bold text-emerald-900 dark:text-emerald-300 flex items-center gap-1">
                <CheckCircle className="w-4 h-4 text-emerald-600" /> Status Koneksi: TERHUBUNG REALTIME
              </p>
              <p className="text-slate-600 dark:text-slate-300">
                20 Sheet Terbuat: users, gereja, jemaat, berita, pengumuman, renungan, event, jadwal_ibadah, pelayanan, galeri, pokok_doa, donasi, kas, dll.
              </p>
            </div>

            <button
              onClick={handleGoogleSheetsSync}
              disabled={syncing}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
              {syncing ? 'Menyinkronkan Data...' : 'Uji & Sinkronkan Sekarang'}
            </button>
          </div>
        </div>
      )}

      {/* --- MODAL: TAMBAH BERITA --- */}
      {showBeritaModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl relative border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setShowBeritaModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 text-xl font-bold cursor-pointer"
            >
              ✕
            </button>
            <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">Tambah Berita Gereja</h3>

            <form onSubmit={handleCreateBerita} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Judul Berita</label>
                <input
                  type="text"
                  value={newBerita.title}
                  onChange={(e) => setNewBerita({ ...newBerita, title: e.target.value })}
                  required
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-xl text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Isi Berita</label>
                <textarea
                  rows={4}
                  value={newBerita.content}
                  onChange={(e) => setNewBerita({ ...newBerita, content: e.target.value })}
                  required
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-xl text-xs text-slate-900 dark:text-white"
                ></textarea>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">URL Gambar Cover</label>
                <input
                  type="url"
                  value={newBerita.coverUrl}
                  onChange={(e) => setNewBerita({ ...newBerita, coverUrl: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-xl text-xs text-slate-900 dark:text-white"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-blue-600 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer mt-2"
              >
                Publikasikan Berita
              </button>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL: PUBLIKASI RENUNGAN + GEMINI AI --- */}
      {showRenunganModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl relative border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setShowRenunganModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 text-xl font-bold cursor-pointer"
            >
              ✕
            </button>
            <div className="flex justify-between items-center pr-6">
              <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">Publikasi Renungan</h3>
              <button
                type="button"
                onClick={handleGenerateAiRenungan}
                disabled={aiGenerating}
                className="px-3 py-1 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs rounded-full flex items-center gap-1 transition-transform active:scale-95 cursor-pointer shadow-sm"
              >
                <Sparkles className="w-3.5 h-3.5" />
                {aiGenerating ? 'Menggenerasi...' : 'Draf AI Gemini'}
              </button>
            </div>

            <form onSubmit={handleCreateRenungan} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Judul Renungan</label>
                <input
                  type="text"
                  value={newRenungan.title}
                  onChange={(e) => setNewRenungan({ ...newRenungan, title: e.target.value })}
                  required
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-xl text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Ayat Alkitab Kunci</label>
                <input
                  type="text"
                  value={newRenungan.scripture}
                  onChange={(e) => setNewRenungan({ ...newRenungan, scripture: e.target.value })}
                  placeholder="Yeremia 29:11..."
                  required
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-xl text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Isi Pesan Renungan</label>
                <textarea
                  rows={4}
                  value={newRenungan.content}
                  onChange={(e) => setNewRenungan({ ...newRenungan, content: e.target.value })}
                  required
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-xl text-xs text-slate-900 dark:text-white"
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-amber-500 text-slate-950 font-bold text-xs rounded-xl shadow-md cursor-pointer mt-2"
              >
                Publikasikan ke Jemaat
              </button>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL: KIRIM NOTIFIKASI BROADCAST --- */}
      {showNotifModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl relative border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setShowNotifModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 text-xl font-bold cursor-pointer"
            >
              ✕
            </button>
            <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">Kirim Push Notification PWA</h3>

            <form onSubmit={handleSendNotification} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Judul Notifikasi</label>
                <input
                  type="text"
                  value={notifForm.title}
                  onChange={(e) => setNotifForm({ ...notifForm, title: e.target.value })}
                  required
                  placeholder="Contoh: Jadwal Ibadah Paskah..."
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-xl text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Pesan Notifikasi</label>
                <textarea
                  rows={3}
                  value={notifForm.message}
                  onChange={(e) => setNotifForm({ ...notifForm, message: e.target.value })}
                  required
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-xl text-xs text-slate-900 dark:text-white"
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-indigo-600 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer mt-2"
              >
                Siarkan Push Broadcast
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
