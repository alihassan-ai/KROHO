'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
    Loader2, ArrowRight, ArrowLeft, Sparkles, Globe, Upload,
    Target, Zap, Users, TrendingUp, CheckCircle2, Plus, X, Building2
} from 'lucide-react';
import { toast } from 'sonner';
import { AssetUploader } from './AssetUploader';

// ── Brand Archetypes ──────────────────────────────────────────────────────────
const BRAND_ARCHETYPES = [
    { id: 'Hero', label: 'Hero', emoji: '⚔️', desc: 'Empowers people to achieve great things. Nike, Army.' },
    { id: 'Sage', label: 'Sage', emoji: '🦉', desc: 'Shares knowledge and wisdom. Google, Harvard.' },
    { id: 'Explorer', label: 'Explorer', emoji: '🧭', desc: 'Encourages freedom and discovery. Patagonia, Jeep.' },
    { id: 'Outlaw', label: 'Outlaw', emoji: '🔥', desc: 'Disrupts the status quo. Harley-Davidson, Red Bull.' },
    { id: 'Creator', label: 'Creator', emoji: '✨', desc: 'Builds things of lasting value. Apple, LEGO.' },
    { id: 'Ruler', label: 'Ruler', emoji: '👑', desc: 'Commands authority and premium status. Rolex, Mercedes.' },
    { id: 'Magician', label: 'Magician', emoji: '🪄', desc: 'Transforms and wows. Disney, Dyson.' },
    { id: 'Lover', label: 'Lover', emoji: '💎', desc: 'Creates connection and desire. Chanel, Hallmark.' },
    { id: 'Jester', label: 'Jester', emoji: '😄', desc: 'Makes people laugh and enjoy. Wendy\'s, Dollar Shave Club.' },
    { id: 'Everyman', label: 'Everyman', emoji: '🤝', desc: 'Relatable and down-to-earth. IKEA, Target.' },
    { id: 'Caregiver', label: 'Caregiver', emoji: '💚', desc: 'Protects and nurtures. Johnson & Johnson, TOMS.' },
    { id: 'Innocent', label: 'Innocent', emoji: '🌸', desc: 'Pure, optimistic, simple. Dove, Whole Foods.' },
];

const STEPS = [
    { title: 'Brand Identity', description: 'Who you are', icon: Building2 },
    { title: 'Target Customer', description: 'Who you serve', icon: Users },
    { title: 'Positioning', description: 'How you win', icon: Target },
    { title: 'Personality', description: 'How you sound', icon: Zap },
    { title: 'Assets & Launch', description: 'Upload & analyze', icon: Sparkles },
];

// ── Tag Input helper ───────────────────────────────────────────────────────────
function TagInput({
    label, placeholder, values, onChange, hint,
}: {
    label: string; placeholder: string; values: string[]; onChange: (v: string[]) => void; hint?: string;
}) {
    const [input, setInput] = useState('');

    const add = () => {
        const trimmed = input.trim();
        if (trimmed && !values.includes(trimmed)) {
            onChange([...values, trimmed]);
        }
        setInput('');
    };

    return (
        <div className="space-y-2">
            <Label>{label}</Label>
            <div className="flex gap-2">
                <Input
                    placeholder={placeholder}
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); add(); } }}
                />
                <Button type="button" variant="outline" size="icon" onClick={add}>
                    <Plus className="h-4 w-4" />
                </Button>
            </div>
            {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
            {values.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                    {values.map(v => (
                        <Badge key={v} variant="secondary" className="gap-1 pr-1">
                            {v}
                            <button onClick={() => onChange(values.filter(x => x !== v))}>
                                <X className="h-3 w-3" />
                            </button>
                        </Badge>
                    ))}
                </div>
            )}
        </div>
    );
}

