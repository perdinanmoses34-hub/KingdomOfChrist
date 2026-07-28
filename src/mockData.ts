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
  BackupRecord
} from './types';

export const initialGerejaList: Gereja[] = [
  {
    id: 'ger-001',
    name: 'Gereja HKBP Grace City Center',
    code: 'HKBP-GCC',
    address: 'Jl. Jendral Sudirman No. 45, Jakarta Pusat',
    city: 'Jakarta Pusat',
    phone: '021-5550192',
    email: 'info@hkbp-gracecity.org',
    logoUrl: 'https://images.unsplash.com/photo-1548625149-fc4a29cf7092?auto=format&fit=crop&w=300&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1438032005730-c779502df39b?auto=format&fit=crop&w=1200&q=80',
    pastorName: 'Pdt. Dr. Martinus Simanjuntak, S.Th',
    status: 'active',
    licensePackage: 'Enterprise',
    googleSheetId: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms',
    googleDriveFolderId: '1zA9K_drive_folder_hkbp_grace',
    createdAt: '2026-01-10T08:00:00Z'
  },
  {
    id: 'ger-002',
    name: 'G3KI Revival Fellowship',
    code: 'G3KI-RF',
    address: 'Jl. Diponegoro No. 12, Bandung',
    city: 'Bandung',
    phone: '022-4239811',
    email: 'contact@g3ki-revival.org',
    logoUrl: 'https://images.unsplash.com/photo-1519817650390-64a93db51149?auto=format&fit=crop&w=300&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1510519138161-58446230f71b?auto=format&fit=crop&w=1200&q=80',
    pastorName: 'Pdt. Jonathan Widjaja, M.Div',
    status: 'active',
    licensePackage: 'Pro',
    googleSheetId: '1CxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms2',
    googleDriveFolderId: '1zA9K_drive_folder_g3ki',
    createdAt: '2026-02-01T09:30:00Z'
  },
  {
    id: 'ger-003',
    name: 'GBI Hope & Joy Community',
    code: 'GBI-HJC',
    address: 'Jl. HR Rasuna Said Blok B10, Surabaya',
    city: 'Surabaya',
    phone: '031-8899123',
    email: 'admin@gbihopejoy.org',
    logoUrl: 'https://images.unsplash.com/photo-1543807535-eceef0bc6599?auto=format&fit=crop&w=300&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=1200&q=80',
    pastorName: 'Pdt. Samuel Santoso, M.A',
    status: 'trial',
    licensePackage: 'Basic',
    createdAt: '2026-03-15T11:00:00Z'
  }
];

export const initialUsers: User[] = [
  {
    id: 'user-001',
    email: 'superadmin@cmschurch.com',
    name: 'Super Admin System',
    role: 'super_admin',
    gerejaId: 'ger-001',
    phone: '081122334455',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    createdAt: '2026-01-01T00:00:00Z'
  },
  {
    id: 'user-002',
    email: 'admin.hkbp@church.org',
    name: 'St. David Nainggolan (Admin)',
    role: 'admin_gereja',
    gerejaId: 'ger-001',
    phone: '081234567890',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    membershipNo: 'HKBP-2024-001',
    createdAt: '2026-01-10T08:30:00Z'
  },
  {
    id: 'user-003',
    email: 'jemaat.daniel@gmail.com',
    name: 'Daniel Sitorus',
    role: 'jemaat',
    gerejaId: 'ger-001',
    phone: '081398765432',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
    membershipNo: 'HKBP-2025-088',
    createdAt: '2026-02-14T10:00:00Z'
  }
];

