export type UserRole = 'super_admin' | 'admin_gereja' | 'jemaat';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  gerejaId: string;
  phone?: string;
  avatarUrl?: string;
  membershipNo?: string;
  createdAt: string;
}

export interface Gereja {
  id: string;
  name: string;
  code: string;
  address: string;
  city: string;
  phone: string;
  email: string;
  logoUrl: string;
  bannerUrl: string;
  pastorName: string;
  status: 'active' | 'trial' | 'expired';
  licensePackage: 'Basic' | 'Pro' | 'Enterprise';
  googleSheetId?: string;
  googleDriveFolderId?: string;
  createdAt: string;
}

export interface JemaatMember {
  id: string;
  gerejaId: string;
  userId?: string;
  fullName: string;
  gender: 'Pria' | 'Wanita' | 'Laki-laki' | 'Perempuan';
  birthDate?: string;
  address: string;
  phone: string;
  email?: string;
  status: 'aktif' | 'simpatisan' | 'pindah';
  joinDate: string;
  avatarUrl?: string;
  sector?: string;
}

export interface Berita {
  id: string;
  gerejaId: string;
  title: string;
  content: string;
  coverUrl: string;
  category: string;
  tags: string[];
  publishDate: string;
  published: boolean;
  viewsCount: number;
  authorName: string;
}

export interface Pengumuman {
  id: string;
  gerejaId: string;
  title: string;
  content: string;
  priority: 'normal' | 'penting' | 'mendesak';
  publishDate: string;
  targetAudience: string;
}

export interface Renungan {
  id: string;
  gerejaId: string;
  title: string;
  scripture: string;
  content: string;
  videoUrl?: string;
  imageUrl?: string;
  author: string;
  publishDate: string;
  likesCount: number;
}

export interface EventGereja {
  id: string;
  gerejaId: string;
  title: string;
  description: string;
  posterUrl: string;
  locationName: string;
  mapUrl: string;
  date: string;
  time: string;
  quota: number;
  registeredCount: number;
  category: string;
}

export interface EventRegistration {
  id: string;
  eventId: string;
  gerejaId: string;
  jemaatName: string;
  phone: string;
  email: string;
  seats: number;
  status: 'confirmed' | 'cancelled';
  registeredAt: string;
}

export interface JadwalIbadah {
  id: string;
  gerejaId: string;
  title: string;
  category: 'Ibadah Minggu' | 'Ibadah Pemuda' | 'Ibadah Wanita' | 'Ibadah Pria' | 'Doa Pagi' | 'Doa Malam' | 'Khusus';
  dayOfWeek: string;
  time: string;
  location: string;
  speaker: string;
  worshipLeader: string;
}

export interface Pelayanan {
  id: string;
  gerejaId: string;
  name?: string;
  category: 'Worship' | 'Multimedia' | 'Singer' | 'Musik' | 'Sekolah Minggu' | 'Diaken' | 'Doa' | 'Kategorial' | string;
  leaderName: string;
  description: string;
  membersCount: number;
  scheduleInfo: string;
  contactPerson: string;
  meetingTime?: string;
}

export interface StrukturOrganisasi {
  id: string;
  gerejaId: string;
  name: string;
  position: string;
  level: number;
  photoUrl: string;
  bio: string;
  contact: string;
  period?: string;
}

export interface Galeri {
  id: string;
  gerejaId: string;
  albumId: string;
  title: string;
  type: 'image' | 'video';
  url: string;
  driveFileId?: string;
  createdAt: string;
}

export interface Album {
  id: string;
  gerejaId: string;
  name: string;
  description: string;
  coverUrl: string;
  photoCount: number;
  createdAt: string;
}

export interface Komentar {
  id: string;
  gerejaId: string;
  targetType: 'renungan' | 'berita';
  targetId: string;
  authorName: string;
  avatarUrl?: string;
  content: string;
  approved: boolean;
  createdAt: string;
}

export interface PokokDoa {
  id: string;
  gerejaId: string;
  senderName: string;
  content: string;
  isPrivate: boolean;
  status: 'pending' | 'didoakan' | 'terjawab';
  adminReply?: string;
  likesCount?: number;
  createdAt: string;
}

export interface Donasi {
  id: string;
  gerejaId: string;
  donorName: string;
  amount: number;
  campaign: string;
  paymentMethod: string;
  transferProofUrl: string;
  status: 'pending' | 'verified' | 'rejected';
  date: string;
}

export interface Kas {
  id: string;
  gerejaId: string;
  title: string;
  type: 'pemasukan' | 'pengeluaran';
  amount: number;
  category: string;
  date: string;
  description: string;
}

export interface Notifikasi {
  id: string;
  gerejaId: string;
  title: string;
  message: string;
  type: 'event' | 'renungan' | 'pengumuman' | 'berita' | 'donasi';
  targetRole: string;
  read?: boolean;
  createdAt: string;
}

export interface ThemeCustomization {
  primaryColor?: 'blue' | 'amber' | 'emerald' | 'purple' | 'indigo' | 'rose' | 'teal' | 'slate';
  backgroundStyle?: 'twilight' | 'clean_light' | 'warm_amber' | 'royal_blue' | 'emerald_nature' | 'dark_luxury';
  cardStyle?: 'glassmorphic' | 'elevated_shadow' | 'bordered_minimal' | 'soft_gradient';
  layoutStyle?: 'modern_cards' | 'classic_compact' | 'visual_grid' | 'editorial_hero';
  welcomeTitle?: string;
  welcomeSubtitle?: string;
  buttonRadius?: 'rounded_pill' | 'modern_rounded' | 'square_sleek';
  churchNameCustom?: string;
  logoUrlCustom?: string;
  bannerUrlCustom?: string;
}

export interface Pengaturan {
  id: string;
  gerejaId: string;
  bankBcaAccount: string;
  bankMandiriAccount: string;
  bankBriAccount: string;
  qrisImageUrl: string;
  contactWhatsapp: string;
  contactEmail: string;
  googleApiConnected: boolean;
  googleSheetUrl?: string;
  googleDriveFolderUrl?: string;
  theme?: ThemeCustomization;
}

export interface LogAktivitas {
  id: string;
  gerejaId: string;
  userId: string;
  userName: string;
  action: string;
  details: string;
  timestamp: string;
}

export interface BackupRecord {
  id: string;
  gerejaId: string;
  filename: string;
  size: string;
  createdBy: string;
  createdAt: string;
}

// Realtime Event Payload Interface
export interface RealtimeSyncMessage {
  type: 'UPDATE' | 'DELETE' | 'INSERT' | 'NOTIFICATION';
  entity: string;
  gerejaId: string;
  data?: any;
  timestamp: string;
}
