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

            loginSuccess(result.user, result.token)

            toast.success('Akun berhasil dibuat!')
            window.location.href = '/'

        } catch (err) {
            setError(err.message)
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
        <main className="relative z-10 w-full max-w-[440px] px-4 md:px-0 mx-auto my-auto flex flex-col justify-center items-center">

            <div className="w-full bg-[#161d30]/60 backdrop-blur-[40px] border border-white/10 rounded-3xl p-8 shadow-[0px_20px_60px_rgba(0,0,0,0.5)]">

                <div className="text-center mb-7">
                    <h1 className="text-3xl font-bold text-white tracking-tight">
                        Create Account
                    </h1>

                    <p className="text-sm text-slate-400 mt-2">
                        Mulai perjalanan digital Anda.
                    </p>
                </div>

                {error && (
                    <Alert className="mb-5 bg-red-500/10 border-red-500/20 text-red-400 rounded-2xl">
                        <AlertDescription>
                            {error}
                        </AlertDescription>
                    </Alert>
                )}

                <div className="mb-5">
                    <div className="overflow-hidden rounded-2xl">
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
                </div>

                <div className="relative flex items-center justify-center mb-5">
                    <div className="absolute inset-x-0 h-[1px] bg-white/10" />

                    <span className="relative px-3 bg-[#161d30] text-xs text-slate-500">
                        atau lanjut manual
                    </span>
                </div>

                <form
                    onSubmit={handleSubmit}
                    className="flex flex-col gap-4"
                >
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
                            className="bg-slate-900/40 border-white/10 rounded-2xl h-12 text-white"
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
                            className="bg-slate-900/40 border-white/10 rounded-2xl h-12 text-white"
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
                            className="bg-slate-900/40 border-white/10 rounded-2xl h-12 text-white"
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
                                className="bg-slate-900/40 border-white/10 rounded-2xl h-12 text-white pr-12"
                            />

                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white cursor-pointer"
                            >
                                <span className="material-symbols-outlined text-[20px]">
                                    {showPassword
                                        ? 'visibility_off'
                                        : 'visibility'}
                                </span>
                            </button>
                        </div>
                    </div>

                    <Button
                        type="submit"
                        disabled={loading}
                        className="mt-2 h-12 rounded-2xl bg-white hover:bg-slate-200 text-black font-semibold cursor-pointer"
                    >
                        {loading
                            ? 'Creating account...'
                            : 'Create Account'}
                    </Button>
                </form>

                <div className="mt-6 text-center">
                    <p className="text-sm text-slate-400">
                        Sudah punya akun?

                        <a
                            href="/login"
                            className="ml-1 text-white font-medium hover:underline"
                        >
                            Masuk
                        </a>
                    </p>
                </div>
            </div>
        </main>
    )
}

export default Register