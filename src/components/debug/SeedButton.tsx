'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Database, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export function SeedButton() {
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleSeed = async () => {
        setIsLoading(true);
        try {
            const response = await fetch('/api/debug/seed-performance', {
                method: 'POST',
            });
            if (!response.ok) throw new Error('Failed to seed data');
            toast.success('Mock performance data seeded!');
            router.refresh();
        } catch (error) {
            toast.error('Failed to seed data');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Button variant="outline" size="sm" onClick={handleSeed} disabled={isLoading}>
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Database className="mr-2 h-4 w-4" />}
            Seed Demo Data
        </Button>
    );
}
