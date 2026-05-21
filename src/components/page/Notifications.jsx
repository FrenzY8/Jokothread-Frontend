import { useEffect, useState } from 'react';
import { Skeleton } from "../ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { useAuthStore } from '../../store/useAuthStore';
import { toast } from "sonner";

function Notifications() {
    const token = useAuthStore((state) => state.token);
    const [notifications, setNotifications] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchNotifications = async () => {
        try {
            setIsLoading(true);
            const response = await fetch(`${import.meta.env.VITE_BACKEND}/notifications`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                }
            });

            const result = await response.json();
            if (!response.ok) throw new Error(result.message || 'Gagal mengambil notifikasi');

            setNotifications(result.data);
        } catch (err) {
            setError(err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (token) fetchNotifications();
    }, [token]);

    const handleMarkAsRead = async (id) => {
        try {
            setNotifications(prev =>
                prev.map(n => n.id === id ? { ...n, is_read: true } : n)
            );

            const response = await fetch(`${import.meta.env.VITE_BACKEND}/notifications/${id}/read`, {
                method: 'PATCH',
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            if (!response.ok) throw new Error('Gagal memperbarui status');
        } catch (err) {
            toast.error(err.message);
            fetchNotifications();
        }
    };

    return (
        <div className="w-full max-w-[580px] mx-auto px-4 pt-4 pb-24 flex flex-col gap-3">
            <div className="flex justify-between items-center mb-1">
                <h1 className="text-xl font-bold text-slate-100">Notifikasi</h1>
            </div>

            {isLoading && (
                <div className="space-y-3 w-full">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="bg-[#182136]/50 border border-white/10 rounded-2xl p-4 flex items-center gap-3">
                            <Skeleton className="h-9 w-9 rounded-full bg-slate-700/50" />
                            <div className="space-y-1.5 flex-1">
                                <Skeleton className="h-4 w-1/3 bg-slate-700/50" />
                                <Skeleton className="h-3 w-3/4 bg-slate-700/50" />
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {error && (
                <Alert variant="destructive" className="flex items-start gap-3 rounded-2xl border border-rose-500/30 bg-rose-950/20 p-4 text-rose-400">
                    <span className="material-symbols-outlined mt-0.5 text-[20px]">error</span>
                    <div className="flex-1">
                        <AlertTitle className="font-semibold leading-none">Gagal Memuat Notifikasi</AlertTitle>
                        <AlertDescription className="mt-1 text-sm leading-relaxed text-rose-400/80">{error.message}</AlertDescription>
                    </div>
                </Alert>
            )}

            {!isLoading && notifications.length === 0 && (
                <div className="bg-[#182136]/20 border border-white/5 rounded-2xl p-12 text-center flex flex-col items-center gap-2">
                    <span className="material-symbols-outlined text-slate-600 text-[40px]">notifications_off</span>
                    <p className="text-slate-500 text-sm">Kotak masuk kamu masih bersih sunyi.</p>
                </div>
            )}

            {notifications.map((notif) => (
                <div
                    key={notif.id}
                    onClick={() => !notif.is_read && handleMarkAsRead(notif.id)}
                    className={`border rounded-2xl p-4 flex items-start gap-4 transition-all duration-200 cursor-pointer
                        ${notif.is_read 
                            ? 'bg-[#182136]/30 border-white/5 opacity-70' 
                            : 'bg-[#182136]/80 border-blue-500/30 hover:border-blue-500/50 shadow-md shadow-blue-500/5'
                        }`}
                >
                    <div className={`p-2 rounded-xl flex items-center justify-center 
                        ${notif.is_read ? 'bg-slate-800/50 text-slate-400' : 'bg-blue-500/10 text-blue-400'}`}>
                        <span className="material-symbols-outlined text-[20px]">
                            {notif.icon || 'notifications'}
                        </span>
                    </div>

                    <div className="flex-1 space-y-0.5">
                        <div className="flex justify-between items-start gap-2">
                            <h3 className={`text-sm font-semibold ${notif.is_read ? 'text-slate-400' : 'text-slate-200'}`}>
                                {notif.title}
                            </h3>
                            {!notif.is_read && (
                                <span className="h-2 w-2 rounded-full bg-blue-500 animate-pulse mt-1" />
                            )}
                        </div>
                        <p className={`text-[13px] leading-relaxed ${notif.is_read ? 'text-slate-500' : 'text-slate-300'}`}>
                            {notif.message}
                        </p>
                    </div>
                </div>
            ))}
        </div>
    );
}

export default Notifications;