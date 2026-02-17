'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    BarChart3,
    Briefcase,
    FolderKanban,
    Home,
    Layers,
    LayoutGrid,
    Settings,
    Sparkles,
    Trash2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Brands', href: '/brands', icon: Briefcase },
    { name: 'Playground', href: '/playground', icon: Sparkles },
    { name: 'Campaigns', href: '/campaigns', icon: FolderKanban },
    { name: 'Exports', href: '/exports', icon: LayoutGrid },
    { name: 'Performance', href: '/performance', icon: BarChart3 },
];

export function Sidebar() {
    const pathname = usePathname();

    return (
        <div className="flex h-full w-64 flex-col border-r bg-background">
            <div className="flex h-14 items-center border-b px-4">
                <Link href="/dashboard" className="flex items-center gap-2 font-black tracking-tighter uppercase text-xl">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-lg shadow-indigo-500/20">
                        <Layers className="h-5 w-5" />
                    </div>
                    <span>KROHO</span>
                </Link>
            </div>
            <ScrollArea className="flex-1 px-3 py-4">
                <div className="space-y-1">
                    {navItems.map((item) => (
                        <Button
                            key={item.href}
                            asChild
                            variant={pathname === item.href ? 'secondary' : 'ghost'}
                            className={cn(
                                'w-full justify-start gap-3',
                                pathname === item.href && 'bg-secondary font-medium'
                            )}
                        >
                            <Link href={item.href}>
                                <item.icon className="h-4 w-4" />
                                {item.name}
                            </Link>
                        </Button>
                    ))}
                </div>
            </ScrollArea>
            <div className="mt-auto border-t p-4">
                <Button variant="ghost" asChild className="w-full justify-start gap-3 px-3">
                    <Link href="/settings">
                        <Settings className="h-4 w-4" />
                        Settings
                    </Link>
                </Button>
            </div>
        </div>
    );
}