export const initialJemaat: JemaatMember[] = [
  {
    id: 'jem-001',
    gerejaId: 'ger-001',
    userId: 'user-003',
    fullName: 'Daniel Sitorus',
    gender: 'Pria',
    birthDate: '1995-08-17',
    address: 'Jl. Kebon Sirih No. 88, Jakarta Pusat',
    phone: '081398765432',
    email: 'jemaat.daniel@gmail.com',
    status: 'aktif',
    joinDate: '2022-04-10',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
    sector: 'Sektor Sudirman'
  },
  {
    id: 'jem-002',
    gerejaId: 'ger-001',
    fullName: 'Maria Elisabeth Hutabarat',
    gender: 'Wanita',
    birthDate: '1998-12-25',
    address: 'Jl. Menteng Raya No. 14, Jakarta Pusat',
    phone: '081288776655',
    email: 'maria.hutabarat@gmail.com',
    status: 'aktif',
    joinDate: '2023-01-15',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
    sector: 'Sektor Menteng'
  },
  {
    id: 'jem-003',
    gerejaId: 'ger-001',
    fullName: 'Joshua Pardede',
    gender: 'Pria',
    birthDate: '2001-05-03',
    address: 'Jl. Cikini Raya No. 29, Jakarta Pusat',
    phone: '081511223344',
    email: 'joshua.pardede@yahoo.com',
    status: 'simpatisan',
    joinDate: '2025-09-01',
    avatarUrl: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=200&q=80',
    sector: 'Sektor Cikini'
  }
];

export const initialBerita: Berita[] = [
  {
    id: 'ber-001',
    gerejaId: 'ger-001',
    title: 'Perayaan Ulang Tahun Gereja HKBP Grace City Center ke-25',
    content: 'Puji Tuhan! Tahun ini gereja kita memasuki usia ke-25 tahun dalam melayani jemaat. Rangkaian acara pesta perak akan dilaksanakan sepanjang bulan Agustus dengan ibadah paduan suara agung, donor darah, dan bakti sosial masyarakat.',
    coverUrl: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=800&q=80',
    category: 'Kegiatan Gereja',
    tags: ['UlangTahun', 'BaktiSosial', 'HUT25'],
    publishDate: '2026-07-20T10:00:00Z',
    published: true,
    viewsCount: 142,
    authorName: 'Tim Humas Gereja'
  },
  {
    id: 'ber-002',
    gerejaId: 'ger-001',
    title: 'Pelantikan Pengurus Pelayanan Pemuda & Remaja Periode 2026-2028',
    content: 'Pada Ibadah Pemuda Minggu kemarin, telah dilaksanakan penumpangan tangan dan pelantikan pengurus Pemuda (Naposobulung). Mari kita dukung anak-anak muda ini dalam pelayanan bagi Kemuliaan Nama Tuhan.',
    coverUrl: 'https://images.unsplash.com/photo-1529070538774-1843cb3265df?auto=format&fit=crop&w=800&q=80',
    category: 'Pelayanan',
    tags: ['Pemuda', 'Pelantikan', 'Naposo'],
    publishDate: '2026-07-25T14:30:00Z',
    published: true,
    viewsCount: 89,
    authorName: 'Sekretariat Gereja'
  }
];

export const initialPengumuman: Pengumuman[] = [
  {
    id: 'peng-001',
    gerejaId: 'ger-001',
    title: 'Pendaftaran Katekisasi Sasi / Peneguhan Sidi Baru',
    content: 'Diberitahukan kepada jemaat usia 15 tahun ke atas yang ingin mengikuti Bimbingan Sidi TA 2026/2027, pendaftaran dapat dilakukan melalui Sekretariat atau Aplikasi PWA paling lambat 10 Agustus 2026.',
    priority: 'mendesak',
    publishDate: '2026-07-26T08:00:00Z',
    targetAudience: 'Seluruh Jemaat & Orang Tua'
  },
  {
    id: 'peng-002',
    gerejaId: 'ger-001',
    title: 'Latihan Paduan Suara Gabungan Setiap Kamis Malam',
    content: 'Latihan rutin paduan suara gabungan untuk persiapan Ibadah Ucapan Syukur akan diadakan setiap hari Kamis pukul 19.00 WIB di Ruang Konsistori Utama.',
    priority: 'normal',
    publishDate: '2026-07-27T12:00:00Z',
    targetAudience: 'Anggota Choir & Musik'
  }
];

