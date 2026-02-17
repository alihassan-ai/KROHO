import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Mail, Shield, UserPlus, Users } from 'lucide-react';
import { InviteMemberDialog } from '@/components/team/InviteMemberDialog';
import { MemberActions } from '@/components/team/MemberActions';

export default async function TeamSettingsPage() {
    const session = await auth();
    if (!session?.user?.id) return null;

    // Fetch workspaces owned by user
    const workspaces = await prisma.workspace.findMany({
        where: { ownerId: session.user.id },
        include: {
            members: {
                include: {
                    user: true
                }
            }
        }
    });

    const activeWorkspace = workspaces[0]; // For MVP, assume one workspace

    if (!activeWorkspace) {
        return (
            <div className="flex flex-col items-center justify-center p-20 text-center">
                <Users className="h-12 w-12 text-muted-foreground mb-4 opacity-20" />
                <h2 className="text-xl font-bold">No Workspace Found</h2>
                <p className="text-muted-foreground mb-6">Create a brand to initialize your team workspace.</p>
                <Button asChild><a href="/brands/new">Create First Brand</a></Button>
            </div>
        );
    }

    return (
        <div className="container max-w-5xl py-10 space-y-10">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Team Settings</h1>
                    <p className="text-muted-foreground">Manage your workspace members and collaboration roles.</p>
                </div>
                <InviteMemberDialog workspaceId={activeWorkspace.id} />
            </div>

            <Card className="bg-neutral-900/50 border-white/5">
                <CardHeader>
                    <CardTitle>Workspace Members</CardTitle>
                    <CardDescription>Members who have access to this workspace's brands and campaigns.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-6">
                        {/* Owner */}
                        <div className="flex items-center justify-between py-4 border-b border-white/5">
                            <div className="flex items-center gap-4">
                                <div className="h-10 w-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                                    <Shield className="h-5 w-5 text-emerald-500" />
                                </div>
                                <div>
                                    <p className="font-medium">{session.user.name || 'Owner'}</p>
                                    <p className="text-sm text-neutral-400">{session.user.email}</p>
                                </div>
                            </div>
                            <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 px-3">
                                OWNER
                            </Badge>
                        </div>

                        {/* Members */}
                        {activeWorkspace.members.map((member) => (
                            <div key={member.id} className="flex items-center justify-between py-4 border-b border-white/5 last:border-0">
                                <div className="flex items-center gap-4">
                                    <div className="h-10 w-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                                        <Users className="h-5 w-5 text-blue-500" />
                                    </div>
                                    <div>
                                        <p className="font-medium">{member.user.name || 'New Member'}</p>
                                        <p className="text-sm text-neutral-400">{member.user.email}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <MemberActions
                                        membershipId={member.id}
                                        currentRole={member.role}
                                        isOwner={member.userId === activeWorkspace.ownerId}
                                        isSelf={member.userId === session?.user?.id}
                                    />
                                </div>
                            </div>
                        ))}

                        {activeWorkspace.members.length === 0 && (
                            <div className="text-center py-10 border-dashed border-2 rounded-xl border-white/5">
                                <Mail className="h-8 w-8 text-neutral-600 mx-auto mb-3" />
                                <p className="text-sm text-neutral-500 italic">No team members invited yet. Scale your studio by adding collaborators.</p>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            <Card className="bg-neutral-900/50 border-white/5">
                <CardHeader>
                    <CardTitle>Role Permissions</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4 md:grid-cols-3">
                        <div className="p-4 rounded-lg bg-neutral-800/50 border border-white/5">
                            <h4 className="font-bold text-sm mb-2">ADMIN</h4>
                            <p className="text-xs text-neutral-400">Full control over workspace settings, brands, and members.</p>
                        </div>
                        <div className="p-4 rounded-lg bg-neutral-800/50 border border-white/5">
                            <h4 className="font-bold text-sm mb-2">MEMBER</h4>
                            <p className="text-xs text-neutral-400">Can create brands, generate creatives, and manage campaigns.</p>
                        </div>
                        <div className="p-4 rounded-lg bg-neutral-800/50 border border-white/5">
                            <h4 className="font-bold text-sm mb-2">VIEWER</h4>
                            <p className="text-xs text-neutral-400">Read-only access. Can view performance data and shared assets.</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
