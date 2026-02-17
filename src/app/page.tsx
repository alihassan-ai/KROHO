import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Sparkles, Zap, Shield, Image as ImageIcon, MessageSquare, Download, Layers } from 'lucide-react';

export default function LandingPage() {
    return (
        <div className="flex flex-col min-h-screen bg-neutral-950 text-neutral-50 overflow-x-hidden">
            {/* Navigation */}
            <header className="fixed top-0 w-full z-50 border-b border-white/5 bg-black/50 backdrop-blur-xl">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2 font-bold text-xl tracking-tighter uppercase">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                            <Layers className="h-5 w-5 text-white" />
                        </div>
                        KROHO
                    </div>
                    <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-neutral-400">
                        <a href="#features" className="hover:text-white transition-colors">Features</a>
                        <a href="#playground" className="hover:text-white transition-colors">Playground</a>
                        <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
                    </nav>
                    <div className="flex items-center gap-4">
                        <Link href="/login">
                            <Button variant="ghost" className="text-neutral-400 hover:text-white">Log in</Button>
                        </Link>
                        <Link href="/signup">
                            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white border-0 shadow-lg shadow-indigo-500/20">
                                Get Started
                            </Button>
                        </Link>
                    </div>
                </div>
            </header>

            <main className="flex-1">
                {/* Hero Section */}
                <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_800px_at_50%_-100px,#312e81,transparent)] opacity-50" />
                    <div className="container mx-auto px-4 relative">
                        <div className="max-w-4xl mx-auto text-center">
                            <Badge variant="outline" className="mb-6 py-1 px-4 border-indigo-500/30 bg-indigo-500/10 text-indigo-300 backdrop-blur-sm">
                                <Sparkles className="h-3 w-3 mr-2" />
                                V1 Live Now: Beta Access Open
                            </Badge>
                            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight mb-8 leading-[1.1]">
                                Creative Production at <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
                                    Machine Speed.
                                </span>
                            </h1>
                            <p className="text-lg md:text-xl text-neutral-400 mb-10 max-w-2xl mx-auto leading-relaxed">
                                The all-in-one playground for performance agencies. Inject your Brand Brain into AI and export platform-ready assets in seconds.
                            </p>
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                                <Link href="/signup">
                                    <Button size="lg" className="h-14 px-10 text-lg bg-indigo-600 hover:bg-indigo-700 text-white border-0 shadow-xl shadow-indigo-500/30">
                                        Start Generating Free
                                    </Button>
                                </Link>
                                <Link href="#features">
                                    <Button size="lg" variant="outline" className="h-14 px-10 text-lg border-white/10 hover:bg-white/5">
                                        View Features
                                    </Button>
                                </Link>
                            </div>

                            {/* Dashboard Preview Overlay */}
                            <div className="mt-20 relative px-4">
                                <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-600 opacity-20 blur-2xl rounded-[2rem]" />
                                <div className="relative border border-white/10 rounded-2xl bg-neutral-900/50 backdrop-blur shadow-2xl overflow-hidden aspect-[16/10] md:aspect-[16/9]">
                                    <div className="w-full h-12 bg-neutral-800/50 flex items-center px-4 gap-2 border-b border-white/5">
                                        <div className="flex gap-1.5">
                                            <div className="w-3 h-3 rounded-full bg-red-500/20" />
                                            <div className="w-3 h-3 rounded-full bg-yellow-500/20" />
                                            <div className="w-3 h-3 rounded-full bg-green-500/20" />
                                        </div>
                                    </div>
                                    <div className="p-8 flex items-center justify-center h-full">
                                        <div className="text-neutral-600 font-mono text-sm animate-pulse">
                                            [ Dashboard Experience Loading... ]
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Features Grid */}
                <section id="features" className="py-24 bg-neutral-900/50 border-y border-white/5">
                    <div className="container mx-auto px-4">
                        <div className="grid md:grid-cols-3 gap-8">
                            {[
                                {
                                    icon: Zap,
                                    title: "Brand Brain Intelligence",
                                    desc: "Analyze guidelines and past performance to build an unshakeable AI memory for your brand's voice and visual DNA."
                                },
                                {
                                    icon: ImageIcon,
                                    title: "Creative Playground",
                                    desc: "Toggle between FLUX and SDXL. Generate copy and images side-by-side with brand presets baked in."
                                },
                                {
                                    icon: Download,
                                    title: "Export Pipeline",
                                    desc: "One-click resize for Meta, TikTok, and Google. Download structured ZIPs ready for your media buyer."
                                }
                            ].map((f, i) => (
                                <div key={i} className="p-8 rounded-2xl border border-white/5 bg-neutral-950/50 hover:border-indigo-500/30 transition-all duration-300 group">
                                    <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center mb-6 group-hover:bg-indigo-500/20 transition-colors">
                                        <f.icon className="h-6 w-6 text-indigo-400" />
                                    </div>
                                    <h3 className="text-xl font-bold mb-3">{f.title}</h3>
                                    <p className="text-neutral-400 mb-0 leading-relaxed">{f.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Pricing Table */}
                <section id="pricing" className="py-24 relative overflow-hidden">
                    <div className="container mx-auto px-4 relative z-10">
                        <div className="text-center mb-16">
                            <h2 className="text-4xl md:text-5xl font-black mb-4">Simple, Scalable Pricing</h2>
                            <p className="text-neutral-400 max-w-xl mx-auto">No complex usage credits. Unlimited potential for your creative team.</p>
                        </div>

                        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                            {[
                                {
                                    name: "Starter",
                                    price: "$99",
                                    desc: "For small agencies and founders",
                                    features: ["3 Managed Brands", "100 Generations / mo", "Standard Export Packager", "Community Support"],
                                    cta: "Start with Starter",
                                    popular: false
                                },
                                {
                                    name: "Growth",
                                    price: "$199",
                                    desc: "Scaling performance workflows",
                                    features: ["10 Managed Brands", "500 Generations / mo", "Advanced ZIP Packager", "Custom Plan Presets", "Priority Support"],
                                    cta: "Get Growth Now",
                                    popular: true
                                },
                                {
                                    name: "Scale",
                                    price: "$349",
                                    desc: "For high-volume creative teams",
                                    features: ["25 Managed Brands", "Unlimited Generations", "White-label Briefs", "API Access (Coming Soon)", "Dedicated Success Manager"],
                                    cta: "Go Scale",
                                    popular: false
                                }
                            ].map((p, i) => (
                                <div key={i} className={`p-10 rounded-[2rem] border transition-all duration-500 relative flex flex-col ${p.popular
                                    ? "bg-neutral-900 border-indigo-500/50 shadow-2xl shadow-indigo-500/10 scale-105 z-20"
                                    : "bg-neutral-950/50 border-white/10 hover:border-white/20"
                                    }`}>
                                    {p.popular && (
                                        <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-600 text-white px-4 py-1 border-0">
                                            Most Popular
                                        </Badge>
                                    )}
                                    <div className="mb-8">
                                        <h3 className="text-2xl font-bold mb-2">{p.name}</h3>
                                        <p className="text-neutral-400 text-sm">{p.desc}</p>
                                    </div>
                                    <div className="mb-8 flex items-baseline gap-1">
                                        <span className="text-5xl font-black tracking-tighter">{p.price}</span>
                                        <span className="text-neutral-500 font-medium">/mo</span>
                                    </div>
                                    <ul className="space-y-4 mb-10 flex-1">
                                        {p.features.map((f, fi) => (
                                            <li key={fi} className="flex items-center gap-3 text-sm text-neutral-300">
                                                <div className="w-5 h-5 rounded-full bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                                                    <Check className="h-3 w-3 text-emerald-400" />
                                                </div>
                                                {f}
                                            </li>
                                        ))}
                                    </ul>
                                    <Link href="/signup">
                                        <Button className={`w-full h-12 text-lg font-bold rounded-xl ${p.popular
                                            ? "bg-indigo-600 hover:bg-indigo-700 text-white border-0"
                                            : "variant-outline border-white/10 hover:bg-white/5"
                                            }`}>
                                            {p.cta}
                                        </Button>
                                    </Link>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            </main>

            <footer className="py-20 border-t border-white/5 bg-black">
                <div className="container mx-auto px-4 text-center">
                    <div className="flex items-center justify-center gap-2 font-bold text-xl tracking-tighter mb-8 uppercase">
                        <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
                            <Layers className="h-5 w-5 text-white" />
                        </div>
                        KROHO
                    </div>
                    <p className="text-neutral-500 text-sm">
                        © {new Date().getFullYear()} KROHO. Built for winners.
                    </p>
                </div>
            </footer>
        </div>
    );
}