export const initialRenungan: Renungan[] = [
  {
    id: 'ren-001',
    gerejaId: 'ger-001',
    title: 'Pengharapan yang Tidak Mengecewakan',
    scripture: 'Roma 5:5 - "Dan pengharapan tidak mengecewakan, karena kasih Allah telah dicurahkan di dalam hati kita oleh Roh Kudus yang telah dikaruniakan kepada kita."',
    content: 'Dalam pergumulan hidup sehari-hari, kita sering kali diuji oleh ketidakpastian. Namun Firman Tuhan mengingatkan kita bahwa pengharapan di dalam Kristus bukanlah sebuah impian kosong. Kasih Allah yang sempurna menjamin masa depan kita. Mari kita melangkah dengan iman yang teguh, menyerahkan segala kekhawatiran kita kepada-Nya.',
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    imageUrl: 'https://images.unsplash.com/photo-1507692049790-de58290a4334?auto=format&fit=crop&w=800&q=80',
    author: 'Pdt. Dr. Martinus Simanjuntak, S.Th',
    publishDate: '2026-07-28T05:00:00Z',
    likesCount: 38
  },
  {
    id: 'ren-002',
    gerejaId: 'ger-001',
    title: 'Setia dalam Perkara-Perkara Kecil',
    scripture: 'Lukas 16:10 - "Barangsiapa setia dalam perkara-perkara kecil, ia setia juga dalam perkara-perkara besar."',
    content: 'Tuhan memperlihatkan bahwa integritas iman tidak diukur dari panggung besar, melainkan dari ketaatan kita dalam rutinitas sehari-hari. Mulailah hari ini dengan melakukan bagian kita secara jujur dan tulus.',
    imageUrl: 'https://images.unsplash.com/photo-1499209974431-9dac3ada00d7?auto=format&fit=crop&w=800&q=80',
    author: 'St. David Nainggolan',
    publishDate: '2026-07-27T05:00:00Z',
    likesCount: 24
  }
];

export const initialEvents: EventGereja[] = [
  {
    id: 'evt-001',
    gerejaId: 'ger-001',
    title: 'Retreat Pemuda & Youth Camp 2026 "Light in Darkness"',
    description: 'Acara retreat akhir pekan khusus pemuda & remaja gereja di Puncak Bogor. Diisi dengan seminar kepemimpinan Kristen, worship night di alam terbuka, outbound, dan keakraban jemaat.',
    posterUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
    locationName: 'Wisma Villa Bukit Hermon, Puncak - Bogor',
    mapUrl: 'https://maps.google.com/?q=Puncak+Bogor',
    date: '2026-08-14',
    time: '15:00 - selesai',
    quota: 100,
    registeredCount: 42,
    category: 'Pemuda & Remaja'
  },
  {
    id: 'evt-002',
    gerejaId: 'ger-001',
    title: 'Seminar Keluarga Kristen: Menjaga Keharmonisan Rumah Tangga',
    description: 'Pembicara tamu Pdt. Jarot Wijaya (Konselor Keluarga). Membahas komunikasi suami-istri, pendidikan anak secara alkitabiah, dan keuangan keluarga.',
    posterUrl: 'https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&w=800&q=80',
    locationName: 'Gedung Serbaguna Lantai 2 HKBP Grace City',
    mapUrl: 'https://maps.google.com/?q=Jakarta',
    date: '2026-08-22',
    time: '09:00 - 13:00 WIB',
    quota: 150,
    registeredCount: 88,
    category: 'Seksi Ama & Puan'
  }
];

export const initialRegistrations: EventRegistration[] = [
  {
    id: 'reg-001',
    eventId: 'evt-001',
    gerejaId: 'ger-001',
    jemaatName: 'Daniel Sitorus',
    phone: '081398765432',
    email: 'jemaat.daniel@gmail.com',
    seats: 1,
    status: 'confirmed',
    registeredAt: '2026-07-25T11:20:00Z'
  },
  {
    id: 'reg-002',
    eventId: 'evt-002',
    gerejaId: 'ger-001',
    jemaatName: 'Maria Elisabeth Hutabarat',
    phone: '081288776655',
    email: 'maria.hutabarat@gmail.com',
    seats: 2,
    status: 'confirmed',
    registeredAt: '2026-07-26T09:15:00Z'
  }
];

