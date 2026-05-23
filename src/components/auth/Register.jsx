import React, { useState } from 'react'
import { GoogleLogin } from '@react-oauth/google'
import { useAuthStore } from '../../store/useAuthStore'
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { Alert, AlertDescription } from "../ui/alert"
import { toast } from "sonner"
import Aurora from '../ui/aurora';

function Register() {
    const [formData, setFormData] = useState({
        name: '',
        username: '',
        email: '',
        password: ''
    })

    const [otpCode, setOtpCode] = useState('')
    const [isOtpStage, setIsOtpStage] = useState(false)
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
            setIsOtpStage(true)

        } catch (err) {
            setError(err.message)
            toast.error(err.message)
        } finally {
            setLoading(false)
        }
    }

    const handleVerifyOtp = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        try {
            const response = await fetch(
                `${import.meta.env.VITE_BACKEND}/users/verify-otp`,
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
        <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-slate-950">
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

            <main className="relative z-10 w-full max-w-[840px] px-4 mx-auto">
                <div className="w-full bg-[#161d30]/60 backdrop-blur-[40px] border border-white/10 rounded-2xl p-6 md:p-8 shadow-[0px_20px_60px_rgba(0,0,0,0.5)] overflow-hidden">
                    <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">

                        <div className="flex flex-col justify-center items-center md:items-start text-center md:text-left h-full border-b md:border-b-0 md:border-r border-white/10 pb-6 md:pb-0 md:pr-8">
                            <div className="w-16 h-16 mb-4 bg-white/5 border border-white/10 rounded-full flex items-center justify-center shadow-lg backdrop-blur-md text-white">
                                <svg viewBox="0 0 24 24" aria-hidden="true" className="w-7 h-7 fill-current">
                                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                                </svg>
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
                                        width={350}
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

                        <div className="flex flex-col gap-4">
                            {error && (
                                <Alert className="bg-red-500/10 border-red-500/20 text-red-400 rounded-2xl">
                                    <AlertDescription>{error}</AlertDescription>
                                </Alert>
                            )}

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
                                            onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
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
        </div>
    )
}

export default Register