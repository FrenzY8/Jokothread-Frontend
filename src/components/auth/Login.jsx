import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../../store/useAuthStore';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from "sonner";
import { GoogleLogin } from '@react-oauth/google';
import Aurora from '../ui/aurora';

function Login() {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });

    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);
    const [error, setError] = useState('');

    const navigate = useNavigate();
    const loginSuccess = useAuthStore((state) => state.loginSuccess);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await fetch(
                `${import.meta.env.VITE_BACKEND}/users/login`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData)
                }
            );

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || 'Gagal login');
            }

            loginSuccess(result.user, result.token);
            toast.success('Berhasil login');
            navigate('/');
        } catch (err) {
            setError(err.message);
            toast.error(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = async (credentialResponse) => {
        try {
            setGoogleLoading(true);
            const response = await fetch(
                `${import.meta.env.VITE_BACKEND}/users/google`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ credential: credentialResponse.credential })
                }
            );

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || 'Google login gagal');
            }

            loginSuccess(result.user, result.token);
            toast.success(`Welcome Back, ${result.user.name}`);
            navigate('/');
        } catch (err) {
            console.error(err);
            toast.error(err.message);
        } finally {
            setGoogleLoading(false);
        }
    };

    return (
        <main className="relative min-h-screen w-screen overflow-hidden flex items-center justify-center bg-slate-950 px-4">
            <div className="absolute inset-0 w-full h-full z-0 pointer-events-none">
                <Aurora
                    speed={0.6}
                    scale={1.5}
                    brightness={1}
                    color1="#f7f7f7"
                    color2="#e100ff"
                    noiseFrequency={2.5}
                    noiseAmplitude={1}
                    bandHeight={0.5}
                    bandSpread={1}
                    octaveDecay={0.1}
                    layerOffset={0}
                    colorSpeed={1}
                    enableMouseInteraction
                    mouseInfluence={0.25}
                />
            </div>

            <div className="relative z-10 w-full max-w-[840px] bg-[#161d30]/60 backdrop-blur-[40px] border border-white/10 rounded-2xl p-6 md:p-8 shadow-[0px_20px_60px_rgba(0,0,0,0.5)] overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                    {/* Sisi Kiri: Branding & Google Login */}
                    <div className="flex flex-col justify-center items-center md:items-start text-center md:text-left h-full border-b md:border-b-0 md:border-r border-white/10 pb-6 md:pb-0 md:pr-8">
                        <div className="w-16 h-16 mb-4 bg-white/5 border border-white/10 rounded-full flex items-center justify-center shadow-lg backdrop-blur-md text-white">
                            <svg viewBox="0 0 24 24" aria-hidden="true" className="w-7 h-7 fill-current">
                                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                            </svg>
                        </div>
                        <h1 className="text-2xl font-bold text-white mb-2 tracking-tight">Masuk</h1>
                        <p className="text-sm text-slate-400 mb-6">Lanjutkan perjalanan digital Anda.</p>
                        <div className="w-full flex flex-col items-center md:items-stretch">
                            <div className="w-full overflow-hidden rounded-xl">
                                <GoogleLogin
                                    onSuccess={handleGoogleLogin}
                                    onError={() => toast.error('Google login gagal')}
                                    theme="filled_black"
                                    shape="pill"
                                    text="continue_with"
                                    width={350}
                                />
                            </div>
                            {googleLoading && <div className="text-center md:text-left text-xs text-slate-400 mt-3">Memproses Google login...</div>}
                        </div>
                        <div className="mt-6 w-full">
                            <p className="text-sm text-slate-400">
                                Belum bergabung?
                                <Link to="/register" className="font-medium text-white hover:underline ml-1 transition-colors">Buat Akun Baru</Link>
                            </p>
                        </div>
                    </div>

                    {/* Sisi Kanan: Form Manual */}
                    <div className="flex flex-col gap-4">
                        {error && <div className="p-3 text-xs bg-red-500/20 border border-red-500/40 rounded-xl text-red-200 text-center">{error}</div>}
                        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                            <div className="flex flex-col gap-2">
                                <label htmlFor="email" className="text-xs font-medium text-slate-400 pl-1">Alamat Email</label>
                                <div className="relative group">
                                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-white transition-colors" style={{ fontVariationSettings: '"FILL" 0' }}>mail</span>
                                    <input id="email" name="email" type="email" required value={formData.email} onChange={handleChange} placeholder="nama@domain.com" className="w-full bg-slate-900/40 backdrop-blur-md border border-white/10 rounded-xl py-3 pl-12 pr-4 text-sm text-white placeholder:text-slate-600 focus:border-white/30 focus:ring-1 focus:ring-white/20 outline-none transition-all duration-300" />
                                </div>
                            </div>
                            <div className="flex flex-col gap-2">
                                <div className="flex justify-between items-center pl-1">
                                    <label htmlFor="password" className="text-xs font-medium text-slate-400">Kata Sandi</label>
                                    <button type="button" className="text-xs font-medium text-slate-400 hover:text-white transition-colors">Lupa Sandi?</button>
                                </div>
                                <div className="relative group">
                                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-white transition-colors" style={{ fontVariationSettings: '"FILL" 0' }}>lock</span>
                                    <input id="password" name="password" required value={formData.password} onChange={handleChange} placeholder="••••••••" type={showPassword ? 'text' : 'password'} className="w-full bg-slate-900/40 backdrop-blur-md border border-white/10 rounded-xl py-3 pl-12 pr-12 text-sm text-white placeholder:text-slate-600 focus:border-white/30 focus:ring-1 focus:ring-white/20 outline-none transition-all duration-300" />
                                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors focus:outline-none flex items-center justify-center cursor-pointer">
                                        <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: showPassword ? '"FILL" 1' : '"FILL" 0' }}>{showPassword ? 'visibility_off' : 'visibility'}</span>
                                    </button>
                                </div>
                            </div>
                            <button type="submit" disabled={loading} className="mt-2 w-full bg-white hover:bg-slate-200 disabled:bg-slate-500 disabled:cursor-not-allowed text-black font-semibold text-sm py-3 rounded-xl shadow-[0_0_20px_rgba(255,255,255,0.1)] transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer">
                                {loading ? 'Memproses...' : 'Masuk Sekarang'}
                                {!loading && <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: '"FILL" 0' }}>arrow_forward</span>}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </main>
    );
}

export default Login;