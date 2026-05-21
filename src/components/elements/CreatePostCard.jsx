import React, { useState, useRef } from 'react';
import { useAuthStore } from '../../store/useAuthStore';
import { convertToBase64 } from '../../utils/base64';
import { toast } from "sonner";

function CreatePostCard({ onPostCreated }) {
    const [content, setContent] = useState('');
    const [loading, setLoading] = useState(false);
    const [media, setMedia] = useState(null);

    const fileInputRef = useRef(null);

    const user = useAuthStore((state) => state.user);
    const token = useAuthStore((state) => state.token);
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

    if (!isAuthenticated) return null;

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const maxSize = 5 * 1024 * 1024; // 5 MB

        if (file.size > maxSize) {
            toast.error("Ukuran file terlalu besar! Maksimal 5 MB.");
            if (fileInputRef.current) fileInputRef.current.value = '';
            return;
        }

        try {
            const base64String = await convertToBase64(file);
            setMedia(base64String);
        } catch (err) {
            toast.error('Gagal memproses file');
        }
    };

    const handleIconButtonClick = () => {
        fileInputRef.current.click();
    };

    const handleRemoveMedia = () => {
        setMedia(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!content.trim() && !media) return;

        setLoading(true);

        try {
            const response = await fetch(`${import.meta.env.VITE_BACKEND}/posts`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    content,
                    media_url: media
                })
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || 'Gagal membuat postingan');
            }

            setContent('');
            setMedia(null);
            if (fileInputRef.current) fileInputRef.current.value = '';

            if (onPostCreated) {
                await onPostCreated();
            }

        } catch (err) {

        } finally {
            setLoading(false);
        }
    };

    const formatTime = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('id-ID', { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className="bg-[#182136]/80 border border-white/10 rounded-2xl p-3.5 shadow-[0_4px_20px_rgba(255,255,255,0.03),0_0_1px_rgba(255,255,255,0.2)] hover:shadow-[0_4px_25px_rgba(255,255,255,0.05),0_0_1px_rgba(255,255,255,0.3)] hover:border-white/20 transition-all duration-300">
            <form onSubmit={handleSubmit} className="flex gap-3">
                <div className="w-9 h-9 shrink-0 rounded-full overflow-hidden border border-white/10 bg-slate-800">
                    <img
                        alt="Avatar"
                        className="w-full h-full object-cover"
                        src={user?.avatar && user.avatar.startsWith('data:image') ? user.avatar : "https://api.dicebear.com/7.x/bottts/svg?seed=" + user?.username}
                    />
                </div>
                <div className="flex-1 flex flex-col gap-2">
                    <input
                        className="w-full bg-transparent border-none text-slate-200 text-[14px] placeholder:text-slate-500 focus:ring-0 p-0 pt-1 outline-none"
                        placeholder="Start a thread..."
                        type="text"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        disabled={loading}
                    />

                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept="image/*"
                        className="hidden"
                    />

                    {media && (
                        <div className="relative mt-2 rounded-xl overflow-hidden border border-white/10 max-h-[250px] bg-slate-900/50 flex justify-center items-center">
                            {media.startsWith("data:video/") || media.match(/\.(mp4|webm|ogg|mov)(\?.*)?$/i) ? (
                                <video
                                    src={media}
                                    controls
                                    className="w-full h-full max-h-[250px] object-contain"
                                />
                            ) : (
                                <img
                                    src={media}
                                    alt="Preview Attachment"
                                    className="w-full h-full object-cover"
                                />
                            )}

                            <button
                                type="button"
                                onClick={handleRemoveMedia}
                                className="absolute top-2 right-2 bg-black/70 hover:bg-black text-white p-1 rounded-full transition-colors z-10"
                            >
                                <span className="material-symbols-outlined text-[16px] block">close</span>
                            </button>
                        </div>
                    )}

                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/10">
                        <div className="flex gap-1">
                            {['image'].map((icon, idx) => (
                                <button
                                    type="button"
                                    key={idx}
                                    onClick={handleIconButtonClick}
                                    className="text-slate-500 hover:text-slate-300 p-1.5 rounded-lg hover:bg-slate-900 transition-colors"
                                >
                                    <span className="material-symbols-outlined text-[18px] block">{icon}</span>
                                </button>
                            ))}
                        </div>
                        <button
                            type="submit"
                            disabled={loading || (!content.trim() && !media)}
                            className="bg-slate-800 hover:bg-slate-700 disabled:bg-slate-900 border border-white/15 text-slate-200 disabled:text-slate-600 font-medium text-[12px] py-1 px-3.5 rounded-lg active:scale-95 transition-all shadow-[0_0_10px_rgba(255,255,255,0.02)]"
                        >
                            {loading ? 'Posting...' : 'Post'}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
}

export default CreatePostCard;