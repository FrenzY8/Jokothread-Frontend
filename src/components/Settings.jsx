import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { convertToBase64 } from '../utils/base64';
import { toast } from "sonner"

function Settings() {
    const checkAuth = useAuthStore((state) => state.checkAuth);
    const user = useAuthStore((state) => state.user);
    const token = useAuthStore((state) => state.token);
    const [isPrivate, setIsPrivate] = useState(user?.is_private || false)
    const [savingPrivacy, setSavingPrivacy] = useState(false)
    const navigate = useNavigate();
    const logout = useAuthStore((state) => state.logout);
    const updateUserState = useAuthStore((state) => state.updateUser);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef(null);

    useEffect(() => {
        checkAuth();
    }, [checkAuth]);

    const handleAvatarChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        try {
            const base64Avatar = await convertToBase64(file);

            const response = await fetch(`${import.meta.env.VITE_BACKEND}/users/${user.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    avatar: base64Avatar
                })
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || 'Gagal mengupdate avatar');
            }

            updateUserState(result.user);
            toast.success("Foto profil berhasil diperbarui.");
        } catch (err) {
            toast.error(err.message || 'Gagal mengupdate avatar');
        } finally {
            setUploading(false);
        }
    };

    const handleTogglePrivacy = async () => {
        const newValue = !isPrivate;

        setIsPrivate(newValue);
        setSavingPrivacy(true);

        try {
            const response = await fetch(
                `${import.meta.env.VITE_BACKEND}/users/privacy`,
                {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        is_private: newValue
                    })
                }
            );

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || 'Gagal update privacy');
            }

            updateUserState(result.user);

            toast.success(newValue ? 'Akun sekarang private' : 'Akun sekarang public');

        } catch (err) {
            setIsPrivate(!newValue);
            toast.error(err.message);
        } finally {
            setSavingPrivacy(false);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/login', { replace: true });
    };

    return (
        <div className="w-full max-w-[580px] mx-auto px-4 py-4 flex flex-col gap-3">
            <div className="max-w-[600px] mx-auto w-full px-container-margin-mobile md:px-0 pt-stack-md flex flex-col gap-5 pb-32">

                <div className="relative w-full rounded-2xl overflow-hidden border border-white/10 shadow-[0px_10px_40px_rgba(0,0,0,0.3)] group bg-[#161d30]/60 backdrop-blur-md">
                    <div
                        className="absolute inset-0 z-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                        data-alt="A deeply blurred, abstract background image featuring soft, glowing orbs of violet and deep indigo light."
                        style={{
                            backgroundImage:
                                'url("https://lh3.googleusercontent.com/aida-public/AB6AXuBXW5MCFGcxlT8LI6r0fGhT855D99CK4kWErktQNLWRoRlHO3cc59rsYwu88xnYVaJOcCjqF-fb3rEDIBDkUJ2hjgyzi4G8J0R1nJzKq2LtzL2DLw9pOuracg1unWzT1J4UdnXT6hr0DmjArFj5W5kd09uqNZIaUzdG1zNowH0f8k-rSpteYDrCJ_WkzsPnPhtjVNgS-EhMCib4ONB6oANY3JyrQKyotlHBhp7BkZ1BJWGy8Ov2hpCrykzUdlWfVUSELncBUv9FZ2CP")'
                        }}
                    >
                        <div className="absolute inset-0 bg-background/40 backdrop-blur-[10px]" />
                    </div>

                    <div className="relative z-10 flex flex-col items-center justify-center p-stack-lg pt-12 pb-10">
                        <div className="relative mb-stack-md group-hover:scale-105 transition-transform duration-500">
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleAvatarChange}
                                accept="image/*"
                                className="hidden"
                                disabled={uploading}
                            />

                            <div
                                onClick={() => fileInputRef.current?.click()}
                                disabled={uploading}
                                className={`w-28 h-28 md:w-32 md:h-32 rounded-full overflow-hidden border-[3px] border-white/20 shadow-[0_0_30px_rgba(192,193,255,0.4)] relative z-10 ${uploading ? 'opacity-50' : ''}`}>
                                <img
                                    alt="Profile avatar"
                                    className="w-full h-full object-cover"
                                    src={user?.avatar && user.avatar.startsWith('data:image')
                                        ? user.avatar
                                        : "https://api.dicebear.com/7.x/bottts/svg?seed=guest"
                                    }
                                />
                            </div>
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                disabled={uploading}
                                className="absolute bottom-0 right-0 z-20 bg-surface/80 backdrop-blur-md border border-white/20 rounded-full w-10 h-10 flex items-center justify-center text-on-surface hover:bg-white/10 transition-colors shadow-lg active:scale-95"
                            >
                                <span className="material-symbols-outlined text-[18px]">
                                    {uploading ? 'sync' : 'photo_camera'}
                                </span>
                            </button>
                        </div>
                        <h1 className="font-display font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-surface mb-1">
                            {user?.name || 'Guest User'}
                        </h1>
                        <p className="font-body-md text-body-md text-primary-fixed-dim">
                            @{user?.username || 'Guest User'}
                        </p>
                    </div>
                </div>

                <div className="flex flex-col gap-5">
                    <section className="flex flex-col gap-2">
                        <h2 className="font-display font-label-lg text-label-lg text-on-surface-variant pl-4">
                            Account
                        </h2>
                        <div className="bg-[#161d30]/40 backdrop-blur-[20px] border border-white/10 rounded-2xl shadow-[0px_10px_40px_rgba(0,0,0,0.2)] overflow-hidden flex flex-col">
                            <button
                                onClick={() => navigate('/personal-settings')}
                                className="w-full flex items-center justify-between p-4 border-b border-white/5 hover:bg-white/[0.04] transition-colors group cursor-pointer"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center border border-white/5 text-primary group-hover:bg-primary/20 transition-colors">
                                        <span className="material-symbols-outlined">
                                            person
                                        </span>
                                    </div>

                                    <span className="font-body-md text-body-md text-on-surface">
                                        Personal Information
                                    </span>
                                </div>

                                <span className="material-symbols-outlined text-on-surface-variant">
                                    chevron_right
                                </span>
                            </button>
                            {user?.is_google_account ? (
                                <div className="w-full flex items-center justify-between p-4 opacity-60 cursor-not-allowed">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center border border-white/5 text-slate-500">
                                            <span className="material-symbols-outlined">
                                                lock
                                            </span>
                                        </div>

                                        <div className="flex flex-col items-start">
                                            <span className="font-body-md text-body-md text-on-surface">
                                                Password & Security
                                            </span>

                                            <span className="text-[11px] text-slate-500">
                                                Login Google tidak memiliki password
                                            </span>
                                        </div>
                                    </div>

                                    <span className="material-symbols-outlined text-slate-600">
                                        block
                                    </span>
                                </div>
                            ) : (
                                <button onClick={() => navigate('/security-settings')} className="w-full flex items-center justify-between p-4 hover:bg-white/[0.04] transition-colors group">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center border border-white/5 text-primary group-hover:bg-primary/20 transition-colors">
                                            <span className="material-symbols-outlined">
                                                shield_person
                                            </span>
                                        </div>

                                        <span className="font-body-md text-body-md text-on-surface">
                                            Password &amp; Security
                                        </span>
                                    </div>

                                    <span className="material-symbols-outlined text-on-surface-variant">
                                        chevron_right
                                    </span>
                                </button>
                            )}
                        </div>
                    </section>

                    <section className="flex flex-col gap-2">
                        <h2 className="font-display font-label-lg text-label-lg text-on-surface-variant pl-4">
                            Privacy
                        </h2>

                        <div className="bg-[#161d30]/40 backdrop-blur-[20px] border border-white/10 rounded-2xl shadow-[0px_10px_40px_rgba(0,0,0,0.2)] overflow-hidden flex flex-col">
                            <div className="w-full flex items-center justify-between p-4 border-b border-white/5 hover:bg-white/[0.04] transition-colors">
                                <div className="flex flex-col gap-1 items-start">
                                    <span className="font-body-md text-body-md text-on-surface">
                                        Private Account
                                    </span>
                                    <span className="font-body-md text-label-sm text-on-surface-variant text-sm">
                                        Hanya pengikut yang disetujui yang dapat melihat postingan Anda.
                                    </span>
                                </div>
                                <button
                                    disabled={savingPrivacy}
                                    onClick={handleTogglePrivacy}
                                    className={`relative w-11 h-6 rounded-full border transition-all duration-300 flex items-center px-0.5 shadow-[inset_0_1px_4px_rgba(0,0,0,0.4)] cursor-pointer disabled:opacity-50 ${isPrivate
                                        ? 'bg-primary/20 border-primary/50'
                                        : 'bg-white/10 border-white/10'
                                        }`}
                                >
                                    <div
                                        className={`w-4 h-4 rounded-full shadow-md transition-all duration-300 transform ${isPrivate
                                            ? 'translate-x-5.5 bg-primary-fixed'
                                            : 'translate-x-0 bg-slate-400'
                                            }`}
                                    />
                                </button>
                            </div>

                            <Link to="/blocked" className="w-full flex items-center justify-between p-4 hover:bg-white/[0.04] transition-colors group">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center border border-white/5 text-primary group-hover:bg-primary/20 transition-colors">
                                        <span className="material-symbols-outlined">block</span>
                                    </div>
                                    <span className="font-body-md text-body-md text-on-surface">
                                        Blocked Accounts
                                    </span>
                                </div>
                                <span className="material-symbols-outlined text-on-surface-variant">
                                    chevron_right
                                </span>
                            </Link>
                        </div>
                    </section>

                    <div className="flex items-center justify-between pl-4 pr-2">
                        <h2 className="font-display font-label-lg text-label-lg text-on-surface-variant">
                            Account
                        </h2>
                        {user?.is_google_account && (
                            <div className="flex items-center gap-1.5 bg-sky-500/10 border border-sky-500/20 px-2.5 py-1 rounded-full">
                                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                                </svg>
                                <span className="text-[11px] font-medium text-sky-400 flex items-center gap-1">
                                    Terhubung
                                    <span className="material-symbols-outlined text-[14px] text-sky-400 font-bold">check</span>
                                </span>
                            </div>
                        )}
                    </div>

                    <section className="mt-2">
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center justify-center gap-2 p-4 bg-error-container/20 border border-error-container/30 backdrop-blur-md rounded-2xl hover:bg-error-container/30 transition-colors text-error shadow-lg"
                        >
                            <span className="material-symbols-outlined">logout</span>
                            <span className="font-display font-label-lg text-label-lg">
                                Log Out
                            </span>
                        </button>
                    </section>

                </div>
            </div>
        </div>
    )
}

export default Settings