import { useEffect, useState, useRef } from 'react';
import CreatePostCard from "./elements/CreatePostCard";
import PostCard from "./elements/PostCard";
import { Skeleton } from "./ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { useAuthStore } from '../store/useAuthStore';
import LightRays from './ui/light-rays';

function Home() {
    const user = useAuthStore((state) => state.user);
    const token = useAuthStore((state) => state.token);

    const [posts, setPosts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isFetchingNextPage, setIsFetchingNextPage] = useState(false);
    const [pageParam, setPageParam] = useState(0);
    const [hasNextPage, setHasNextPage] = useState(true);
    const [error, setError] = useState(null);

    const loadMoreRef = useRef(null);

    const fetchPosts = async (currentOffset, isRefresh = false) => {
        try {
            if (isRefresh) setIsLoading(true);
            else if (currentOffset > 0) setIsFetchingNextPage(true);

            const headers = {
                'Content-Type': 'application/json'
            };

            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            const response = await fetch(
                `${import.meta.env.VITE_BACKEND}/posts?offset=${currentOffset}&limit=10`,
                {
                    method: 'GET',
                    headers: headers
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
                    const uniquePosts = Array.from(
                        new Map(allPosts.map(post => [post.id, post])).values()
                    );
                    return uniquePosts;
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
        setPageParam(0);
        fetchPosts(0, true);
    }, [user?.id]);

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

    useEffect(() => {
        setPageParam(0);
        fetchPosts(0, true);
    }, [user?.id, token, location.key]);

    return (
        <div className="w-full max-w-[580px] mx-auto px-4 pt-4 pb-24 flex flex-col gap-3 relative">
            <div className="fixed inset-0 pointer-events-none z-0 flex items-center justify-center">
                <LightRays
                    raysOrigin="top-center"
                    raysColor="#ffffff"
                    raysSpeed={1}
                    lightSpread={0.5}
                    rayLength={3}
                    followMouse={true}
                    mouseInfluence={0.1}
                    noiseAmount={1}
                    distortion={0}
                    className="custom-rays opacity-20"
                    pulsating={false}
                    fadeDistance={1}
                    saturation={1}
                />
            </div>
            <CreatePostCard onPostCreated={handlePostCreated} />

            <div className="w-full flex justify-center py-1">
                <div className="w-8 h-[2px] rounded-full bg-white/10" />
            </div>

            {isLoading && (
                <div className="space-y-4 w-full">
                    {[1, 2, 3, 4, 5].map((i) => (
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
                    <span className="material-symbols-outlined mt-0.5 text-[20px]">
                        error
                    </span>

                    <div className="flex-1">
                        <AlertTitle className="font-semibold leading-none">
                            Gagal Memuat Data
                        </AlertTitle>

                        <AlertDescription className="mt-1 text-sm leading-relaxed text-rose-400/80">
                            {error.message}
                        </AlertDescription>
                    </div>
                </Alert>
            )}

            {!isLoading && posts.length === 0 && (
                <p className="text-slate-500 text-sm text-center">Belum ada postingan saat ini.</p>
            )}

            {posts.map((post) => (
                <PostCard
                    key={post.id}
                    post={post}
                    setPosts={setPosts}
                />
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
        </div>
    );
}

export default Home;