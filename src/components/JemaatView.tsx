import React, { useState } from 'react';
import {
  Home,
  Calendar,
  BookOpen,
  CalendarDays,
  Heart,
  Users,
  Building,
  Image,
  MessageSquareHeart,
  User,
  HeartHandshake,
  MapPin,
  Clock,
  Play,
  ThumbsUp,
  Share2,
  CheckCircle,
  QrCode,
  Upload,
  PlusCircle,
  ExternalLink,
  MessageCircle,
  Send,
  Sparkles,
  PhoneCall,
  Volume2,
  ChevronRight,
  ShieldCheck,
  Search,
  Filter
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
  User as UserType
} from '../types';
import { ApiService } from '../services/api';

interface JemaatViewProps {
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
  currentUser: UserType;
  onRefreshData: () => void;
  onShowToast: (msg: string, type?: 'success' | 'info') => void;
}

export const JemaatView: React.FC<JemaatViewProps> = ({
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
  currentUser,
  onRefreshData,
  onShowToast
}) => {
  const [activeTab, setActiveTab] = useState<
    'beranda' | 'jadwal' | 'renungan' | 'event' | 'donasi' | 'pelayanan' | 'struktur' | 'galeri' | 'doa' | 'profil'
  >('beranda');

  // Modals & Active selections
  const [selectedRenungan, setSelectedRenungan] = useState<Renungan | null>(null);
  const [selectedEventRsvp, setSelectedEventRsvp] = useState<EventGereja | null>(null);
  const [selectedPhoto, setSelectedPhoto] = useState<Galeri | null>(null);
  const [selectedAlbum, setSelectedAlbum] = useState<Album | null>(null);

  // Form states
  const [rsvpForm, setRsvpForm] = useState({ name: currentUser.name || '', phone: currentUser.phone || '', email: currentUser.email || '', seats: 1 });
  const [donasiForm, setDonasiForm] = useState({ campaign: 'Persembahan Perpuluhan & Pembangunan', amount: '100000', method: 'Transfer BCA', donorName: currentUser.name || 'Jemaat' });
  const [doaForm, setDoaForm] = useState({ senderName: currentUser.name || '', content: '', isPrivate: false });
  const [commentInput, setCommentInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Daily Verse State
  const dailyVerse = {
    text: '"Sebab Aku ini mengetahui rancangan-rancangan apa yang ada pada-Ku mengenai kamu, demikianlah firman TUHAN, yaitu rancangan damai sejahtera dan bukan rancangan kecelakaan, untuk memberikan kepadamu hari depan yang penuh harapan."',
    ref: 'Yeremia 29:11'
  };

  const handleRsvpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEventRsvp) return;
    try {
      const res = await ApiService.rsvpEvent(selectedEventRsvp.id, {
        jemaatName: rsvpForm.name,
        phone: rsvpForm.phone,
        email: rsvpForm.email,
        seats: rsvpForm.seats
      });
      if (res.success) {
        onShowToast(`Pendaftaran event "${selectedEventRsvp.title}" berhasil!`, 'success');
        setSelectedEventRsvp(null);
        onRefreshData();
      } else {
        alert(res.message || 'Pendaftaran gagal');
      }
    } catch (err) {
      alert('Terjadi kesalahan pendaftaran');
    }
  };

  const handleDonasiSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await ApiService.createDonasi({
        gerejaId: gereja.id,
        donorName: donasiForm.donorName,
        amount: parseFloat(donasiForm.amount),
        campaign: donasiForm.campaign,
        paymentMethod: donasiForm.method,
        transferProofUrl: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=600&q=80'
      });
      onShowToast('Terima kasih! Bukti transfer donasi telah berhasil dikirim dan menunggu verifikasi Admin.', 'success');
      setDonasiForm({ campaign: 'Persembahan Perpuluhan & Pembangunan', amount: '100000', method: 'Transfer BCA', donorName: currentUser.name || 'Jemaat' });
      onRefreshData();
    } catch (err) {
      alert('Gagal mengirim donasi');
    }
  };

  const handleDoaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!doaForm.content.trim()) return;
    try {
      await ApiService.createPokokDoa({
        gerejaId: gereja.id,
        senderName: doaForm.senderName || 'Hamba Allah',
        content: doaForm.content,
        isPrivate: doaForm.isPrivate
      });
      onShowToast('Permohonan pokok doa berhasil dikirimkan ke Tim Doa Syafaat Gereja!', 'success');
      setDoaForm({ senderName: currentUser.name || '', content: '', isPrivate: false });
      onRefreshData();
    } catch (err) {
      alert('Gagal mengirim permohonan doa');
    }
  };

  const handleLikeRenungan = async (r: Renungan) => {
    const newLikes = await ApiService.likeRenungan(r.id);
    r.likesCount = newLikes;
    onShowToast(`Suka ditambahkan pada renungan!`, 'info');
    onRefreshData();
  };

  return (
    <div className="pb-24 pt-4 px-3 sm:px-6 max-w-5xl mx-auto">
      {/* Top Mobile Quick Navigation Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-3 no-scrollbar scroll-smooth">
        {[
          { id: 'beranda', label: 'Beranda', icon: Home },
          { id: 'jadwal', label: 'Jadwal', icon: Calendar },
          { id: 'renungan', label: 'Renungan', icon: BookOpen },
          { id: 'event', label: 'Event', icon: CalendarDays },
          { id: 'donasi', label: 'Donasi/Kas', icon: Heart },
          { id: 'pelayanan', label: 'Pelayanan', icon: Users },
          { id: 'struktur', label: 'Struktur', icon: Building },
          { id: 'galeri', label: 'Galeri', icon: Image },
          { id: 'doa', label: 'Pokok Doa', icon: MessageSquareHeart },
          { id: 'profil', label: 'Profil Saya', icon: User }
        ].map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as any)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs sm:text-sm font-extrabold whitespace-nowrap transition-all cursor-pointer shadow-sm ${
                isActive
                  ? 'bg-blue-900 text-white shadow-blue-900/30 ring-2 ring-amber-400'
                  : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-amber-400' : 'text-blue-900 dark:text-amber-400'}`} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* --- TAB 1: BERANDA --- */}
      {activeTab === 'beranda' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Church Banner Hero */}
          <div className="relative rounded-3xl overflow-hidden shadow-xl border border-slate-200 dark:border-slate-800 bg-slate-900 group">
            <img
              src={gereja.bannerUrl}
              alt={gereja.name}
              className="w-full h-52 sm:h-64 object-cover opacity-80 group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/60 to-transparent p-6 flex flex-col justify-end">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/90 backdrop-blur-md text-slate-950 font-bold text-xs rounded-full w-fit mb-2">
                <Sparkles className="w-3.5 h-3.5" /> Selamat Datang di Rumah Tuhan
              </div>
              <h1 className="text-xl sm:text-3xl font-extrabold text-white tracking-tight">{gereja.name}</h1>
              <p className="text-xs sm:text-sm text-slate-300 mt-1 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>{gereja.address}</span>
              </p>
              <p className="text-xs text-amber-200/90 font-medium mt-1">
                Gembala Sidang: <span className="font-bold text-white">{gereja.pastorName}</span>
              </p>
            </div>
          </div>

          {/* Ayat Hari Ini Card */}
          <div className="bg-gradient-to-br from-blue-900 via-indigo-900 to-slate-900 text-white rounded-3xl p-6 shadow-xl relative overflow-hidden border border-blue-700/50">
            <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl"></div>
            <div className="flex items-center justify-between gap-2 mb-3">
              <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-400 bg-amber-400/10 px-3 py-1 rounded-full border border-amber-400/20">
                <BookOpen className="w-3.5 h-3.5" /> Ayat Alkitab Hari Ini
              </span>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(`${dailyVerse.text} - ${dailyVerse.ref}`);
                  onShowToast('Ayat hari ini disalin ke clipboard!', 'success');
                }}
                className="text-xs text-blue-200 hover:text-white flex items-center gap-1 bg-white/10 hover:bg-white/20 px-2.5 py-1 rounded-xl transition-colors"
              >
                <Share2 className="w-3.5 h-3.5" /> Bagikan
              </button>
            </div>
            <p className="italic text-sm sm:text-base leading-relaxed text-blue-50 font-serif">
              {dailyVerse.text}
            </p>
            <div className="mt-3 text-right font-bold text-amber-300 text-xs sm:text-sm">
              — {dailyVerse.ref}
            </div>
          </div>

          {/* Pengumuman Important Ticker */}
          {pengumumanList.length > 0 && (
            <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-2xl p-4 flex items-start gap-3">
              <div className="p-2 bg-amber-500 text-slate-950 rounded-xl font-bold shrink-0">
                📢
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-800 dark:text-amber-300 uppercase tracking-wider">
                    Pengumuman Gereja ({pengumumanList[0].priority.toUpperCase()})
                  </span>
                  <span className="text-[11px] text-slate-500">
                    {new Date(pengumumanList[0].publishDate).toLocaleDateString('id-ID')}
                  </span>
                </div>
                <h4 className="font-bold text-slate-900 dark:text-white text-sm mt-0.5">{pengumumanList[0].title}</h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 line-clamp-2">{pengumumanList[0].content}</p>
              </div>
            </div>
          )}

          {/* Jadwal Ibadah Terdekat Widget */}
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-5 border border-slate-200 dark:border-slate-700 shadow-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-extrabold text-slate-900 dark:text-white text-base flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-600" /> Jadwal Ibadah Hari Minggu Ini
              </h3>
              <button
                onClick={() => setActiveTab('jadwal')}
                className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
              >
                Lihat Semua <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {jadwalList.slice(0, 2).map((j) => (
                <div
                  key={j.id}
                  className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-700/50 border border-slate-200/80 dark:border-slate-700 flex flex-col justify-between"
                >
                  <div>
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300">
                      {j.category}
                    </span>
                    <h4 className="font-bold text-slate-900 dark:text-white text-sm mt-2">{j.title}</h4>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-amber-500" /> {j.dayOfWeek}, {j.time}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-blue-500" /> {j.location}
                    </p>
                  </div>
                  <div className="mt-3 pt-2 border-t border-slate-200 dark:border-slate-600 text-xs text-slate-500 dark:text-slate-400 flex items-center justify-between">
                    <span>Pengkhotbah: <strong className="text-slate-800 dark:text-slate-200">{j.speaker}</strong></span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Event Terdekat & Renungan Terbaru Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Event Terdekat */}
            {eventList.length > 0 && (
              <div className="bg-white dark:bg-slate-800 rounded-3xl p-5 border border-slate-200 dark:border-slate-700 shadow-md flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 flex items-center gap-1">
                      <CalendarDays className="w-4 h-4" /> Event Gereja Terdekat
                    </span>
                    <span className="text-xs bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-full">
                      {eventList[0].category}
                    </span>
                  </div>
                  <img
                    src={eventList[0].posterUrl}
                    alt={eventList[0].title}
                    className="w-full h-36 object-cover rounded-2xl mb-3"
                  />
                  <h4 className="font-bold text-slate-900 dark:text-white text-base">{eventList[0].title}</h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 line-clamp-2">{eventList[0].description}</p>
                  
                  {/* Quota Progress */}
                  <div className="mt-3 bg-slate-100 dark:bg-slate-700 rounded-xl p-2.5">
                    <div className="flex justify-between text-xs font-bold mb-1">
                      <span className="text-slate-600 dark:text-slate-300">Sisa Kuota Pendaftaran:</span>
                      <span className="text-blue-600 dark:text-blue-400">
                        {eventList[0].quota - eventList[0].registeredCount} dari {eventList[0].quota} Kursi
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-600 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-blue-600 to-indigo-600 h-full rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(100, (eventList[0].registeredCount / eventList[0].quota) * 100)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedEventRsvp(eventList[0])}
                  className="mt-4 w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold text-sm transition-colors shadow-md flex items-center justify-center gap-2 cursor-pointer"
                >
                  <CalendarDays className="w-4 h-4" /> Daftar Event Sekarang
                </button>
              </div>
            )}

            {/* Renungan Hari Ini */}
            {renunganList.length > 0 && (
              <div className="bg-white dark:bg-slate-800 rounded-3xl p-5 border border-slate-200 dark:border-slate-700 shadow-md flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-1">
                      <BookOpen className="w-4 h-4" /> Renungan Harian
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {new Date(renunganList[0].publishDate).toLocaleDateString('id-ID')}
                    </span>
                  </div>
                  <img
                    src={renunganList[0].imageUrl}
                    alt={renunganList[0].title}
                    className="w-full h-36 object-cover rounded-2xl mb-3"
                  />
                  <h4 className="font-bold text-slate-900 dark:text-white text-base">{renunganList[0].title}</h4>
                  <p className="text-xs italic font-serif text-blue-600 dark:text-blue-400 mt-1">{renunganList[0].scripture}</p>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 line-clamp-2">{renunganList[0].content}</p>
                </div>

                <div className="mt-4 flex items-center gap-2">
                  <button
                    onClick={() => setSelectedRenungan(renunganList[0])}
                    className="flex-1 py-2.5 bg-slate-900 dark:bg-slate-700 hover:bg-slate-800 text-white rounded-2xl font-bold text-sm transition-colors shadow-md flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <BookOpen className="w-4 h-4 text-amber-400" /> Baca Selengkapnya
                  </button>
                  <button
                    onClick={() => handleLikeRenungan(renunganList[0])}
                    className="p-2.5 bg-rose-50 dark:bg-rose-950/40 text-rose-600 rounded-2xl font-bold flex items-center gap-1 text-xs hover:bg-rose-100 transition-colors cursor-pointer"
                  >
                    <ThumbsUp className="w-4 h-4" /> {renunganList[0].likesCount}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Quick Contact Church Section */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl p-6 text-white shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="font-extrabold text-lg flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-amber-300" /> Perlu Layanan Konseling & Doa?
              </h3>
              <p className="text-xs text-blue-100 mt-1">
                Tim Penggembalaan dan Sekretariat Gereja siap mendampingi Anda kapan saja.
              </p>
            </div>
            <a
              href={`https://wa.me/${gereja.phone.replace(/[^0-9]/g, '')}`}
              target="_blank"
              rel="noreferrer"
              className="px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-sm rounded-2xl transition-transform active:scale-95 shadow-md flex items-center gap-2 whitespace-nowrap cursor-pointer"
            >
              <PhoneCall className="w-4 h-4" /> Hubungi Sekretariat
            </a>
          </div>
        </div>
      )}

      {/* --- TAB 2: JADWAL IBADAH --- */}
      {activeTab === 'jadwal' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 shadow-lg">
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <Calendar className="w-6 h-6 text-blue-600" /> Jadwal Pelayanan Ibadah
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Seluruh jadwal ibadah rutin dan doa syafaat di {gereja.name}.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              {jadwalList.map((j) => (
                <div
                  key={j.id}
                  className="bg-slate-50 dark:bg-slate-700/60 p-5 rounded-2xl border border-slate-200 dark:border-slate-600 hover:shadow-md transition-shadow relative overflow-hidden"
                >
                  <div className="absolute top-0 left-0 w-2 h-full bg-blue-600"></div>
                  <div className="pl-3">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                      {j.category}
                    </span>
                    <h3 className="font-extrabold text-slate-900 dark:text-white text-base mt-2">{j.title}</h3>
                    <div className="space-y-1.5 mt-3 text-xs text-slate-600 dark:text-slate-300">
                      <p className="flex items-center gap-2 font-semibold text-slate-800 dark:text-slate-200">
                        <Clock className="w-4 h-4 text-amber-500" /> Hari {j.dayOfWeek}, Pukul {j.time}
                      </p>
                      <p className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-blue-500" /> {j.location}
                      </p>
                      <p className="pt-2 border-t border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300">
                        Pelayan Firman: <strong>{j.speaker}</strong>
                      </p>
                      <p className="text-slate-600 dark:text-slate-400">
                        Worship Leader: <strong>{j.worshipLeader}</strong>
                      </p>
                    </div>

                    <div className="mt-4 pt-3 flex items-center justify-between gap-2 border-t border-slate-200 dark:border-slate-600">
                      <a
                        href={`https://maps.google.com/?q=${encodeURIComponent(j.location + ' ' + gereja.name)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-bold flex items-center gap-1"
                      >
                        <ExternalLink className="w-3.5 h-3.5" /> Buka Google Maps
                      </a>
                      <button
                        onClick={() => onShowToast(`Jadwal "${j.title}" disimpan ke pengingat Anda.`, 'success')}
                        className="px-3 py-1 bg-white dark:bg-slate-800 hover:bg-slate-100 border border-slate-300 dark:border-slate-600 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 transition-colors shadow-sm cursor-pointer"
                      >
                        + Ingatkan Saya
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* --- TAB 3: RENUNGAN ALKITAB --- */}
      {activeTab === 'renungan' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 shadow-lg">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <BookOpen className="w-6 h-6 text-amber-500" /> Renungan & Video Khotbah
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Santapan rohani harian untuk pertumbuhan iman jemaat.
                </p>
              </div>

              {/* Search Bar */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Cari renungan / ayat..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-4 py-2 bg-slate-100 dark:bg-slate-700 rounded-2xl text-xs border border-slate-200 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-60 text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              {renunganList
                .filter((r) => r.title.toLowerCase().includes(searchQuery.toLowerCase()) || r.scripture.toLowerCase().includes(searchQuery.toLowerCase()))
                .map((r) => (
                  <div
                    key={r.id}
                    className="bg-slate-50 dark:bg-slate-700/50 rounded-2xl border border-slate-200 dark:border-slate-600 overflow-hidden flex flex-col justify-between hover:shadow-md transition-shadow"
                  >
                    <div>
                      {r.imageUrl && (
                        <div className="relative h-44 overflow-hidden">
                          <img src={r.imageUrl} alt={r.title} className="w-full h-full object-cover" />
                          {r.videoUrl && (
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                              <span className="w-12 h-12 rounded-full bg-red-600 text-white flex items-center justify-center shadow-lg transform hover:scale-110 transition-transform">
                                <Play className="w-6 h-6 fill-current ml-0.5" />
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                      <div className="p-5">
                        <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                          <span>Penulis: <strong className="text-slate-700 dark:text-slate-200">{r.author}</strong></span>
                          <span>{new Date(r.publishDate).toLocaleDateString('id-ID')}</span>
                        </div>
                        <h3 className="font-extrabold text-slate-900 dark:text-white text-base">{r.title}</h3>
                        <p className="text-xs font-serif italic text-blue-600 dark:text-blue-400 mt-1">{r.scripture}</p>
                        <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 line-clamp-3">{r.content}</p>
                      </div>
                    </div>

                    <div className="p-4 pt-0 flex items-center justify-between border-t border-slate-200 dark:border-slate-600 mt-2">
                      <button
                        onClick={() => setSelectedRenungan(r)}
                        className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                      >
                        Baca Selengkapnya <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleLikeRenungan(r)}
                        className="text-xs text-rose-600 font-bold flex items-center gap-1 bg-rose-50 dark:bg-rose-950/40 px-2.5 py-1 rounded-xl cursor-pointer hover:bg-rose-100"
                      >
                        <ThumbsUp className="w-3.5 h-3.5" /> {r.likesCount} Suka
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* --- TAB 4: EVENT GEREJA & RSVP --- */}
      {activeTab === 'event' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 shadow-lg">
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <CalendarDays className="w-6 h-6 text-indigo-600" /> Agenda & Event Gereja
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Daftar kegiatan, retreat, dan seminar gereja yang akan datang.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              {eventList.map((e) => (
                <div
                  key={e.id}
                  className="bg-slate-50 dark:bg-slate-700/50 rounded-2xl border border-slate-200 dark:border-slate-600 overflow-hidden flex flex-col justify-between hover:shadow-md transition-shadow"
                >
                  <div>
                    <img src={e.posterUrl} alt={e.title} className="w-full h-48 object-cover" />
                    <div className="p-5">
                      <div className="flex items-center justify-between mb-2">
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-200">
                          {e.category}
                        </span>
                        <span className="text-xs font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" /> {e.date}
                        </span>
                      </div>
                      <h3 className="font-extrabold text-slate-900 dark:text-white text-base">{e.title}</h3>
                      <p className="text-xs text-slate-600 dark:text-slate-300 mt-2">{e.description}</p>
                      
                      <div className="mt-3 space-y-1 text-xs text-slate-500 dark:text-slate-400">
                        <p className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-red-500 shrink-0" /> {e.locationName}
                        </p>
                        <p className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-amber-500 shrink-0" /> {e.time}
                        </p>
                      </div>

                      <div className="mt-4 bg-white dark:bg-slate-800 rounded-xl p-3 border border-slate-200 dark:border-slate-600">
                        <div className="flex justify-between text-xs font-bold mb-1">
                          <span>Sisa Kursi:</span>
                          <span className="text-blue-600 dark:text-blue-400">{e.quota - e.registeredCount} / {e.quota}</span>
                        </div>
                        <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                          <div
                            className="bg-blue-600 h-full rounded-full"
                            style={{ width: `${Math.min(100, (e.registeredCount / e.quota) * 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 pt-0">
                    <button
                      onClick={() => setSelectedEventRsvp(e)}
                      disabled={e.registeredCount >= e.quota}
                      className={`w-full py-2.5 rounded-2xl font-bold text-xs sm:text-sm transition-colors shadow-sm flex items-center justify-center gap-2 cursor-pointer ${
                        e.registeredCount >= e.quota
                          ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                          : 'bg-blue-600 hover:bg-blue-700 text-white'
                      }`}
                    >
                      <CalendarDays className="w-4 h-4" />
                      {e.registeredCount >= e.quota ? 'Kuota Penuh' : 'Form Pendaftaran Event'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* --- TAB 5: DONASI ONLINE & LAPORAN KAS --- */}
      {activeTab === 'donasi' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 shadow-lg">
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <Heart className="w-6 h-6 text-rose-500" /> Donasi Online & Persembahan
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Dukung pelayanan dan pilar pembangunan {gereja.name} secara aman dan transparan.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              {/* Donasi Form */}
              <div className="bg-slate-50 dark:bg-slate-700/50 rounded-2xl p-5 border border-slate-200 dark:border-slate-600">
                <h3 className="font-bold text-slate-900 dark:text-white text-base mb-3 flex items-center gap-2">
                  <HeartHandshake className="w-5 h-5 text-amber-500" /> Form Transfer Donasi
                </h3>

                <form onSubmit={handleDonasiSubmit} className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Kategori Persembahan
                    </label>
                    <select
                      value={donasiForm.campaign}
                      onChange={(e) => setDonasiForm({ ...donasiForm, campaign: e.target.value })}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl text-xs font-medium text-slate-900 dark:text-white"
                    >
                      <option value="Persembahan Perpuluhan & Pembangunan">Persembahan Perpuluhan & Pembangunan</option>
                      <option value="Dana Bakti Sosial HUT Gereja">Dana Bakti Sosial HUT Gereja</option>
                      <option value="Diakonia & Kasih Jemaat">Diakonia & Kasih Jemaat</option>
                      <option value="Operasional Pelayanan Music & Youth">Operasional Pelayanan Music & Youth</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Nama Donatur / Atas Nama
                    </label>
                    <input
                      type="text"
                      value={donasiForm.donorName}
                      onChange={(e) => setDonasiForm({ ...donasiForm, donorName: e.target.value })}
                      required
                      className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl text-xs font-medium text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Nominal Donasi (Rp)
                    </label>
                    <input
                      type="number"
                      value={donasiForm.amount}
                      onChange={(e) => setDonasiForm({ ...donasiForm, amount: e.target.value })}
                      required
                      min="10000"
                      className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl text-xs font-medium text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Metode Pembayaran
                    </label>
                    <select
                      value={donasiForm.method}
                      onChange={(e) => setDonasiForm({ ...donasiForm, method: e.target.value })}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl text-xs font-medium text-slate-900 dark:text-white"
                    >
                      <option value="Transfer BCA">Transfer Bank BCA</option>
                      <option value="Transfer Mandiri">Transfer Bank Mandiri</option>
                      <option value="Transfer BRI">Transfer Bank BRI</option>
                      <option value="QRIS Digital">QRIS Digital (All E-Wallet)</option>
                    </select>
                  </div>

                  <div className="p-3 bg-blue-50 dark:bg-blue-950/40 rounded-xl border border-blue-200 dark:border-blue-800 text-xs space-y-1">
                    <p className="font-bold text-blue-900 dark:text-blue-300">Rekening Tujuan Gereja:</p>
                    <p className="text-slate-700 dark:text-slate-300"><strong>BCA:</strong> 782-099-1234 a/n {gereja.name}</p>
                    <p className="text-slate-700 dark:text-slate-300"><strong>Mandiri:</strong> 122-00-9876543-1</p>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs sm:text-sm rounded-xl transition-colors shadow-md flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Upload className="w-4 h-4" /> Kirim Donasi & Bukti Transfer
                  </button>
                </form>
              </div>

              {/* Laporan Kas Transparansi */}
              <div className="space-y-4">
                <div className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white rounded-2xl p-5 shadow-md">
                  <h3 className="font-extrabold text-sm text-amber-400 mb-2">Transparansi Laporan Kas Gereja</h3>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="p-2.5 bg-white/10 rounded-xl">
                      <span className="text-slate-300">Total Pemasukan:</span>
                      <p className="font-extrabold text-emerald-400 text-sm mt-0.5">
                        Rp {kasData.summary.totalPemasukan.toLocaleString('id-ID')}
                      </p>
                    </div>
                    <div className="p-2.5 bg-white/10 rounded-xl">
                      <span className="text-slate-300">Total Pengeluaran:</span>
                      <p className="font-extrabold text-rose-400 text-sm mt-0.5">
                        Rp {kasData.summary.totalPengeluaran.toLocaleString('id-ID')}
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-white/20 flex justify-between items-center text-xs">
                    <span className="font-medium text-slate-300">Saldo Akhir Kas:</span>
                    <span className="font-extrabold text-amber-300 text-base">
                      Rp {kasData.summary.saldoAkhir.toLocaleString('id-ID')}
                    </span>
                  </div>
                </div>

                {/* History Donasi Jemaat */}
                <div className="bg-slate-50 dark:bg-slate-700/50 rounded-2xl p-4 border border-slate-200 dark:border-slate-600">
                  <h4 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider mb-2">
                    Riwayat Donasi Masuk
                  </h4>
                  <div className="space-y-2 max-h-56 overflow-y-auto">
                    {donasiList.map((d) => (
                      <div
                        key={d.id}
                        className="p-2.5 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-600 flex justify-between items-center text-xs"
                      >
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white">{d.donorName}</p>
                          <p className="text-[11px] text-slate-500">{d.campaign}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-emerald-600 dark:text-emerald-400">
                            Rp {d.amount.toLocaleString('id-ID')}
                          </p>
                          <span
                            className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              d.status === 'verified'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {d.status === 'verified' ? 'Terverifikasi' : 'Pending'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- TAB 6: PELAYANAN JEMAAT --- */}
      {activeTab === 'pelayanan' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 shadow-lg">
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <Users className="w-6 h-6 text-blue-600" /> Pelayanan Jemaat & Seksi
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Bergabunglah menjadi bagian dari tim pelayan dalam rumah Tuhan.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-6">
              {pelayananList.map((p) => (
                <div
                  key={p.id}
                  className="bg-slate-50 dark:bg-slate-700/50 p-5 rounded-2xl border border-slate-200 dark:border-slate-600 flex flex-col justify-between hover:shadow-md transition-shadow"
                >
                  <div>
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-100 text-indigo-800 dark:bg-indigo-900/60 dark:text-indigo-200">
                      {p.category}
                    </span>
                    <h3 className="font-extrabold text-slate-900 dark:text-white text-base mt-2">
                      Tim Pelayanan {p.category}
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-2">{p.description}</p>
                    <div className="mt-3 text-xs text-slate-500 dark:text-slate-400 space-y-1">
                      <p>Koordinator: <strong>{p.leaderName}</strong></p>
                      <p>Jadwal: <strong>{p.scheduleInfo}</strong></p>
                      <p>Jumlah Anggota: <strong>{p.membersCount} Orang</strong></p>
                    </div>
                  </div>

                  <button
                    onClick={() => onShowToast(`Permohonan bergabung tim ${p.category} dikirimkan ke koordinator.`, 'success')}
                    className="mt-4 w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs transition-colors shadow-sm cursor-pointer"
                  >
                    Daftar Melayani
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* --- TAB 7: STRUKTUR ORGANISASI --- */}
      {activeTab === 'struktur' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 shadow-lg">
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <Building className="w-6 h-6 text-purple-600" /> Struktur Organisasi & Kepengurusan
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Pelayan dan majelis yang bertugas memimpin {gereja.name}.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mt-6">
              {strukturList.map((s) => (
                <div
                  key={s.id}
                  className="bg-slate-50 dark:bg-slate-700/50 rounded-2xl p-5 border border-slate-200 dark:border-slate-600 text-center hover:shadow-md transition-shadow"
                >
                  <img
                    src={s.photoUrl}
                    alt={s.name}
                    className="w-24 h-24 rounded-full object-cover mx-auto ring-4 ring-blue-600/30 shadow-md"
                  />
                  <h3 className="font-extrabold text-slate-900 dark:text-white text-base mt-3">{s.name}</h3>
                  <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-200 font-bold text-xs rounded-full mt-1">
                    {s.position}
                  </span>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 line-clamp-3">{s.bio}</p>
                  <p className="text-xs text-slate-400 mt-2 font-mono">{s.contact}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* --- TAB 8: GALERI FOTO & VIDEO --- */}
      {activeTab === 'galeri' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 shadow-lg">
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <Image className="w-6 h-6 text-emerald-600" /> Galeri Dokumentasi Kegiatan
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Album foto dan media perayaan kegiatan gereja (Tersimpan di Google Drive).
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-6">
              {galeriList.map((g) => (
                <div
                  key={g.id}
                  onClick={() => setSelectedPhoto(g)}
                  className="group relative h-48 rounded-2xl overflow-hidden shadow-md cursor-pointer border border-slate-200 dark:border-slate-700"
                >
                  <img
                    src={g.url}
                    alt={g.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity p-4 flex flex-col justify-end">
                    <span className="text-[10px] uppercase font-bold text-amber-300 bg-amber-400/20 px-2 py-0.5 rounded-full w-fit">
                      Google Drive Cloud
                    </span>
                    <h4 className="font-bold text-white text-sm mt-1">{g.title}</h4>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* --- TAB 9: POKOK DOA SYAFAAT --- */}
      {activeTab === 'doa' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 shadow-lg">
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <MessageSquareHeart className="w-6 h-6 text-rose-500" /> Tembok Pokok Doa Syafaat
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Kirimkan beban doa Anda untuk didoakan bersama hamba-hamba Tuhan.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
              {/* Form Doa */}
              <div className="bg-slate-50 dark:bg-slate-700/50 rounded-2xl p-5 border border-slate-200 dark:border-slate-600 h-fit">
                <h3 className="font-bold text-slate-900 dark:text-white text-sm mb-3">Kirim Permohonan Doa</h3>
                <form onSubmit={handleDoaSubmit} className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Nama Pengirim
                    </label>
                    <input
                      type="text"
                      value={doaForm.senderName}
                      onChange={(e) => setDoaForm({ ...doaForm, senderName: e.target.value })}
                      placeholder="Atau Hamba Allah (Anonim)"
                      className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl text-xs text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Isi Permohonan Doa
                    </label>
                    <textarea
                      rows={4}
                      value={doaForm.content}
                      onChange={(e) => setDoaForm({ ...doaForm, content: e.target.value })}
                      required
                      placeholder="Tuliskan pergumulan atau ucapan syukur Anda..."
                      className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl text-xs text-slate-900 dark:text-white"
                    ></textarea>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="isPrivate"
                      checked={doaForm.isPrivate}
                      onChange={(e) => setDoaForm({ ...doaForm, isPrivate: e.target.checked })}
                      className="rounded text-blue-600"
                    />
                    <label htmlFor="isPrivate" className="text-xs text-slate-600 dark:text-slate-300">
                      Privat (Hanya untuk Tim Hamba Tuhan)
                    </label>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl transition-colors shadow-sm flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Send className="w-4 h-4" /> Kirim Pokok Doa
                  </button>
                </form>
              </div>

              {/* Public Doa Feed */}
              <div className="md:col-span-2 space-y-3">
                <h3 className="font-bold text-slate-900 dark:text-white text-sm">Pokok Doa Jemaat Publik</h3>
                {pokokDoaList
                  .filter((d) => !d.isPrivate)
                  .map((d) => (
                    <div
                      key={d.id}
                      className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-2xl border border-slate-200 dark:border-slate-600 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 dark:text-white text-xs">{d.senderName}</span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            d.status === 'terjawab'
                              ? 'bg-emerald-100 text-emerald-800'
                              : d.status === 'didoakan'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {d.status === 'terjawab' ? 'Puji Tuhan! Terjawab' : d.status === 'didoakan' ? 'Didoakan' : 'Pending'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-700 dark:text-slate-300 italic">"{d.content}"</p>

                      {d.adminReply && (
                        <div className="p-3 bg-blue-50 dark:bg-blue-900/30 rounded-xl border border-blue-200 dark:border-blue-800 text-xs">
                          <span className="font-bold text-blue-900 dark:text-blue-300">Respon Hamba Tuhan:</span>
                          <p className="text-slate-700 dark:text-slate-300 mt-0.5">{d.adminReply}</p>
                        </div>
                      )}

                      <div className="pt-2 flex justify-end">
                        <button
                          onClick={() => onShowToast(`Anda mengucapkan Amin untuk doa ${d.senderName}`, 'info')}
                          className="text-xs text-rose-600 font-bold flex items-center gap-1 hover:underline cursor-pointer"
                        >
                          🙏 Amin / Turut Mendoakan ({d.likesCount || 0})
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- TAB 10: PROFIL JEMAAT --- */}
      {activeTab === 'profil' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 shadow-lg max-w-xl mx-auto">
            <div className="text-center">
              <img
                src={currentUser.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'}
                alt={currentUser.name}
                className="w-24 h-24 rounded-full object-cover mx-auto ring-4 ring-blue-600/30 shadow-md"
              />
              <h2 className="text-lg font-extrabold text-slate-900 dark:text-white mt-3">{currentUser.name}</h2>
              <span className="inline-block px-3 py-0.5 bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-200 font-bold text-xs rounded-full mt-1">
                Jemaat Aktif ({currentUser.membershipNo || 'HKBP-2026-088'})
              </span>
            </div>

            <div className="mt-6 space-y-3 text-xs border-t border-slate-200 dark:border-slate-700 pt-4">
              <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-700">
                <span className="text-slate-500">Email:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{currentUser.email}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-700">
                <span className="text-slate-500">No. Telepon / WA:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{currentUser.phone || '081398765432'}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-700">
                <span className="text-slate-500">Gereja Naungan:</span>
                <span className="font-bold text-blue-600 dark:text-blue-400">{gereja.name}</span>
              </div>
            </div>

            <button
              onClick={() => onShowToast('Perubahan kata sandi berhasil diperbarui!', 'success')}
              className="mt-6 w-full py-2.5 bg-slate-900 dark:bg-slate-700 hover:bg-slate-800 text-white rounded-2xl font-bold text-xs transition-colors shadow-sm cursor-pointer"
            >
              Ubah Password & Profil
            </button>
          </div>
        </div>
      )}

      {/* --- MODAL: RENUNGAN DETAIL --- */}
      {selectedRenungan && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl relative border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setSelectedRenungan(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 text-xl font-bold cursor-pointer"
            >
              ✕
            </button>
            <span className="text-xs font-bold text-amber-500 uppercase tracking-wider">
              {new Date(selectedRenungan.publishDate).toLocaleDateString('id-ID')} • {selectedRenungan.author}
            </span>
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white mt-1">{selectedRenungan.title}</h2>
            <p className="text-sm font-serif italic text-blue-600 dark:text-blue-400 mt-2 p-3 bg-blue-50 dark:bg-blue-950/40 rounded-xl">
              {selectedRenungan.scripture}
            </p>

            {selectedRenungan.imageUrl && (
              <img src={selectedRenungan.imageUrl} alt={selectedRenungan.title} className="w-full h-56 object-cover rounded-2xl my-4" />
            )}

            <div className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed whitespace-pre-line mt-3">
              {selectedRenungan.content}
            </div>

            <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-700 flex justify-between items-center">
              <button
                onClick={() => handleLikeRenungan(selectedRenungan)}
                className="px-4 py-2 bg-rose-50 dark:bg-rose-950/40 text-rose-600 rounded-xl font-bold text-xs flex items-center gap-1.5 cursor-pointer"
              >
                <ThumbsUp className="w-4 h-4" /> {selectedRenungan.likesCount} Suka
              </button>
              <button
                onClick={() => setSelectedRenungan(null)}
                className="px-5 py-2 bg-blue-600 text-white font-bold text-xs rounded-xl cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL: EVENT RSVP --- */}
      {selectedEventRsvp && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl relative border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setSelectedEventRsvp(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 text-xl font-bold cursor-pointer"
            >
              ✕
            </button>
            <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">Pendaftaran Event</h3>
            <p className="text-xs text-blue-600 font-bold mt-1">{selectedEventRsvp.title}</p>

            <form onSubmit={handleRsvpSubmit} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Nama Lengkap</label>
                <input
                  type="text"
                  value={rsvpForm.name}
                  onChange={(e) => setRsvpForm({ ...rsvpForm, name: e.target.value })}
                  required
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-xl text-xs text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">No. Whatsapp</label>
                <input
                  type="tel"
                  value={rsvpForm.phone}
                  onChange={(e) => setRsvpForm({ ...rsvpForm, phone: e.target.value })}
                  required
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-xl text-xs text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Jumlah Kursi</label>
                <input
                  type="number"
                  min="1"
                  max="5"
                  value={rsvpForm.seats}
                  onChange={(e) => setRsvpForm({ ...rsvpForm, seats: parseInt(e.target.value) })}
                  required
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-xl text-xs text-slate-900 dark:text-white"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer mt-2"
              >
                Konfirmasi Pendaftaran
              </button>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL: PHOTO LIGHTBOX --- */}
      {selectedPhoto && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative max-w-3xl w-full text-center">
            <button
              onClick={() => setSelectedPhoto(null)}
              className="absolute -top-10 right-0 text-white text-2xl font-bold cursor-pointer"
            >
              ✕
            </button>
            <img src={selectedPhoto.url} alt={selectedPhoto.title} className="max-h-[75vh] mx-auto rounded-2xl shadow-2xl" />
            <p className="text-white font-bold text-sm mt-3">{selectedPhoto.title}</p>
          </div>
        </div>
      )}

      {/* --- MOBILE BOTTOM NAVIGATION BAR --- */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t-2 border-slate-200 dark:border-slate-800 py-2.5 px-3 flex items-center justify-around shadow-2xl">
        {[
          { id: 'beranda', label: 'Beranda', icon: Home },
          { id: 'jadwal', label: 'Jadwal', icon: Calendar },
          { id: 'renungan', label: 'Renungan', icon: BookOpen },
          { id: 'event', label: 'Event', icon: CalendarDays },
          { id: 'donasi', label: 'Donasi', icon: Heart }
        ].map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as any)}
              className={`flex flex-col items-center gap-0.5 text-[11px] font-extrabold transition-transform active:scale-95 cursor-pointer ${
                isActive ? 'text-blue-900 dark:text-amber-400 font-black' : 'text-slate-400 dark:text-slate-500 hover:text-slate-700'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5px] text-blue-900 dark:text-amber-400' : 'stroke-2'}`} />
              <span className="uppercase tracking-wider text-[10px]">{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
