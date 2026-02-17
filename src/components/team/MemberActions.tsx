'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { Loader2, Trash2 } from 'lucide-react';

interface MemberActionsProps {
    membershipId: string;
    currentRole: string;
    isOwner: boolean;
    isSelf: boolean;
}

export function MemberActions({ membershipId, currentRole, isOwner, isSelf }: MemberActionsProps) {
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleRoleUpdate = async (newRole: string) => {
        setIsLoading(true);
        try {
            const res = await fetch(`/api/workspaces/members/${membershipId}`, {
                method: 'PATCH',
                body: JSON.stringify({ role: newRole }),
            });
            if (!res.ok) throw new Error('Failed to update role');
            toast.success('Member role updated');
            router.refresh();
        } catch (error) {
            toast.error('Failed to update role');
        } finally {
            setIsLoading(false);
        }
    };

    const handleRemove = async () => {
        setIsLoading(true);
        try {
            const res = await fetch(`/api/workspaces/members/${membershipId}`, {
                method: 'DELETE',
            });
            if (!res.ok) throw new Error('Failed to remove member');
            toast.success('Member removed');
            router.refresh();
        } catch (error) {
            toast.error('Failed to remove member');
        } finally {
            setIsLoading(false);
        }
    };

    if (isOwner) return null;

    return (
        <div className="flex items-center gap-3">
            <Select
                defaultValue={currentRole}
                onValueChange={handleRoleUpdate}
                disabled={isLoading}
            >
                <SelectTrigger className="w-[110px] h-8 text-[11px] uppercase font-bold tracking-tighter">
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="ADMIN">ADMIN</SelectItem>
                    <SelectItem value="MEMBER">MEMBER</SelectItem>
                    <SelectItem value="VIEWER">VIEWER</SelectItem>
                </SelectContent>
            </Select>
            <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-neutral-500 hover:text-red-400 hover:bg-neutral-800 transition-colors"
                onClick={handleRemove}
                disabled={isLoading}
            >
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
            </Button>
        </div>
    );
}
