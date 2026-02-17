'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Sparkles, ArrowRight, Loader2, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

export default function NewBrandPage() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [brandData, setBrandData] = useState({
        name: '',
        website: '',
    });

    const handleNext = async () => {
        if (step === 1) {
            if (!brandData.name) {
                toast.error('Brand name is required');
                return;
            }
            setStep(2);
        } else if (step === 2) {
            setIsLoading(true);
            try {
                const response = await fetch('/api/brands', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(brandData),
                });

                if (!response.ok) throw new Error('Failed to create brand');

                const brand = await response.json();
                toast.success('Brand created successfully!');
                setStep(3);
                // In a real app, we would trigger analysis here
            } catch (error) {
                toast.error('Something went wrong');
            } finally {
                setIsLoading(false);
            }
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-8 py-8">
            <div className="space-y-2 text-center">
                <h1 className="text-3xl font-bold">Onboard New Brand</h1>
                <p className="text-muted-foreground">Follow the steps to build your Brand Brain.</p>
            </div>

            <div className="flex justify-center mb-8">
                <div className="flex items-center gap-4">
                    {[1, 2, 3].map((s) => (
                        <div key={s} className="flex items-center">
                            <div className={`h-8 w-8 rounded-full flex items-center justify-center font-bold ${step >= s ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                                }`}>
                                {step > s ? <CheckCircle2 className="h-5 w-5" /> : s}
                            </div>
                            {s < 3 && <div className={`h-0.5 w-12 mx-2 ${step > s ? 'bg-primary' : 'bg-muted'}`} />}
                        </div>
                    ))}
                </div>
            </div>

            {step === 1 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Basic Information</CardTitle>
                        <CardDescription>Tell us the name and website of the brand.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Brand Name</Label>
                            <Input
                                id="name"
                                placeholder="e.g. Acme Corp"
                                value={brandData.name}
                                onChange={(e) => setBrandData({ ...brandData, name: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="website">Website URL</Label>
                            <Input
                                id="website"
                                placeholder="https://acme.com"
                                value={brandData.website}
                                onChange={(e) => setBrandData({ ...brandData, website: e.target.value })}
                            />
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button className="ml-auto" onClick={handleNext}>
                            Next Step
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    </CardFooter>
                </Card>
            )}

            {step === 2 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Brand Guidelines & Assets</CardTitle>
                        <CardDescription>Upload PDFs or images that define the brand voice and style.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="border-2 border-dashed rounded-lg p-12 text-center space-y-4 hover:border-primary/50 transition-colors cursor-pointer">
                            <div className="bg-primary/10 h-12 w-12 rounded-full flex items-center justify-center mx-auto text-primary">
                                <Sparkles className="h-6 w-6" />
                            </div>
                            <div className="space-y-1">
                                <p className="font-medium text-sm">Click to upload or drag and drop</p>
                                <p className="text-xs text-muted-foreground">Brand Guidelines PDF, Logos, Font files (Max 10MB)</p>
                            </div>
                        </div>
                        <div className="text-sm text-muted-foreground italic text-center">
                            Our AI will analyze these files to build your Brand Brain.
                        </div>
                    </CardContent>
                    <CardFooter className="flex justify-between">
                        <Button variant="ghost" onClick={() => setStep(1)}>Back</Button>
                        <Button onClick={handleNext} disabled={isLoading}>
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Finish & Analyze
                        </Button>
                    </CardFooter>
                </Card>
            )}

            {step === 3 && (
                <Card className="border-primary">
                    <CardHeader className="text-center">
                        <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
                            <CheckCircle2 className="h-8 w-8 text-primary" />
                        </div>
                        <CardTitle className="text-2xl">Brand Analysis Started!</CardTitle>
                        <CardDescription>
                            We're building {brandData.name}'s Brand Brain. This usually takes 1-2 minutes.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4 text-center">
                        <p className="text-sm text-muted-foreground">
                            You'll be notified via email once the analysis is complete.
                            In the meantime, you can explore the dashboard.
                        </p>
                    </CardContent>
                    <CardFooter>
                        <Button className="w-full" onClick={() => router.push('/brands')}>
                            Go to Brands
                        </Button>
                    </CardFooter>
                </Card>
            )}
        </div>
    );
}
