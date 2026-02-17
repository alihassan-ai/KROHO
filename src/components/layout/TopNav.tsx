'use client';

import { UserNav } from './UserNav';
import { BrandSwitcher } from './BrandSwitcher';
import Link from 'next/link';

export function TopNav() {
    return (
        <header className="flex h-14 items-center justify-between border-b bg-background px-6">
            <div className="flex items-center gap-8">
                <BrandSwitcher />
                <nav className="flex items-center gap-6 text-sm font-medium">
                    <Link href="/" className="transition-colors hover:text-primary">Brands</Link>
                    <Link href="/performance" className="transition-colors hover:text-primary">Performance</Link>
                </nav>
            </div>
            <div className="flex items-center gap-4">
                <UserNav />
            </div>
        </header>
    );
}
