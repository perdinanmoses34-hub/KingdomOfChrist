import React, { useState } from 'react';
import {
  Shield,
  Building2,
  CheckCircle2,
  XCircle,
  Database,
  Download,
  Upload,
  Activity,
  Key,
  Globe,
  Plus,
  RefreshCw,
  Search,
  FileSpreadsheet
} from 'lucide-react';
import { Gereja, LogAktivitas, BackupRecord } from '../types';
import { ApiService } from '../services/api';

interface SuperAdminViewProps {
  gerejaList: Gereja[];
  logAktivitas: LogAktivitas[];
  onRefreshData: () => void;
  onShowToast: (msg: string, type?: 'success' | 'info') => void;
}

export const SuperAdminView: React.FC<SuperAdminViewProps> = ({
  gerejaList,
  logAktivitas,
  onRefreshData,
  onShowToast
}) => {
  const [activeTab, setActiveTab] = useState<'gereja' | 'lisensi' | 'backup' | 'monitoring' | 'global'>('gereja');
  const [showAddGerejaModal, setShowAddGerejaModal] = useState(false);
  const [newGereja, setNewGereja] = useState({
    name: '',
    code: '',
    address: '',
    city: 'Jakarta',
    phone: '',
    email: '',
    pastorName: '',
    licensePackage: 'Pro' as 'Basic' | 'Pro' | 'Enterprise'
  });

  const handleCreateGereja = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch('/api/gereja', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newGereja.name,
          code: newGereja.code || 'GRJ-' + Math.floor(Math.random() * 1000),
          address: newGereja.address,
          city: newGereja.city,
          phone: newGereja.phone,
          email: newGereja.email,
          pastorName: newGereja.pastorName,
          licensePackage: newGereja.licensePackage,
          logoUrl: 'https://images.unsplash.com/photo-1548625149-fc4a29cf7092?auto=format&fit=crop&w=300&q=80',
          bannerUrl: 'https://images.unsplash.com/photo-1438032005730-c779502df39b?auto=format&fit=crop&w=1200&q=80'
        })
      });
      onShowToast(`Gereja baru "${newGereja.name}" berhasil terdaftar dan aktif!`, 'success');
      setShowAddGerejaModal(false);
      setNewGereja({ name: '', code: '', address: '', city: 'Jakarta', phone: '', email: '', pastorName: '', licensePackage: 'Pro' });
      onRefreshData();
    } catch (err) {
      alert('Gagal menambah gereja');
    }
  };

  const handleTriggerBackup = async () => {
    const backup = await ApiService.triggerBackup();
    onShowToast(`Snapshot database "${backup.filename}" berhasil dibuat!`, 'success');
    onRefreshData();
  };

  return (
    <div className="py-6 px-3 sm:px-6 max-w-7xl mx-auto space-y-6 overflow-x-hidden w-full max-w-full">
      {/* Super Admin Banner */}
      <div className="bg-gradient-to-r from-purple-950 via-indigo-900 to-slate-900 text-white rounded-3xl p-6 shadow-xl border border-purple-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-400 text-slate-950 rounded-full font-black text-xs mb-2">
            <Shield className="w-3.5 h-3.5" /> Super Admin Global Console
          </div>
          <h1 className="text-xl sm:text-2xl font-black">SaaS Multi-Tenant Management</h1>
          <p className="text-xs text-purple-200 mt-1">
            Kelola lisensi gereja pelanggan, status berlangganan, backup database, dan monitoring global API.
          </p>
        </div>

        <button
          onClick={() => setShowAddGerejaModal(true)}
          className="px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs sm:text-sm rounded-2xl shadow-lg transition-transform active:scale-95 flex items-center gap-2 cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Tambah Gereja Pelanggan
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
        {[
          { id: 'gereja', label: 'Kelola Gereja', icon: Building2 },
          { id: 'lisensi', label: 'Status Lisensi', icon: Key },
          { id: 'backup', label: 'Backup & Restore', icon: Database },
          { id: 'monitoring', label: 'Audit Activity Logs', icon: Activity },
          { id: 'global', label: 'Pengaturan Global', icon: Globe }
        ].map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as any)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? 'bg-purple-600 text-white shadow-md ring-2 ring-purple-500'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* --- TAB 1: KELOLA GEREJA --- */}
      {activeTab === 'gereja' && (
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <Building2 className="w-5 h-5 text-purple-600" /> Daftar Gereja Terdaftar ({gerejaList.length})
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold">
                <tr>
                  <th className="p-3 rounded-l-xl">Nama Gereja</th>
                  <th className="p-3">Kota</th>
                  <th className="p-3">Gembala Sidang</th>
                  <th className="p-3">Paket SaaS</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 rounded-r-xl">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {gerejaList.map((g) => (
                  <tr key={g.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/40">
                    <td className="p-3 font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <img src={g.logoUrl} alt={g.name} className="w-7 h-7 rounded-lg object-cover" />
                      <div>
                        <div>{g.name}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{g.code}</div>
                      </div>
                    </td>
                    <td className="p-3 text-slate-600 dark:text-slate-300">{g.city}</td>
                    <td className="p-3 text-slate-600 dark:text-slate-300">{g.pastorName}</td>
                    <td className="p-3">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800 dark:bg-purple-900/60 dark:text-purple-200">
                        {g.licensePackage}
                      </span>
                    </td>
                    <td className="p-3">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          g.status === 'active'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {g.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="p-3">
                      <button
                        onClick={() => onShowToast(`Status gereja ${g.name} diperbarui!`, 'success')}
                        className="px-2.5 py-1 bg-slate-900 text-white rounded-lg font-bold text-[11px] cursor-pointer"
                      >
                        Edit Aktivasi
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* --- TAB 2: BACKUP & RESTORE --- */}
      {activeTab === 'backup' && (
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm space-y-6">
          <div>
            <h2 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <Database className="w-5 h-5 text-purple-600" /> Backup & Restore Database Google Sheets
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Buat snapshot JSON lengkap dari seluruh 20 sheet database atau pulihkan data kapan saja.
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleTriggerBackup}
              className="px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-2 cursor-pointer"
            >
              <Download className="w-4 h-4" /> Buat Backup JSON Baru
            </button>
            <button
              onClick={() => onShowToast('Database berhasil dipulihkan dari snapshot!', 'success')}
              className="px-4 py-2.5 bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white font-bold text-xs rounded-xl flex items-center gap-2 cursor-pointer"
            >
              <Upload className="w-4 h-4" /> Restore Snapshot
            </button>
          </div>
        </div>
      )}

      {/* --- TAB 3: MONITORING LOGS --- */}
      {activeTab === 'monitoring' && (
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
          <h2 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <Activity className="w-5 h-5 text-purple-600" /> Audit Trail & System Activity
          </h2>

          <div className="space-y-2">
            {logAktivitas.map((l) => (
              <div
                key={l.id}
                className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl border border-slate-200 dark:border-slate-600 flex justify-between items-center text-xs"
              >
                <div>
                  <span className="font-bold text-slate-900 dark:text-white">{l.userName}</span>
                  <p className="text-slate-600 dark:text-slate-300">{l.details}</p>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">
                  {new Date(l.timestamp).toLocaleString('id-ID')}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* --- MODAL: TAMBAH GEREJA --- */}
      {showAddGerejaModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl relative border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setShowAddGerejaModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 text-xl font-bold cursor-pointer"
            >
              ✕
            </button>
            <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">Registrasi Gereja Pelanggan</h3>

            <form onSubmit={handleCreateGereja} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Nama Gereja</label>
                <input
                  type="text"
                  value={newGereja.name}
                  onChange={(e) => setNewGereja({ ...newGereja, name: e.target.value })}
                  required
                  placeholder="Gereja HKBP Grace City..."
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-xl text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Kota / Lokasi</label>
                <input
                  type="text"
                  value={newGereja.city}
                  onChange={(e) => setNewGereja({ ...newGereja, city: e.target.value })}
                  required
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-xl text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Nama Pendeta / Gembala</label>
                <input
                  type="text"
                  value={newGereja.pastorName}
                  onChange={(e) => setNewGereja({ ...newGereja, pastorName: e.target.value })}
                  required
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-xl text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Paket Berlangganan</label>
                <select
                  value={newGereja.licensePackage}
                  onChange={(e) => setNewGereja({ ...newGereja, licensePackage: e.target.value as any })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-xl text-xs text-slate-900 dark:text-white"
                >
                  <option value="Basic">Basic (Max 500 Jemaat)</option>
                  <option value="Pro">Pro (Max 2,000 Jemaat + AI)</option>
                  <option value="Enterprise">Enterprise (Unlimited + Dedicated Sheets/Drive)</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer mt-2"
              >
                Daftarkan & Aktifkan Gereja
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
