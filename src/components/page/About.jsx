import React, { useState } from 'react'

function About() {
    const [openIndex, setOpenIndex] = useState(null);

    const faqData = [
        {
            question: "Apa itu platform ini?",
            answer: "Platform ini adalah media sosial berbasis teks (seperti Threads/Twitter) tempat kamu bisa berbagi pemikiran, mengikuti pengguna lain, dan berinteraksi secara real-time."
        },
        {
            question: "Bagaimana cara kerja akun Privat?",
            answer: "Jika akunmu diatur sebagai privat, pengguna lain yang ingin mengikutimu harus mengirimkan 'Permintaan Mengikuti' terlebih dahulu. Kamu bisa menerima atau menolak permintaan tersebut di menu notifikasi."
        },
        {
            question: "Apakah saya bisa membatalkan permintaan follow?",
            answer: "Bisa. Cukup tekan kembali tombol 'Requested' di profil pengguna tersebut untuk membatalkan permintaan mengikuti sebelum mereka menyetujuinya."
        }
    ];

    const toggleFaq = (index) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <div className="w-full max-w-[580px] mx-auto px-4 pt-4 pb-24 flex flex-col gap-6 text-slate-200">
            <div className="bg-[#182136]/50 border border-white/10 rounded-2xl p-6">
                <h1 className="text-2xl font-bold text-slate-100 mb-3">Tentang Kami</h1>
                <p className="text-sm text-slate-300 leading-relaxed">
                    Selamat datang di platform kami! Kami berkomitmen untuk menyediakan ruang digital 
                    yang aman, cepat, dan nyaman bagi semua orang untuk saling terhubung melalui rangkaian kata.
                </p>
            </div>

            <div className="flex flex-col gap-3">
                <h2 className="text-lg font-bold text-slate-100 px-1">Pertanyaan Sering Diajukan (FAQ)</h2>
                
                <div className="flex flex-col gap-2">
                    {faqData.map((faq, index) => {
                        const isOpen = openIndex === index;
                        return (
                            <div 
                                key={index} 
                                className="bg-[#182136]/30 border border-white/10 rounded-xl overflow-hidden transition-all duration-200"
                            >
                                <button
                                    onClick={() => toggleFaq(index)}
                                    className="w-full px-5 py-4 flex justify-between items-center text-left hover:bg-white/5 transition-colors cursor-pointer"
                                >
                                    <span className="font-semibold text-sm text-slate-200">
                                        {faq.question}
                                    </span>
                                    <span 
                                        className={`transform transition-transform duration-200 text-slate-400 text-xs ${
                                            isOpen ? 'rotate-180' : 'rotate-0'
                                        }`}
                                    >
                                        ▼
                                    </span>
                                </button>

                                <div 
                                    className={`transition-all duration-300 ease-in-out overflow-hidden ${
                                        isOpen ? 'max-h-[500px] border-t border-white/5 bg-[#182136]/10' : 'max-h-0'
                                    }`}
                                >
                                    <p className="px-5 py-4 text-xs text-slate-400 leading-relaxed whitespace-pre-line">
                                        {faq.answer}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    )
}

export default About