export const initialJadwalIbadah: JadwalIbadah[] = [
  {
    id: 'jdw-001',
    gerejaId: 'ger-001',
    title: 'Ibadah Minggu Pagi I (Bahasa Indonesia)',
    category: 'Ibadah Minggu',
    dayOfWeek: 'Minggu',
    time: '07:00 - 09:00 WIB',
    location: 'Gedung Gereja Utama',
    speaker: 'Pdt. Dr. Martinus Simanjuntak',
    worshipLeader: 'St. B. Panjaitan'
  },
  {
    id: 'jdw-002',
    gerejaId: 'ger-001',
    title: 'Ibadah Minggu Siang II (Bahasa Daerah / Tradisional)',
    category: 'Ibadah Minggu',
    dayOfWeek: 'Minggu',
    time: '10:00 - 12:00 WIB',
    location: 'Gedung Gereja Utama',
    speaker: 'Pdt. R. Siregar, S.Th',
    worshipLeader: 'St. A. Tampubolon'
  },
  {
    id: 'jdw-003',
    gerejaId: 'ger-001',
    title: 'Ibadah Pemuda & Mahasiswa (Youth Service)',
    category: 'Ibadah Pemuda',
    dayOfWeek: 'Minggu',
    time: '17:00 - 19:00 WIB',
    location: 'Auditorium Lantai 3',
    speaker: 'Ev. Samuel Alexander',
    worshipLeader: 'Tim Worship Pemuda'
  },
  {
    id: 'jdw-004',
    gerejaId: 'ger-001',
    title: 'Doa Fajar Fajar Pagi (Fajar Syafaat)',
    category: 'Doa Pagi',
    dayOfWeek: 'Sabtu',
    time: '05:30 - 06:30 WIB',
    location: 'Ruang Doa Konsistori',
    speaker: 'St. David Nainggolan',
    worshipLeader: 'Tim Doa Syafaat'
  }
];

export const initialPelayanan: Pelayanan[] = [
  {
    id: 'ply-001',
    gerejaId: 'ger-001',
    category: 'Worship',
    leaderName: 'Graceia Panjaitan',
    description: 'Tim pelayan pujian dan pemimpin nyanyian dalam ibadah raya dan acara khusus.',
    membersCount: 24,
    scheduleInfo: 'Latihan Sabtu 16:00 WIB',
    contactPerson: '0812-3333-4444'
  },
  {
    id: 'ply-002',
    gerejaId: 'ger-001',
    category: 'Multimedia',
    leaderName: 'Kevin Wijaya',
    description: 'Mengelola audio sound system, live streaming YouTube, penayangan slide lirik, dan pencahayaan.',
    membersCount: 12,
    scheduleInfo: 'Latihan Minggu 06:00 WIB',
    contactPerson: '0815-9999-8888'
  },
  {
    id: 'ply-003',
    gerejaId: 'ger-001',
    category: 'Sekolah Minggu',
    leaderName: 'Ruth Simangunsong',
    description: 'Guru-guru Sekolah Minggu yang mendidik anak-anak balita hingga sekolah dasar dalam iman Kristen.',
    membersCount: 18,
    scheduleInfo: 'Rapat Persiapan Jumat 19:00 WIB',
    contactPerson: '0813-7777-6666'
  }
];

export const initialStrukturOrganisasi: StrukturOrganisasi[] = [
  {
    id: 'stk-001',
    gerejaId: 'ger-001',
    name: 'Pdt. Dr. Martinus Simanjuntak, S.Th',
    position: 'Pendeta Jemaat (Head Pastor)',
    level: 1,
    photoUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80',
    bio: 'Melayani di HKBP Grace City Center sejak tahun 2018. Lulusan S3 Teologi STT Jakarta.',
    contact: 'martinus.pdt@hkbp-gracecity.org'
  },
  {
    id: 'stk-002',
    gerejaId: 'ger-001',
    name: 'St. David Nainggolan',
    position: 'Ketua Parartaon / Administrasi & Keuangan',
    level: 2,
    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
    bio: 'Bertanggung jawab atas manajemen operasional, aset, dan keuangan gereja.',
    contact: '081234567890'
  },
  {
    id: 'stk-003',
    gerejaId: 'ger-001',
    name: 'St. B. Panjaitan',
    position: 'Sekretaris Jemaat',
    level: 2,
    photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
    bio: 'Mengelola keanggotaan jemaat, warta jemaat, dan kearsipan gereja.',
    contact: 'sekretariat@hkbp-gracecity.org'
  }
];

