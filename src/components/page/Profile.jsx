import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import CreatePostCard from "../elements/CreatePostCard";
import PostCard from "../elements/PostCard";
import { Skeleton } from "../ui/skeleton";
import { Link } from 'react-router-dom';
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { useAuthStore } from '../../store/useAuthStore';
import { toast } from "sonner";

function Profile() {
    const { id: profileId } = useParams();
    const currentUser = useAuthStore((state) => state.user);
    const navigate = useNavigate();

    const isOwnProfile = !profileId || profileId === String(currentUser?.id);
    const targetUserId = isOwnProfile ? currentUser?.id : profileId;

    const [profileData, setProfileData] = useState(null);
    const [isProfileLoading, setIsProfileLoading] = useState(true);

    const [posts, setPosts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isFetchingNextPage, setIsFetchingNextPage] = useState(false);
    const [pageParam, setPageParam] = useState(0);
    const [hasNextPage, setHasNextPage] = useState(true);
    const [error, setError] = useState(null);

    const [followLoading, setFollowLoading] = useState(false);

    const loadMoreRef = useRef(null);

    useEffect(() => {
        const fetchProfileData = async () => {
            if (!targetUserId) return;

            try {
                setIsProfileLoading(true);
                const response = await fetch(
                    `${import.meta.env.VITE_BACKEND}/users/${targetUserId}`,
                    {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: `Bearer ${useAuthStore.getState().token}`
                        }
                    }
                );

                const result = await response.json();

                if (!response.ok) {
                    throw new Error(result.message || 'Gagal memuat profil');
                }

                setProfileData({
                    ...result.user,
                    is_following: result.user.is_following,
                    blocked_by: result.blocked_by
                });

            } catch (err) {
                console.error("Gagal memuat profil:", err);
            } finally {
                setIsProfileLoading(false);
            }
        };

        fetchProfileData();
    }, [targetUserId, currentUser?.id]);

    const handleFollow = async () => {
        try {
            setFollowLoading(true);
            const response = await fetch(
                `${import.meta.env.VITE_BACKEND}/users/${targetUserId}/follow`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${useAuthStore.getState().token}`
                    }
                }
            );

            const result = await response.json();


            if (!response.ok) {
                throw new Error(result.message);
            }

            const nextFollowing = result.isFollowing ?? result.is_following ?? false;
            const nextRequested = result.is_requested ?? result.isRequested ?? false;

            setProfileData(prev => ({
                ...prev,
                followers_count: nextFollowing
                    ? prev.followers_count + 1
                    : Math.max(prev.followers_count - 1, 0),
                is_following: nextFollowing,
                is_requested: nextRequested
            }));

        } catch (err) {
            toast.error(err.message || 'Gagal mengikuti pengguna');
        } finally {
            setFollowLoading(false);
        }
    };

    const handleChat = () => {
        navigate(`/messages?userId=${targetUserId}`);
    };

    const handleBlock = async () => {
        const actionText = profileData?.is_blocked ? "membuka blokir" : "memblokir";
        if (!window.confirm(`Apakah Anda yakin ingin ${actionText} pengguna ini?`)) return;
        try {
            const response = await fetch(`${import.meta.env.VITE_BACKEND}/users/${targetUserId}/block`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${useAuthStore.getState().token}`
                }
            });
            const result = await response.json();
            if (!response.ok) throw new Error(result.message || 'Gagal mengeksekusi aksi');

            toast.success(result.message || 'Berhasil memperbarui status blokir');

            setProfileData(prev => ({
                ...prev,
                is_blocked: result.isBlocked,
                blocked_by: result.blocked_by
            }));
        } catch (err) {
            toast.error(err.message);
        }
    };

    const fetchPosts = async (currentOffset, isRefresh = false) => {
        if (!targetUserId) return;

        if (!isOwnProfile && profileData?.is_private && !profileData?.is_following) {
            setPosts([]);
            setIsLoading(false);
            return;
        }

        try {
            if (isRefresh) setIsLoading(true);
            else if (currentOffset > 0) setIsFetchingNextPage(true);

            const response = await fetch(
                `${import.meta.env.VITE_BACKEND}/posts?user_id=${targetUserId}&offset=${currentOffset}&limit=10`,
                {
                    method: 'GET',
                    headers: { 'Content-Type': 'application/json' }
                }
            );

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || 'Failed to fetch posts');
            }

            const formattedData = result.data.map(post => ({
                ...post,
                likes_count: post.likes_count || 0,
                is_liked: post.is_liked || false
            }));

            if (isRefresh) {
                setPosts(formattedData);
            } else {
                setPosts(prev => {
                    const allPosts = [...prev, ...formattedData];
                    return Array.from(new Map(allPosts.map(p => [p.id, p])).values());
                });
            }

            setHasNextPage(result.data.length === 10);
            setError(null);

        } catch (err) {
            setError(err);
        } finally {
            setIsLoading(false);
            setIsFetchingNextPage(false);
        }
    };

    useEffect(() => {
        if (!isProfileLoading && profileData) {
            setPageParam(0);
            fetchPosts(0, true);
        }
    }, [targetUserId, isProfileLoading]);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasNextPage && !isLoading && !isFetchingNextPage) {
                    setPageParam(prevOffset => {
                        const nextOffset = prevOffset + 10;
                        fetchPosts(nextOffset);
                        return nextOffset;
                    });
                }
            },
            { threshold: 0.1 }
        );

        if (loadMoreRef.current) observer.observe(loadMoreRef.current);
        return () => {
            if (loadMoreRef.current) observer.unobserve(loadMoreRef.current);
        };
    }, [hasNextPage, isLoading, isFetchingNextPage, pageParam]);

    const handlePostCreated = () => {
        setPageParam(0);
        fetchPosts(0, true);
    };

    if (isProfileLoading) {
        return (
            <div className="w-full max-w-[580px] mx-auto px-4 pt-4 pb-24 flex flex-col gap-4">
                <div className="bg-[#182136]/50 border border-white/10 rounded-2xl p-6 space-y-4">
                    <div className="flex justify-between items-start">
                        <Skeleton className="h-20 w-20 rounded-full bg-slate-700/50" />
                        <Skeleton className="h-9 w-24 rounded-full bg-slate-700/50" />
                    </div>
                    <div className="space-y-2">
                        <Skeleton className="h-5 w-1/3 bg-slate-700/50" />
                        <Skeleton className="h-4 w-1/4 bg-slate-700/50" />
                    </div>
                </div>
            </div>
        );
    }

    if (
        !isOwnProfile &&
        (
            profileData?.is_blocked ||
            profileData?.blocked_by
        )
    ) {
        return (
            <div className="w-full max-w-[580px] mx-auto px-4 pt-4 pb-24 flex flex-col gap-3">
                <div className="w-full bg-[#182136]/30 border border-rose-500/10 rounded-2xl p-16 flex flex-col items-center justify-center gap-2 mt-2">
                    <span className="material-symbols-outlined text-[56px] text-slate-500 animate-pulse">
                        lock_person
                    </span>
                    <h3 className="text-lg font-bold text-slate-200 mt-2">Profil Tidak Tersedia</h3>
                    <p className="text-xs text-slate-400 text-center max-w-[340px] leading-relaxed">
                        Mekanisme pembatasan aktif. Anda telah memblokir akun ini atau akses komunikasi antar kedua belah pihak telah ditutup.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full max-w-[580px] mx-auto px-4 pt-4 pb-24 flex flex-col gap-3">
            <div className="w-full bg-[#182136]/50 border border-white/10 rounded-2xl p-5 flex flex-col gap-4">
                <div className="flex justify-between items-start w-full">
                    <div className="w-20 h-20 rounded-full overflow-hidden border border-white/10 bg-slate-800">
                        <img
                            src={profileData?.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${profileData?.username}`}
                            alt={profileData?.name || "User"}
                            className="w-full h-full object-cover"
                        />
                    </div>

                    {currentUser?.id && (
                        <div className="flex items-center gap-2">
                            {isOwnProfile ? (
                                <Link
                                    to="/settings"
                                    className="px-4 py-1.5 border border-white/10 hover:bg-white/5 text-slate-200 text-[13px] font-semibold rounded-full transition-colors cursor-pointer"
                                >
                                    Edit Profile
                                </Link>
                            ) : (
                                <>
                                    {/* Tombol Chat */}
                                    <button
                                        onClick={handleChat}
                                        className="p-1.5 border border-white/10 hover:bg-white/5 text-slate-300 hover:text-white rounded-full transition-colors cursor-pointer"
                                        title="Kirim Pesan"
                                    >
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                                        </svg>
                                    </button>

                                    {/* Tombol Follow */}
                                    <button
                                        onClick={handleFollow}
                                        disabled={followLoading}
                                        className={`px-5 py-1.5 text-white text-[13px] font-semibold rounded-full transition-colors cursor-pointer
                                        ${profileData?.is_following
                                                ? 'bg-slate-700 hover:bg-slate-600'
                                                : profileData?.is_requested
                                                    ? 'bg-slate-800 text-slate-400 border border-white/10'
                                                    : 'bg-blue-500 hover:bg-blue-600'
                                            }`}
                                    >
                                        {followLoading
                                            ? 'Loading...'
                                            : profileData?.is_following
                                                ? 'Unfollow'
                                                : profileData?.is_requested
                                                    ? 'Requested'
                                                    : 'Follow'}
                                    </button>

                                    {/* Tombol Block */}
                                    <button
                                        onClick={handleBlock}
                                        className="p-1.5 border border-rose-500/20 hover:bg-rose-500/10 text-rose-400 rounded-full transition-colors cursor-pointer"
                                        title="Blokir Pengguna"
                                    >
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <circle cx="12" cy="12" r="10"></circle>
                                            <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"></line>
                                        </svg>
                                    </button>
                                </>
                            )}
                        </div>
                    )}
                </div>
                <div className="flex flex-col">
                    <h1 className="text-xl font-bold text-slate-100">{profileData?.name || 'User Name'}</h1>
                    <span className="text-sm text-slate-400">@{profileData?.username || 'username'}</span>
                </div>
                <p className="text-[14px] text-slate-300 leading-relaxed whitespace-pre-line">
                    {profileData?.bio || 'Belum ada bio.'}
                </p>
                <div className="flex items-center gap-4 text-sm pt-3 border-t border-white/5">
                    <div className="flex items-center gap-1">
                        <span className="font-semibold text-slate-200">{profileData?.following_count || 0}</span>
                        <span className="text-slate-500">Following</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <span className="font-semibold text-slate-200">{profileData?.followers_count || 0}</span>
                        <span className="text-slate-500">Followers</span>
                    </div>
                </div>
            </div>

            {isOwnProfile && (
                <>
                    <CreatePostCard onPostCreated={handlePostCreated} />
                    <div className="w-full flex justify-center py-1">
                        <div className="w-8 h-[2px] rounded-full bg-white/10" />
                    </div>
                </>
            )}

            <div className="w-full border-b border-white/10 flex justify-start mt-2">
                <div className="px-4 py-2 border-b-2 border-blue-500 text-blue-400 text-sm font-semibold">
                    Threads
                </div>
            </div>

            {!isOwnProfile && profileData?.is_private && !profileData?.is_following ? (
                <div className="w-full bg-[#182136]/30 border border-white/10 rounded-2xl p-8 flex flex-col items-center justify-center gap-2 mt-2">
                    <span className="material-symbols-outlined text-[40px] text-slate-500">
                        lock
                    </span>
                    <h3 className="text-base font-bold text-slate-200 mt-2">Akun ini Privat</h3>
                    <p className="text-xs text-slate-400 text-center max-w-[320px]">
                        Ikuti akun ini untuk melihat kiriman threads dan interaksi mereka.
                    </p>
                </div>
            ) : (
                <>
                    {isLoading && (
                        <div className="space-y-4 w-full">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="bg-[#182136]/50 border border-white/10 rounded-2xl p-4 space-y-3">
                                    <div className="flex items-center space-x-3">
                                        <Skeleton className="h-9 w-9 rounded-full bg-slate-700/50" />
                                        <div className="space-y-1.5 flex-1">
                                            <Skeleton className="h-4 w-1/4 bg-slate-700/50" />
                                            <Skeleton className="h-3 w-1/6 bg-slate-700/50" />
                                        </div>
                                    </div>
                                    <div className="space-y-2 pt-2">
                                        <Skeleton className="h-4 w-full bg-slate-700/50" />
                                        <Skeleton className="h-4 w-4/5 bg-slate-700/50" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                    {error && (
                        <Alert
                            variant="destructive"
                            className="my-4 flex items-start gap-3 rounded-2xl border border-rose-500/30 bg-rose-950/20 p-4 text-rose-400"
                        >
                            <span className="material-symbols-outlined mt-0.5 text-[20px]">error</span>
                            <div className="flex-1">
                                <AlertTitle className="font-semibold leading-none">Gagal Memuat Data</AlertTitle>
                                <AlertDescription className="mt-1 text-sm leading-relaxed text-rose-400/80">
                                    {error.message}
                                </AlertDescription>
                            </div>
                        </Alert>
                    )}
                    {!isLoading && posts.length === 0 && (
                        <p className="text-slate-500 text-sm text-center py-8">Belum ada postingan dari user ini.</p>
                    )}
                    {posts.map((post) => (
                        <PostCard key={post.id} post={post} setPosts={setPosts} />
                    ))}
                    {hasNextPage && !isLoading && !isFetchingNextPage && (
                        <div ref={loadMoreRef} className="h-2 w-full bg-transparent" />
                    )}
                    {isFetchingNextPage && (
                        <div className="space-y-4 w-full mt-3">
                            {[1, 2].map((i) => (
                                <div key={i} className="bg-[#182136]/50 border border-white/10 rounded-2xl p-4 space-y-3 animate-pulse">
                                    <div className="flex items-center space-x-3">
                                        <Skeleton className="h-9 w-9 rounded-full bg-slate-700/50" />
                                        <div className="space-y-1.5 flex-1">
                                            <Skeleton className="h-4 w-1/4 bg-slate-700/50" />
                                            <Skeleton className="h-3 w-1/6 bg-slate-700/50" />
                                        </div>
                                    </div>
                                    <div className="space-y-2 pt-2">
                                        <Skeleton className="h-4 w-full bg-slate-700/50" />
                                        <Skeleton className="h-4 w-4/5 bg-slate-700/50" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </>
            )}
        </div>
    );
}

export default Profile;