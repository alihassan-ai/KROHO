'use client';

import * as React from 'react';
import { Check, ChevronsUpDown, PlusCircle, Building2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useBrandStore } from '@/stores/brand-store';
import { useBrandContext } from '@/hooks/useBrandContext';

export function BrandSwitcher() {
    const router = useRouter();
    const { brands, activeBrand, setActiveBrand, isLoading } = useBrandContext();
    const [open, setOpen] = React.useState(false);

    if (isLoading && brands.length === 0) {
        return (
            <Button variant="outline" className="w-[200px] justify-between animate-pulse">
                <span className="truncate">Loading brands...</span>
                <ChevronsUpDown className="ml-auto h-4 w-4 shrink-0 opacity-50" />
            </Button>
        );
    }

    return (
        <DropdownMenu open={open} onOpenChange={setOpen}>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    aria-label="Select a brand"
                    className="w-[200px] justify-between bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800"
                >
                    <div className="flex items-center gap-2 truncate">
                        <div className="h-4 w-4 rounded-sm bg-indigo-600 flex items-center justify-center text-[10px] font-bold text-white uppercase">
                            {activeBrand?.name?.[0] || <Building2 className="h-3 w-3" />}
                        </div>
                        <span className="truncate">{activeBrand?.name || 'Select Brand'}</span>
                    </div>
                    <ChevronsUpDown className="ml-auto h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-[240px]" align="start">
                <DropdownMenuLabel className="text-zinc-500 text-[10px] uppercase tracking-widest font-bold">Brands</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <div className="max-h-[300px] overflow-y-auto">
                    {brands.length > 0 ? (
                        brands.map((brand) => (
                            <DropdownMenuItem
                                key={brand.id}
                                onSelect={() => {
                                    setActiveBrand(brand);
                                    setOpen(false);
                                }}
                                className="flex items-center gap-2 py-2 cursor-pointer"
                            >
                                <div className={cn(
                                    "flex items-center justify-center h-6 w-6 rounded border text-[10px] font-bold uppercase",
                                    activeBrand?.id === brand.id
                                        ? "bg-indigo-600 text-white border-indigo-600"
                                        : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500 border-zinc-200 dark:border-zinc-700"
                                )}>
                                    {brand.name[0]}
                                </div>
                                <span className="flex-1 truncate">{brand.name}</span>
                                {activeBrand?.id === brand.id && (
                                    <Check className="ml-auto h-4 w-4 text-indigo-500" />
                                )}
                            </DropdownMenuItem>
                        ))
                    ) : (
                        <div className="py-6 text-center text-xs text-zinc-500 font-medium">
                            No brands found.
                        </div>
                    )}
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                    onSelect={() => router.push('/brands/new')}
                    className="flex items-center gap-2 py-2 cursor-pointer text-indigo-600 dark:text-indigo-400 font-medium"
                >
                    <PlusCircle className="h-4 w-4" />
                    Create New Brand
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