export const initialAlbums: Album[] = [
  {
    id: 'alb-001',
    gerejaId: 'ger-001',
    name: 'Paskah & Kebangkitan Kristus 2026',
    description: 'Dokumentasi perayaan Ibadah Subuh Paskah dan Drama Musikal Kebangkitan Kristus.',
    coverUrl: 'https://images.unsplash.com/photo-1438032005730-c779502df39b?auto=format&fit=crop&w=600&q=80',
    photoCount: 16,
    createdAt: '2026-04-05T12:00:00Z'
  },
  {
    id: 'alb-002',
    gerejaId: 'ger-001',
    name: 'Bakti Sosial & Donor Darah Jemaat',
    description: 'Aksi kasih membagikan paket sembako kepada 200 keluarga pra-sejahtera di sekitar gereja.',
    coverUrl: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=600&q=80',
    photoCount: 24,
    createdAt: '2026-06-12T14:00:00Z'
  }
];

export const initialGaleri: Galeri[] = [
  {
    id: 'gal-001',
    gerejaId: 'ger-001',
    albumId: 'alb-001',
    title: 'Prosesi Obor Subuh Paskah',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1519817650390-64a93db51149?auto=format&fit=crop&w=800&q=80',
    driveFileId: '1drive_file_001',
    createdAt: '2026-04-05T06:00:00Z'
  },
  {
    id: 'gal-002',
    gerejaId: 'ger-001',
    albumId: 'alb-001',
    title: 'Paduan Suara Agung Paskah',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=800&q=80',
    driveFileId: '1drive_file_002',
    createdAt: '2026-04-05T08:30:00Z'
  },
  {
    id: 'gal-003',
    gerejaId: 'ger-001',
    albumId: 'alb-002',
    title: 'Penyerahan Paket Sembako Kasih',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=800&q=80',
    driveFileId: '1drive_file_003',
    createdAt: '2026-06-12T10:00:00Z'
  }
];

export const initialKomentar: Komentar[] = [
  {
    id: 'kom-001',
    gerejaId: 'ger-001',
    targetType: 'renungan',
    targetId: 'ren-001',
    authorName: 'Daniel Sitorus',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
    content: 'Sangat menguatkan Firman Tuhan hari ini. Terima kasih Pak Pendeta!',
    approved: true,
    createdAt: '2026-07-28T06:30:00Z'
  },
  {
    id: 'kom-002',
    gerejaId: 'ger-001',
    targetType: 'renungan',
    targetId: 'ren-001',
    authorName: 'Maria Elisabeth',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
    content: 'Amin! Pengharapan di dalam Kristus tidak pernah mengecewakan.',
    approved: true,
    createdAt: '2026-07-28T07:15:00Z'
  }
];

export const initialPokokDoa: PokokDoa[] = [
  {
    id: 'doa-001',
    gerejaId: 'ger-001',
    senderName: 'Ibu Ratna Nainggolan',
    content: 'Mohon dukungan doa untuk pemulihan kesehatan suami yang sedang dirawat di RS Cipto Mangunkusumo.',
    isPrivate: false,
    status: 'didoakan',
    adminReply: 'Tim Doa Fajar gereja telah mendoakan pada Sabtu pagi. Semoga Tuhan Yesus memberikan kesembuhan total.',
    likesCount: 18,
    createdAt: '2026-07-26T14:00:00Z'
  },
  {
    id: 'doa-002',
    gerejaId: 'ger-001',
    senderName: 'Daniel Sitorus',
    content: 'Mohon doa untuk kelancaran proses ujian akhir dan pencarian kerja.',
    isPrivate: false,
    status: 'terjawab',
    adminReply: 'Puji Tuhan! Kiranya Hikmat Kristus menyertai Daniel.',
    likesCount: 12,
    createdAt: '2026-07-20T09:00:00Z'
  }
];

