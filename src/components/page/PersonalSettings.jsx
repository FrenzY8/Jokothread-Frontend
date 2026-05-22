import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import { Skeleton } from "../ui/skeleton";
import { toast } from "sonner";

function PersonalSettings() {
    const navigate = useNavigate();
    const updateUser = useAuthStore((state) => state.updateUser);
    const currentUser = useAuthStore((state) => state.user);
    const token = useAuthStore((state) => state.token);

    const [formData, setFormData] = useState({
        name: '',
        username: '',
        bio: '',
        avatar: ''
    });

    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (currentUser) {
            setFormData({
                name: currentUser.name || '',
                username: currentUser.username || '',
                bio: currentUser.bio || '',
                avatar: currentUser.avatar || ''
            });
        }
    }, [currentUser]);

    const handleFormChange = (e) => {
        let value = e.target.value;

        if (e.target.name === 'username') {
            value = value
                .toLowerCase()
                .replace(/\s+/g, '')
                .replace(/[^a-z0-9_]/g, '');
        }

        setFormData((prev) => ({
            ...prev,
            [e.target.name]: value
        }));
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        try {
            setIsSubmitting(true);
            const response = await fetch(`${import.meta.env.VITE_BACKEND}/users/${currentUser.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || 'Gagal memperbarui profil');
            }

            updateUser(result.user);
            toast.success('Profil berhasil diperbarui!');
        } catch (err) {
            toast.error(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!currentUser) {
        return (
            <div className="w-full max-w-[580px] mx-auto px-4 pt-4 pb-24 space-y-4">
                <Skeleton className="h-10 w-20 bg-slate-700/50 rounded-lg" />
                <Skeleton className="h-72 w-full bg-slate-700/50 rounded-xl" />
            </div>
        );
    }

    return (
        <div className="w-full max-w-[580px] mx-auto px-4 pt-4 pb-24 flex flex-col gap-4">
            <div className="flex items-center gap-3">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center justify-center p-2 border border-white/10 bg-[#182136]/30 hover:bg-white/5 text-slate-300 rounded-lg transition-colors cursor-pointer"
                    title="Kembali"
                >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="19" y1="12" x2="5" y2="12"></line>
                        <polyline points="12 19 5 12 12 5"></polyline>
                    </svg>
                </button>
                <h1 className="text-xl font-bold text-slate-100">Pengaturan Akun</h1>
            </div>

            <form onSubmit={handleUpdateProfile} className="w-full bg-[#182136]/50 border border-white/10 rounded-xl p-5 flex flex-col gap-4">
                <h2 className="text-sm font-semibold text-blue-400 uppercase tracking-wider">Informasi Pribadi</h2>

                <div className="flex flex-col gap-1.5">
                    <label className="text-xs text-slate-400 font-medium">Nama Lengkap</label>
                    <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleFormChange}
                        className="w-full bg-slate-900/50 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-blue-500/50 transition-colors"
                        required
                    />
                </div>

                <div className="flex flex-col gap-1.5">
                    <label className="text-xs text-slate-400 font-medium">Username</label>
                    <input
                        type="text"
                        name="username"
                        value={formData.username}
                        onChange={handleFormChange}
                        className="w-full bg-slate-900/50 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-blue-500/50 transition-colors"
                        required
                    />
                </div>

                <div className="flex flex-col gap-1.5">
                    <label className="text-xs text-slate-400 font-medium">Bio</label>
                    <textarea
                        name="bio"
                        value={formData.bio}
                        onChange={handleFormChange}
                        rows="3"
                        placeholder="Tulis bio singkat kamu..."
                        className="w-full bg-slate-900/50 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-blue-500/50 transition-colors resize-none"
                    />
                </div>

                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="mt-2 w-full sm:w-fit sm:self-end px-5 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-500/50 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                >
                    {isSubmitting ? 'Menyimpan...' : 'Simpan Perubahan'}
                </button>
            </form>
        </div>
    );
}

export default PersonalSettings;