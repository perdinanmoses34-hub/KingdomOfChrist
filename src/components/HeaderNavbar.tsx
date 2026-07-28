import React, { useState, useEffect } from 'react';
import {
  Church,
  Shield,
  UserCheck,
  Building2,
  Wifi,
  Sun,
  Moon,
  Download,
  Bell,
  ChevronDown,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { UserRole, Gereja, Notifikasi } from '../types';

interface HeaderNavbarProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  gerejaList: Gereja[];
  selectedGereja: Gereja | null;
  onGerejaChange: (gereja: Gereja) => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  notifikasiList: Notifikasi[];
  onOpenNotifModal: () => void;
  viewportMode?: 'mobile' | 'tablet' | 'desktop';
  onViewportChange?: (mode: 'mobile' | 'tablet' | 'desktop') => void;
  showViewportToggle?: boolean;
}

export const HeaderNavbar: React.FC<HeaderNavbarProps> = ({
  currentRole,
  onRoleChange,
  gerejaList,
  selectedGereja,
  onGerejaChange,
  isDarkMode,
  onToggleDarkMode,
  notifikasiList,
  onOpenNotifModal,
  viewportMode,
  onViewportChange,
  showViewportToggle = false
}) => {
  const [isChurchDropdownOpen, setIsChurchDropdownOpen] = useState(false);
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
  const [pwaInstalled, setPwaInstalled] = useState(false);
  const [showPwaBanner, setShowPwaBanner] = useState(false);

  // Admin Security Auth Modal State
  const [showAdminLoginModal, setShowAdminLoginModal] = useState(false);
  const [adminPinInput, setAdminPinInput] = useState('');
  const [pinError, setPinError] = useState('');

  const unreadCount = notifikasiList.filter(n => !n.read).length;

  const handleInstallPWA = () => {
    setPwaInstalled(true);
    setShowPwaBanner(false);
    alert('Aplikasi CMS Gereja PWA telah berhasil terinstall di perangkat Anda!');
  };

  const handleAdminAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminPinInput === '123456' || adminPinInput === 'admin123' || adminPinInput === 'admin') {
      onRoleChange('admin_gereja');
      setShowAdminLoginModal(false);
      setAdminPinInput('');
      setPinError('');
      alert('Autentikasi Berhasil! Anda sekarang masuk ke Panel Admin Gereja.');
    } else {
      setPinError('PIN/Password Admin salah! Silakan masukkan 123456');
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-blue-900 dark:bg-slate-950 border-b-4 border-amber-500 shadow-md text-white transition-colors duration-200">
      {/* PWA Install Notification Bar */}
      {!pwaInstalled && (
        <div className="bg-gradient-to-r from-blue-950 via-blue-900 to-indigo-950 text-white text-xs py-1.5 px-4 flex items-center justify-between border-b border-blue-800/60">
          <div className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            <span className="font-semibold text-[11px] sm:text-xs">
              Install Aplikasi CMS Gereja PWA untuk pengalaman cepat seperti App Native!
            </span>
          </div>
          <button
            onClick={handleInstallPWA}
            className="flex items-center gap-1 bg-amber-500 hover:bg-amber-400 text-slate-950 px-3 py-0.5 rounded-full font-black text-[11px] uppercase tracking-wider transition-transform active:scale-95 cursor-pointer shadow-md"
          >
            <Download className="w-3 h-3" />
            Install PWA
          </button>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-2.5 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-1.5 sm:gap-2">
        {/* Left Branding */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <div className="relative shrink-0">
            {selectedGereja?.logoUrl ? (
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white rounded-full flex items-center justify-center p-0.5 shadow-md">
                <img
                  src={selectedGereja.logoUrl}
                  alt={selectedGereja.name}
                  className="w-full h-full rounded-full object-cover"
                />
              </div>
            ) : (
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white text-blue-900 flex items-center justify-center shadow-md font-bold">
                <Church className="w-5 h-5 sm:w-6 sm:h-6 text-blue-900" />
              </div>
            )}
            <span className="absolute -bottom-0.5 -right-0.5 flex h-3 w-3 sm:h-3.5 sm:w-3.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 sm:h-3.5 sm:w-3.5 bg-emerald-500 border-2 border-blue-900"></span>
            </span>
          </div>

          <div className="min-w-0">
            <div className="relative">
              {currentRole === 'jemaat' ? (
                <div className="flex items-center gap-1 font-black text-white text-xs sm:text-base tracking-wide max-w-full">
                  <span className="max-w-[120px] xs:max-w-[160px] sm:max-w-[240px] truncate uppercase tracking-wider block">
                    {selectedGereja ? selectedGereja.name : 'CMS Gereja'}
                  </span>
                  <span className="text-[10px] bg-amber-500/30 text-amber-300 font-extrabold px-2 py-0.5 rounded-full border border-amber-400/30 shrink-0">
                    Gereja Saya
                  </span>
                </div>
              ) : (
                <button
                  onClick={() => setIsChurchDropdownOpen(!isChurchDropdownOpen)}
                  className="flex items-center gap-1 font-black text-white text-xs sm:text-base tracking-wide hover:text-amber-300 transition-colors text-left cursor-pointer max-w-full"
                >
                  <span className="max-w-[100px] xs:max-w-[140px] sm:max-w-[220px] md:max-w-none truncate uppercase tracking-wider block">
                    {selectedGereja ? selectedGereja.name : 'CMS Gereja'}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400 shrink-0" />
                </button>
              )}

              {/* Church Selector Modal/Dropdown (Only accessible for Admin/Superadmin) */}
              {isChurchDropdownOpen && currentRole !== 'jemaat' && (
                <div className="fixed sm:absolute top-16 sm:top-full left-2 sm:left-0 mt-1 w-72 max-w-[calc(100vw-1rem)] bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 py-2 z-50">
                  <div className="px-3 py-1.5 text-[10px] font-extrabold text-amber-600 dark:text-amber-400 uppercase tracking-widest">
                    Pilih Gereja (Multi-Tenant)
                  </div>
                  {gerejaList.map((g) => (
                    <button
                      key={g.id}
                      onClick={() => {
                        onGerejaChange(g);
                        setIsChurchDropdownOpen(false);
                      }}
                      className={`w-full px-3 py-2.5 text-left text-sm flex items-center justify-between hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ${
                        selectedGereja?.id === g.id ? 'bg-blue-50 dark:bg-blue-950/60 font-bold text-blue-900 dark:text-amber-400' : 'text-slate-700 dark:text-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <Building2 className="w-4 h-4 text-amber-500 shrink-0" />
                        <div className="truncate">
                          <div className="font-bold text-xs sm:text-sm truncate">{g.name}</div>
                          <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{g.city}</div>
                        </div>
                      </div>
                      {selectedGereja?.id === g.id && <CheckCircle2 className="w-4 h-4 text-amber-500 shrink-0" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="hidden xs:flex items-center gap-1.5 text-[10px] text-blue-200 uppercase tracking-wider font-semibold">
              <span className="flex items-center gap-1 text-emerald-400 font-bold">
                <Wifi className="w-2.5 h-2.5" /> Realtime Sync Active
              </span>
            </div>
          </div>
        </div>

        {/* Center Viewport Switcher for Admin Preview Mode */}
        {showViewportToggle && onViewportChange && (
          <div className="hidden lg:flex items-center bg-blue-950/80 rounded-xl p-1 text-xs border border-blue-800/80">
            <button
              onClick={() => onViewportChange('mobile')}
              className={`px-2.5 py-1 rounded-lg font-bold text-[11px] uppercase tracking-wider transition-colors ${
                viewportMode === 'mobile' ? 'bg-amber-500 text-slate-950 shadow-sm' : 'text-blue-200 hover:text-white'
              }`}
            >
              📱 Mobile
            </button>
            <button
              onClick={() => onViewportChange('tablet')}
              className={`px-2.5 py-1 rounded-lg font-bold text-[11px] uppercase tracking-wider transition-colors ${
                viewportMode === 'tablet' ? 'bg-amber-500 text-slate-950 shadow-sm' : 'text-blue-200 hover:text-white'
              }`}
            >
              Tablet
            </button>
            <button
              onClick={() => onViewportChange('desktop')}
              className={`px-2.5 py-1 rounded-lg font-bold text-[11px] uppercase tracking-wider transition-colors ${
                viewportMode === 'desktop' ? 'bg-amber-500 text-slate-950 shadow-sm' : 'text-blue-200 hover:text-white'
              }`}
            >
              💻 Desktop
            </button>
          </div>
        )}

        {/* Right Controls & Role Switcher */}
        <div className="flex items-center gap-1 sm:gap-2.5 shrink-0">
          {/* Notifications Bell */}
          <button
            onClick={onOpenNotifModal}
            className="relative p-1.5 sm:p-2 text-blue-100 hover:bg-blue-800/60 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
            title="Notifikasi Realtime"
          >
            <Bell className="w-4 h-4 sm:w-5 sm:h-5 text-amber-300" />
            {unreadCount > 0 && (
              <span className="absolute top-0.5 right-0.5 w-3.5 h-3.5 bg-red-500 text-white font-black text-[9px] rounded-full flex items-center justify-center animate-bounce">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Theme Toggle */}
          <button
            onClick={onToggleDarkMode}
            className="p-1.5 sm:p-2 text-blue-100 hover:bg-blue-800/60 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
            title="Ganti Tema Dark/Light"
          >
            {isDarkMode ? <Sun className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" /> : <Moon className="w-4 h-4 sm:w-5 sm:h-5 text-amber-300" />}
          </button>

          {/* Role Switcher Pill */}
          <div className="relative">
            <button
              onClick={() => {
                if (currentRole === 'jemaat') {
                  setShowAdminLoginModal(true);
                } else {
                  setIsRoleDropdownOpen(!isRoleDropdownOpen);
                }
              }}
              className={`flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full font-extrabold text-xs border shadow-sm transition-all cursor-pointer ${
                currentRole === 'super_admin'
                  ? 'bg-purple-600 text-white border-purple-400'
                  : currentRole === 'admin_gereja'
                  ? 'bg-amber-500 text-slate-950 border-amber-300 font-black'
                  : 'bg-white text-blue-950 border-white font-black hover:bg-amber-400 hover:text-slate-950'
              }`}
              title={currentRole === 'jemaat' ? 'Klik untuk Login Pengurus/Admin' : 'Ganti Akses Role'}
            >
              {currentRole === 'super_admin' && <Shield className="w-3.5 h-3.5 shrink-0" />}
              {currentRole === 'admin_gereja' && <Building2 className="w-3.5 h-3.5 shrink-0" />}
              {currentRole === 'jemaat' && <UserCheck className="w-3.5 h-3.5 text-blue-900 shrink-0" />}
              <span className="uppercase tracking-wider text-[10px] sm:text-[11px] whitespace-nowrap">
                {currentRole === 'super_admin' ? 'Super Admin' : currentRole === 'admin_gereja' ? 'Admin' : 'Mode Jemaat'}
              </span>
              {currentRole === 'jemaat' ? (
                <span className="text-[10px] font-black bg-blue-900 text-white px-1.5 py-0.5 rounded-full">🔑 Login</span>
              ) : (
                <ChevronDown className="w-3 h-3 sm:w-3.5 sm:h-3.5 opacity-80 shrink-0" />
              )}
            </button>

            {isRoleDropdownOpen && currentRole !== 'jemaat' && (
              <div className="fixed sm:absolute top-16 sm:top-full right-2 sm:right-0 mt-1 w-52 max-w-[calc(100vw-1rem)] bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 py-2 z-50">
                <div className="px-3 py-1.5 text-[10px] font-extrabold text-amber-600 dark:text-amber-400 uppercase tracking-widest">
                  Simulasi Hak Akses Role
                </div>
                <button
                  onClick={() => {
                    onRoleChange('jemaat');
                    setIsRoleDropdownOpen(false);
                  }}
                  className={`w-full px-3 py-2 text-left text-xs sm:text-sm flex items-center gap-2 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ${
                    currentRole === 'jemaat' ? 'font-bold text-blue-900 dark:text-amber-400' : 'text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <UserCheck className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>Jemaat / Member</span>
                </button>
                <button
                  onClick={() => {
                    onRoleChange('admin_gereja');
                    setIsRoleDropdownOpen(false);
                  }}
                  className={`w-full px-3 py-2 text-left text-xs sm:text-sm flex items-center gap-2 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ${
                    currentRole === 'admin_gereja' ? 'font-bold text-amber-600 dark:text-amber-400' : 'text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <Building2 className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Admin Gereja</span>
                </button>
                <button
                  onClick={() => {
                    onRoleChange('super_admin');
                    setIsRoleDropdownOpen(false);
                  }}
                  className={`w-full px-3 py-2 text-left text-xs sm:text-sm flex items-center gap-2 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ${
                    currentRole === 'super_admin' ? 'font-bold text-purple-600 dark:text-purple-400' : 'text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <Shield className="w-4 h-4 text-purple-600 shrink-0" />
                  <span>Super Admin (SaaS)</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* --- MODAL AUTENTIKASI ADMIN GEREJA (Mencegah Jemaat Masuk Akun Admin) --- */}
      {showAdminLoginModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 text-slate-900 dark:text-white">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-sm w-full p-6 shadow-2xl relative border border-slate-200 dark:border-slate-800 animate-fadeIn">
            <button
              onClick={() => {
                setShowAdminLoginModal(false);
                setPinError('');
                setAdminPinInput('');
              }}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-white text-xl font-bold cursor-pointer"
            >
              ✕
            </button>
            
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-amber-500/20 text-amber-500 rounded-2xl flex items-center justify-center mx-auto mb-2 border border-amber-500/30">
                <Shield className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white">Login Pengurus / Admin</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Jemaat biasa tidak dapat mengakses panel ini. Masukkan Kata Sandi atau PIN Keamanan Pengurus Gereja.
              </p>
            </div>

            <form onSubmit={handleAdminAuthSubmit} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 mb-1">
                  PIN / Password Keamanan Admin
                </label>
                <input
                  type="password"
                  value={adminPinInput}
                  onChange={(e) => {
                    setAdminPinInput(e.target.value);
                    setPinError('');
                  }}
                  placeholder="Masukkan PIN (Contoh: 123456)"
                  required
                  autoFocus
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-2xl text-sm font-mono text-center tracking-widest text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 outline-none"
                />
                {pinError && (
                  <p className="text-xs font-bold text-red-500 mt-1.5 text-center">{pinError}</p>
                )}
                <p className="text-[11px] text-slate-400 text-center mt-2">
                  💡 PIN Demo Pengurus: <code className="bg-slate-200 dark:bg-slate-800 px-1.5 py-0.5 rounded font-bold text-amber-600 dark:text-amber-400">123456</code>
                </p>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider rounded-2xl shadow-lg transition-transform active:scale-95 cursor-pointer"
              >
                Masuk ke Panel Admin
              </button>
            </form>
          </div>
        </div>
      )}
    </header>
  );
};