export const initialDonasi: Donasi[] = [
  {
    id: 'don-001',
    gerejaId: 'ger-001',
    donorName: 'Daniel Sitorus',
    amount: 500000,
    campaign: 'Persembahan Perpuluhan & Pembangunan',
    paymentMethod: 'Transfer BCA',
    transferProofUrl: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=600&q=80',
    status: 'verified',
    date: '2026-07-25'
  },
  {
    id: 'don-002',
    gerejaId: 'ger-001',
    donorName: 'Hamba Allah (Anonim)',
    amount: 1200000,
    campaign: 'Dana Bakti Sosial HUT 25',
    paymentMethod: 'QRIS',
    transferProofUrl: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=600&q=80',
    status: 'verified',
    date: '2026-07-26'
  }
];

export const initialKas: Kas[] = [
  {
    id: 'kas-001',
    gerejaId: 'ger-001',
    title: 'Persembahan Ibadah Minggu 26 Juli 2026',
    type: 'pemasukan',
    amount: 18450000,
    category: 'Persembahan Minggu',
    date: '2026-07-26',
    description: 'Pemasukan Kantong I, II, dan QRIS Digital Jemaat'
  },
  {
    id: 'kas-002',
    gerejaId: 'ger-001',
    title: 'Pembayaran Listrik & Kebersihan Gedung',
    type: 'pengeluaran',
    amount: 4200000,
    category: 'Operasional',
    date: '2026-07-27',
    description: 'Tagihan PLN Juli & Perlengkapan Kebersihan'
  }
];

export const initialNotifikasi: Notifikasi[] = [
  {
    id: 'notif-001',
    gerejaId: 'ger-001',
    title: 'Pengumuman Penting Katekisasi Sidi',
    message: 'Pendaftaran Bimbingan Sidi 2026/2027 telah dibuka melalui aplikasi!',
    type: 'pengumuman',
    targetRole: 'jemaat',
    read: false,
    createdAt: '2026-07-26T08:05:00Z'
  },
  {
    id: 'notif-002',
    gerejaId: 'ger-001',
    title: 'Renungan Terbaru Hari Ini',
    message: 'Renungan "Pengharapan yang Tidak Mengecewakan" telah dipublikasikan.',
    type: 'renungan',
    targetRole: 'jemaat',
    read: true,
    createdAt: '2026-07-28T05:05:00Z'
  }
];

export const initialPengaturan: Pengaturan = {
  id: 'stg-001',
  gerejaId: 'ger-001',
  bankBcaAccount: '782-099-1234 a/n HKBP Grace City Center',
  bankMandiriAccount: '122-00-9876543-1 a/n HKBP Grace City',
  bankBriAccount: '0112-01-009988-50-3 a/n HKBP Grace',
  qrisImageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=400&q=80',
  contactWhatsapp: '081234567890',
  contactEmail: 'sekretariat@hkbp-gracecity.org',
  googleApiConnected: true,
  googleSheetUrl: 'https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms',
  googleDriveFolderUrl: 'https://drive.google.com/drive/folders/1zA9K_drive_folder_hkbp_grace'
};

export const initialLogAktivitas: LogAktivitas[] = [
  {
    id: 'log-001',
    gerejaId: 'ger-001',
    userId: 'user-002',
    userName: 'St. David Nainggolan',
    action: 'TAMBAH_BERITA',
    details: 'Menambahkan berita "Pelantikan Pengurus Pelayanan Pemuda"',
    timestamp: '2026-07-25T14:30:00Z'
  },
  {
    id: 'log-002',
    gerejaId: 'ger-001',
    userId: 'user-002',
    userName: 'St. David Nainggolan',
    action: 'VERIFIKASI_DONASI',
    details: 'Memverifikasi donasi Rp 500.000 dari Daniel Sitorus',
    timestamp: '2026-07-25T16:00:00Z'
  }
];

export const initialBackup: BackupRecord[] = [
  {
    id: 'bak-001',
    gerejaId: 'ger-001',
    filename: 'backup_hkbp_grace_2026_07_20.json',
    size: '1.4 MB',
    createdBy: 'St. David Nainggolan',
    createdAt: '2026-07-20T23:59:00Z'
  }
];
