import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import { Skeleton } from "../ui/skeleton";
import { toast } from "sonner";

function PersonalSettings() {
    const navigate = useNavigate();
    const currentUser = useAuthStore((state) => state.user);
    const token = useAuthStore((state) => state.token);

    const [formData, setFormData] = useState({
        oldPassword: '',
        newPassword: '',
        confirmPassword: '',
        otpCode: ''
    });

    // User google gabisa ganti pass, kita sesuaikan dengan akun mereka saja.
    useEffect(() => {
        if (currentUser && currentUser.is_google_account) {
            toast.error("Akun Google tidak dapat mengubah password di sini.");
            navigate('/settings', { replace: true });
        }
    }, [currentUser, navigate]);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [otpSent, setOtpSent] = useState(false);
    const [isSendingOtp, setIsSendingOtp] = useState(false);

    const handleFormChange = (e) => {
        setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleRequestOtp = async () => {
        try {
            setIsSendingOtp(true);
            const response = await fetch(`${import.meta.env.VITE_BACKEND}/users/password/request-otp`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                }
            });

            const result = await response.json();
            if (!response.ok) throw new Error(result.message || 'Gagal mengirim OTP');

            setOtpSent(true);
            toast.success('Kode OTP berhasil dikirim ke email Anda!');
        } catch (err) {
            toast.error(err.message);
        } finally {
            setIsSendingOtp(false);
        }
    };

    const handleUpdatePassword = async (e) => {
        e.preventDefault();
        
        if (formData.newPassword !== formData.confirmPassword) {
            return toast.error('Konfirmasi password baru tidak cocok');
        }

        if (!formData.otpCode) {
            return toast.error('Silakan minta dan masukkan kode OTP terlebih dahulu');
        }

        try {
            setIsSubmitting(true);
            const response = await fetch(`${import.meta.env.VITE_BACKEND}/users/password/update`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    oldPassword: formData.oldPassword,
                    newPassword: formData.newPassword,
                    otpCode: formData.otpCode
                })
            });

            const result = await response.json();
            if (!response.ok) throw new Error(result.message || 'Gagal memperbarui password');

            toast.success('Password berhasil diperbarui!');
            setFormData({ oldPassword: '', newPassword: '', confirmPassword: '', otpCode: '' });
            setOtpSent(false);
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
                <h1 className="text-xl font-bold text-slate-100">Keamanan Akun</h1>
            </div>

            <form onSubmit={handleUpdatePassword} className="w-full bg-[#182136]/50 border border-white/10 rounded-xl p-5 flex flex-col gap-4">
                <h2 className="text-sm font-semibold text-blue-400 uppercase tracking-wider">Ubah Password</h2>

                <div className="flex flex-col gap-1.5">
                    <label className="text-xs text-slate-400 font-medium">Password Lama</label>
                    <input
                        type="password"
                        name="oldPassword"
                        value={formData.oldPassword}
                        onChange={handleFormChange}
                        className="w-full bg-slate-900/50 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-blue-500/50 transition-colors"
                        required
                    />
                </div>

                <div className="flex flex-col gap-1.5">
                    <label className="text-xs text-slate-400 font-medium">Password Baru</label>
                    <input
                        type="password"
                        name="newPassword"
                        value={formData.newPassword}
                        onChange={handleFormChange}
                        className="w-full bg-slate-900/50 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-blue-500/50 transition-colors"
                        required
                    />
                </div>

                <div className="flex flex-col gap-1.5">
                    <label className="text-xs text-slate-400 font-medium">Konfirmasi Password Baru</label>
                    <input
                        type="password"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleFormChange}
                        className="w-full bg-slate-900/50 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-blue-500/50 transition-colors"
                        required
                    />
                </div>

                <div className="flex flex-col gap-1.5">
                    <label className="text-xs text-slate-400 font-medium">Verifikasi OTP</label>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            name="otpCode"
                            placeholder="Masukkan 6 digit kode"
                            value={formData.otpCode}
                            onChange={handleFormChange}
                            maxLength={6}
                            disabled={!otpSent}
                            className="flex-1 bg-slate-900/50 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-blue-500/50 transition-colors disabled:opacity-50"
                            required
                        />
                        <button
                            type="button"
                            onClick={handleRequestOtp}
                            disabled={isSendingOtp}
                            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-white/10 text-xs font-semibold rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                        >
                            {isSendingOtp ? 'Mengirim...' : otpSent ? 'Kirim Ulang' : 'Minta OTP'}
                        </button>
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={isSubmitting || !otpSent}
                    className="mt-2 w-full sm:w-fit sm:self-end px-5 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-500/30 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                >
                    {isSubmitting ? 'Memproses...' : 'Ubah Password'}
                </button>
            </form>
        </div>
    );
}

export default PersonalSettings;