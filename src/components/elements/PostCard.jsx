import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../../store/useAuthStore';
import { Link } from 'react-router-dom';
import { toast } from "sonner";

function PostCard({ post, setPosts, FromDetailThread = false }) {
    const [isMaximized, setIsMaximized] = useState(false);
    const navigate = useNavigate();

    const [showReplyForm, setShowReplyForm] = useState(false);
    const [replyContent, setReplyContent] = useState('');
    const [isSubmittingReply, setIsSubmittingReply] = useState(false);
    const queryClient = useQueryClient();

    const [replyMedia, setReplyMedia] = useState(null);
    const [replyMediaPreview, setReplyMediaPreview] = useState(null);
    const replyFileInputRef = useRef(null);

    const [showMenu, setShowMenu] = useState(false);

    const user = useAuthStore((state) => state.user);
    const token = useAuthStore((state) => state.token);

    const { data: realRepliesCount = 0 } = useQuery({
        queryKey: ['replies-count', post.id],

        queryFn: async () => {
            const response = await fetch(
                `${import.meta.env.VITE_BACKEND}/posts/${post.id}/replies/count`
            );

            const result = await response.json();

            if (!response.ok) {
                throw new Error(
                    result.message || 'Gagal mengambil jumlah balasan'
                );
            }

            return result.count || 0;
        },

        enabled: !!post.id,
    });

    const likeMutation = useMutation({
        mutationFn: async () => {
            if (!user?.id) {
                throw new Error('Anda harus login terlebih dahulu');
            }

            const response = await fetch(
                `${import.meta.env.VITE_BACKEND}/posts/${post.id}/like`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message);
            }

            return {
                liked: result.isLiked
            };
        },
        onMutate: async () => {
            setPosts((prevPosts) =>
                prevPosts.map((p) =>
                    p.id === post.id
                        ? {
                            ...p,
                            is_liked: !p.is_liked,
                            likes_count: p.is_liked ? Math.max(0, p.likes_count - 1) : p.likes_count + 1,
                        }
                        : p
                )
            );
        },
        onError: (err) => {
            toast.error(err.message || 'Gagal menambahkan like');
            setPosts((prevPosts) =>
                prevPosts.map((p) =>
                    p.id === post.id
                        ? {
                            ...p,
                            is_liked: !p.is_liked,
                            likes_count: p.is_liked ? Math.max(0, p.likes_count - 1) : p.likes_count + 1,
                        }
                        : p
                )
            );
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['posts'] });
        }
    });

    const handleDeletePost = async () => {

        const confirmed = window.confirm(
            'Yakin ingin menghapus postingan ini?'
        );

        if (!confirmed) return;

        try {
            const response = await fetch(
                `${import.meta.env.VITE_BACKEND}/posts/delete/${post.id}`,
                {
                    method: 'DELETE',
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || 'Gagal menghapus postingan');
            }

            toast.success('Postingan berhasil dihapus');
            setShowMenu(false);
            setPosts((prev) =>
                prev.filter((p) => p.id !== post.id)
            );
            queryClient.invalidateQueries({
                queryKey: ['posts']
            });

            navigate('/');

        } catch (err) {
            toast.error(err.message);
        }
    };

    const handleCardClick = (e) => {
        if (e.target.closest('button') || e.target.closest('img') || e.target.closest('video') || e.target.closest('textarea')) {
            return;
        }
        navigate(`/thread/${post.id}`);
    };

    const handleReplyMediaChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const previewUrl = URL.createObjectURL(file);
        setReplyMediaPreview(previewUrl);
        setReplyMedia(file);
    };

    const handleRemoveReplyMedia = () => {
        setReplyMedia(null);
        setReplyMediaPreview(null);
        if (replyFileInputRef.current) replyFileInputRef.current.value = '';
    };

    const handleSubmitReply = async () => {
        if (!user?.id) {
            return toast.error('Anda harus login terlebih dahulu');
        }

        if (!replyContent.trim() && !replyMedia) return;

        setIsSubmittingReply(true);

        try {
            let mediaUrlResult = null;

            if (replyMedia) {
                mediaUrlResult = await convertToBase64(replyMedia);
            }

            const response = await fetch(
                `${import.meta.env.VITE_BACKEND}/posts/${post.id}/replies`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        content: replyContent.trim(),
                        media_url: mediaUrlResult,
                        parent_reply_id: null
                    })
                }
            );

            const result = await response.json();

            if (!response.ok) {
                throw new Error(
                    result.message || 'Gagal mengirim komentar'
                );
            }

            setPosts((prevPosts) =>
                prevPosts.map((p) =>
                    p.id === post.id
                        ? {
                            ...p,
                            replies_count: (p.replies_count || 0) + 1
                        }
                        : p
                )
            );

            setReplyContent('');
            handleRemoveReplyMedia();
            setShowReplyForm(false);
            toast.success('Komentar berhasil dikirim!');

            queryClient.invalidateQueries({
                queryKey: ['replies-count', post.id]
            });

        } catch (err) {
            toast.error(err.message || 'Gagal mengirim komentar');
        } finally {
            setIsSubmittingReply(false);
        }
    };

    useEffect(() => {
        const closeMenu = () => setShowMenu(false);

        window.addEventListener('click', closeMenu);

        return () => {
            window.removeEventListener('click', closeMenu);
        };
    }, []);

    const formatTime = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('id-ID', { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <article onClick={handleCardClick} className="bg-[#182136]/50 hover:bg-[#182136]/80 border border-white/10 hover:border-white/20 rounded-2xl p-3.5 shadow-[0_4px_20px_rgba(255,255,255,0.02),0_0_1px_rgba(255,255,255,0.15)] hover:shadow-[0_4px_25px_rgba(255,255,255,0.05),0_0_1px_rgba(255,255,255,0.3)] transition-all duration-300 flex gap-3 w-full">
            <div className="flex flex-col items-center gap-2">
                <div className="w-9 h-9 shrink-0 rounded-full overflow-hidden border border-white/10 bg-slate-800">
                    <img
                        alt={post.name}
                        className="w-full h-full object-cover"
                        src={post.avatar && post.avatar.startsWith('data:image')
                            ? post.avatar
                            : "https://api.dicebear.com/7.x/bottts/svg?seed=guest"
                        }
                    />
                </div>
                <div className="w-[1px] h-full bg-white/10 rounded-full" />
            </div>

            <div className="flex-1 flex flex-col gap-1.5">
                <div className="flex justify-between items-center">
                    <div className="flex items-start justify-between w-full gap-2">
                        <div onClick={(e) => e.stopPropagation()} className="flex flex-col min-w-0">
                            <span className="text-[14px] text-slate-200 font-semibold truncate leading-tight">
                                {post.name}
                            </span>
                            <Link
                                to={`/profile/${post.user_id}`}
                                className="text-[12px] text-slate-400 leading-tight hover:underline"
                            >
                                @{post.username}
                            </Link>
                        </div>
                        <div className="relative flex items-center gap-2.5 shrink-0">

                            <span className="text-[11px] text-slate-500 whitespace-nowrap pt-0.5">
                                {formatTime(post.created_at)}
                            </span>

                            {Number(user?.id) === Number(post.user_id) && (
                                <>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setShowMenu((prev) => !prev);
                                        }}
                                        className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-white/5 text-slate-500 hover:text-white transition-all cursor-pointer"
                                    >
                                        <span className="material-symbols-outlined text-[18px]">
                                            more_horiz
                                        </span>
                                    </button>

                                    {showMenu && (
                                        <div
                                            onClick={(e) => e.stopPropagation()}
                                            className="absolute top-9 right-0 min-w-[170px] overflow-hidden rounded-2xl border border-white/10 bg-[#182136]/95 backdrop-blur-xl shadow-[0_10px_40px_rgba(0,0,0,0.45)] z-50 animate-in fade-in zoom-in-95 duration-100"
                                        >
                                            <button
                                                onClick={handleDeletePost}
                                                className="w-full px-4 py-3 flex items-center gap-3 text-[13px] text-rose-400 hover:bg-white/5 transition-colors cursor-pointer"
                                            >
                                                <span className="material-symbols-outlined text-[18px]">
                                                    delete
                                                </span>

                                                Delete Post
                                            </button>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {post.content && post.content.trim() && (
                    <p className="text-[14px] text-slate-300 leading-relaxed whitespace-pre-line mb-2">
                        {post.content}
                    </p>
                )}

                {post.media_url && (
                    <>
                        <div className="mt-2 rounded-xl overflow-hidden border border-white/10 max-h-[400px] bg-slate-950/40 flex justify-center items-center">
                            {post.media_url.startsWith('data:video') || post.media_url.match(/\.(mp4|webm|ogg|mov)(\?.*)?$/i) ? (
                                <div className="relative w-full max-h-[400px] flex justify-center items-center group">
                                    <video
                                        src={post.media_url}
                                        className="w-full max-h-[400px] object-contain cursor-pointer"
                                        onClick={() => setIsMaximized(true)}
                                    />
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-100 group-hover:bg-black/40 transition-colors cursor-pointer pointer-events-none">
                                        <div className="w-14 h-14 flex items-center justify-center bg-black/50 backdrop-blur-md border border-white/20 rounded-full shadow-lg transform group-hover:scale-110 transition-transform duration-300">
                                            <span className="material-symbols-outlined text-white text-[32px] select-none">
                                                play_arrow
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <img
                                    src={post.media_url}
                                    alt="Post media"
                                    className="w-full h-full object-cover cursor-pointer hover:opacity-90 transition-opacity"
                                    onClick={() => setIsMaximized(true)}
                                />
                            )}
                        </div>

                        {isMaximized && (
                            <div
                                className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4"
                                onClick={() => setIsMaximized(false)}
                            >
                                <button
                                    className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center text-white bg-white/10 hover:bg-white/20 rounded-full transition-colors z-50 cursor-pointer"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setIsMaximized(false);
                                    }}
                                >
                                    <span className="material-symbols-outlined text-[24px] leading-none select-none">
                                        close
                                    </span>
                                </button>

                                <div
                                    className="max-w-4xl max-h-[85vh] flex items-center justify-center structure-container"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    {post.media_url.startsWith('data:video') || post.media_url.match(/\.(mp4|webm|ogg|mov)(\?.*)?$/i) ? (
                                        <video
                                            src={post.media_url}
                                            autoPlay
                                            loop
                                            controls
                                            className="max-w-full max-h-[85vh] rounded-lg object-contain"
                                        />
                                    ) : (
                                        <img
                                            src={post.media_url}
                                            alt="Post media maximized"
                                            className="max-w-full max-h-[85vh] rounded-lg object-contain select-none"
                                        />
                                    )}
                                </div>
                            </div>
                        )}
                    </>
                )}
                <div className="flex items-center gap-5 mt-2 text-slate-500 text-[12px]">
                    <button
                        onClick={() => likeMutation.mutate()}
                        disabled={likeMutation.isPending}
                        className="flex items-center gap-1.5 transition-colors group cursor-pointer hover:text-rose-400"
                    >
                        <span
                            className="material-symbols-outlined text-[18px] transition-transform active:scale-125 duration-150"
                            style={post.is_liked ? { fontVariationSettings: '"FILL" 1' } : {}}
                        >
                            favorite
                        </span>
                        <span>{post.likes_count || 0}</span>
                    </button>

                    {FromDetailThread ? (
                        <div className="flex items-center gap-1.5 text-slate-500">
                            <span className="material-symbols-outlined text-[18px]">chat_bubble</span>
                            <span>{realRepliesCount}</span>
                        </div>
                    ) : (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setShowReplyForm(!showReplyForm);
                            }}
                            className="flex items-center gap-1.5 hover:text-blue-400 transition-colors group cursor-pointer"
                        >
                            <span className="material-symbols-outlined text-[18px]">chat_bubble</span>
                            <span>{realRepliesCount}</span>
                        </button>
                    )}
                </div>
                {showReplyForm && (
                    <div className="mt-4 pt-4 border-t border-white/5 flex gap-3 items-start animate-fadeIn">
                        <div className="w-8 h-8 shrink-0 rounded-full overflow-hidden border border-white/10 bg-slate-800">
                            <img
                                alt="Avatar"
                                className="w-full h-full object-cover"
                                src={user?.avatar && user.avatar.startsWith('data:image')
                                    ? user.avatar
                                    : "https://api.dicebear.com/7.x/bottts/svg?seed=guest"
                                }
                            />
                        </div>
                        <div className="flex-1 flex flex-col gap-2">
                            <textarea
                                value={replyContent}
                                onChange={(e) => setReplyContent(e.target.value)}
                                placeholder="Write a comment..."
                                rows={1}
                                className="w-full bg-transparent text-[14px] text-slate-200 placeholder-slate-500 focus:outline-none resize-none py-1 leading-relaxed min-h-[32px]"
                                onInput={(e) => {
                                    e.target.style.height = 'auto';
                                    e.target.style.height = e.target.scrollHeight + 'px';
                                }}
                            />
                            {replyMediaPreview && (
                                <div className="relative mt-1 max-w-[200px] rounded-lg overflow-hidden border border-white/10 bg-slate-950/40">
                                    <img
                                        src={replyMediaPreview}
                                        alt="Reply preview"
                                        className="w-full h-auto object-cover max-h-[150px]"
                                    />
                                    <button
                                        type="button"
                                        onClick={handleRemoveReplyMedia}
                                        className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/70 hover:bg-black/90 text-white flex items-center justify-center cursor-pointer transition-colors"
                                    >
                                        <span className="material-symbols-outlined text-[14px]">close</span>
                                    </button>
                                </div>
                            )}

                            <div className="flex justify-between items-center mt-1">
                                <div>
                                    <input
                                        type="file"
                                        ref={replyFileInputRef}
                                        onChange={handleReplyMediaChange}
                                        accept="image/*"
                                        className="hidden"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => replyFileInputRef.current?.click()}
                                        className="text-slate-400 hover:text-blue-400 p-1.5 hover:bg-white/5 rounded-full transition-colors cursor-pointer flex items-center justify-center"
                                    >
                                        <span className="material-symbols-outlined text-[20px]">image</span>
                                    </button>
                                </div>
                                <button
                                    type="button"
                                    onClick={handleSubmitReply}
                                    disabled={(!replyContent.trim() && !replyMedia) || isSubmittingReply}
                                    className="px-4 py-1.5 bg-blue-500 disabled:opacity-40 disabled:hover:bg-blue-500 hover:bg-blue-600 text-white font-medium text-[12px] rounded-full transition-colors cursor-pointer"
                                >
                                    {isSubmittingReply ? 'Replying...' : 'Reply'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </article>
    );
}

export default PostCard;