// ── Main Wizard ───────────────────────────────────────────────────────────────
export function BrandOnboardingWizard() {
    const router = useRouter();
    const [step, setStep] = useState(0);
    const [loading, setLoading] = useState(false);
    const [brandId, setBrandId] = useState<string | null>(null);

    // Step 1 — Brand Identity
    const [name, setName] = useState('');
    const [website, setWebsite] = useState('');
    const [marketCategory, setMarketCategory] = useState('');
    const [tagline, setTagline] = useState('');
    const [missionStatement, setMissionStatement] = useState('');

    // Step 2 — Target Customer
    const [primaryCustomer, setPrimaryCustomer] = useState('');
    const [customerAge, setCustomerAge] = useState('');
    const [customerIncome, setCustomerIncome] = useState('');
    const [painPoints, setPainPoints] = useState<string[]>([]);
    const [customerGoals, setCustomerGoals] = useState<string[]>([]);
    const [buyingTriggers, setBuyingTriggers] = useState<string[]>([]);

    // Step 3 — Positioning
    const [mainCompetitors, setMainCompetitors] = useState<string[]>([]);
    const [keyDifferentiator, setKeyDifferentiator] = useState('');
    const [positioningStatement, setPositioningStatement] = useState('');
    const [notBrand, setNotBrand] = useState(''); // "We are NOT..."

    // Step 4 — Personality
    const [brandArchetype, setBrandArchetype] = useState('');
    const [toneWords, setToneWords] = useState<string[]>([]);
    const [bannedWords, setBannedWords] = useState<string[]>([]);

    // ── Step Handlers ──────────────────────────────────────────────────────────

    const handleCreateBrand = async () => {
        if (!name.trim()) { toast.error('Brand name is required'); return; }
        setLoading(true);
        try {
            const res = await fetch('/api/brands', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: name.trim(),
                    website: website.trim() || undefined,
                }),
            });
            if (!res.ok) throw new Error('Failed to create brand');
            const brand = await res.json();
            setBrandId(brand.id);
            setStep(1);
        } catch {
            toast.error('Failed to create brand');
        } finally {
            setLoading(false);
        }
    };

    const handleAnalyze = async () => {
        if (!brandId) return;
        setLoading(true);

        // Build the wizard context to pass to the AI
        const wizardContext = {
            brandIdentity: {
                name,
                website,
                marketCategory,
                tagline,
                missionStatement,
            },
            targetCustomer: {
                description: primaryCustomer,
                ageRange: customerAge,
                incomeRange: customerIncome,
                painPoints,
                goals: customerGoals,
                buyingTriggers,
            },
            positioning: {
                positioningStatement,
                keyDifferentiator,
                mainCompetitors,
                theyAreNot: notBrand,
            },
            personality: {
                brandArchetype,
                toneDescriptors: toneWords,
                bannedWords,
            },
        };

        try {
            const res = await fetch(`/api/brands/${brandId}/analyze`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(wizardContext),
            });
            if (!res.ok) throw new Error('Analysis failed');
            setStep(5); // Loading/success step
            toast.success('Analysis started! Building your Brand Brain...');
            setTimeout(() => router.push(`/brands/${brandId}`), 3000);
        } catch {
            toast.error('Failed to start analysis');
            setLoading(false);
        }
    };

    const canProceed = () => {
        if (step === 0) return name.trim().length > 0;
        return true;
    };

    // ── Render ─────────────────────────────────────────────────────────────────

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            {/* Progress bar */}
            {step < 5 && (
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        {STEPS.map((s, i) => {
                            const Icon = s.icon;
                            return (
                                <div key={i} className={`flex flex-col items-center gap-1 flex-1 ${i < STEPS.length - 1 ? 'relative' : ''}`}>
                                    <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-medium transition-all
                                        ${i < step ? 'bg-primary text-primary-foreground' :
                                            i === step ? 'bg-primary text-primary-foreground ring-4 ring-primary/20' :
                                                'bg-muted text-muted-foreground'}`}>
                                        {i < step ? <CheckCircle2 className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                                    </div>
                                    <span className="text-xs text-muted-foreground hidden sm:block">{s.title}</span>
                                    {i < STEPS.length - 1 && (
                                        <div className={`absolute left-1/2 top-4 w-full h-0.5 -z-10 ${i < step ? 'bg-primary' : 'bg-muted'}`} />
                                    )}
                                </div>
                            );
                        })}
                    </div>
                    <Progress value={((step + 1) / STEPS.length) * 100} className="h-1" />
                    <p className="text-sm text-center text-muted-foreground">
                        Step {step + 1} of {STEPS.length} — {STEPS[step].description}
                    </p>
                </div>
            )}

            {/* ── STEP 0: Brand Identity ─────────────────────────────────────── */}
            {step === 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Building2 className="h-5 w-5 text-primary" />
                            Brand Identity
                        </CardTitle>
                        <CardDescription>
                            Let's start with the basics. The more context you give, the better your Brand Brain will be.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2 col-span-2">
                                <Label>Brand Name <span className="text-destructive">*</span></Label>
                                <Input
                                    placeholder="e.g. Acme Corp"
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="flex items-center gap-1.5">
                                    <Globe className="h-3.5 w-3.5" /> Website
                                </Label>
                                <Input placeholder="https://acme.com" value={website} onChange={e => setWebsite(e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label>Industry / Market Category</Label>
                                <Input placeholder="e.g. B2B SaaS, DTC Skincare, E-commerce" value={marketCategory} onChange={e => setMarketCategory(e.target.value)} />
                            </div>
                            <div className="space-y-2 col-span-2">
                                <Label>Tagline or Brand Slogan</Label>
                                <Input placeholder="e.g. Just Do It" value={tagline} onChange={e => setTagline(e.target.value)} />
                            </div>
                            <div className="space-y-2 col-span-2">
                                <Label>Mission Statement (optional)</Label>
                                <Textarea
                                    placeholder="Why does your brand exist beyond making money? e.g. 'To empower small businesses with enterprise-grade tools.'"
                                    value={missionStatement}
                                    onChange={e => setMissionStatement(e.target.value)}
                                    rows={2}
                                />
                            </div>
                        </div>
                        <Button className="w-full" onClick={handleCreateBrand} disabled={loading || !name.trim()}>
                            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ArrowRight className="mr-2 h-4 w-4" />}
                            Continue
                        </Button>
                    </CardContent>
                </Card>
            )}

            {/* ── STEP 1: Target Customer ────────────────────────────────────── */}
            {step === 1 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Users className="h-5 w-5 text-primary" />
                            Target Customer
                        </CardTitle>
                        <CardDescription>
                            Describe your ideal customer. This shapes every creative decision — the more specific, the better.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label>Who is your primary customer?</Label>
                            <Textarea
                                placeholder="e.g. 'Founders and marketing managers at early-stage SaaS startups who are trying to scale their ad spend but don't have an in-house creative team.'"
                                value={primaryCustomer}
                                onChange={e => setPrimaryCustomer(e.target.value)}
                                rows={2}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Age Range</Label>
                                <Input placeholder="e.g. 28-45" value={customerAge} onChange={e => setCustomerAge(e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label>Income / Budget Level</Label>
                                <Input placeholder="e.g. $80k-$150k / SMB budget" value={customerIncome} onChange={e => setCustomerIncome(e.target.value)} />
                            </div>
                        </div>
                        <TagInput
                            label="Their Biggest Pain Points"
                            placeholder="Add a pain point and press Enter"
                            values={painPoints}
                            onChange={setPainPoints}
                            hint="What problems keep them up at night? What frustrates them daily?"
                        />
                        <TagInput
                            label="Their Goals & Desires"
                            placeholder="Add a goal and press Enter"
                            values={customerGoals}
                            onChange={setCustomerGoals}
                            hint="What outcomes are they trying to achieve?"
                        />
                        <TagInput
                            label="Buying Triggers"
                            placeholder="Add a trigger and press Enter"
                            values={buyingTriggers}
                            onChange={setBuyingTriggers}
                            hint="What makes them finally decide to buy? The 'last straw' moments."
                        />
                        <div className="flex gap-3">
                            <Button variant="outline" className="flex-1" onClick={() => setStep(s => s - 1)}>
                                <ArrowLeft className="mr-2 h-4 w-4" /> Back
                            </Button>
                            <Button className="flex-1" onClick={() => setStep(s => s + 1)}>
                                Continue <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* ── STEP 2: Positioning ────────────────────────────────────────── */}
            {step === 2 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Target className="h-5 w-5 text-primary" />
                            Brand Positioning
                        </CardTitle>
                        <CardDescription>
                            How you're positioned in the market determines every campaign angle. Let's nail this.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label>Positioning Statement (optional — AI will generate if empty)</Label>
                            <Textarea
                                placeholder="For [your ICP], [Brand] is the [category] that [key benefit] because [reason to believe]."
                                value={positioningStatement}
                                onChange={e => setPositioningStatement(e.target.value)}
                                rows={2}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Key Differentiator — What makes you genuinely different?</Label>
                            <Textarea
                                placeholder="e.g. 'We're the only platform that combines AI copywriting with real performance data from your ad account — so every suggestion is calibrated to what's actually working for you, not generic best practices.'"
                                value={keyDifferentiator}
                                onChange={e => setKeyDifferentiator(e.target.value)}
                                rows={3}
                            />
                        </div>
                        <TagInput
                            label="Main Competitors"
                            placeholder="Competitor name and press Enter"
                            values={mainCompetitors}
                            onChange={setMainCompetitors}
                            hint="Who do customers compare you to? Who are you fighting for share-of-wallet?"
                        />
                        <div className="space-y-2">
                            <Label>What is your brand NOT? (optional)</Label>
                            <Input
                                placeholder="e.g. 'We are NOT a cheap alternative. We are NOT for enterprise.'"
                                value={notBrand}
                                onChange={e => setNotBrand(e.target.value)}
                            />
                        </div>
                        <div className="flex gap-3">
                            <Button variant="outline" className="flex-1" onClick={() => setStep(s => s - 1)}>
                                <ArrowLeft className="mr-2 h-4 w-4" /> Back
                            </Button>
                            <Button className="flex-1" onClick={() => setStep(s => s + 1)}>
                                Continue <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* ── STEP 3: Brand Personality ─────────────────────────────────── */}
            {step === 3 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Zap className="h-5 w-5 text-primary" />
                            Brand Personality
                        </CardTitle>
                        <CardDescription>
                            Your brand's personality shapes its voice. Select the archetype that resonates most.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-5">
                        <div className="space-y-2">
                            <Label>Brand Archetype</Label>
                            <div className="grid grid-cols-3 gap-2">
                                {BRAND_ARCHETYPES.map(arch => (
                                    <button
                                        key={arch.id}
                                        onClick={() => setBrandArchetype(arch.id === brandArchetype ? '' : arch.id)}
                                        className={`p-3 rounded-lg border text-left transition-all hover:border-primary/50
                                            ${brandArchetype === arch.id
                                                ? 'border-primary bg-primary/5 ring-1 ring-primary'
                                                : 'border-border bg-muted/30'}`}
                                    >
                                        <div className="text-lg mb-1">{arch.emoji}</div>
                                        <div className="text-sm font-medium">{arch.label}</div>
                                        <div className="text-xs text-muted-foreground leading-tight mt-0.5">{arch.desc}</div>
                                    </button>
                                ))}
                            </div>
                        </div>
                        <TagInput
                            label="Tone Descriptors"
                            placeholder="Add a tone word and press Enter"
                            values={toneWords}
                            onChange={setToneWords}
                            hint="e.g. 'bold', 'witty', 'empathetic', 'no-nonsense', 'inspiring'"
                        />
                        <TagInput
                            label="Banned Words / Phrases"
                            placeholder="Add banned word and press Enter"
                            values={bannedWords}
                            onChange={setBannedWords}
                            hint="Words that feel off-brand: e.g. 'cheap', 'just', 'synergy', 'disruptive'"
                        />
                        <div className="flex gap-3">
                            <Button variant="outline" className="flex-1" onClick={() => setStep(s => s - 1)}>
                                <ArrowLeft className="mr-2 h-4 w-4" /> Back
                            </Button>
                            <Button className="flex-1" onClick={() => setStep(s => s + 1)}>
                                Continue <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* ── STEP 4: Assets & Launch ───────────────────────────────────── */}
            {step === 4 && brandId && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Upload className="h-5 w-5 text-primary" />
                            Upload Assets & Build Brand Brain
                        </CardTitle>
                        <CardDescription>
                            Upload brand guidelines (PDF), logos, and example ads. The AI will combine everything to build your Brand Brain.
                            <span className="block mt-1 text-xs">Assets are optional — the AI can work from your website and the context you've provided.</span>
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <AssetUploader brandId={brandId} />

                        <div className="rounded-lg bg-muted/50 border p-4 space-y-2">
                            <p className="text-sm font-medium">What we'll build for you:</p>
                            <ul className="text-sm text-muted-foreground space-y-1">
                                <li className="flex items-center gap-2"><TrendingUp className="h-3.5 w-3.5 text-primary" /> Brand positioning & archetype</li>
                                <li className="flex items-center gap-2"><Users className="h-3.5 w-3.5 text-primary" /> ICP personas with deep psychology</li>
                                <li className="flex items-center gap-2"><Target className="h-3.5 w-3.5 text-primary" /> Content pillars & messaging hierarchy</li>
                                <li className="flex items-center gap-2"><Zap className="h-3.5 w-3.5 text-primary" /> Platform-specific playbooks (Meta, TikTok, Google)</li>
                                <li className="flex items-center gap-2"><Sparkles className="h-3.5 w-3.5 text-primary" /> Voice & visual DNA</li>
                            </ul>
                        </div>

                        <div className="flex gap-3">
                            <Button variant="outline" className="flex-1" onClick={() => setStep(s => s - 1)} disabled={loading}>
                                <ArrowLeft className="mr-2 h-4 w-4" /> Back
                            </Button>
                            <Button className="flex-1" onClick={handleAnalyze} disabled={loading}>
                                {loading ? (
                                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Launching...</>
                                ) : (
                                    <><Sparkles className="mr-2 h-4 w-4" /> Build Brand Brain</>
                                )}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* ── STEP 5: Building / Success ────────────────────────────────── */}
            {step === 5 && (
                <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-transparent text-center">
                    <CardContent className="py-16 space-y-4">
                        <div className="relative mx-auto w-16 h-16">
                            <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />
                            <div className="relative h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                                <Sparkles className="h-8 w-8 text-primary animate-pulse" />
                            </div>
                        </div>
                        <div>
                            <h3 className="font-bold text-xl">Building Your Brand Brain...</h3>
                            <p className="text-muted-foreground text-sm mt-2 max-w-sm mx-auto">
                                Our AI is analyzing everything — your context, guidelines, and website —
                                to build a comprehensive strategic intelligence document.
                            </p>
                        </div>
                        <div className="space-y-1.5 text-sm text-muted-foreground">
                            <p className="animate-pulse">Extracting voice & visual DNA...</p>
                        </div>
                        <p className="text-xs text-muted-foreground pt-2">Redirecting to your Brand Brain in a moment...</p>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
