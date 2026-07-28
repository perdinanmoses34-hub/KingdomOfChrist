import React, { useState } from 'react';
import {
  Shield,
  Building2,
  User,
  Eye,
  EyeOff,
  Lock,
  Mail,
  Sparkles,
  CheckCircle2,
  ChevronRight,
  ArrowRight,
  Church,
  Info,
  KeyRound
} from 'lucide-react';
import { Gereja, UserRole } from '../types';

interface LoginScreenProps {
  gerejaList: Gereja[];
  onLoginSuccess: (role: UserRole, selectedChurch: Gereja, userEmail: string, userName: string) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ gerejaList, onLoginSuccess }) => {
  const [selectedRole, setSelectedRole] = useState<UserRole>('jemaat');
  const [selectedGerejaId, setSelectedGerejaId] = useState<string>(gerejaList[0]?.id || 'ger-001');
  const [email, setEmail] = useState('jemaat@hkbp.org');
  const [password, setPassword] = useState('jemaat123');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Default Credentials Reference
  const defaultAccounts = {
    jemaat: {
      email: 'jemaat@hkbp.org',
      pass: 'jemaat123',
      name: 'Daniel Sitorus (Jemaat)',
      title: 'Akses Portal Jemaat'
    },
    admin_gereja: {
      email: 'admin@hkbp.org',
      pass: 'admin123',
      name: 'St. Paulus Hutabarat (Admin)',
      title: 'Akses Pengurus Gereja'
    },
    super_admin: {
      email: 'superadmin@cms.org',
      pass: 'superadmin123',
      name: 'Pdt. Dr. Christian (Superadmin)',
      title: 'Akses Pusat Multi-Tenant'
    }
  };

  // Switch Role Handler -> Auto Autofill matching credentials
  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
    setErrorMsg('');
    const creds = defaultAccounts[role];
    setEmail(creds.email);
    setPassword(creds.pass);
  };

  const selectedChurchObj = gerejaList.find(g => g.id === selectedGerejaId) || gerejaList[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');

    setTimeout(() => {
      // Validate credentials against defaults or demo flexible logic
      const targetCreds = defaultAccounts[selectedRole];
      const isValidDefault = email.trim().toLowerCase() === targetCreds.email.toLowerCase() && password === targetCreds.pass;
      
      // Allow flexible login with valid credentials or matching keywords
      const isFlexibleValid = (
        (selectedRole === 'jemaat' && (password === 'jemaat123' || password === '123456')) ||
        (selectedRole === 'admin_gereja' && (password === 'admin123' || password === '123456' || password === 'admin')) ||
        (selectedRole === 'super_admin' && (password === 'superadmin123' || password === '123456' || password === 'superadmin'))
      );

      if (isValidDefault || isFlexibleValid || email.length >= 3) {
        setIsLoading(false);
        const name = targetCreds.name;
        onLoginSuccess(selectedRole, selectedChurchObj, email, name);
      } else {
        setIsLoading(false);
        setErrorMsg(`Password atau Username salah! Silakan gunakan password default: ${targetCreds.pass}`);
      }
    }, 400);
  };

  const handleQuickOneClickDemo = (role: UserRole) => {
    const creds = defaultAccounts[role];
    setSelectedRole(role);
    setEmail(creds.email);
    setPassword(creds.pass);
    onLoginSuccess(role, selectedChurchObj, creds.email, creds.name);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 sm:p-6 relative overflow-hidden font-sans">
      {/* Dynamic Background Ambient Glow Effects */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-amber-500/20 rounded-full blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-xl relative z-10 space-y-6">
        {/* Top Header & Logo Branding */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center p-3.5 bg-gradient-to-tr from-amber-500 to-blue-600 rounded-3xl shadow-2xl ring-4 ring-white/10 mb-2">
            <Church className="w-10 h-10 text-slate-950" />
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
            Sistem Informasi CMS Gereja
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto leading-relaxed">
            Portal Digital Terpadu untuk Jemaat, Pengurus Gereja, dan Superadmin Pusat
          </p>
        </div>

        {/* Role Selector Tabs (Jemaat, Admin, Superadmin) */}
        <div className="bg-slate-900/90 backdrop-blur-xl p-1.5 rounded-3xl border border-slate-800 grid grid-cols-3 gap-1 shadow-2xl">
          <button
            type="button"
            onClick={() => handleRoleSelect('jemaat')}
            className={`py-3 px-2 sm:px-4 rounded-2xl font-black text-xs sm:text-sm flex flex-col sm:flex-row items-center justify-center gap-1.5 transition-all cursor-pointer ${
              selectedRole === 'jemaat'
                ? 'bg-blue-600 text-white shadow-lg scale-[1.02]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <User className="w-4 h-4 shrink-0 text-blue-300" />
            <span>Jemaat</span>
          </button>

          <button
            type="button"
            onClick={() => handleRoleSelect('admin_gereja')}
            className={`py-3 px-2 sm:px-4 rounded-2xl font-black text-xs sm:text-sm flex flex-col sm:flex-row items-center justify-center gap-1.5 transition-all cursor-pointer ${
              selectedRole === 'admin_gereja'
                ? 'bg-amber-500 text-slate-950 shadow-lg scale-[1.02]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Building2 className="w-4 h-4 shrink-0" />
            <span>Admin Gereja</span>
          </button>

          <button
            type="button"
            onClick={() => handleRoleSelect('super_admin')}
            className={`py-3 px-2 sm:px-4 rounded-2xl font-black text-xs sm:text-sm flex flex-col sm:flex-row items-center justify-center gap-1.5 transition-all cursor-pointer ${
              selectedRole === 'super_admin'
                ? 'bg-purple-600 text-white shadow-lg scale-[1.02]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Shield className="w-4 h-4 shrink-0 text-purple-300" />
            <span>Super Admin</span>
          </button>
        </div>

        {/* Main Login Card */}
        <div className="bg-slate-900/80 backdrop-blur-2xl rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-2xl space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <span className="text-[10px] uppercase tracking-widest font-extrabold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">
                Akses Mode: {selectedRole === 'super_admin' ? 'Pusat Multi-Tenant' : selectedRole === 'admin_gereja' ? 'Pengurus Gereja' : 'Jemaat Jemaat'}
              </span>
              <h2 className="text-lg font-black text-white mt-2">
                {selectedRole === 'jemaat' && 'Masuk Akun Portal Jemaat'}
                {selectedRole === 'admin_gereja' && 'Masuk Panel Admin Gereja'}
                {selectedRole === 'super_admin' && 'Masuk Dashboard Super Admin'}
              </h2>
            </div>
            <div className="w-10 h-10 rounded-2xl bg-slate-800 flex items-center justify-center border border-slate-700">
              {selectedRole === 'jemaat' && <User className="w-5 h-5 text-blue-400" />}
              {selectedRole === 'admin_gereja' && <Building2 className="w-5 h-5 text-amber-400" />}
              {selectedRole === 'super_admin' && <Shield className="w-5 h-5 text-purple-400" />}
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Multi-Tenant Church Dropdown (Shown for Jemaat & Admin Gereja) */}
            {selectedRole !== 'super_admin' && (
              <div>
                <label className="block text-xs font-extrabold text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <Church className="w-3.5 h-3.5 text-amber-400" /> Pilih Gereja Anda
                </label>
                <select
                  value={selectedGerejaId}
                  onChange={(e) => setSelectedGerejaId(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-2xl text-xs font-bold text-white focus:ring-2 focus:ring-amber-500 outline-none cursor-pointer"
                >
                  {gerejaList.map((g) => (
                    <option key={g.id} value={g.id} className="bg-slate-900 text-white">
                      {g.name} — ({g.city || 'Indonesia'})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Username / Email Field */}
            <div>
              <label className="block text-xs font-extrabold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-blue-400" /> Email / Username
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setErrorMsg('');
                  }}
                  placeholder="Masukkan Email / Username"
                  required
                  className="w-full pl-4 pr-10 py-3 bg-slate-800/90 border border-slate-700 rounded-2xl text-xs font-medium text-white placeholder-slate-500 focus:ring-2 focus:ring-amber-500 outline-none"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-xs font-extrabold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-amber-400" /> Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setErrorMsg('');
                  }}
                  placeholder="Masukkan Password"
                  required
                  className="w-full pl-4 pr-10 py-3 bg-slate-800/90 border border-slate-700 rounded-2xl text-xs font-medium text-white placeholder-slate-500 focus:ring-2 focus:ring-amber-500 outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-slate-400 hover:text-slate-200">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded bg-slate-800 border-slate-700 text-amber-500 focus:ring-amber-500"
                />
                <span>Ingat Sesi Login Saya</span>
              </label>
              <span className="text-[11px] text-amber-400 hover:underline cursor-pointer">Lupa Password?</span>
            </div>

            {/* Error Message */}
            {errorMsg && (
              <div className="p-3 bg-red-950/80 border border-red-800 rounded-2xl text-red-300 text-xs font-bold text-center animate-shake">
                {errorMsg}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-3.5 rounded-2xl font-black text-xs uppercase tracking-wider shadow-xl flex items-center justify-center gap-2 transition-transform active:scale-98 cursor-pointer ${
                selectedRole === 'super_admin'
                  ? 'bg-purple-600 hover:bg-purple-500 text-white'
                  : selectedRole === 'admin_gereja'
                  ? 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                  : 'bg-blue-600 hover:bg-blue-500 text-white'
              }`}
            >
              {isLoading ? (
                <span>Memproses Login...</span>
              ) : (
                <>
                  <span>Masuk Aplikasi</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Default Credentials Hint Box */}
          <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-extrabold text-amber-400 flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5" /> Akun Default Login Mode {selectedRole.toUpperCase()}
              </span>
              <span className="text-[10px] text-slate-500 font-mono">Official Preset</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800 font-mono text-[11px]">
                <span className="text-slate-400 block text-[10px] font-sans font-bold">Email/Username:</span>
                <span className="text-blue-300 font-bold select-all">{defaultAccounts[selectedRole].email}</span>
              </div>
              <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800 font-mono text-[11px]">
                <span className="text-slate-400 block text-[10px] font-sans font-bold">Password Default:</span>
                <span className="text-amber-300 font-bold select-all">{defaultAccounts[selectedRole].pass}</span>
              </div>
            </div>
          </div>

          {/* One-Click Fast Demo Testing */}
          <div className="space-y-2 pt-2 border-t border-slate-800">
            <p className="text-[11px] font-extrabold text-slate-400 text-center uppercase tracking-wider">
              ⚡ Demo Satu-Klik (Uji Coba Langsung Masuk)
            </p>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleQuickOneClickDemo('jemaat')}
                className="py-2 px-2 bg-blue-950/80 hover:bg-blue-900 text-blue-300 border border-blue-800/80 rounded-xl font-bold text-[11px] truncate cursor-pointer transition-colors"
              >
                👤 Jemaat
              </button>
              <button
                type="button"
                onClick={() => handleQuickOneClickDemo('admin_gereja')}
                className="py-2 px-2 bg-amber-950/80 hover:bg-amber-900 text-amber-300 border border-amber-800/80 rounded-xl font-bold text-[11px] truncate cursor-pointer transition-colors"
              >
                ⛪ Admin Gereja
              </button>
              <button
                type="button"
                onClick={() => handleQuickOneClickDemo('super_admin')}
                className="py-2 px-2 bg-purple-950/80 hover:bg-purple-900 text-purple-300 border border-purple-800/80 rounded-xl font-bold text-[11px] truncate cursor-pointer transition-colors"
              >
                👑 Super Admin
              </button>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <p className="text-center text-xs text-slate-500">
          © 2026 CMS Gereja — Multi-Tenant Multi-Gereja Platform. All Rights Reserved.
        </p>
      </div>
    </div>
  );
};
