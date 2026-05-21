import React from 'react'

function Explore() {
    return (
        <div className="w-full max-w-[580px] mx-auto px-4 py-4 flex flex-col gap-3">
            <div className="w-full max-w-[600px] px-container-margin-mobile md:px-0 pt-stack-md flex flex-col gap-5">
                <section className="sticky top-[72px] md:top-stack-md z-30 glass-panel p-4 rounded-2xl border border-white/10 shadow-xl bg-[#161d30]/60 backdrop-blur-md">
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <span className="material-symbols-outlined text-outline group-focus-within:text-primary transition-colors">
                                search
                            </span>
                        </div>
                        <input
                            className="w-full bg-surface-container/50 backdrop-blur-[20px] border border-white/10 text-on-surface rounded-full py-4 pl-12 pr-4 font-body-md placeholder:text-outline-variant focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary shadow-lg transition-all"
                            placeholder="Cari topik..."
                            type="text"
                        />
                    </div>
                </section>
                <section className="glass-panel p-4 rounded-2xl border border-white/10 bg-[#161d30]/40 backdrop-blur-md">
                    <div className="flex justify-between items-center mb-stack-sm">
                        <h2 className="font-headline-md text-headline-md text-on-surface">
                            Suggested for you
                        </h2>
                        <a className="text-primary font-label-sm hover:underline" href="#">
                            See all
                        </a>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-2 gap-gutter">
                        <div className="glass-panel p-stack-md rounded-[24px] flex flex-col items-center text-center gap-unit hover:bg-white/10 transition-colors cursor-pointer">
                            <img
                                alt="Profile of @designmaster"
                                className="w-16 h-16 rounded-full object-cover border-2 border-primary/30"
                                data-alt="A portrait of a male designer looking thoughtfully off-camera. He is wearing modern casual clothing. The background is a slightly blurred office setting with warm, ambient lighting. The style is professional yet approachable, fitting for a modern social media profile."
                                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCAEMnmowOJxl7HcCqhHIok0TzG4rOlDgAjgeSGnM61uJKDj_aki0V6rgZ1k48W4ykpKgg3VdDs5VMOtU_5pr4ViX1ThzcUNXx5ewTfvPL1Nucc6ugjylaDLM1B6tzlj2nmO3VAucAWeVzrqFVpFwD3V6pgNhJkQqB9Qn3CVSI49w6yIs53Y7JxmFThVKPmgR0kS0lOGvw0tr9M9QuK92Vd2cw1l4mEQaYJ57qmq3TJsnMumXFFFDn99zmyd2tN6Jzz-y-SYoezrZLv"
                            />
                            <div>
                                <div className="font-label-lg font-bold text-on-surface">
                                    Alex River
                                </div>
                                <div className="font-body-md text-body-md text-on-surface-variant text-sm">
                                    @designmaster
                                </div>
                            </div>
                            <button className="mt-2 w-full bg-white/15 hover:bg-white/25 text-on-surface font-label-sm py-2 rounded-full border border-white/20 transition-colors">
                                Follow
                            </button>
                        </div>
                        <div className="glass-panel p-stack-md rounded-[24px] flex flex-col items-center text-center gap-unit hover:bg-white/10 transition-colors cursor-pointer">
                            <img
                                alt="Profile of @techsarah"
                                className="w-16 h-16 rounded-full object-cover border-2 border-primary/30"
                                data-alt="A vibrant portrait of a female tech enthusiast smiling brightly at the camera. She is in a well-lit indoor environment with soft, cool-toned lighting. The image conveys energy and professionalism, suitable for a tech influencer's profile picture."
                                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDbgWyukNlAA57xTE6ouLBiJqgn4VipU6Ysuqxbc-ZDWcbjQnGBpgE1P-Wn99fZ7URtgx5MeNhOjf5gpLyKRkEODvacuFV5hlj3R9KfqJDgtrXx1dyY7ezW4duSLR2ZPp07C1xDxXu7Jn3xQa7WC5dt0fyCRMvWdreJE-EILsv3QvPY4OhJzZFZvHv2zaVZtSG97r6sdorT66GhYmCporayimFxPPHVKR0uvBH0_L0vg7Vz951GXNHgFFIll65Yi2A3JVjR3pfhBadV"
                            />
                            <div>
                                <div className="font-label-lg font-bold text-on-surface">
                                    Sarah Chen
                                </div>
                                <div className="font-body-md text-body-md text-on-surface-variant text-sm">
                                    @techsarah
                                </div>
                            </div>
                            <button className="mt-2 w-full bg-white/15 hover:bg-white/25 text-on-surface font-label-sm py-2 rounded-full border border-white/20 transition-colors">
                                Follow
                            </button>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    )
}

export default Explore