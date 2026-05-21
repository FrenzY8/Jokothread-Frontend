import React from 'react'

function Messages() {
  return (
    <div className="w-full max-w-[580px] mx-auto px-4 py-4 flex flex-col gap-3">
      <div className="bg-[#182136]/80 border border-white/10 rounded-2xl p-3.5 shadow-lg">
        <div className="flex gap-3">
          <div className="w-9 h-9 shrink-0 rounded-full overflow-hidden border border-white/10">
            <img alt="Avatar" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuB9zlczufRcrZllO3DiczxyFjHDDUhyWhnxeJEJgTvrTpLFz121eTNAELKE6m1ksi6k18R7ec7_GJ0Oqj9HdUEVaFxWRX0woe1JhVGnwMeO0dQbf0sUDVWM0-_PvTF5xhJhYj7JrFUyy70FtYvkdhPMyQDcopeeoVK3ggRfgrmet_yvc4NclB5XzmsVSEwt7jglW9MTpT41fW6jV2kJWd7syFpZ_KtgtIa8wZrK_VOdsL5nJQlZ-rU075N3zRKku0dGC3YPDx7sUcb9" />
          </div>
          <div className="flex-1 flex flex-col gap-2">
            <input
              className="w-full bg-transparent border-none text-slate-200 text-[14px] placeholder:text-slate-500 focus:ring-0 p-0 pt-1"
              placeholder="Start a thread..."
              type="text"
            />
          </div>
        </div>
      </div>
      <article className="bg-[#182136]/50 border border-white/10 rounded-2xl p-3.5 flex gap-3">
        <p className="text-[14px] text-slate-300">DQWBDIQDJQWND</p>
      </article>
    </div>
  )
}

export default Messages