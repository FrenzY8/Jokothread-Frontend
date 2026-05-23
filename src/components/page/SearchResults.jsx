import React, { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import PostCard from '../elements/PostCard'
import { useAuthStore } from '../../store/useAuthStore';

function SearchResults() {
    const { query } = useParams()
    const [activeTab, setActiveTab] = useState('threads')
    const queryClient = useQueryClient()
    const token = useAuthStore((state) => state.token);

    const {
        data,
        isLoading
    } = useQuery({
        queryKey: ['search', query],
        queryFn: async () => {
            const response = await fetch(
                `${import.meta.env.VITE_BACKEND}/posts/search?q=${query}`,
                {
                    headers: {
                        ...(token && { 'Authorization': `Bearer ${token}` })
                    }
                }
            )
            const result = await response.json()
            if (!response.ok) {
                throw new Error(result.message || 'Gagal search')
            }
            return result
        },
        enabled: !!query
    })

    const users = data?.users || []
    const threads = data?.threads || []

    return (
        <div className="w-full max-w-[680px] mx-auto px-4 py-5 flex flex-col gap-5">
            <div className="sticky top-[72px] z-20 bg-[#0f1422]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-1.5 flex items-center shadow-lg mb-2">
                <button
                    onClick={() => setActiveTab('threads')}
                    className={`flex-1 py-2.5 rounded-xl text-[13px] font-semibold transition-all cursor-pointer
                    ${activeTab === 'threads'
                            ? 'bg-white text-black'
                            : 'text-slate-400 hover:text-white'
                        }`}
                >
                    Threads
                </button>

                <button
                    onClick={() => setActiveTab('users')}
                    className={`flex-1 py-2.5 rounded-xl text-[13px] font-semibold transition-all cursor-pointer
                    ${activeTab === 'users'
                            ? 'bg-white text-black'
                            : 'text-slate-400 hover:text-white'
                        }`}
                >
                    Users
                </button>
            </div>

            {isLoading ? (
                <>
                    {activeTab === 'threads' && (
                        <div className="flex flex-col pt-10 gap-4">
                            {[1, 2, 3].map((item) => (
                                <div
                                    key={item}
                                    className="bg-[#161d30]/30 border border-white/10 rounded-2xl p-4 animate-pulse"
                                >
                                    <div className="flex gap-3">
                                        <div className="w-11 h-11 rounded-full bg-white/10 shrink-0" />
                                        <div className="flex-1 flex flex-col gap-2">
                                            <div className="flex items-center justify-between gap-3">
                                                <div className="flex flex-col gap-2">
                                                    <div className="w-28 h-3 rounded bg-white/10" />
                                                    <div className="w-20 h-2 rounded bg-white/5" />
                                                </div>
                                                <div className="w-10 h-2 rounded bg-white/5" />
                                            </div>
                                            <div className="w-full h-3 rounded bg-white/10" />
                                            <div className="w-[85%] h-3 rounded bg-white/5" />
                                            <div className="w-full h-[220px] rounded-2xl bg-white/5 mt-2" />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {activeTab === 'users' && (
                        <div className="flex flex-col pt-10 gap-4">
                            {[1, 2, 3, 4].map((item) => (
                                <div
                                    key={item}
                                    className="bg-[#161d30]/40 border border-white/10 rounded-2xl p-4 flex items-center justify-between animate-pulse"
                                >
                                    <div className="flex items-center gap-3 flex-1">
                                        <div className="w-14 h-14 rounded-full bg-white/10 shrink-0" />
                                        <div className="flex flex-col gap-2 flex-1">
                                            <div className="w-28 h-3 rounded bg-white/10" />
                                            <div className="w-20 h-2 rounded bg-white/5" />
                                            <div className="w-40 h-2 rounded bg-white/5" />
                                        </div>
                                    </div>
                                    <div className="w-20 h-8 rounded-full bg-white/10 shrink-0" />
                                </div>
                            ))}
                        </div>
                    )}
                </>
            ) : (
                <>
                    {/* Render Tab Users */}
                    {activeTab === 'users' && (
                        <div className="flex flex-col pt-10 gap-4">
                            {users.length === 0 ? (
                                <div className="text-center text-slate-500 py-12 border border-white/10 rounded-2xl bg-[#161d30]/20">
                                    User tidak ditemukan
                                </div>
                            ) : (
                                users.map((user) => (
                                    <Link
                                        key={user.id}
                                        to={`/profile/${user.id}`}
                                        className="bg-[#161d30]/40 backdrop-blur-md border border-white/10 rounded-2xl p-4 flex items-center justify-between hover:bg-white/[0.03] transition-colors"
                                    >
                                        <div className="flex items-center gap-4 min-w-0">
                                            <div className="w-14 h-14 rounded-full overflow-hidden border border-white/10 bg-slate-800 shrink-0">
                                                <img
                                                    src={
                                                        user.avatar ||
                                                        `https://api.dicebear.com/7.x/bottts/svg?seed=${user.username}`
                                                    }
                                                    alt={user.name}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>

                                            <div className="min-w-0 flex flex-col gap-1">
                                                <h3 className="text-[14px] font-semibold text-slate-200 truncate">
                                                    {user.name}
                                                </h3>
                                                <p className="text-[12px] text-slate-400 truncate">
                                                    @{user.username}
                                                </p>
                                                <p className="text-[12px] text-slate-500 truncate">
                                                    {user.bio || 'Belum ada bio'}
                                                </p>
                                            </div>
                                        </div>
                                    </Link>
                                ))
                            )}
                        </div>
                    )}

                    {/* Render Tab Threads */}
                    {activeTab === 'threads' && (
                        <div className="flex flex-col pt-10 gap-4">
                            {threads.length === 0 ? (
                                <div className="text-center text-slate-500 py-12 border border-white/10 rounded-2xl bg-[#161d30]/20">
                                    Thread tidak ditemukan
                                </div>
                            ) : (
                                threads
                                    .filter(post => post && post.id)
                                    .map((post) => (
                                        <div key={post.id} className="w-full">
                                            <PostCard
                                                post={post}
                                                setPosts={(updater) => {
                                                    queryClient.setQueryData(['search', query], (oldData) => {
                                                        if (!oldData || !oldData.threads) return oldData;

                                                        const updatedThreads = oldData.threads
                                                            .map((t) => {
                                                                if (t && t.id === post.id) {
                                                                    const result = updater([t]);
                                                                    return result ? result[0] : null;
                                                                }
                                                                return t;
                                                            })
                                                            .filter(Boolean);

                                                        return {
                                                            ...oldData,
                                                            threads: updatedThreads
                                                        };
                                                    });
                                                }}
                                            />
                                        </div>
                                    ))
                            )}
                        </div>
                    )}
                </>
            )}
        </div>
    )
}

export default SearchResults