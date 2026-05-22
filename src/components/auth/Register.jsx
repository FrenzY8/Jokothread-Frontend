import React, { useState } from 'react'
import { GoogleLogin } from '@react-oauth/google'
import { useAuthStore } from '../../store/useAuthStore'
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { Alert, AlertDescription } from "../ui/alert"
import { toast } from "sonner"

function Register() {
    const [formData, setFormData] = useState({
        name: '',
        username: '',
        email: '',
        password: ''
    })

    const [otpCode, setOtpCode] = useState('')
    const [isOtpStage, setIsOtpStage] = useState(false) // Mengontrol pergantian ke form OTP
    const [showPassword, setShowPassword] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const loginSuccess = useAuthStore((state) => state.loginSuccess)

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        })
    }

    // Tahap 1: Kirim Data Pendaftaran & Trigger OTP ke Real Email
    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        try {
            const response = await fetch(
                `${import.meta.env.VITE_BACKEND}/users/register`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        name: formData.name,
                        username: formData.username
                            .toLowerCase()
                            .replace(/\s+/g, ''),
                        email: formData.email,
                        password: formData.password
                    })
                }
            )

            const result = await response.json()

            if (!response.ok) {
                throw new Error(result.message || 'Registrasi gagal')
            }

            toast.success(result.message || 'Kode OTP telah dikirim ke email Anda.')
            setIsOtpStage(true) // Pindah ke tampilan input OTP

        } catch (err) {
            setError(err.message)
            toast.error(err.message)
        } finally {
            setLoading(false)
        }
    }

    // Tahap 2: Verifikasi Kode OTP yang Diinput User
    const handleVerifyOtp = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        try {
            const response = await fetch(
                `${import.meta.env.VITE_BACKEND}/users/verify-otp`, // Sesuaikan endpoint backend verifikasi OTP kamu
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        email: formData.email,
                        otpCode: otpCode
                    })
                }
            )

            const result = await response.json()

            if (!response.ok) {
                throw new Error(result.message || 'Verifikasi OTP gagal')
            }

            loginSuccess(result.user, result.token)
            toast.success('Akun berhasil diverifikasi dan dibuat!')
            window.location.href = '/'

        } catch (err) {
            setError(err.message)
            toast.error(err.message)
        } finally {
            setLoading(false)
        }
    }

    const handleGoogleSuccess = async (credentialResponse) => {
        try {
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
            )

            const result = await response.json()

            if (!response.ok) {
                throw new Error(result.message)
            }

            loginSuccess(result.user, result.token)
            toast.success('Login berhasil!')
            window.location.href = '/'

        } catch (err) {
            toast.error(err.message)
        }
    }

    return (
        <main className="relative z-10 w-full max-w-[840px] px-4 mx-auto my-auto flex flex-col justify-center items-center">
            
            <div className="w-full bg-[#161d30]/60 backdrop-blur-[40px] border border-white/10 rounded-3xl p-6 md:p-8 shadow-[0px_20px_60px_rgba(0,0,0,0.5)] relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                    
                    {/* Sisi Kiri: Branding & Oauth */}
                    <div className="flex flex-col justify-center items-center md:items-start text-center md:text-left h-full border-b md:border-b-0 md:border-r border-white/10 pb-6 md:pb-0 md:pr-8">
                        <div className="w-16 h-16 mb-4 bg-white/5 border border-white/10 rounded-full flex items-center justify-center shadow-lg backdrop-blur-md">
                            <span
                                className="material-symbols-outlined text-white text-3xl"
                                style={{ fontVariationSettings: '"FILL" 1' }}
                            >
                                {isOtpStage ? 'mark_email_unread' : 'graphic_eq'}
                            </span>
                        </div>

                        <h1 className="text-2xl font-bold text-white mb-2 tracking-tight">
                            {isOtpStage ? 'Verifikasi OTP' : 'Daftar Akun'}
                        </h1>

                        <p className="text-sm text-slate-400 mb-6">
                            {isOtpStage 
                                ? `Kami telah mengirimkan kode verifikasi 6 digit ke email ${formData.email}`
                                : 'Lanjutkan perjalanan digital Anda bersama kami.'}
                        </p>

                        {!isOtpStage && (
                            <div className="w-full overflow-hidden rounded-2xl mb-4">
                                <GoogleLogin
                                    onSuccess={handleGoogleSuccess}
                                    onError={() => {
                                        toast.error('Google login gagal')
                                    }}
                                    theme="filled_black"
                                    shape="pill"
                                    size="large"
                                    text="continue_with"
                                    width="100%"
                                />
                            </div>
                        )}

                        <div className="mt-4 text-center md:text-left w-full">
                            <p className="text-sm text-slate-400">
                                {isOtpStage ? 'Salah memasukkan email?' : 'Sudah punya akun?'}
                                {isOtpStage ? (
                                    <button 
                                        type="button" 
                                        onClick={() => setIsOtpStage(false)} 
                                        className="ml-1 text-white font-medium hover:underline cursor-pointer bg-transparent border-none"
                                    >
                                        Kembali
                                    </button>
                                ) : (
                                    <a href="/login" className="ml-1 text-white font-medium hover:underline">
                                        Masuk
                                    </a>
                                )}
                            </p>
                        </div>
                    </div>

                    {/* Sisi Kanan: Form Registrasi / Form OTP */}
                    <div className="flex flex-col gap-4">
                        {error && (
                            <Alert className="bg-red-500/10 border-red-500/20 text-red-400 rounded-2xl">
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}

                        {/* Kondisi Jika Masuk Tahap Input OTP */}
                        {isOtpStage ? (
                            <form onSubmit={handleVerifyOtp} className="flex flex-col gap-4">
                                <div className="flex flex-col gap-2">
                                    <Label htmlFor="otpCode" className="text-xs text-slate-400 pl-1">
                                        Kode OTP 6-Digit
                                    </Label>
                                    <Input
                                        id="otpCode"
                                        name="otpCode"
                                        type="text"
                                        maxLength={6}
                                        value={otpCode}
                                        onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))} // Hanya menerima angka
                                        placeholder="000000"
                                        required
                                        className="bg-slate-900/40 border-white/10 rounded-2xl h-12 text-center text-xl font-bold tracking-[10px] text-white focus:placeholder:opacity-0"
                                    />
                                </div>

                                <Button
                                    type="submit"
                                    disabled={loading || otpCode.length !== 6}
                                    className="mt-2 h-11 rounded-2xl bg-white hover:bg-slate-200 text-black font-semibold cursor-pointer disabled:bg-slate-600 disabled:text-slate-400"
                                >
                                    {loading ? 'Verifying...' : 'Verifikasi & Aktivasi'}
                                </Button>
                            </form>
                        ) : (
                            /* Tampilan Utama Form Registrasi Biasa */
                            <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
                                <div className="flex flex-col gap-1.5">
                                    <Label className="text-xs text-slate-400 pl-1">
                                        Nama Lengkap
                                    </Label>
                                    <Input
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        placeholder="Nama Lengkap"
                                        required
                                        className="bg-slate-900/40 border-white/10 rounded-2xl h-11 text-white"
                                    />
                                </div>

                                <div className="flex flex-col gap-1.5">
                                    <Label className="text-xs text-slate-400 pl-1">
                                        Username
                                    </Label>
                                    <Input
                                        name="username"
                                        value={formData.username}
                                        onChange={handleChange}
                                        placeholder="username"
                                        required
                                        className="bg-slate-900/40 border-white/10 rounded-2xl h-11 text-white"
                                    />
                                </div>

                                <div className="flex flex-col gap-1.5">
                                    <Label className="text-xs text-slate-400 pl-1">
                                        Email
                                    </Label>
                                    <Input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        placeholder="nama@email.com"
                                        required
                                        className="bg-slate-900/40 border-white/10 rounded-2xl h-11 text-white"
                                    />
                                </div>

                                <div className="flex flex-col gap-1.5">
                                    <Label className="text-xs text-slate-400 pl-1">
                                        Password
                                    </Label>
                                    <div className="relative">
                                        <Input
                                            type={showPassword ? 'text' : 'password'}
                                            name="password"
                                            value={formData.password}
                                            onChange={handleChange}
                                            placeholder="••••••••"
                                            required
                                            className="bg-slate-900/40 border-white/10 rounded-2xl h-11 text-white pr-12"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white cursor-pointer"
                                        >
                                            <span className="material-symbols-outlined text-[18px]">
                                                {showPassword ? 'visibility_off' : 'visibility'}
                                            </span>
                                        </button>
                                    </div>
                                </div>

                                <Button
                                    type="submit"
                                    disabled={loading}
                                    className="mt-2 h-11 rounded-2xl bg-white hover:bg-slate-200 text-black font-semibold cursor-pointer"
                                >
                                    {loading ? 'Sending OTP...' : 'Daftar & Kirim OTP'}
                                </Button>
                            </form>
                        )}
                    </div>

                </div>
            </div>
        </main>
    )
}

export default Register