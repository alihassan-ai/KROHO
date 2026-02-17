import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { XCircle, ArrowLeft } from 'lucide-react';

export default function CancelPage() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-neutral-950 text-white p-4">
            <div className="max-w-md w-full text-center space-y-8">
                <div className="flex justify-center">
                    <div className="w-20 h-20 rounded-full bg-red-500/20 flex items-center justify-center">
                        <XCircle className="h-12 w-12 text-red-400" />
                    </div>
                </div>

                <div className="space-y-2">
                    <h1 className="text-4xl font-bold tracking-tight">Checkout Cancelled</h1>
                    <p className="text-neutral-400">
                        No worries. Your account was not charged and your plan remains the same.
                    </p>
                </div>

                <div className="pt-4">
                    <Link href="/settings/billing">
                        <Button size="lg" variant="outline" className="w-full border-white/10 hover:bg-white/5 h-12 text-lg">
                            <ArrowLeft className="mr-2 h-5 w-5" /> Back to Billing
                        </Button>
                    </Link>
                </div>

                <p className="text-xs text-neutral-500">
                    If you ran into a technical problem, please contact our support team.
                </p>
            </div>
        </div>
    );
}
