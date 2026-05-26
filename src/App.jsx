import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom';
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from './store/useAuthStore';
import { GuestRoute, PrivateRoute } from './utils/ProtectedRoute';

import HomeFeed from './components/Home'
import SearchExplore from './components/Explore'
import Messages from './components/page/Messages'
import Settings from './components/Settings'
import Login from './components/auth/Login'
import Register from './components/auth/Register'
import ThreadDetail from './components/page/ThreadDetail';
import Profile from './components/page/Profile';
import SearchResults from './components/page/SearchResults';
import About from './components/page/About';
import Notifications from './components/page/Notifications';
import PersonalSettings from './components/page/PersonalSettings';
import SecuritySettings from './components/page/SecuritySettings';
import BlockedAccount from './components/page/BlockedAccount';

function App() {
  const [isSideBarOpen, setIsSideBarOpen] = useState(false);
  const location = useLocation();
  const token = useAuthStore((state) => state.token);
  const isActive = (path) => location.pathname === path;
  const isLoginPage = location.pathname === '/login' || location.pathname === '/register';
  const user = useAuthStore((state) => state.user);
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const checkAuth = useAuthStore((state) => state.checkAuth);

  useEffect(() => {
    checkAuth();

    const interval = setInterval(() => {
      checkAuth();
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  const { data: unreadData } = useQuery({
    queryKey: ['unreadCounts', user?.id],
    queryFn: async () => {
      const response = await fetch(`${import.meta.env.VITE_BACKEND}/notifications/unread-count`, {
        headers: {
          ...(token && { 'Authorization': `Bearer ${token}` })
        }
      });
      if (!response.ok) throw new Error('Gagal mengambil data unread');
      return response.json();
    },
    enabled: !!user?.id && !isLoginPage,
    refetchInterval: 15000
  });

  const navItems = [
    { name: 'Home', icon: 'home', path: '/' },
    { name: 'Search', icon: 'search', path: '/explore' },
    {
      name: 'Messages',
      icon: 'chat_bubble',
      path: '/messages',
      unreadCount: unreadData?.unreadMessages || 0
    },
    {
      name: 'Notifications',
      icon: 'notifications',
      path: '/notifications',
      unreadCount: unreadData?.unreadNotifications || 0
    },
    ...(user?.id
      ? [{ name: 'Profile', icon: 'person', path: `/profile/${user.id}` }]
      : []
    )
  ];

  return (
    <div className="min-h-screen bg-[#0f1422] text-slate-100 flex flex-col md:flex-row">

      {/* Mobile Bottom Navigation */}
      {!isLoginPage && (
        <nav className="md:hidden fixed bottom-0 left-0 w-full z-50 flex justify-around items-center py-2 bg-[#0f1422]/90 backdrop-blur-md border-t border-white/10 pb-safe shadow-[0_-1px_15px_rgba(255,255,255,0.03)]">
          {navItems.map((tab, idx) => {
            const isActive = location.pathname === tab.path;

            return (
              <Link
                key={idx}
                className={`p-2 transition-all active:scale-95 flex items-center justify-center ${isActive ? 'text-white' : 'text-slate-500'}`}
                to={tab.path}
                title={tab.name}
              >
                {tab.name === 'Profile' ? (
                  <div className={`w-6 h-6 rounded-full overflow-hidden border transition-all ${isActive ? 'border-white scale-105' : 'border-white/10'}`}>
                    <img
                      alt="Profile"
                      className="w-full h-full object-cover"
                      src={user?.avatar && user.avatar.startsWith('data:image') ? user.avatar : "https://api.dicebear.com/7.x/bottts/svg?seed=guest"}
                    />
                  </div>
                ) : (
                  <div className="relative flex items-center justify-center">
                    <span
                      className="material-symbols-outlined text-[24px] block"
                      style={isActive ? { fontVariationSettings: '"FILL" 1' } : {}}
                    >
                      {tab.icon}
                    </span>

                    {tab.unreadCount > 0 && (
                      <span className="absolute -top-1.5 -right-2 bg-rose-500 text-white font-bold text-[10px] h-4 min-w-[16px] px-1 rounded-full flex items-center justify-center ring-2 ring-[#0f1422]">
                        {tab.unreadCount > 9 ? '9+' : tab.unreadCount}
                      </span>
                    )}
                  </div>
                )}
              </Link>
            );
          })}
        </nav>
      )}

      {!isLoginPage && (
        <header className="md:hidden sticky top-0 w-full z-50 flex justify-between items-center px-4 py-3 bg-[#0f1422]/80 backdrop-blur-md border-b border-white/10 shadow-[0_1px_10px_rgba(255,255,255,0.03)]">
          <div className="text-xl font-bold tracking-tight text-white">Jokothread</div>
          <div className="flex items-center gap-4 text-slate-300">
            <span
              onClick={() => navigate('/explore')}
              className="material-symbols-outlined text-[22px] cursor-pointer hover:text-white transition-colors"
            >
              search
            </span>
            <span
              onClick={() => navigate('/about')}
              className="material-symbols-outlined text-[22px] cursor-pointer hover:text-white transition-colors"
            >
              info
            </span>
          </div>
        </header>
      )}

      {/* Desktop SideNav */}
      {!isLoginPage && (
        <nav className={`hidden md:flex flex-col h-screen fixed left-0 top-0 z-40 bg-[#161d30]/60 backdrop-blur-lg border-r border-white/10 p-3 justify-between transition-all duration-300 shadow-[1px_0_15px_rgba(255,255,255,0.02)] ${isSideBarOpen ? 'w-64' : 'w-20'}`}>
          <div className="flex flex-col gap-5">
            <div className="flex items-center justify-between px-2 py-1.5">
              {isSideBarOpen && <h1 className="text-lg font-bold tracking-wider">Jokothread</h1>}
              <button
                onClick={() => setIsSideBarOpen(!isSideBarOpen)}
                className={`text-slate-400 hover:text-white p-2 rounded-xl bg-slate-900/50 hover:bg-slate-900 transition-all ${!isSideBarOpen && 'mx-auto'}`}
              >
                <span className="material-symbols-outlined text-[20px] block">
                  {isSideBarOpen ? 'menu_open' : 'menu'}
                </span>
              </button>
            </div>

            <div className="flex flex-col gap-1.5">
              {navItems.map((tab, idx) => {
                const isActive = location.pathname === tab.path;

                return (
                  <Link
                    key={idx}
                    className={`flex items-center gap-4 rounded-xl px-3 py-2.5 transition-all active:scale-98 ${isActive
                      ? 'bg-slate-900 text-white font-medium border border-white/15 shadow-[0_0_10px_rgba(255,255,255,0.05)]'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
                      } ${!isSideBarOpen && 'justify-center'}`}
                    to={tab.path}
                    title={!isSideBarOpen ? tab.name : ''}
                  >
                    <div className="relative flex items-center justify-center">
                      <span className="material-symbols-outlined text-[22px]" style={isActive ? { fontVariationSettings: '"FILL" 1' } : {}}>
                        {tab.icon}
                      </span>

                      {tab.unreadCount > 0 && (
                        <span className="absolute -top-1.5 -right-2 bg-rose-500 text-white font-bold text-[9px] h-3.5 min-w-[14px] px-1 rounded-full flex items-center justify-center">
                          {tab.unreadCount > 9 ? '9+' : tab.unreadCount}
                        </span>
                      )}
                    </div>

                    {isSideBarOpen && <span className="text-[14px] tracking-wide">{tab.name}</span>}
                  </Link>
                );
              })}
            </div>

            {/*<button className={`bg-white hover:bg-slate-200 text-black font-semibold text-[13px] py-2.5 rounded-xl transition-all active:scale-95 shadow-[0_0_15px_rgba(255,255,255,0.2)] flex items-center justify-center ${isSideBarOpen ? 'w-full px-4' : 'w-12 h-12 mx-auto rounded-full'}`}>
              {isSideBarOpen ? 'Post Thread' : <span className="material-symbols-outlined text-[20px]">edit</span>}
            </button>*/}
          </div>

          <div className="flex flex-col gap-1">
            <Link className={`flex items-center gap-4 text-slate-400 hover:text-slate-200 px-3 py-2 rounded-xl hover:bg-slate-900/40 transition-colors ${!isSideBarOpen && 'justify-center'}`} to="/about" title="About">
              <span className="material-symbols-outlined text-[22px]">info</span>
              {isSideBarOpen && <span className="text-[14px]">About</span>}
            </Link>

            {user?.id ? (
              <Link
                to="/settings"
                title="Profile"
                className={`flex items-center gap-3 px-2 py-2.5 mt-3 border-t border-white/10 hover:bg-slate-900/30 rounded-xl transition-all duration-200 cursor-pointer ${!isSideBarOpen && 'justify-center'}`}
              >
                <div className="w-8 h-8 rounded-full overflow-hidden border border-white/10 shrink-0 bg-slate-800">
                  <img
                    alt="User profile"
                    className="w-full h-full object-cover"
                    src={
                      user?.avatar?.startsWith('data:image')
                        ? user.avatar
                        : `https://api.dicebear.com/7.x/bottts/svg?seed=guest`
                    }
                  />
                </div>

                {isSideBarOpen && (
                  <div className="flex flex-col min-w-0 flex-1 align-middle">
                    <span className="text-[13px] font-medium text-slate-200 truncate leading-tight">
                      {user?.name}
                    </span>
                    <span className="text-[11px] text-slate-500 truncate">
                      @{user?.username}
                    </span>
                  </div>
                )}
              </Link>
            ) : (
              <Link
                to="/login"
                title="Login"
                className={`flex items-center gap-3 px-2 py-2.5 mt-3 border-t border-white/10 hover:bg-slate-900/30 rounded-xl transition-all duration-200 cursor-pointer ${!isSideBarOpen && 'justify-center'}`}
              >
                <div className="w-8 h-8 flex items-center justify-center text-slate-400 shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M12 9l-3 3m0 0 3 3m-3-3h12.75" />
                  </svg>
                </div>

                {isSideBarOpen && (
                  <div className="flex flex-col min-w-0 flex-1">
                    <span className="text-[13px] font-medium text-slate-200 truncate leading-tight">
                      Masuk / Log In
                    </span>
                    <span className="text-[11px] text-slate-500 truncate">
                      Akses akun kamu
                    </span>
                  </div>
                )}
              </Link>
            )}
          </div>
        </nav>
      )}

      <style dangerouslySetInnerHTML={{ __html: ".pb-safe { padding-bottom: env(safe-area-inset-bottom, 10px); }" }} />
      <style dangerouslySetInnerHTML={{ __html: "*::-webkit-scrollbar { display: none !important; } * { -ms-overflow-style: none !important; scrollbar-width: none !important; }" }} />
      <style dangerouslySetInnerHTML={{ __html: ".pb-safe { padding-bottom: env(safe-area-inset-bottom, 10px); }" }} />

      <main onClick={() => { if (isSideBarOpen) setIsSideBarOpen(false) }}
        className={`flex-1 h-screen overflow-y-auto transition-all ${isLoginPage
          ? 'flex items-center justify-center md:ml-0'
          : isSideBarOpen ? 'md:ml-64' : 'md:ml-20'
          }`}
      >
        <Routes>
          <Route path="/" element={<HomeFeed />} />
          <Route path="/explore" element={<SearchExplore />} />
          <Route path="/about" element={<About />} />
          <Route path="/thread/:id" element={<ThreadDetail />} />
          <Route path="/profile/:id" element={<Profile />} />
          <Route path="/search/:query" element={<SearchResults />} />

          <Route element={<PrivateRoute />}>
            <Route path="/messages" element={<Messages />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/personal-settings" element={<PersonalSettings />} />
            <Route path="/security-settings" element={<SecuritySettings />} />
            <Route path="/blocked" element={<BlockedAccount />} />
          </Route>

          <Route element={<GuestRoute />}>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Route>
        </Routes>
      </main>

    </div>
  )
}

export default App