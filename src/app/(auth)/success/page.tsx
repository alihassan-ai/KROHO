import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { CheckCircle2, ArrowRight } from 'lucide-react';

export default function SuccessPage() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-neutral-950 text-white p-4">
            <div className="max-w-md w-full text-center space-y-8">
                <div className="flex justify-center">
                    <div className="w-20 h-20 rounded-full bg-emerald-500/20 flex items-center justify-center">
                        <CheckCircle2 className="h-12 w-12 text-emerald-400" />
                    </div>
                </div>

                <div className="space-y-2">
                    <h1 className="text-4xl font-bold tracking-tight">Subscription Active!</h1>
                    <p className="text-neutral-400">
                        Welcome to the premium club. Your account has been upgraded and your creative limits have been lifted.
                    </p>
                </div>

                <div className="pt-4">
                    <Link href="/dashboard">
                        <Button size="lg" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white h-12 text-lg">
                            Go to Dashboard <ArrowRight className="ml-2 h-5 w-5" />
                        </Button>
                    </Link>
                </div>

                <p className="text-xs text-neutral-500">
                    Your invoice will be emailed to you shortly. You can manage your subscription anytime from the billing settings.
                </p>
            </div>
        </div>
    );
}
