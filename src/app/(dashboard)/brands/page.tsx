import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, Globe, Calendar } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";

export default async function BrandsPage() {
    const session = await auth();

    if (!session?.user?.id) {
        redirect("/login");
    }

    const brands = await prisma.brand.findMany({
        where: {
            userId: session.user.id,
        },
        orderBy: {
            createdAt: 'desc',
        },
    });

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Brands</h1>
                    <p className="text-muted-foreground">Manage your brand profiles and voice guidelines.</p>
                </div>
                <Button asChild>
                    <Link href="/brands/new">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        New Brand
                    </Link>
                </Button>
            </div>

            {brands.length === 0 ? (
                <Card className="flex flex-col items-center justify-center p-12 text-center">
                    <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
                        <PlusCircle className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <CardTitle>No brands yet</CardTitle>
                    <CardDescription className="mt-2 max-w-sm">
                        Add your first brand to start generating on-brand creative content.
                    </CardDescription>
                    <Button asChild className="mt-6">
                        <Link href="/brands/new">Add Brand</Link>
                    </Button>
                </Card>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {brands.map((brand: any) => (
                        <Card key={brand.id} className="hover:border-primary/50 transition-colors">
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div className="h-10 w-10 rounded bg-primary text-primary-foreground flex items-center justify-center font-bold">
                                        {brand.name[0]}
                                    </div>
                                    <div className={`px-2 py-1 rounded text-xs font-medium ${brand.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                                        }`}>
                                        {brand.status}
                                    </div>
                                </div>
                                <CardTitle className="mt-4">{brand.name}</CardTitle>
                                <CardDescription className="flex items-center gap-2">
                                    <Globe className="h-3 w-3" />
                                    {brand.website || 'No website'}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Calendar className="h-3 w-3" />
                                    Created {format(brand.createdAt, 'MMM d, yyyy')}
                                </div>
                                <Button variant="outline" className="w-full mt-6" asChild>
                                    <Link href={`/brands/${brand.id}`}>View Brand</Link>
                                </Button>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
