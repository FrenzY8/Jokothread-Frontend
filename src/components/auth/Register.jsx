import React, { useState } from 'react';
import { useAuthStore } from '../../store/useAuthStore';
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Alert, AlertDescription } from "../ui/alert";
import { toast } from "sonner";

function Register() {
    const [formData, setFormData] = useState({
        name: '',
        username: '',
        email: '',
        password: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const loginSuccess = useAuthStore((state) => state.loginSuccess);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await fetch(`${import.meta.env.VITE_BACKEND}/users/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name: formData.name,
                    username: formData.username.toLowerCase().replace(/\s+/g, ''),
                    email: formData.email,
                    password: formData.password
                })
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || 'Registrasi gagal');
            }

            loginSuccess(result.user, result.token);
            toast.success('Akun dibuat!');
            window.location.href = '/';

        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="relative z-10 w-full max-w-[440px] px-4 md:px-0 mx-auto my-auto flex flex-col justify-center items-center">
            <div className="w-full bg-[#161d30]/60 backdrop-blur-[40px] border border-white/10 rounded-2xl p-8 shadow-[0px_20px_60px_rgba(0,0,0,0.5)] relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />

                <div className="text-center mb-6">
                    <h1 className="text-2xl font-bold text-white mb-2 tracking-tight">Daftar Akun</h1>
                    <p className="text-sm text-slate-400">Mulai perjalanan digital Anda bersama kami.</p>
                </div>

                {error && (
                    <Alert variant="destructive" className="mb-4 bg-red-500/10 border-red-500/30 text-red-400 rounded-xl">
                        <AlertDescription className="text-xs text-center">
                            {error}
                        </AlertDescription>
                    </Alert>
                )}

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    {/* Nama Lengkap */}
                    <div className="flex flex-col gap-1.5">
                        <Label htmlFor="name" className="text-xs font-medium text-slate-400 pl-1">Nama Lengkap</Label>
                        <Input
                            id="name"
                            className="w-full bg-slate-900/40 border-white/10 rounded-xl py-3 px-4 h-11 text-sm text-white focus-visible:ring-1 focus-visible:ring-white/20"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="Nama Lengkap"
                            required
                            type="text"
                        />
                    </div>

                    {/* Username */}
                    <div className="flex flex-col gap-1.5">
                        <Label htmlFor="username" className="text-xs font-medium text-slate-400 pl-1">Username</Label>
                        <Input
                            id="username"
                            className="w-full bg-slate-900/40 border-white/10 rounded-xl py-3 px-4 h-11 text-sm text-white focus-visible:ring-1 focus-visible:ring-white/20"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            placeholder="username_kamu"
                            required
                            type="text"
                        />
                    </div>

                    {/* Email */}
                    <div className="flex flex-col gap-1.5">
                        <Label htmlFor="email" className="text-xs font-medium text-slate-400 pl-1">Alamat Email</Label>
                        <Input
                            id="email"
                            className="w-full bg-slate-900/40 border-white/10 rounded-xl py-3 px-4 h-11 text-sm text-white focus-visible:ring-1 focus-visible:ring-white/20"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="nama@domain.com"
                            required
                            type="email"
                        />
                    </div>

                    {/* Password */}
                    <div className="flex flex-col gap-1.5">
                        <Label htmlFor="password" className="text-xs font-medium text-slate-400 pl-1">Kata Sandi</Label>
                        <div className="relative">
                            <Input
                                id="password"
                                className="w-full bg-slate-900/40 border-white/10 rounded-xl py-3 pl-4 pr-12 h-11 text-sm text-white focus-visible:ring-1 focus-visible:ring-white/20"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="••••••••"
                                required
                                type={showPassword ? 'text' : 'password'}
                            />
                            <button
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 focus:outline-none cursor-pointer"
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                <span className="material-symbols-outlined text-[20px] select-none block">
                                    {showPassword ? 'visibility_off' : 'visibility'}
                                </span>
                            </button>
                        </div>
                    </div>

                    <Button
                        className="mt-2 w-full bg-white hover:bg-slate-200 text-black font-semibold text-sm h-11 rounded-xl transition-all duration-300 cursor-pointer"
                        type="submit"
                        disabled={loading}
                    >
                        {loading ? 'Mendaftarkan...' : 'Daftar Sekarang'}
                    </Button>
                </form>

                <div className="mt-6 pt-4 border-t border-white/10 text-center">
                    <p className="text-sm text-slate-400">
                        Sudah punya akun?
                        <a className="font-medium text-white hover:underline ml-1" href="/login">Masuk</a>
                    </p>
                </div>
            </div>
        </main>
    );
}

export default Register;