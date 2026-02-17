import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Layers } from "lucide-react";
import Link from "next/link";
import { signIn } from "@/lib/auth";

export default function LoginPage() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-black px-4 relative overflow-hidden">
            {/* Background Glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_800px_at_50%_-100px,#312e81,transparent)] opacity-30" />

            <Card className="w-full max-w-sm bg-neutral-900/50 border-white/10 backdrop-blur-xl relative z-10">
                <CardHeader className="space-y-4 text-center">
                    <div className="flex justify-center mb-2">
                        <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                            <Layers className="h-6 w-6 text-white" />
                        </div>
                    </div>
                    <div>
                        <CardTitle className="text-3xl font-black tracking-tight text-white uppercase">Welcome Back</CardTitle>
                        <CardDescription className="text-neutral-400 font-medium">
                            Log in to your creative studio.
                        </CardDescription>
                    </div>
                </CardHeader>
                <CardContent className="grid gap-6">
                    <form action={async () => {
                        "use server"
                        await signIn("google")
                    }}>
                        <Button className="w-full h-12 bg-white hover:bg-neutral-200 text-black border-0 font-bold text-lg rounded-xl transition-all hover:scale-[1.02]">
                            <svg className="mr-2 h-5 w-5" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
                                <path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path>
                            </svg>
                            Sign in with Google
                        </Button>
                    </form>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-white/5" />
                        </div>
                        <div className="relative flex justify-center text-[10px] uppercase tracking-widest font-black">
                            <span className="bg-transparent px-2 text-neutral-500">
                                Protected by KROHO
                            </span>
                        </div>
                    </div>
                </CardContent>
                <CardFooter className="flex flex-col gap-4">
                    <p className="text-center text-sm text-neutral-500 font-medium">
                        © {new Date().getFullYear()} KROHO. Built for performance.
                    </p>
                </CardFooter>
            </Card>
        </div>
    );
}
