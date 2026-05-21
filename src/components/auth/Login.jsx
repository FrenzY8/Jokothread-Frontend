import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../../store/useAuthStore';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from "sonner";
import { GoogleLogin } from '@react-oauth/google';

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
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(formData)
                }
            );

            const result = await response.json();

            if (!response.ok) {
                throw new Error(
                    result.message || 'Gagal login'
                );
            }

            loginSuccess(
                result.user,
                result.token
            );

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
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        credential: credentialResponse.credential
                    })
                }
            );

            const result = await response.json();

            if (!response.ok) {
                throw new Error(
                    result.message || 'Google login gagal'
                );
            }

            loginSuccess(
                result.user,
                result.token
            );

            toast.success(
                `Welcome Back, ${result.user.name}`
            );

            navigate('/');

        } catch (err) {
            console.error(err);
            toast.error(err.message);
        } finally {
            setGoogleLoading(false);
        }
    };

    return (
        <main className="relative z-10 w-full max-w-[440px] px-4 md:px-0 mx-auto my-auto flex flex-col justify-center items-center">
            <div className="w-full bg-[#161d30]/60 backdrop-blur-[40px] border border-white/10 rounded-2xl p-8 shadow-[0px_20px_60px_rgba(0,0,0,0.5)] relative overflow-hidden">

                <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />

                <div className="text-center mb-6">
                    <div className="w-16 h-16 mx-auto mb-4 bg-white/5 border border-white/10 rounded-full flex items-center justify-center shadow-lg backdrop-blur-md">
                        <span
                            className="material-symbols-outlined text-white text-3xl"
                            style={{
                                fontVariationSettings: '"FILL" 1'
                            }}
                        >
                            graphic_eq
                        </span>
                    </div>

                    <h1 className="text-2xl font-bold text-white mb-2 tracking-tight">
                        Masuk
                    </h1>

                    <p className="text-sm text-slate-400">
                        Lanjutkan perjalanan digital Anda.
                    </p>
                </div>

                {error && (
                    <div className="mb-4 p-3 text-xs bg-red-500/20 border border-red-500/40 rounded-xl text-red-200 text-center">
                        {error}
                    </div>
                )}

                <div className="mb-5">
                    <div className="w-full flex justify-center">
                        <div className="scale-[1.02]">
                            <GoogleLogin
                                onSuccess={handleGoogleLogin}
                                onError={() => {
                                    toast.error('Google login gagal');
                                }}
                                theme="filled_black"
                                shape="pill"
                                text="continue_with"
                                width="370"
                            />
                        </div>
                    </div>

                    {googleLoading && (
                        <div className="text-center text-xs text-slate-400 mt-3">
                            Memproses Google login...
                        </div>
                    )}
                </div>

                <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-white/10" />
                    </div>

                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-[#161d30] px-3 text-slate-500">
                            atau lanjut dengan email
                        </span>
                    </div>
                </div>

                <form
                    onSubmit={handleSubmit}
                    className="flex flex-col gap-5"
                >

                    <div className="flex flex-col gap-2">
                        <label
                            htmlFor="email"
                            className="text-xs font-medium text-slate-400 pl-1"
                        >
                            Alamat Email
                        </label>

                        <div className="relative group">
                            <span
                                className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-white transition-colors"
                                style={{
                                    fontVariationSettings: '"FILL" 0'
                                }}
                            >
                                mail
                            </span>

                            <input
                                id="email"
                                name="email"
                                type="email"
                                required
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="nama@domain.com"
                                className="w-full bg-slate-900/40 backdrop-blur-md border border-white/10 rounded-xl py-3.5 pl-12 pr-4 text-sm text-white placeholder:text-slate-600 focus:border-white/30 focus:ring-1 focus:ring-white/20 outline-none transition-all duration-300"
                            />
                        </div>
                    </div>

                    <div className="flex flex-col gap-2">

                        <div className="flex justify-between items-center pl-1">
                            <label
                                htmlFor="password"
                                className="text-xs font-medium text-slate-400"
                            >
                                Kata Sandi
                            </label>

                            <button
                                type="button"
                                className="text-xs font-medium text-slate-400 hover:text-white transition-colors"
                            >
                                Lupa Sandi?
                            </button>
                        </div>

                        <div className="relative group">

                            <span
                                className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-white transition-colors"
                                style={{
                                    fontVariationSettings: '"FILL" 0'
                                }}
                            >
                                lock
                            </span>

                            <input
                                id="password"
                                name="password"
                                required
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="••••••••"
                                type={showPassword ? 'text' : 'password'}
                                className="w-full bg-slate-900/40 backdrop-blur-md border border-white/10 rounded-xl py-3.5 pl-12 pr-12 text-sm text-white placeholder:text-slate-600 focus:border-white/30 focus:ring-1 focus:ring-white/20 outline-none transition-all duration-300"
                            />

                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors focus:outline-none flex items-center justify-center"
                            >
                                <span
                                    className="material-symbols-outlined text-[22px]"
                                    style={{
                                        fontVariationSettings: showPassword
                                            ? '"FILL" 1'
                                            : '"FILL" 0'
                                    }}
                                >
                                    {showPassword
                                        ? 'visibility_off'
                                        : 'visibility'}
                                </span>
                            </button>

                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="mt-2 w-full bg-white hover:bg-slate-200 disabled:bg-slate-500 disabled:cursor-not-allowed text-black font-semibold text-sm py-3.5 rounded-xl shadow-[0_0_20px_rgba(255,255,255,0.1)] transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer"
                    >
                        {loading
                            ? 'Memproses...'
                            : 'Masuk Sekarang'}

                        {!loading && (
                            <span
                                className="material-symbols-outlined text-[18px]"
                                style={{
                                    fontVariationSettings: '"FILL" 0'
                                }}
                            >
                                arrow_forward
                            </span>
                        )}
                    </button>
                </form>

                <div className="mt-8 pt-5 border-t border-white/10 text-center">
                    <p className="text-sm text-slate-400">
                        Belum bergabung?

                        <Link
                            to="/register"
                            className="font-medium text-white hover:underline ml-1 transition-colors"
                        >
                            Buat Akun Baru
                        </Link>
                    </p>
                </div>

            </div>
        </main>
    );
}

export default Login;