import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import PostCard from './elements/PostCard'

function Explore() {
    const [search, setSearch] = useState('')
    const navigate = useNavigate()

    const {
        data,
        isLoading
    } = useQuery({
        queryKey: ['explore-suggestions'],

        queryFn: async () => {
            const response = await fetch(
                `${import.meta.env.VITE_BACKEND}/explore/suggestions`
            )

            const result = await response.json()

            if (!response.ok) {
                throw new Error(result.message || 'Gagal mengambil explore')
            }

            return result
        }
    })

    const suggestedUsers = data?.users || []
    const trendingThreads = data?.threads || []

    const handleSubmit = (e) => {
        e.preventDefault()

        if (!search.trim()) return

        navigate(`/search/${encodeURIComponent(search.trim())}`)
    }

    return (
        <div className="w-full max-w-[580px] mx-auto px-4 py-4 flex flex-col gap-5">

            <section className="sticky top-[72px] md:top-4 z-30 glass-panel p-4 rounded-2xl border border-white/10 shadow-xl bg-[#161d30]/60 backdrop-blur-md">
                <form onSubmit={handleSubmit}>
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <span className="material-symbols-outlined text-outline group-focus-within:text-primary transition-colors">
                                search
                            </span>
                        </div>

                        <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full bg-surface-container/50 backdrop-blur-[20px] border border-white/10 text-on-surface rounded-full py-4 pl-12 pr-4 font-body-md placeholder:text-outline-variant focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary shadow-lg transition-all"
                            placeholder="Cari topik..."
                            type="text"
                        />
                    </div>
                </form>
            </section>

            {isLoading ? (
                <div className="flex flex-col gap-4">

                    <div className="bg-[#161d30]/40 border border-white/10 rounded-2xl p-4 animate-pulse">
                        <div className="h-5 w-32 bg-white/10 rounded mb-4" />

                        <div className="flex flex-col gap-4">
                            {[...Array(3)].map((_, i) => (
                                <div key={i} className="flex items-center gap-3">
                                    <div className="w-14 h-14 rounded-full bg-white/10" />

                                    <div className="flex-1">
                                        <div className="h-4 w-32 bg-white/10 rounded mb-2" />
                                        <div className="h-3 w-24 bg-white/10 rounded" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-[#161d30]/40 border border-white/10 rounded-2xl p-4 animate-pulse">
                        <div className="h-5 w-40 bg-white/10 rounded mb-4" />

                        <div className="flex flex-col gap-3">
                            {[...Array(2)].map((_, i) => (
                                <div key={i} className="h-32 rounded-2xl bg-white/5" />
                            ))}
                        </div>
                    </div>

                </div>
            ) : (
                <>
                    <section className="glass-panel p-4 rounded-2xl border border-white/10 bg-[#161d30]/40 backdrop-blur-md">

                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-[18px] font-semibold text-white">
                                Suggested Users
                            </h2>

                            <span className="text-[12px] text-slate-500">
                                Paling populer
                            </span>
                        </div>

                        <div className="flex flex-col gap-3">

                            {suggestedUsers.map((user) => (
                                <Link
                                    key={user.id}
                                    to={`/profile/${user.id}`}
                                    className="flex items-center justify-between gap-3 bg-white/[0.02] hover:bg-white/[0.04] border border-white/5 rounded-2xl p-3 transition-colors"
                                >
                                    <div className="flex items-center gap-3 min-w-0">

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

                                        <div className="min-w-0">
                                            <h3 className="text-[14px] font-semibold text-slate-200 truncate">
                                                {user.name}
                                            </h3>

                                            <p className="text-[12px] text-slate-400 truncate">
                                                @{user.username}
                                            </p>

                                            <p className="text-[11px] text-slate-500 mt-1 truncate">
                                                {user.followers_count || 0} followers
                                            </p>
                                        </div>
                                    </div>
                                </Link>
                            ))}

                        </div>
                    </section>

                    <section className="glass-panel p-4 rounded-2xl border border-white/10 bg-[#161d30]/40 backdrop-blur-md">

                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-[18px] font-semibold text-white">
                                Trending Threads
                            </h2>

                            <span className="text-[12px] text-slate-500">
                                Paling banyak dibicarakan
                            </span>
                        </div>

                        <div className="flex flex-col divide-y divide-white/5 border border-white/5 rounded-2xl overflow-hidden">

                            {trendingThreads.map((post) => (
                                <div key={post.id} className="p-1">
                                    <PostCard post={post} />
                                </div>
                            ))}

                        </div>
                    </section>
                </>
            )}
        </div>
    )
}

export default Explore