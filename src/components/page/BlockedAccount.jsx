import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import { Skeleton } from "../ui/skeleton";
import { toast } from "sonner";

function BlockedAccount() {
    const [blockedUsers, setBlockedUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const token = useAuthStore((state) => state.token);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchBlockedUsers = async () => {
            try {
                setIsLoading(true);
                const response = await fetch(`${import.meta.env.VITE_BACKEND}/users/blocked-list`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                });

                const result = await response.json();
                if (!response.ok) throw new Error(result.message || 'Gagal memuat daftar blokir');

                setBlockedUsers(result.data || []);
            } catch (err) {
                console.error(err);
                toast.error(err.message);
            } finally {
                setIsLoading(false);
            }
        };

        if (token) fetchBlockedUsers();
    }, [token]);

    const handleUnblock = async (userId) => {
        try {
            const response = await fetch(`${import.meta.env.VITE_BACKEND}/users/${userId}/block`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            const result = await response.json();
            if (!response.ok) throw new Error(result.message || 'Gagal membuka blokir');

            toast.success('Berhasil membuka blokir pengguna');
            
            setBlockedUsers(prev => prev.filter(user => user.id !== userId));
        } catch (err) {
            toast.error(err.message);
        }
    };

    return (
        <div className="w-full max-w-[580px] mx-auto px-4 pt-4 pb-24 flex flex-col gap-4">
            <div className="flex flex-col gap-1 border-b border-white/10 pb-4">
                <h1 className="text-xl font-bold text-slate-100">Akun yang Diblokir</h1>
                <p className="text-xs text-slate-400">Daftar pengguna yang telah Anda blokir. Mereka tidak dapat melihat profil atau thread Anda.</p>
            </div>

            {isLoading ? (
                <div className="flex flex-col gap-3">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="w-full bg-[#182136]/50 border border-white/10 rounded-2xl p-4 flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <Skeleton className="h-10 w-10 rounded-full bg-slate-700/50" />
                                <div className="space-y-1.5">
                                    <Skeleton className="h-4 w-28 bg-slate-700/50" />
                                    <Skeleton className="h-3 w-20 bg-slate-700/50" />
                                </div>
                            </div>
                            <Skeleton className="h-8 w-20 rounded-full bg-slate-700/50" />
                        </div>
                    ))}
                </div>
            ) : blockedUsers.length === 0 ? (
                <div className="w-full bg-[#182136]/30 border border-white/10 rounded-2xl p-12 flex flex-col items-center justify-center gap-2 mt-2">
                    <span className="material-symbols-outlined text-[40px] text-slate-600">
                        no_accounts
                    </span>
                    <p className="text-sm text-slate-400 text-center mt-1">
                        Tidak ada pengguna yang sedang diblokir.
                    </p>
                </div>
            ) : (
                <div className="flex flex-col gap-2">
                    {blockedUsers.map((user) => (
                        <div 
                            key={user.id} 
                            className="w-full bg-[#182136]/40 border border-white/5 hover:border-white/10 rounded-2xl p-4 flex justify-between items-center transition-all"
                        >
                            <div 
                                className="flex items-center gap-3 cursor-pointer group"
                                onClick={() => navigate(`/profile/${user.id}`)}
                            >
                                <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-800 border border-white/10">
                                    <img 
                                        src={user.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.username}`} 
                                        alt={user.name} 
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-sm font-semibold text-slate-200 group-hover:text-blue-400 transition-colors">
                                        {user.name}
                                    </span>
                                    <span className="text-xs text-slate-400">@{user.username}</span>
                                </div>
                            </div>

                            <button
                                onClick={() => handleUnblock(user.id)}
                                className="px-4 py-1 text-xs font-semibold text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/10 rounded-full transition-colors cursor-pointer"
                            >
                                Buka Blokir
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default BlockedAccount;