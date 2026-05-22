import React, { useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../../store/useAuthStore';
import PostCard from '../elements/PostCard';
import { convertToBase64 } from '../../utils/base64';
import { Skeleton } from '../ui/skeleton';
import { toast } from 'sonner';

function ThreadDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const user = useAuthStore((state) => state.user);
    const token = useAuthStore((state) => state.token);

    const [replyContent, setReplyContent] = useState('');
    const [replyMedia, setReplyMedia] = useState(null);
    const [replyMediaPreview, setReplyMediaPreview] = useState(null);

    const [isSubmitting, setIsSubmitting] = useState(false);

    const replyFileInputRef = useRef(null);

    const formatTime = (dateString) => {
        const date = new Date(dateString);

        return date.toLocaleDateString('id-ID', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const { data: post, isLoading: isPostLoading, error: postError } = useQuery({
        queryKey: ['post', id],

        queryFn: async () => {
            const response = await fetch(
                `${import.meta.env.VITE_BACKEND}/posts/${id}`
            );

            const result = await response.json();

            if (!response.ok) {
                throw new Error(
                    result.message || 'Gagal mengambil postingan'
                );
            }

            return result.data;
        },

        enabled: !!id
    });

    const { data: replies = [], isLoading: isRepliesLoading } = useQuery({
        queryKey: ['replies', id],

        queryFn: async () => {
            const response = await fetch(
                `${import.meta.env.VITE_BACKEND}/posts/${id}/replies`
            );

            const result = await response.json();

            if (!response.ok) {
                throw new Error(
                    result.message || 'Gagal mengambil komentar'
                );
            }

            return result.data || [];
        },

        enabled: !!id
    });

    const handleMediaChange = (e) => {
        const file = e.target.files[0];

        if (!file) return;

        setReplyMedia(file);
        setReplyMediaPreview(URL.createObjectURL(file));
    };

    const handleRemoveMedia = () => {
        setReplyMedia(null);
        setReplyMediaPreview(null);

        if (replyFileInputRef.current) {
            replyFileInputRef.current.value = '';
        }
    };

    const handleSubmitReply = async () => {
        if (!user?.id) {
            return toast.error('Anda harus login terlebih dahulu');
        }

        if (!replyContent.trim() && !replyMedia) return;

        setIsSubmitting(true);

        try {
            let mediaUrlResult = null;

            if (replyMedia) {
                mediaUrlResult = await convertToBase64(replyMedia);
            }

            const response = await fetch(
                `${import.meta.env.VITE_BACKEND}/posts/${id}/replies`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        content: replyContent.trim(),
                        media_url: mediaUrlResult
                    })
                }
            );

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || 'Gagal mengirim komentar');
            }

            setReplyContent('');
            handleRemoveMedia();

            queryClient.invalidateQueries({
                queryKey: ['replies', id]
            });

        } catch (err) {
            toast.error(err.message || 'Gagal mengirim komentar');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isPostLoading) {
        return (
            <div className="max-w-2xl mx-auto min-h-screen pb-32 px-4">

                <div className="sticky top-0 z-10 bg-transparent px-2 py-2 flex items-center">
                    <Skeleton className="w-9 h-9 rounded-full bg-slate-700/40" />
                </div>

                <div className="p-4 border-b border-white/10 space-y-4">

                    <div className="flex gap-3">
                        <Skeleton className="w-10 h-10 rounded-full bg-slate-700/40" />

                        <div className="flex-1 space-y-2">
                            <Skeleton className="h-4 w-32 bg-slate-700/40" />
                            <Skeleton className="h-3 w-24 bg-slate-700/40" />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Skeleton className="h-4 w-full bg-slate-700/40" />
                        <Skeleton className="h-4 w-[90%] bg-slate-700/40" />
                        <Skeleton className="h-4 w-[70%] bg-slate-700/40" />
                    </div>

                    <Skeleton className="w-full h-[240px] rounded-2xl bg-slate-700/30" />
                </div>

                <div className="space-y-5 p-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="flex gap-3">
                            <Skeleton className="w-8 h-8 rounded-full bg-slate-700/40" />

                            <div className="flex-1 space-y-2">
                                <Skeleton className="h-3 w-24 bg-slate-700/40" />
                                <Skeleton className="h-3 w-full bg-slate-700/40" />
                                <Skeleton className="h-3 w-[85%] bg-slate-700/40" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (postError || !post) {
        return (
            <div className="p-6 text-center text-rose-400">
                Thread tidak ditemukan.
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto min-h-screen pb-32 px-4 overflow-visible">

            <div className="sticky top-0 z-10 bg-transparent px-2 py-2 flex items-center justify-start">
                <button
                    onClick={() => navigate(-1)}
                    className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                >
                    <span className="material-symbols-outlined block text-[22px]">
                        arrow_back
                    </span>
                </button>
            </div>

            <div className="p-4 border-b border-white/10">
                <PostCard post={post} setPosts={() => { }} />
            </div>

            <div className="p-4 border-b border-white/5 flex gap-3">
                <div className="w-9 h-9 shrink-0 rounded-full overflow-hidden border border-white/10 bg-slate-800">
                    <img
                        alt="My Profile"
                        className="w-full h-full object-cover"
                        src={
                            user?.avatar ||
                            `https://api.dicebear.com/7.x/bottts/svg?seed=${user?.username}`
                        }
                    />
                </div>

                <div className="flex-1 flex flex-col gap-2">

                    <textarea
                        value={replyContent}
                        onChange={(e) => setReplyContent(e.target.value)}
                        placeholder="Post your reply"
                        rows={2}
                        className="w-full bg-transparent text-[15px] text-slate-200 placeholder-slate-500 focus:outline-none resize-none py-1 leading-relaxed"
                    />

                    {replyMediaPreview && (
                        <div className="relative mt-1 max-w-[260px] rounded-xl overflow-hidden border border-white/10 bg-slate-950/40">
                            <img
                                src={replyMediaPreview}
                                alt="Preview"
                                className="w-full h-auto max-h-[200px] object-cover"
                            />

                            <button
                                type="button"
                                onClick={handleRemoveMedia}
                                className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/70 hover:bg-black/90 text-white flex items-center justify-center cursor-pointer transition-colors"
                            >
                                <span className="material-symbols-outlined text-[14px]">
                                    close
                                </span>
                            </button>
                        </div>
                    )}

                    <div className="flex justify-between items-center border-t border-white/5 pt-2 mt-1">

                        <div>
                            <input
                                type="file"
                                ref={replyFileInputRef}
                                onChange={handleMediaChange}
                                accept="image/*"
                                className="hidden"
                            />

                            <button
                                type="button"
                                onClick={() => replyFileInputRef.current?.click()}
                                className="text-blue-400 hover:bg-blue-500/10 p-2 rounded-full transition-colors cursor-pointer flex items-center justify-center"
                            >
                                <span className="material-symbols-outlined text-[20px]">
                                    image
                                </span>
                            </button>
                        </div>

                        <button
                            onClick={handleSubmitReply}
                            disabled={(!replyContent.trim() && !replyMedia) || isSubmitting}
                            className="px-5 py-1.5 bg-blue-500 hover:bg-blue-600 disabled:opacity-40 disabled:hover:bg-blue-500 text-white font-semibold text-[13px] rounded-full transition-colors cursor-pointer"
                        >
                            {isSubmitting ? 'Replying...' : 'Reply'}
                        </button>
                    </div>
                </div>
            </div>

            <div className="divide-y divide-white/5">

                {isRepliesLoading ? (
                    <div className="space-y-0 divide-y divide-white/5 w-full">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="p-4 pb-6 flex gap-3 animate-pulse">
                                <Skeleton className="w-8 h-8 rounded-full bg-slate-700/40 shrink-0" />

                                <div className="flex-1 flex flex-col gap-2 min-w-0">
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center gap-1.5 w-1/2">
                                            <Skeleton className="h-4 w-1/3 bg-slate-700/40 rounded" />
                                            <Skeleton className="h-3 w-1/4 bg-slate-700/30 rounded" />
                                        </div>
                                        <Skeleton className="h-3 w-10 bg-slate-700/30 rounded" />
                                    </div>

                                    {/* Content Text Skeleton */}
                                    <div className="space-y-1.5 pt-1">
                                        <Skeleton className="h-3.5 w-full bg-slate-700/40 rounded" />
                                        <Skeleton className="h-3.5 w-4/5 bg-slate-700/40 rounded" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : replies.length === 0 ? (
                    <div className="p-8 text-center text-slate-500 text-sm">
                        Belum ada komentar. Jadilah yang pertama!
                    </div>
                ) : (
                    replies.map((comment) => (
                        <div
                            key={comment.id}
                            className="p-4 pb-6 flex gap-3 hover:bg-white/[0.01] transition-colors"
                        >
                            <div className="w-8 h-8 shrink-0 rounded-full overflow-hidden border border-white/10 bg-slate-800">
                                <img
                                    alt={comment.users?.name}
                                    className="w-full h-full object-cover"
                                    src={
                                        comment.avatar ||
                                        `https://api.dicebear.com/7.x/bottts/svg?seed=${comment.users?.username}`
                                    }
                                />
                            </div>

                            <div className="flex-1 flex flex-col min-w-0">
                                <div className="flex justify-between items-center mb-0.5">
                                    <div className="flex items-baseline gap-1.5 min-w-0">
                                        <span className="text-[13px] text-slate-200 font-semibold truncate">
                                            {comment.name || 'Unknown'}
                                        </span>
                                        <span className="text-[11px] text-slate-400 truncate">
                                            @{comment.username || 'unknown'}
                                        </span>
                                    </div>
                                    <span className="text-[10px] text-slate-500 whitespace-nowrap">
                                        {formatTime(comment.created_at)}
                                    </span>
                                </div>

                                <p className="text-[13px.5] text-slate-300 leading-relaxed whitespace-pre-line">
                                    {comment.content}
                                </p>

                                {comment.media_url && (
                                    <div className="mt-2 rounded-xl overflow-hidden border border-white/10 max-w-[300px] bg-slate-950/40">
                                        <img
                                            src={comment.media_url}
                                            alt="Reply Media"
                                            className="w-full h-auto max-h-[220px] object-cover"
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

export default ThreadDetail;